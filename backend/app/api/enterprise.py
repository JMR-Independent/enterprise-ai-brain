"""
Enterprise API routes - Core business intelligence endpoints
Enhanced from ai-chatbot with advanced query processing
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.enterprise import Enterprise, Department
from app.models.enterprise_query import EnterpriseQuery, QueryType, QueryComplexity
from app.services.enterprise_analysis_service import EnterpriseAnalysisService
from app.schemas.enterprise import (
    EnterpriseQuery as EnterpriseQuerySchema,
    EnterpriseResponse,
    QueryHistoryResponse,
    EnterpriseStats
)

router = APIRouter(prefix="/api/enterprise", tags=["enterprise"])


@router.post("/query", response_model=EnterpriseResponse)
async def process_enterprise_query(
    request: EnterpriseQuerySchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Process complex enterprise queries with advanced AI analysis
    Main endpoint for business intelligence questions
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Initialize analysis service
    analysis_service = EnterpriseAnalysisService()
    
    try:
        # Process the query with full enterprise intelligence
        result = await analysis_service.process_enterprise_query(
            query=request.query,
            enterprise_id=current_user.enterprise_id,
            user_id=current_user.id,
            db=db,
            department_id=request.department_id
        )
        
        return EnterpriseResponse(
            query_id=result["query_id"],
            response=result["response"],
            structured_data=result["structured_data"],
            query_type=result["query_type"],
            complexity=result["complexity"],
            documents_used=result["documents_used"],
            confidence_score=result["confidence_score"],
            processing_time_ms=result["processing_time_ms"],
            suggested_follow_ups=result["suggested_follow_ups"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")


@router.get("/queries/history", response_model=List[QueryHistoryResponse])
async def get_query_history(
    limit: int = Query(20, description="Number of queries to return"),
    offset: int = Query(0, description="Number of queries to skip"),
    query_type: Optional[QueryType] = Query(None, description="Filter by query type"),
    complexity: Optional[QueryComplexity] = Query(None, description="Filter by complexity"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get enterprise query history with filtering
    Useful for analytics and finding previous analyses
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Build query with filters
    query = select(EnterpriseQuery).where(
        EnterpriseQuery.enterprise_id == current_user.enterprise_id
    ).order_by(desc(EnterpriseQuery.created_at))
    
    if query_type:
        query = query.where(EnterpriseQuery.query_type == query_type)
    if complexity:
        query = query.where(EnterpriseQuery.complexity == complexity)
        
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    queries = result.scalars().all()
    
    return [
        QueryHistoryResponse(
            id=q.id,
            original_query=q.original_query,
            query_type=q.query_type,
            complexity=q.complexity,
            confidence_score=q.confidence_score,
            processing_time_ms=q.processing_time_ms,
            created_at=q.created_at,
            was_helpful=q.was_helpful,
            user_satisfaction=q.user_satisfaction
        )
        for q in queries
    ]


@router.get("/query/{query_id}")
async def get_query_details(
    query_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific query
    Including full response and structured data
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    result = await db.execute(
        select(EnterpriseQuery).where(
            EnterpriseQuery.id == query_id,
            EnterpriseQuery.enterprise_id == current_user.enterprise_id
        )
    )
    query = result.scalar_one_or_none()
    
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    return {
        "id": query.id,
        "original_query": query.original_query,
        "query_type": query.query_type,
        "complexity": query.complexity,
        "ai_response": query.ai_response,
        "structured_data": query.structured_data,
        "confidence_score": query.confidence_score,
        "processing_time_ms": query.processing_time_ms,
        "documents_used": query.documents_used,
        "entities_mentioned": query.entities_mentioned,
        "created_at": query.created_at,
        "was_helpful": query.was_helpful,
        "user_satisfaction": query.user_satisfaction,
        "feedback_text": query.feedback_text
    }


@router.post("/query/{query_id}/feedback")
async def submit_query_feedback(
    query_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit feedback for a query (helpful/not helpful, rating, comments)
    Important for improving the AI system
    """
    body = await request.json()
    was_helpful = body.get("was_helpful")
    satisfaction = body.get("satisfaction")  # 1-5 rating
    feedback_text = body.get("feedback_text")
    
    result = await db.execute(
        select(EnterpriseQuery).where(
            EnterpriseQuery.id == query_id,
            EnterpriseQuery.enterprise_id == current_user.enterprise_id
        )
    )
    query = result.scalar_one_or_none()
    
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    # Update feedback
    query.was_helpful = was_helpful
    query.user_satisfaction = satisfaction
    query.feedback_text = feedback_text
    
    await db.commit()
    
    return {"message": "Feedback submitted successfully"}


@router.get("/stats", response_model=EnterpriseStats)
async def get_enterprise_stats(
    days: int = Query(30, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get enterprise analytics and usage statistics
    Executive dashboard data
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Total queries in period
    total_queries_result = await db.execute(
        select(EnterpriseQuery).where(
            EnterpriseQuery.enterprise_id == current_user.enterprise_id,
            EnterpriseQuery.created_at >= start_date
        )
    )
    total_queries = len(total_queries_result.scalars().all())
    
    # Query types breakdown
    query_types_result = await db.execute(
        select(EnterpriseQuery.query_type, EnterpriseQuery.id).where(
            EnterpriseQuery.enterprise_id == current_user.enterprise_id,
            EnterpriseQuery.created_at >= start_date
        )
    )
    queries_by_type = {}
    for query_type, _ in query_types_result.fetchall():
        queries_by_type[query_type] = queries_by_type.get(query_type, 0) + 1
    
    # Average processing time
    processing_times_result = await db.execute(
        select(EnterpriseQuery.processing_time_ms).where(
            EnterpriseQuery.enterprise_id == current_user.enterprise_id,
            EnterpriseQuery.created_at >= start_date,
            EnterpriseQuery.processing_time_ms.isnot(None)
        )
    )
    processing_times = [t[0] for t in processing_times_result.fetchall()]
    avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
    
    # Satisfaction scores
    satisfaction_result = await db.execute(
        select(EnterpriseQuery.user_satisfaction).where(
            EnterpriseQuery.enterprise_id == current_user.enterprise_id,
            EnterpriseQuery.created_at >= start_date,
            EnterpriseQuery.user_satisfaction.isnot(None)
        )
    )
    satisfaction_scores = [s[0] for s in satisfaction_result.fetchall()]
    avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0
    
    return EnterpriseStats(
        total_queries=total_queries,
        queries_by_type=queries_by_type,
        avg_processing_time_ms=avg_processing_time,
        avg_satisfaction_score=avg_satisfaction,
        period_days=days
    )


@router.get("/departments", response_model=List[Dict])
async def get_departments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get departments for the current enterprise
    Used for departmental filtering and permissions
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    result = await db.execute(
        select(Department).where(Department.enterprise_id == current_user.enterprise_id)
    )
    departments = result.scalars().all()
    
    return [
        {
            "id": dept.id,
            "name": dept.name,
            "code": dept.code,
            "description": dept.description
        }
        for dept in departments
    ]


@router.post("/export/{query_id}")
async def export_query_results(
    query_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export query results in various formats (PDF, Excel, CSV)
    Enterprise feature for sharing and compliance
    """
    body = await request.json()
    export_format = body.get("format", "pdf")  # pdf, excel, csv
    
    # Validate query exists and user has access
    result = await db.execute(
        select(EnterpriseQuery).where(
            EnterpriseQuery.id == query_id,
            EnterpriseQuery.enterprise_id == current_user.enterprise_id
        )
    )
    query = result.scalar_one_or_none()
    
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    # TODO: Implement actual export logic
    # For now, return a placeholder response
    return {
        "message": f"Export initiated for query {query_id} in {export_format} format",
        "export_id": f"exp_{query_id}_{int(datetime.utcnow().timestamp())}",
        "estimated_completion": "2-3 minutes"
    }


@router.get("/similar-queries/{query_id}")
async def get_similar_queries(
    query_id: int,
    limit: int = Query(5, description="Number of similar queries to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Find similar queries to help users discover related analyses
    Uses query embeddings and entity matching
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Get the original query
    result = await db.execute(
        select(EnterpriseQuery).where(
            EnterpriseQuery.id == query_id,
            EnterpriseQuery.enterprise_id == current_user.enterprise_id
        )
    )
    original_query = result.scalar_one_or_none()
    
    if not original_query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    # Find similar queries (simplified approach - would use embeddings in production)
    similar_result = await db.execute(
        select(EnterpriseQuery).where(
            EnterpriseQuery.enterprise_id == current_user.enterprise_id,
            EnterpriseQuery.id != query_id,
            EnterpriseQuery.query_type == original_query.query_type
        ).order_by(desc(EnterpriseQuery.created_at)).limit(limit)
    )
    similar_queries = similar_result.scalars().all()
    
    return [
        {
            "id": q.id,
            "original_query": q.original_query,
            "query_type": q.query_type,
            "confidence_score": q.confidence_score,
            "created_at": q.created_at,
            "similarity_score": 0.75  # Placeholder - would calculate actual similarity
        }
        for q in similar_queries
    ]