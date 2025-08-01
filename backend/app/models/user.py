"""
User model for Enterprise AI Brain
Enhanced from ai-chatbot with enterprise features
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    """
    User model for enterprise employees
    Enhanced from ai-chatbot with enterprise context
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    
    # Enterprise context (NEW)
    enterprise_id = Column(Integer, ForeignKey("enterprises.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    role = Column(String, default="user")  # user, admin, manager, analyst
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)  # Skip email verification for enterprise
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    enterprise = relationship("Enterprise", back_populates="users")
    documents = relationship("Document", back_populates="user")
    queries = relationship("EnterpriseQuery", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', enterprise_id={self.enterprise_id})>"
    
    @property
    def is_admin(self):
        """Check if user is an admin"""
        return self.role in ["admin", "super_admin"]
    
    @property
    def can_manage_enterprise(self):
        """Check if user can manage enterprise settings"""
        return self.role in ["admin", "manager"]