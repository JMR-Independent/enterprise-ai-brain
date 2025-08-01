"""
Document service for Enterprise AI Brain
Enhanced from ai-chatbot with enterprise document processing
"""
import os
import asyncio
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime
import aiofiles
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.document import Document
from app.models.user import User

# Import processing libraries
try:
    from langchain_community.document_loaders import PyPDFLoader, TextLoader
    from langchain_community.vectorstores import Chroma
    from langchain_openai import OpenAIEmbeddings
    from langchain.text_splitter import RecursiveCharacterTextSplitter
except ImportError as e:
    print(f"Warning: Some LangChain imports failed: {e}")


class DocumentService:
    """Enhanced document service for enterprise needs"""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY,
            model=settings.EMBEDDING_MODEL
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
        )
    
    async def create_document(
        self,
        file: UploadFile,
        user_id: int,
        enterprise_id: int,
        db: AsyncSession,
        category: Optional[str] = None,
        department_id: Optional[int] = None,
        tags: Optional[List[str]] = None,
        is_confidential: bool = False,
        fiscal_period: Optional[str] = None
    ) -> Document:
        """Create and process a new enterprise document"""
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._-")
        unique_filename = f"{timestamp}_{safe_filename}"
        
        # Create upload directory if it doesn't exist
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Calculate file hash for deduplication
        content_hash = hashlib.md5(content).hexdigest()
        
        # Create document record
        document = Document(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(content),
            file_type=file.content_type,
            user_id=user_id,
            enterprise_id=enterprise_id,
            department_id=department_id,
            category=category,
            tags=tags or [],
            is_confidential=is_confidential,
            fiscal_period=fiscal_period,
            content_hash=content_hash,
            processing_status="pending"
        )
        
        db.add(document)
        await db.commit()
        await db.refresh(document)
        
        # Start background processing
        asyncio.create_task(self._process_document_background(document, db))
        
        return document
    
    async def _process_document_background(self, document: Document, db: AsyncSession):
        """Background task to process document"""
        try:
            # Update status
            document.processing_status = "processing"
            await db.commit()
            
            start_time = datetime.utcnow()
            
            # Load and process document based on file type
            if document.file_type == "application/pdf":
                loader = PyPDFLoader(document.file_path)
            else:
                loader = TextLoader(document.file_path, encoding="utf-8")
            
            # Load document
            pages = loader.load()
            
            # Split into chunks
            chunks = self.text_splitter.split_documents(pages)
            
            # Create vector store namespace for enterprise
            collection_name = f"enterprise_{document.enterprise_id}_docs"
            
            # Store in ChromaDB
            vector_store = Chroma(
                collection_name=collection_name,
                embedding_function=self.embeddings,
                persist_directory=settings.VECTOR_STORE_PATH
            )
            
            # Add chunks with metadata
            for i, chunk in enumerate(chunks):
                chunk.metadata.update({
                    "document_id": document.id,
                    "enterprise_id": document.enterprise_id,
                    "category": document.category,
                    "fiscal_period": document.fiscal_period,
                    "chunk_index": i,
                    "is_confidential": document.is_confidential
                })
            
            vector_store.add_documents(chunks)
            
            # Extract additional metadata (tables, entities, etc.)
            metadata = await self._extract_document_metadata(document.file_path)
            
            # Update document record
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            document.processed = True
            document.processing_status = "completed"
            document.chunks_count = len(chunks)
            document.processing_time_seconds = processing_time
            document.processed_at = datetime.utcnow()
            document.metadata = metadata
            
            await db.commit()
            
        except Exception as e:
            # Update with error
            document.processing_status = "failed"
            document.error_message = str(e)
            await db.commit()
    
    async def _extract_document_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract advanced metadata from document"""
        metadata = {
            "tables_found": 0,
            "entities_found": [],
            "financial_data": [],
            "dates_found": [],
            "language": "en"
        }
        
        try:
            # Basic file info
            stat = os.stat(file_path)
            metadata["file_modified"] = datetime.fromtimestamp(stat.st_mtime).isoformat()
            
            # TODO: Implement advanced extraction
            # - Table detection and extraction
            # - Financial data parsing
            # - Entity recognition (names, companies)
            # - Date extraction
            # - Language detection
            
        except Exception as e:
            metadata["extraction_error"] = str(e)
        
        return metadata
    
    async def search_documents(
        self,
        query: str,
        user_id: Optional[int],
        k: int = 10,
        enterprise: Optional[int] = None,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search documents with enterprise context"""
        try:
            collection_name = f"enterprise_{enterprise}_docs" if enterprise else "default"
            
            vector_store = Chroma(
                collection_name=collection_name,
                embedding_function=self.embeddings,
                persist_directory=settings.VECTOR_STORE_PATH
            )
            
            # Perform similarity search
            results = vector_store.similarity_search_with_score(query, k=k)
            
            # Filter by similarity threshold and format results
            filtered_results = []
            for doc, score in results:
                if score >= similarity_threshold:
                    filtered_results.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "score": score
                    })
            
            return filtered_results
            
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    async def delete_document(self, document: Document, db: AsyncSession):
        """Delete document and associated data"""
        try:
            # Remove from vector store
            collection_name = f"enterprise_{document.enterprise_id}_docs"
            vector_store = Chroma(
                collection_name=collection_name,
                embedding_function=self.embeddings,
                persist_directory=settings.VECTOR_STORE_PATH
            )
            
            # Delete chunks associated with this document
            # TODO: Implement vector store cleanup
            
            # Delete physical file
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
            
            # Delete database record
            await db.delete(document)
            await db.commit()
            
        except Exception as e:
            raise Exception(f"Failed to delete document: {str(e)}")
    
    async def reprocess_document(self, document: Document, db: AsyncSession):
        """Reprocess an existing document"""
        # Reset processing status
        document.processed = False
        document.processing_status = "pending"
        document.error_message = None
        await db.commit()
        
        # Start reprocessing
        asyncio.create_task(self._process_document_background(document, db))
    
    async def get_document_chunks(self, document_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get processed chunks from a document"""
        try:
            # TODO: Implement chunk retrieval from vector store
            # For now, return placeholder
            return [
                {
                    "chunk_id": i,
                    "content": f"Chunk {i} content placeholder",
                    "metadata": {"document_id": document_id, "chunk_index": i}
                }
                for i in range(min(limit, 5))
            ]
        except Exception as e:
            return []