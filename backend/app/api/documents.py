"""
Documents API - Enhanced from ai-chatbot for enterprise document management
Supports advanced file types and batch processing
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import aiofiles
import os
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.document import Document
from app.services.document_service import DocumentService
from app.schemas.enterprise import DocumentUpload

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    department_id: Optional[int] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated tags
    is_confidential: bool = Form(False),
    fiscal_period: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload and process enterprise documents with metadata
    Enhanced from ai-chatbot with enterprise features
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.xlsx', '.csv', '.txt', '.json', '.pptx']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_extension} not supported. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (100MB limit for enterprise)
    max_size = 100 * 1024 * 1024  # 100MB
    if file.size and file.size > max_size:
        raise HTTPException(status_code=400, detail="File too large. Maximum size: 100MB")
    
    try:
        # Initialize document service
        document_service = DocumentService()
        
        # Process tags
        tag_list = [tag.strip() for tag in tags.split(',')] if tags else []
        
        # Save and process document
        document = await document_service.create_document(
            file=file,
            user_id=current_user.id,
            enterprise_id=current_user.enterprise_id,
            db=db,
            category=category,
            department_id=department_id,
            tags=tag_list,
            is_confidential=is_confidential,
            fiscal_period=fiscal_period
        )
        
        return {
            "message": "Document uploaded and processing started",
            "document_id": document.id,
            "filename": document.filename,
            "status": "processing",
            "estimated_completion": "2-5 minutes depending on document size and complexity"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/")
async def list_documents(
    limit: int = Query(20, description="Number of documents to return"),
    offset: int = Query(0, description="Number of documents to skip"),
    category: Optional[str] = Query(None, description="Filter by category"),
    department_id: Optional[int] = Query(None, description="Filter by department"),
    processed_only: bool = Query(True, description="Show only processed documents"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List enterprise documents with filtering
    Enhanced with enterprise-specific metadata
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Build query with filters
    query = select(Document).where(
        Document.enterprise_id == current_user.enterprise_id
    ).order_by(desc(Document.created_at))
    
    if category:
        query = query.where(Document.category == category)
    if department_id:
        query = query.where(Document.department_id == department_id)
    if processed_only:
        query = query.where(Document.processed == True)
        
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    documents = result.scalars().all()
    
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "category": doc.category,
            "department_id": doc.department_id,
            "tags": doc.tags,
            "is_confidential": doc.is_confidential,
            "fiscal_period": doc.fiscal_period,
            "file_size": doc.file_size,
            "processed": doc.processed,
            "chunks_count": doc.chunks_count,
            "created_at": doc.created_at,
            "processed_at": doc.processed_at,
            "uploaded_by": doc.user_id
        }
        for doc in documents
    ]


@router.get("/{document_id}")
async def get_document_details(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific document
    Including processing status and extracted metadata
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.enterprise_id == current_user.enterprise_id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": document.id,
        "filename": document.filename,
        "original_filename": document.original_filename,
        "file_path": document.file_path,
        "file_size": document.file_size,
        "file_type": document.file_type,
        "category": document.category,
        "department_id": document.department_id,
        "tags": document.tags,
        "is_confidential": document.is_confidential,
        "fiscal_period": document.fiscal_period,
        "processed": document.processed,
        "chunks_count": document.chunks_count,
        "processing_time_seconds": document.processing_time_seconds,
        "metadata": document.metadata,
        "created_at": document.created_at,
        "processed_at": document.processed_at,
        "uploaded_by": document.user_id,
        "last_accessed": document.last_accessed
    }


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a document and its associated data
    Includes vector embeddings cleanup
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.enterprise_id == current_user.enterprise_id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Initialize document service for cleanup
        document_service = DocumentService()
        
        # Delete document and associated data
        await document_service.delete_document(document, db)
        
        return {"message": f"Document '{document.filename}' deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reprocess a document with updated AI models or parameters
    Useful when improving the extraction algorithms
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.enterprise_id == current_user.enterprise_id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Initialize document service
        document_service = DocumentService()
        
        # Reprocess document
        await document_service.reprocess_document(document, db)
        
        return {
            "message": f"Document '{document.filename}' queued for reprocessing",
            "document_id": document.id,
            "status": "processing",
            "estimated_completion": "2-5 minutes"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reprocessing failed: {str(e)}")


@router.get("/{document_id}/content")
async def get_document_content(
    document_id: int,
    chunk_limit: int = Query(10, description="Maximum number of chunks to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get processed content chunks from a document
    Useful for reviewing what was extracted
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.enterprise_id == current_user.enterprise_id
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.processed:
        raise HTTPException(status_code=400, detail="Document not yet processed")
    
    try:
        document_service = DocumentService()
        
        # Get document chunks from vector store
        chunks = await document_service.get_document_chunks(
            document_id=document.id,
            limit=chunk_limit
        )
        
        return {
            "document_id": document.id,
            "filename": document.filename,
            "total_chunks": document.chunks_count,
            "returned_chunks": len(chunks),
            "chunks": chunks
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content retrieval failed: {str(e)}")


@router.get("/categories/list")
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of document categories used in the enterprise
    For UI dropdowns and filtering
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    result = await db.execute(
        select(Document.category).where(
            Document.enterprise_id == current_user.enterprise_id,
            Document.category.isnot(None)
        ).distinct()
    )
    categories = [row[0] for row in result.fetchall()]
    
    # Add common enterprise categories if not present
    common_categories = ["financial", "hr", "legal", "operations", "marketing", "sales", "it", "compliance"]
    for category in common_categories:
        if category not in categories:
            categories.append(category)
    
    return {"categories": sorted(categories)}


@router.get("/stats/overview")
async def get_document_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get document statistics for the enterprise dashboard
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Total documents
    total_result = await db.execute(
        select(Document).where(Document.enterprise_id == current_user.enterprise_id)
    )
    total_documents = len(total_result.scalars().all())
    
    # Processed documents
    processed_result = await db.execute(
        select(Document).where(
            Document.enterprise_id == current_user.enterprise_id,
            Document.processed == True
        )
    )
    processed_documents = len(processed_result.scalars().all())
    
    # Documents by category
    categories_result = await db.execute(
        select(Document.category, Document.id).where(
            Document.enterprise_id == current_user.enterprise_id,
            Document.category.isnot(None)
        )
    )
    categories_count = {}
    for category, _ in categories_result.fetchall():
        categories_count[category] = categories_count.get(category, 0) + 1
    
    # Total file size
    size_result = await db.execute(
        select(Document.file_size).where(
            Document.enterprise_id == current_user.enterprise_id,
            Document.file_size.isnot(None)
        )
    )
    total_size = sum(size[0] for size in size_result.fetchall())
    total_size_mb = total_size / (1024 * 1024)
    
    return {
        "total_documents": total_documents,
        "processed_documents": processed_documents,
        "processing_rate": processed_documents / total_documents if total_documents > 0 else 0,
        "documents_by_category": categories_count,
        "total_size_mb": round(total_size_mb, 2),
        "average_size_mb": round(total_size_mb / total_documents, 2) if total_documents > 0 else 0
    }