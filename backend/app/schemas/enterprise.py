"""
Enterprise Pydantic schemas - Request/response models for business intelligence
Enhanced from ai-chatbot with complex query structures
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

from app.models.enterprise_query import QueryType, QueryComplexity


class EnterpriseQuery(BaseModel):
    """Request schema for enterprise queries"""
    query: str = Field(..., description="The business question or request", min_length=5, max_length=2000)
    department_id: Optional[int] = Field(None, description="Department context for the query")
    context: Optional[str] = Field(None, description="Additional context or instructions")
    priority: Optional[str] = Field("normal", description="Query priority: low, normal, high, urgent")
    

class EnterpriseResponse(BaseModel):
    """Response schema for processed enterprise queries"""
    query_id: int = Field(..., description="Unique identifier for the query")
    response: str = Field(..., description="AI-generated response")
    structured_data: Optional[Dict[str, Any]] = Field(None, description="Tables, charts, and structured content")
    query_type: QueryType = Field(..., description="Detected query type")
    complexity: QueryComplexity = Field(..., description="Query complexity level")
    documents_used: int = Field(..., description="Number of documents analyzed")
    confidence_score: Optional[float] = Field(None, description="AI confidence score (0-1)")
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")
    suggested_follow_ups: List[str] = Field(default_factory=list, description="Suggested follow-up questions")


class QueryHistoryResponse(BaseModel):
    """Schema for query history items"""
    id: int
    original_query: str
    query_type: QueryType
    complexity: QueryComplexity
    confidence_score: Optional[float]
    processing_time_ms: Optional[int]
    created_at: datetime
    was_helpful: Optional[bool]
    user_satisfaction: Optional[int]  # 1-5 rating


class EnterpriseStats(BaseModel):
    """Enterprise analytics and usage statistics"""
    total_queries: int = Field(..., description="Total queries in the period")
    queries_by_type: Dict[str, int] = Field(..., description="Breakdown by query type")
    avg_processing_time_ms: float = Field(..., description="Average processing time")
    avg_satisfaction_score: float = Field(..., description="Average user satisfaction (1-5)")
    period_days: int = Field(..., description="Analysis period in days")


class DocumentUpload(BaseModel):
    """Schema for enterprise document uploads"""
    filename: str = Field(..., description="Original filename")
    category: Optional[str] = Field(None, description="Document category (financial, hr, legal, etc.)")
    department_id: Optional[int] = Field(None, description="Department that owns this document")
    tags: Optional[List[str]] = Field(default_factory=list, description="Document tags for organization")
    is_confidential: bool = Field(False, description="Whether document contains sensitive data")
    fiscal_period: Optional[str] = Field(None, description="Fiscal period for financial documents (e.g., 2023-Q1)")


class SavedQueryTemplate(BaseModel):
    """Schema for saving query templates"""
    name: str = Field(..., description="User-defined name for the query template")
    description: Optional[str] = Field(None, description="Template description")
    query_template: str = Field(..., description="Query template with placeholders")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Template parameters")
    is_shared: bool = Field(False, description="Whether to share with other users")
    shared_with_departments: Optional[List[int]] = Field(None, description="Department IDs to share with")


class QueryFeedback(BaseModel):
    """Schema for query feedback"""
    was_helpful: Optional[bool] = Field(None, description="Whether the response was helpful")
    satisfaction: Optional[int] = Field(None, description="Satisfaction rating (1-5)", ge=1, le=5)
    feedback_text: Optional[str] = Field(None, description="Additional feedback comments", max_length=1000)


class ExportRequest(BaseModel):
    """Schema for export requests"""
    format: str = Field(..., description="Export format: pdf, excel, csv, json")
    include_charts: bool = Field(True, description="Include charts and visualizations")
    include_raw_data: bool = Field(False, description="Include raw data sources")
    custom_title: Optional[str] = Field(None, description="Custom title for the export")


class DataConnector(BaseModel):
    """Schema for external data source connections"""
    connector_type: str = Field(..., description="Type: google_drive, dropbox, salesforce, etc.")
    configuration: Dict[str, Any] = Field(..., description="Connector-specific configuration")
    sync_schedule: Optional[str] = Field(None, description="Cron expression for automatic sync")
    is_active: bool = Field(True, description="Whether connector is active")


class EnterpriseSettings(BaseModel):
    """Schema for enterprise configuration"""
    name: str = Field(..., description="Enterprise name")
    industry: Optional[str] = Field(None, description="Industry sector")
    fiscal_year_start: int = Field(1, description="Fiscal year start month (1-12)", ge=1, le=12)
    currency: str = Field("USD", description="Default currency code")
    timezone: str = Field("UTC", description="Enterprise timezone")
    enable_analytics: bool = Field(True, description="Enable advanced analytics")
    enable_auto_reports: bool = Field(False, description="Enable automatic report generation")
    data_retention_days: int = Field(2555, description="Data retention period in days")


class DepartmentCreate(BaseModel):
    """Schema for creating departments"""
    name: str = Field(..., description="Department name", max_length=100)
    code: str = Field(..., description="Department code", max_length=10)
    description: Optional[str] = Field(None, description="Department description")
    specialized_instructions: Optional[str] = Field(None, description="AI instructions for this department")
    allowed_data_types: Optional[List[str]] = Field(None, description="Allowed data types for this department")


class SimilarQuery(BaseModel):
    """Schema for similar query results"""
    id: int
    original_query: str
    query_type: QueryType
    confidence_score: Optional[float]
    created_at: datetime
    similarity_score: float = Field(..., description="Similarity score (0-1)")


class AnalyticsMetric(BaseModel):
    """Schema for analytics metrics"""
    name: str = Field(..., description="Metric name")
    value: float = Field(..., description="Metric value")
    unit: Optional[str] = Field(None, description="Metric unit")
    change_percent: Optional[float] = Field(None, description="Change percentage from previous period")
    trend: Optional[str] = Field(None, description="Trend direction: up, down, stable")


class FinancialData(BaseModel):
    """Schema for financial data extracted from documents"""
    metric: str = Field(..., description="Financial metric name")
    value: float = Field(..., description="Metric value")
    currency: str = Field("USD", description="Currency code")
    period: Optional[str] = Field(None, description="Time period")
    source_document: Optional[str] = Field(None, description="Source document name")
    confidence: float = Field(..., description="Extraction confidence (0-1)")


class TableData(BaseModel):
    """Schema for extracted table data"""
    headers: List[str] = Field(..., description="Table column headers")
    rows: List[List[str]] = Field(..., description="Table rows")
    title: Optional[str] = Field(None, description="Table title")
    source_document: Optional[str] = Field(None, description="Source document")
    page_number: Optional[int] = Field(None, description="Page number in source document")


class ChartData(BaseModel):
    """Schema for chart generation data"""
    chart_type: str = Field(..., description="Chart type: bar, line, pie, scatter")
    title: str = Field(..., description="Chart title")
    x_axis: List[str] = Field(..., description="X-axis labels")
    y_axis: List[float] = Field(..., description="Y-axis values")
    x_label: Optional[str] = Field(None, description="X-axis label")
    y_label: Optional[str] = Field(None, description="Y-axis label")


class QueryInsight(BaseModel):
    """Schema for query insights and recommendations"""
    insight_type: str = Field(..., description="Type: trend, anomaly, correlation, recommendation")
    title: str = Field(..., description="Insight title")
    description: str = Field(..., description="Detailed description")
    confidence: float = Field(..., description="Insight confidence (0-1)")
    actionable: bool = Field(False, description="Whether this insight suggests specific actions")
    related_metrics: Optional[List[str]] = Field(None, description="Related business metrics")


class AuditLogEntry(BaseModel):
    """Schema for audit log entries"""
    user_id: int
    action: str = Field(..., description="Action performed")
    resource_type: str = Field(..., description="Type of resource accessed")
    resource_id: Optional[int] = Field(None, description="ID of the resource")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional details")
    ip_address: Optional[str] = Field(None, description="User IP address")
    user_agent: Optional[str] = Field(None, description="User agent string")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Action timestamp")