"""
Configuration settings for Enterprise AI Brain
Enhanced from ai-chatbot with enterprise features
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App Info
    APP_NAME: str = "Enterprise AI Brain"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/enterprise_ai_db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    JWT_SECRET_KEY: str = "your-super-secret-enterprise-jwt-key-here"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    SECRET_KEY: str = "your-secret-key-for-enterprise-encryption"
    BCRYPT_ROUNDS: int = 12
    
    # OpenAI & LangChain
    OPENAI_API_KEY: str = "sk-your-openai-api-key-here"
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_PROJECT: str = "enterprise-ai-brain"
    
    # Vector Store
    VECTOR_STORE_PATH: str = "../enterprise_chroma_db"
    EMBEDDING_MODEL: str = "text-embedding-ada-002"
    
    # Enterprise RAG Configuration
    DEFAULT_MAX_DOCUMENTS: int = 10
    ENTERPRISE_MAX_DOCUMENTS: int = 10000
    RAG_SIMILARITY_THRESHOLD: float = 0.6
    CONVERSATION_HISTORY_LIMIT: int = 20
    CHUNK_SIZE: int = 2000
    CHUNK_OVERLAP: int = 400
    LLM_MODEL: str = "gpt-4"
    LLM_TEMPERATURE: float = 0.1
    
    # File Processing
    UPLOAD_DIR: str = "../enterprise_uploads"
    MAX_FILE_SIZE: int = 104857600  # 100MB
    SUPPORTED_FORMATS: str = "pdf,docx,xlsx,csv,txt,json,pptx"
    ENABLE_OCR: bool = True
    ENABLE_TABLE_EXTRACTION: bool = True
    ENABLE_FINANCIAL_PARSING: bool = True
    
    # Google Drive Connector
    GOOGLE_DRIVE_CLIENT_ID: str = ""
    GOOGLE_DRIVE_CLIENT_SECRET: str = ""
    GOOGLE_DRIVE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    GOOGLE_DRIVE_SCOPES: str = "https://www.googleapis.com/auth/drive.readonly"
    
    # Analytics & Reporting
    ENABLE_ADVANCED_ANALYTICS: bool = True
    ENABLE_AUTO_REPORTS: bool = True
    REPORTS_OUTPUT_DIR: str = "../reports"
    ENABLE_CHARTS: bool = True
    CHART_THEME: str = "plotly_white"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Enterprise Features
    ENABLE_MULTI_LANGUAGE: bool = True
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: str = "en,es,fr,de"
    ENABLE_AUDIT_LOG: bool = True
    ENABLE_DATA_EXPORT: bool = True
    ENABLE_SCHEDULED_QUERIES: bool = True
    
    # Cache & Performance
    REDIS_CACHE_TTL: int = 3600
    ENABLE_QUERY_CACHE: bool = True
    ENABLE_RESULT_PAGINATION: bool = True
    MAX_RESULTS_PER_PAGE: int = 50
    
    # Security
    ENABLE_IP_WHITELIST: bool = False
    ALLOWED_IPS: str = "192.168.1.0/24"
    ENABLE_API_RATE_LIMITING: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    ENABLE_AUDIT_TRAIL: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS to list if it's a string"""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS


# Global settings instance
settings = Settings()