"""
Document model for Enterprise AI Brain
Enhanced from ai-chatbot with enterprise metadata
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Document(Base):
    """
    Document model for enterprise files
    Enhanced with enterprise-specific metadata
    """
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic file info (from ai-chatbot)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String, nullable=True)
    
    # Enterprise context (NEW)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    enterprise_id = Column(Integer, ForeignKey("enterprises.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Enterprise metadata (NEW)
    category = Column(String, nullable=True)  # financial, hr, legal, operations
    tags = Column(JSON, nullable=True)  # List of tags
    is_confidential = Column(Boolean, default=False)
    fiscal_period = Column(String, nullable=True)  # e.g., "2023-Q1", "2023-07"
    
    # Processing info (enhanced from ai-chatbot)
    processed = Column(Boolean, default=False)
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    chunks_count = Column(Integer, default=0)
    processing_time_seconds = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Advanced metadata (NEW)
    metadata = Column(JSON, nullable=True)  # Extracted metadata (tables, entities, etc.)
    language = Column(String, default="en")
    content_hash = Column(String, nullable=True)  # For deduplication
    
    # Access control (NEW)
    access_level = Column(String, default="internal")  # public, internal, restricted, confidential
    allowed_roles = Column(JSON, nullable=True)  # List of roles that can access
    
    # Analytics
    access_count = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="documents")
    enterprise = relationship("Enterprise", back_populates="documents")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}', enterprise_id={self.enterprise_id})>"
    
    @property
    def file_size_mb(self):
        """Get file size in MB"""
        return self.file_size / (1024 * 1024) if self.file_size else 0
    
    @property
    def is_processed_successfully(self):
        """Check if document was processed successfully"""
        return self.processed and self.processing_status == "completed"
    
    @property
    def processing_time_minutes(self):
        """Get processing time in minutes"""
        return self.processing_time_seconds / 60 if self.processing_time_seconds else 0