"""
Enterprise model - Extended from ai-chatbot's Tenant model
Designed for complex organizational structures and enterprise features
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Enterprise(Base):
    """
    Enterprise entity - Similar to Tenant but for internal company use
    Each Enterprise represents a company using the AI Brain system
    """
    __tablename__ = "enterprises"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info (similar to ai-chatbot Tenant)
    name = Column(String, nullable=False)  # e.g., "Coca-Cola Inc.", "Microsoft Corp"
    slug = Column(String, unique=True, index=True, nullable=False)  # e.g., "coca-cola", "microsoft"
    
    # Enterprise-specific info (enhanced)
    industry = Column(String, nullable=True)  # e.g., "Technology", "Healthcare", "Finance"
    company_size = Column(String, nullable=True)  # e.g., "startup", "sme", "enterprise"
    headquarters = Column(String, nullable=True)  # e.g., "New York, NY"
    website = Column(String, nullable=True)
    
    # AI Configuration (enterprise-grade)
    company_description = Column(Text, nullable=True)  # For AI context
    business_context = Column(Text, nullable=True)  # Industry-specific context
    ai_instructions = Column(Text, nullable=True)  # Custom AI behavior instructions
    
    # Visual Branding (enhanced from ai-chatbot)
    primary_color = Column(String, nullable=True)
    secondary_color = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    brand_guidelines = Column(Text, nullable=True)
    
    # Enterprise Features (NEW - not in ai-chatbot)
    fiscal_year_start = Column(Integer, default=1)  # January = 1
    currency = Column(String, default="USD")
    timezone = Column(String, default="UTC")
    date_format = Column(String, default="YYYY-MM-DD")
    
    # Data Sources Configuration (NEW)
    connected_systems = Column(JSON, nullable=True)  # {"crm": "salesforce", "erp": "sap"}
    data_refresh_schedule = Column(String, nullable=True)  # Cron format
    last_data_sync = Column(DateTime(timezone=True), nullable=True)
    
    # Limits & Configuration (enhanced from ai-chatbot)
    max_documents = Column(Integer, default=10000)  # 100x more than ai-chatbot
    max_users = Column(Integer, default=100)        # 10x more than ai-chatbot
    max_queries_per_day = Column(Integer, default=1000)
    max_file_size_mb = Column(Integer, default=100)  # 10x more than ai-chatbot
    
    # Analytics & Reporting (NEW)
    enable_analytics = Column(Boolean, default=True)
    enable_auto_reports = Column(Boolean, default=False)
    report_recipients = Column(JSON, nullable=True)  # List of email addresses
    
    # Security & Compliance (NEW)
    enable_audit_log = Column(Boolean, default=True)
    data_retention_days = Column(Integer, default=2555)  # 7 years default
    enable_data_export = Column(Boolean, default=True)
    compliance_requirements = Column(JSON, nullable=True)  # ["GDPR", "SOX", "HIPAA"]
    
    # Billing & Subscription (NEW)
    subscription_plan = Column(String, default="basic")  # basic, pro, enterprise
    billing_email = Column(String, nullable=True)
    monthly_query_limit = Column(Integer, default=5000)
    overage_rate = Column(Float, default=0.01)  # Per extra query
    
    # Status & Metadata
    is_active = Column(Boolean, default=True)
    is_trial = Column(Boolean, default=True)
    trial_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships (enhanced from ai-chatbot structure)
    users = relationship("User", back_populates="enterprise")
    documents = relationship("Document", back_populates="enterprise") 
    queries = relationship("EnterpriseQuery", back_populates="enterprise")
    reports = relationship("AutoReport", back_populates="enterprise")
    audit_logs = relationship("AuditLog", back_populates="enterprise")
    
    def __repr__(self):
        return f"<Enterprise(id={self.id}, name='{self.name}', slug='{self.slug}')>"
    
    @property
    def display_name(self):
        """Friendly display name for UI"""
        return self.name
    
    @property
    def is_premium(self):
        """Check if enterprise has premium features"""
        return self.subscription_plan in ["pro", "enterprise"]
    
    @property
    def remaining_trial_days(self):
        """Calculate remaining trial days"""
        if not self.is_trial or not self.trial_expires_at:
            return 0
        
        from datetime import datetime
        remaining = self.trial_expires_at - datetime.utcnow()
        return max(0, remaining.days)


class Department(Base):
    """
    Department within an Enterprise (NEW - not in ai-chatbot)
    Allows for departmental data segregation and permissions
    """
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    enterprise_id = Column(Integer, nullable=False, index=True)
    
    name = Column(String, nullable=False)  # e.g., "Finance", "HR", "Marketing"
    code = Column(String, nullable=False)  # e.g., "FIN", "HR", "MKT"
    description = Column(Text, nullable=True)
    
    # Department-specific AI settings
    specialized_instructions = Column(Text, nullable=True)
    allowed_data_types = Column(JSON, nullable=True)  # ["financial", "hr", "sales"]
    
    # Permissions
    can_access_all_data = Column(Boolean, default=False)
    restricted_keywords = Column(JSON, nullable=True)  # Sensitive terms to filter
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}', enterprise_id={self.enterprise_id})>"