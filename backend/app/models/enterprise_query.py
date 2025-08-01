"""
Enterprise Query models - For complex business intelligence queries
Extends simple chat to handle analytical and data-driven questions
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from app.core.database import Base


class QueryType(str, Enum):
    """Types of enterprise queries"""
    SIMPLE = "simple"              # Basic questions like ai-chatbot
    ANALYTICAL = "analytical"      # Data analysis questions
    FINANCIAL = "financial"        # Financial/accounting queries  
    OPERATIONAL = "operational"    # Business operations
    COMPLIANCE = "compliance"      # Regulatory/compliance
    STRATEGIC = "strategic"        # Executive/strategic decisions


class QueryComplexity(str, Enum):
    """Complexity levels for processing and billing"""
    LOW = "low"          # Simple lookup
    MEDIUM = "medium"    # Analysis required
    HIGH = "high"        # Complex cross-document analysis
    CRITICAL = "critical" # Executive-level deep analysis


class EnterpriseQuery(Base):
    """
    Enhanced query model for complex business questions
    Extends basic chat to track analytical queries with metadata
    """
    __tablename__ = "enterprise_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info (similar to ai-chatbot Message)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    enterprise_id = Column(Integer, ForeignKey("enterprises.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Query Content
    original_query = Column(Text, nullable=False)  # User's exact question
    processed_query = Column(Text, nullable=True)  # AI-enhanced/clarified version
    query_intent = Column(String, nullable=True)   # Detected intent
    
    # Classification (NEW - not in ai-chatbot)
    query_type = Column(String, nullable=False, default=QueryType.SIMPLE)
    complexity = Column(String, nullable=False, default=QueryComplexity.LOW)
    category = Column(String, nullable=True)  # "finance", "hr", "sales", etc.
    subcategory = Column(String, nullable=True)  # "balance_sheet", "payroll", etc.
    
    # Analysis Metadata (NEW)
    entities_mentioned = Column(JSON, nullable=True)  # Names, companies, dates found
    date_range_requested = Column(JSON, nullable=True)  # {"start": "2023-01-01", "end": "2023-12-31"}
    numerical_filters = Column(JSON, nullable=True)   # Amount ranges, thresholds
    keywords_detected = Column(JSON, nullable=True)   # Important business terms
    
    # Response Data
    ai_response = Column(Text, nullable=True)
    response_format = Column(String, default="text")  # "text", "table", "chart", "report"
    structured_data = Column(JSON, nullable=True)     # Tables, charts data
    confidence_score = Column(Float, nullable=True)   # AI confidence 0-1
    
    # Processing Info (enhanced from ai-chatbot)
    documents_used = Column(JSON, nullable=True)      # List of document IDs
    chunks_analyzed = Column(Integer, default=0)      # Number of text chunks
    processing_time_ms = Column(Integer, nullable=True)
    tokens_used = Column(Integer, nullable=True)      # For billing/analytics
    
    # Status & Flags
    is_sensitive = Column(Boolean, default=False)     # Contains sensitive data
    requires_approval = Column(Boolean, default=False) # Executive approval needed
    is_starred = Column(Boolean, default=False)       # User marked as important
    is_public = Column(Boolean, default=False)        # Shareable within enterprise
    
    # Follow-up & Context (NEW)
    parent_query_id = Column(Integer, ForeignKey("enterprise_queries.id"), nullable=True)
    has_follow_ups = Column(Boolean, default=False)
    conversation_context = Column(JSON, nullable=True) # Previous questions in thread
    
    # Analytics & Learning (NEW)
    user_satisfaction = Column(Integer, nullable=True) # 1-5 rating
    was_helpful = Column(Boolean, nullable=True)
    feedback_text = Column(Text, nullable=True)
    similar_queries_count = Column(Integer, default=0) # How often this type is asked
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    responded_at = Column(DateTime(timezone=True), nullable=True)
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="queries")
    enterprise = relationship("Enterprise", back_populates="queries")
    department = relationship("Department")
    follow_ups = relationship("EnterpriseQuery", remote_side=[id])
    exports = relationship("QueryExport", back_populates="query")
    
    def __repr__(self):
        return f"<EnterpriseQuery(id={self.id}, type='{self.query_type}', user_id={self.user_id})>"
    
    @property
    def processing_time_seconds(self):
        """Convert processing time to seconds"""
        return self.processing_time_ms / 1000 if self.processing_time_ms else 0
    
    @property
    def is_complex(self):
        """Check if query requires advanced processing"""
        return self.complexity in [QueryComplexity.HIGH, QueryComplexity.CRITICAL]
    
    @property
    def response_length(self):
        """Calculate response length"""
        return len(self.ai_response) if self.ai_response else 0


class QueryExport(Base):
    """
    Track exports of query results (NEW feature for enterprises)
    Useful for compliance and audit trails
    """
    __tablename__ = "query_exports"
    
    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("enterprise_queries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    export_format = Column(String, nullable=False)  # "pdf", "excel", "csv", "json"
    export_filename = Column(String, nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    download_count = Column(Integer, default=0)
    
    # Security
    is_confidential = Column(Boolean, default=False)
    access_level = Column(String, default="internal")  # "public", "internal", "restricted"
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_downloaded = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    query = relationship("EnterpriseQuery", back_populates="exports")
    user = relationship("User")
    
    def __repr__(self):
        return f"<QueryExport(id={self.id}, format='{self.export_format}', query_id={self.query_id})>"


class SavedQuery(Base):
    """
    Saved/bookmarked queries for reuse (NEW feature)
    Allows users to save complex queries as templates
    """
    __tablename__ = "saved_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    enterprise_id = Column(Integer, ForeignKey("enterprises.id"), nullable=False)
    
    name = Column(String, nullable=False)  # User-defined name
    description = Column(Text, nullable=True)
    query_template = Column(Text, nullable=False)  # Template with placeholders
    parameters = Column(JSON, nullable=True)  # {"date_range": "last_quarter", "department": "sales"}
    
    # Usage Stats
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Sharing
    is_shared = Column(Boolean, default=False)
    shared_with_departments = Column(JSON, nullable=True)  # List of department IDs
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships  
    user = relationship("User")
    enterprise = relationship("Enterprise")
    
    def __repr__(self):
        return f"<SavedQuery(id={self.id}, name='{self.name}', user_id={self.user_id})>"