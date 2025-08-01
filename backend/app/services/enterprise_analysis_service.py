"""
Enterprise Analysis Service - The core intelligence engine
Handles complex business queries with advanced RAG + analytical capabilities
Based on ai-chatbot's LangChain service but enhanced for enterprise needs
"""
import re
import json
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.enterprise import Enterprise
from app.models.enterprise_query import EnterpriseQuery, QueryType, QueryComplexity
from app.models.document import Document
from app.services.document_service import DocumentService
from app.core.config import settings

import openai
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate


class EnterpriseAnalysisService:
    """
    Advanced AI service for complex enterprise queries
    Extends basic chatbot capabilities with:
    - Financial data analysis
    - Table/chart extraction from documents  
    - Multi-document synthesis
    - Structured data responses
    - Executive-level insights
    """
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY,
            model=settings.EMBEDDING_MODEL
        )
        self.document_service = DocumentService()
        
        # Enterprise-specific prompts (enhanced from ai-chatbot)
        self.executive_prompt = PromptTemplate(
            input_variables=["context", "question", "enterprise_info"],
            template="""
            You are a senior business analyst AI for {enterprise_info[name]}, a {enterprise_info[industry]} company.
            
            CONTEXT FROM DOCUMENTS:
            {context}
            
            EXECUTIVE QUESTION:
            {question}
            
            INSTRUCTIONS:
            1. Provide factual, data-driven responses based ONLY on the provided context
            2. Include specific numbers, dates, and references when available
            3. If data spans multiple time periods, provide comparisons
            4. Structure responses with clear sections and bullet points
            5. Flag any limitations or missing data
            6. Suggest follow-up questions for deeper analysis
            
            RESPONSE FORMAT:
            📊 EXECUTIVE SUMMARY: [Brief key findings]
            
            📈 DETAILED ANALYSIS: [In-depth breakdown]
            
            🔍 DATA SOURCES: [Documents referenced]
            
            ⚠️ LIMITATIONS: [What data might be missing]
            
            🎯 RECOMMENDED ACTIONS: [Strategic recommendations]
            """
        )
        
        self.financial_prompt = PromptTemplate(
            input_variables=["context", "question", "date_range"],
            template="""
            You are a financial analyst AI specializing in corporate financial analysis.
            
            FINANCIAL DATA CONTEXT:
            {context}
            
            FINANCIAL QUESTION:
            {question}
            
            ANALYSIS PERIOD: {date_range}
            
            INSTRUCTIONS:
            1. Extract and analyze financial metrics with precision
            2. Calculate ratios, percentages, and trends where applicable
            3. Compare periods if historical data is available
            4. Present data in structured format (tables/lists)
            5. Flag any accounting inconsistencies or red flags
            6. Provide context for the numbers (industry benchmarks if known)
            
            RESPONSE FORMAT:
            💰 FINANCIAL SUMMARY
            • Key Metric 1: $X,XXX (vs previous period: +/-X%)
            • Key Metric 2: $X,XXX (vs budget: +/-X%)
            
            📊 DETAILED BREAKDOWN
            [Table format where possible]
            
            📈 TRENDS & INSIGHTS
            [Analysis of patterns and changes]
            
            🚨 ATTENTION ITEMS
            [Anything requiring management attention]
            """
        )

    async def process_enterprise_query(
        self,
        query: str,
        enterprise_id: int,
        user_id: int,
        db: AsyncSession,
        department_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Main method to process complex enterprise queries
        
        Args:
            query: The user's question
            enterprise_id: ID of the enterprise
            user_id: ID of the user asking
            db: Database session
            department_id: Optional department context
            
        Returns:
            Dict with analysis results, structured data, and metadata
        """
        start_time = datetime.utcnow()
        
        # 1. Get enterprise context
        enterprise = await self._get_enterprise_context(db, enterprise_id)
        
        # 2. Analyze and classify the query
        query_analysis = await self._analyze_query(query, enterprise)
        
        # 3. Search relevant documents with enhanced filtering
        documents = await self._search_enterprise_documents(
            query, enterprise_id, query_analysis, db
        )
        
        # 4. Extract and process data from documents
        processed_data = await self._process_document_data(documents, query_analysis)
        
        # 5. Generate AI response based on query type
        ai_response = await self._generate_enterprise_response(
            query, processed_data, query_analysis, enterprise
        )
        
        # 6. Post-process for structured data (tables, charts)
        structured_response = await self._structure_response(ai_response, query_analysis)
        
        # 7. Calculate processing metrics
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # 8. Save query for analytics and future reference
        query_record = await self._save_enterprise_query(
            db, query, ai_response, query_analysis, 
            enterprise_id, user_id, department_id,
            processing_time, documents
        )
        
        return {
            "query_id": query_record.id,
            "response": structured_response["text"],
            "structured_data": structured_response["data"],
            "query_type": query_analysis["type"],
            "complexity": query_analysis["complexity"],
            "documents_used": len(documents),
            "confidence_score": query_analysis["confidence"],
            "processing_time_ms": processing_time,
            "suggested_follow_ups": structured_response["follow_ups"]
        }

    async def _analyze_query(self, query: str, enterprise: Enterprise) -> Dict[str, Any]:
        """
        Analyze query to determine type, complexity, and processing approach
        Enhanced from basic ai-chatbot classification
        """
        query_lower = query.lower()
        
        # Detect query type based on keywords and patterns
        query_type = QueryType.SIMPLE
        complexity = QueryComplexity.LOW
        
        # Financial keywords
        financial_terms = [
            "revenue", "profit", "loss", "balance", "cash flow", "budget",
            "expenses", "income", "roi", "margin", "financial", "accounting",
            "p&l", "balance sheet", "assets", "liabilities", "equity"
        ]
        
        # Analytical keywords  
        analytical_terms = [
            "compare", "trend", "analysis", "correlation", "performance",
            "vs", "versus", "change", "growth", "decline", "forecast"
        ]
        
        # Time-based patterns
        date_patterns = [
            r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b",
            r"\b(q1|q2|q3|q4|quarter)\b",
            r"\b(\d{4})\b",  # Year
            r"\b(last|this|next)\s+(month|quarter|year)\b"
        ]
        
        # Entity detection (names, companies)
        entity_patterns = [
            r"\b[A-Z][a-z]+\s+[A-Z][a-z]+\b",  # "John Smith"
            r"\b[A-Z]{2,}\b"  # "IBM", "HR"
        ]
        
        # Classify query type
        if any(term in query_lower for term in financial_terms):
            query_type = QueryType.FINANCIAL
            complexity = QueryComplexity.HIGH
        elif any(term in query_lower for term in analytical_terms):
            query_type = QueryType.ANALYTICAL  
            complexity = QueryComplexity.MEDIUM
        elif any(re.search(pattern, query_lower) for pattern in date_patterns):
            complexity = QueryComplexity.MEDIUM
            
        # Extract entities and dates
        entities = []
        for pattern in entity_patterns:
            entities.extend(re.findall(pattern, query))
            
        date_mentions = []
        for pattern in date_patterns:
            date_mentions.extend(re.findall(pattern, query_lower))
        
        # Detect numerical filters
        number_patterns = [
            r"\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?",  # Currency
            r"\b\d+%\b",  # Percentages
            r"\b(?:above|below|over|under|greater than|less than)\s+\d+\b"
        ]
        
        numerical_filters = []
        for pattern in number_patterns:
            numerical_filters.extend(re.findall(pattern, query))
        
        return {
            "type": query_type,
            "complexity": complexity,
            "entities": entities,
            "date_mentions": date_mentions,
            "numerical_filters": numerical_filters,
            "confidence": 0.8,  # Would use ML model in production
            "requires_approval": complexity == QueryComplexity.CRITICAL,
            "estimated_processing_time": self._estimate_processing_time(complexity)
        }

    async def _search_enterprise_documents(
        self, 
        query: str, 
        enterprise_id: int,
        query_analysis: Dict[str, Any],
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """
        Enhanced document search with enterprise-specific filtering
        Based on ai-chatbot's document search but with business intelligence focus
        """
        # Get all documents for the enterprise
        documents_query = select(Document).where(
            Document.enterprise_id == enterprise_id,
            Document.processed == True
        )
        
        # Filter by document type based on query
        if query_analysis["type"] == QueryType.FINANCIAL:
            # Prioritize financial documents
            documents_query = documents_query.where(
                Document.category.in_(["financial", "accounting", "budget"])
            )
        
        result = await db.execute(documents_query)
        documents = result.scalars().all()
        
        # Use enhanced RAG search with more context
        relevant_docs = await self.document_service.search_documents(
            query=query,
            user_id=None,  # Enterprise context
            k=min(15, len(documents)),  # More documents for complex queries
            enterprise=enterprise_id,
            similarity_threshold=0.6  # Lower threshold for broader results
        )
        
        return relevant_docs

    async def _process_document_data(
        self, 
        documents: List[Dict[str, Any]], 
        query_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Extract and structure data from documents
        NEW: Enhanced processing for tables, numbers, dates
        """
        processed_data = {
            "text_content": [],
            "tables": [],
            "financial_data": [],
            "dates_found": [],
            "entities_found": []
        }
        
        for doc in documents:
            content = doc.get("content", "")
            metadata = doc.get("metadata", {})
            
            # Basic text content (like ai-chatbot)
            processed_data["text_content"].append({
                "content": content,
                "source": metadata.get("filename", "unknown"),
                "relevance": doc.get("score", 0)
            })
            
            # Extract tables if query is analytical/financial
            if query_analysis["type"] in [QueryType.FINANCIAL, QueryType.ANALYTICAL]:
                tables = self._extract_tables_from_text(content)
                processed_data["tables"].extend(tables)
                
                # Extract financial numbers
                financial_data = self._extract_financial_data(content)
                processed_data["financial_data"].extend(financial_data)
            
            # Extract dates
            dates = self._extract_dates_from_text(content)
            processed_data["dates_found"].extend(dates)
            
            # Extract entities (names, companies)
            entities = self._extract_entities_from_text(content)
            processed_data["entities_found"].extend(entities)
        
        return processed_data

    async def _generate_enterprise_response(
        self,
        query: str,
        processed_data: Dict[str, Any],
        query_analysis: Dict[str, Any],
        enterprise: Enterprise
    ) -> str:
        """
        Generate AI response using appropriate prompt template
        Enhanced from ai-chatbot with business-specific prompts
        """
        # Prepare context from processed data
        context = self._prepare_context_for_ai(processed_data)
        
        # Choose appropriate prompt based on query type
        if query_analysis["type"] == QueryType.FINANCIAL:
            prompt = self.financial_prompt.format(
                context=context,
                question=query,
                date_range=", ".join(query_analysis.get("date_mentions", ["Not specified"]))
            )
        else:
            prompt = self.executive_prompt.format(
                context=context,
                question=query,
                enterprise_info={
                    "name": enterprise.name,
                    "industry": enterprise.industry or "Business"
                }
            )
        
        # Call OpenAI with enterprise-optimized parameters
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",  # Better model for complex queries
                messages=[
                    {"role": "system", "content": "You are a senior business intelligence analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Lower for factual responses
                max_tokens=2000,  # Longer for detailed analysis
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            # Fallback response
            return f"I apologize, but I encountered an issue analyzing your request: {str(e)}. Please try rephrasing your question or contact support."

    def _extract_tables_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extract table-like data from text content"""
        tables = []
        
        # Simple table detection (would use more sophisticated parsing in production)
        lines = text.split('\n')
        current_table = []
        
        for line in lines:
            # Detect table rows (multiple columns separated by tabs/pipes)
            if '\t' in line or '|' in line:
                columns = re.split(r'[\t|]', line.strip())
                if len(columns) > 1:
                    current_table.append(columns)
            else:
                if len(current_table) > 2:  # Minimum table size
                    tables.append({
                        "headers": current_table[0],
                        "rows": current_table[1:],
                        "row_count": len(current_table) - 1
                    })
                current_table = []
        
        return tables

    def _extract_financial_data(self, text: str) -> List[Dict[str, Any]]:
        """Extract financial numbers and metrics"""
        financial_data = []
        
        # Currency patterns
        currency_pattern = r'\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?'
        currencies = re.findall(currency_pattern, text)
        
        for currency in currencies:
            financial_data.append({
                "type": "currency",
                "value": currency,
                "context": text[max(0, text.find(currency)-50):text.find(currency)+50]
            })
        
        # Percentage patterns
        percentage_pattern = r'\d+(?:\.\d+)?%'
        percentages = re.findall(percentage_pattern, text)
        
        for percentage in percentages:
            financial_data.append({
                "type": "percentage", 
                "value": percentage,
                "context": text[max(0, text.find(percentage)-50):text.find(percentage)+50]
            })
        
        return financial_data

    def _extract_dates_from_text(self, text: str) -> List[str]:
        """Extract dates from text content"""
        import dateparser
        
        date_patterns = [
            r'\b\d{1,2}/\d{1,2}/\d{4}\b',  # MM/DD/YYYY
            r'\b\d{4}-\d{2}-\d{2}\b',      # YYYY-MM-DD
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b'
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        return dates

    def _extract_entities_from_text(self, text: str) -> List[str]:
        """Extract entity names (people, companies) from text"""
        # Simple entity extraction (would use NER in production)
        entity_patterns = [
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # "John Smith"
            r'\b[A-Z][a-z]+\s+(?:Inc|Corp|LLC|Ltd)\.?\b'  # "Microsoft Corp"
        ]
        
        entities = []
        for pattern in entity_patterns:
            matches = re.findall(pattern, text)
            entities.extend(matches)
        
        return list(set(entities))  # Remove duplicates

    async def _structure_response(
        self, 
        ai_response: str, 
        query_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Post-process AI response to extract structured data
        NEW: Create tables, charts data, follow-up suggestions  
        """
        structured = {
            "text": ai_response,
            "data": {},
            "follow_ups": []
        }
        
        # Extract structured sections from formatted response
        sections = {
            "executive_summary": self._extract_section(ai_response, "📊 EXECUTIVE SUMMARY"),
            "analysis": self._extract_section(ai_response, "📈 DETAILED ANALYSIS"),  
            "sources": self._extract_section(ai_response, "🔍 DATA SOURCES"),
            "limitations": self._extract_section(ai_response, "⚠️ LIMITATIONS"),
            "recommendations": self._extract_section(ai_response, "🎯 RECOMMENDED ACTIONS")
        }
        
        structured["data"] = {k: v for k, v in sections.items() if v}
        
        # Generate contextual follow-up questions
        if query_analysis["type"] == QueryType.FINANCIAL:
            structured["follow_ups"] = [
                "Show me the trend for this metric over the last 3 quarters",
                "How does this compare to industry benchmarks?", 
                "What are the main drivers behind these numbers?"
            ]
        else:
            structured["follow_ups"] = [
                "Can you provide more details on this analysis?",
                "What additional data would help clarify this?",
                "Are there any related metrics I should consider?"
            ]
        
        return structured

    def _extract_section(self, text: str, section_header: str) -> Optional[str]:
        """Extract content from a specific section in formatted response"""
        pattern = f"{re.escape(section_header)}:?\\s*([\\s\\S]*?)(?=\\n\\n|$|📊|📈|🔍|⚠️|🎯)"
        match = re.search(pattern, text)
        return match.group(1).strip() if match else None

    # Additional helper methods...
    async def _get_enterprise_context(self, db: AsyncSession, enterprise_id: int) -> Enterprise:
        """Get enterprise information for context"""
        result = await db.execute(select(Enterprise).where(Enterprise.id == enterprise_id))
        return result.scalar_one()

    async def _save_enterprise_query(
        self,
        db: AsyncSession,
        query: str,
        response: str,
        analysis: Dict[str, Any],
        enterprise_id: int,
        user_id: int,
        department_id: Optional[int],
        processing_time: float,
        documents: List[Dict]
    ) -> EnterpriseQuery:
        """Save query record for analytics and audit"""
        query_record = EnterpriseQuery(
            user_id=user_id,
            enterprise_id=enterprise_id,
            department_id=department_id,
            original_query=query,
            query_type=analysis["type"],
            complexity=analysis["complexity"],
            ai_response=response,
            processing_time_ms=int(processing_time),
            documents_used=[doc.get("metadata", {}).get("document_id") for doc in documents],
            confidence_score=analysis["confidence"],
            entities_mentioned=analysis["entities"],
            responded_at=datetime.utcnow()
        )
        
        db.add(query_record)
        await db.commit()
        await db.refresh(query_record)
        
        return query_record

    def _prepare_context_for_ai(self, processed_data: Dict[str, Any]) -> str:
        """Prepare structured context for AI prompt"""
        context_parts = []
        
        # Text content
        for item in processed_data["text_content"][:10]:  # Limit context
            context_parts.append(f"Source: {item['source']}\n{item['content']}\n")
        
        # Tables
        if processed_data["tables"]:
            context_parts.append("\nTABLES FOUND:")
            for i, table in enumerate(processed_data["tables"][:3]):  # Limit tables
                context_parts.append(f"Table {i+1}: {table['headers']} ({table['row_count']} rows)")
        
        # Financial data
        if processed_data["financial_data"]:
            context_parts.append("\nFINANCIAL DATA:")
            for item in processed_data["financial_data"][:10]:
                context_parts.append(f"{item['type']}: {item['value']}")
        
        return "\n".join(context_parts)

    def _estimate_processing_time(self, complexity: QueryComplexity) -> int:
        """Estimate processing time in milliseconds"""
        time_estimates = {
            QueryComplexity.LOW: 2000,      # 2 seconds
            QueryComplexity.MEDIUM: 5000,   # 5 seconds  
            QueryComplexity.HIGH: 15000,    # 15 seconds
            QueryComplexity.CRITICAL: 30000 # 30 seconds
        }
        return time_estimates.get(complexity, 5000)