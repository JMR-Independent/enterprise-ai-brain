"""
Data Connectors API - NEW enterprise feature
Connect to external data sources (Google Drive, Dropbox, CRM systems)
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.enterprise import Enterprise
from app.schemas.enterprise import DataConnector

router = APIRouter(prefix="/api/connectors", tags=["connectors"])


@router.get("/available")
async def list_available_connectors(
    current_user: User = Depends(get_current_user)
):
    """
    List available data connectors for enterprise integration
    """
    connectors = [
        {
            "type": "google_drive",
            "name": "Google Drive",
            "description": "Connect to Google Drive to automatically sync documents",
            "supported_formats": ["pdf", "docx", "xlsx", "csv", "txt"],
            "features": ["auto_sync", "folder_monitoring", "shared_drives"],
            "setup_required": ["oauth", "folder_selection"]
        },
        {
            "type": "dropbox", 
            "name": "Dropbox",
            "description": "Connect to Dropbox for document synchronization",
            "supported_formats": ["pdf", "docx", "xlsx", "csv", "txt", "pptx"],
            "features": ["auto_sync", "folder_monitoring"],  
            "setup_required": ["oauth", "folder_selection"]
        },
        {
            "type": "salesforce",
            "name": "Salesforce",
            "description": "Import reports and data from Salesforce CRM",
            "supported_formats": ["reports", "dashboards", "custom_objects"],
            "features": ["scheduled_sync", "incremental_updates", "custom_queries"],
            "setup_required": ["api_credentials", "object_selection"]
        },
        {
            "type": "sharepoint",
            "name": "Microsoft SharePoint",
            "description": "Connect to SharePoint document libraries",
            "supported_formats": ["pdf", "docx", "xlsx", "pptx"],
            "features": ["auto_sync", "permissions_sync", "version_control"],
            "setup_required": ["oauth", "site_selection"]
        },
        {
            "type": "onedrive",
            "name": "Microsoft OneDrive",
            "description": "Sync documents from OneDrive for Business",
            "supported_formats": ["pdf", "docx", "xlsx", "pptx", "txt"],
            "features": ["auto_sync", "folder_monitoring"],
            "setup_required": ["oauth", "folder_selection"]
        },
        {
            "type": "box",
            "name": "Box",
            "description": "Enterprise file sharing and collaboration platform",
            "supported_formats": ["pdf", "docx", "xlsx", "csv", "txt"],
            "features": ["auto_sync", "enterprise_permissions", "compliance"],
            "setup_required": ["oauth", "folder_selection"]
        },
        {
            "type": "database",
            "name": "Database Connection",
            "description": "Connect to SQL databases for data analysis",
            "supported_formats": ["sql_queries", "table_exports"],
            "features": ["scheduled_queries", "custom_sql", "table_monitoring"],
            "setup_required": ["connection_string", "query_configuration"]
        },
        {
            "type": "api_endpoint",
            "name": "Custom API",
            "description": "Connect to custom REST APIs for data ingestion",
            "supported_formats": ["json", "xml", "csv"],
            "features": ["scheduled_polls", "webhook_support", "authentication"],
            "setup_required": ["endpoint_url", "authentication_setup"]
        }
    ]
    
    return {"available_connectors": connectors}


@router.post("/setup/{connector_type}")
async def setup_connector(
    connector_type: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Set up a new data connector for the enterprise
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    body = await request.json()
    configuration = body.get("configuration", {})
    sync_schedule = body.get("sync_schedule")  # Cron expression
    
    # Validate connector type
    valid_types = ["google_drive", "dropbox", "salesforce", "sharepoint", "onedrive", "box", "database", "api_endpoint"]
    if connector_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid connector type. Supported: {valid_types}")
    
    try:
        # Initialize connector based on type
        if connector_type == "google_drive":
            result = await _setup_google_drive_connector(configuration, current_user.enterprise_id, db)
        elif connector_type == "dropbox":
            result = await _setup_dropbox_connector(configuration, current_user.enterprise_id, db)
        elif connector_type == "salesforce":
            result = await _setup_salesforce_connector(configuration, current_user.enterprise_id, db)
        else:
            # For other connectors, create a placeholder configuration
            result = await _setup_generic_connector(connector_type, configuration, current_user.enterprise_id, db)
        
        return {
            "message": f"{connector_type} connector configured successfully",
            "connector_id": result["connector_id"],
            "status": "configured",
            "sync_schedule": sync_schedule,
            "next_sync": "Based on schedule" if sync_schedule else "Manual trigger required"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connector setup failed: {str(e)}")


@router.get("/configured")
async def list_configured_connectors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all configured connectors for the enterprise
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Get enterprise to check configured connectors
    result = await db.execute(
        select(Enterprise).where(Enterprise.id == current_user.enterprise_id)
    )
    enterprise = result.scalar_one()
    
    configured_connectors = enterprise.connected_systems or {}
    
    # Format response with status information
    connectors_info = []
    for connector_type, config in configured_connectors.items():
        connectors_info.append({
            "type": connector_type,
            "status": config.get("status", "unknown"),
            "configured_at": config.get("configured_at"),
            "last_sync": config.get("last_sync"),
            "sync_schedule": config.get("sync_schedule"),
            "documents_synced": config.get("documents_synced", 0),
            "is_active": config.get("is_active", True)
        })
    
    return {"configured_connectors": connectors_info}


@router.post("/sync/{connector_type}")
async def trigger_sync(
    connector_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually trigger synchronization for a specific connector
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Get enterprise configuration
    result = await db.execute(
        select(Enterprise).where(Enterprise.id == current_user.enterprise_id)
    )
    enterprise = result.scalar_one()
    
    configured_connectors = enterprise.connected_systems or {}
    
    if connector_type not in configured_connectors:
        raise HTTPException(status_code=404, detail="Connector not configured")
    
    try:
        # Trigger sync based on connector type
        if connector_type == "google_drive":
            sync_result = await _sync_google_drive(configured_connectors[connector_type], enterprise, db)
        elif connector_type == "dropbox":
            sync_result = await _sync_dropbox(configured_connectors[connector_type], enterprise, db)
        elif connector_type == "salesforce":
            sync_result = await _sync_salesforce(configured_connectors[connector_type], enterprise, db)
        else:
            sync_result = {"status": "not_implemented", "message": f"Sync for {connector_type} not yet implemented"}
        
        # Update last sync time
        configured_connectors[connector_type]["last_sync"] = datetime.utcnow().isoformat()
        enterprise.connected_systems = configured_connectors
        enterprise.last_data_sync = datetime.utcnow()
        
        await db.commit()
        
        return {
            "connector_type": connector_type,
            "sync_status": sync_result["status"],
            "documents_processed": sync_result.get("documents_processed", 0),
            "sync_time": datetime.utcnow().isoformat(),
            "details": sync_result.get("details", "Sync completed")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.delete("/{connector_type}")
async def remove_connector(
    connector_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a configured connector
    """
    if not current_user.enterprise_id:
        raise HTTPException(status_code=400, detail="User not associated with enterprise")
    
    # Get enterprise configuration
    result = await db.execute(
        select(Enterprise).where(Enterprise.id == current_user.enterprise_id)
    )
    enterprise = result.scalar_one()
    
    configured_connectors = enterprise.connected_systems or {}
    
    if connector_type not in configured_connectors:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    # Remove connector configuration
    del configured_connectors[connector_type]
    enterprise.connected_systems = configured_connectors
    
    await db.commit()
    
    return {"message": f"{connector_type} connector removed successfully"}


# Helper functions for specific connectors
async def _setup_google_drive_connector(config: Dict[str, Any], enterprise_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Set up Google Drive connector"""
    # Validate required configuration
    required_fields = ["client_id", "client_secret", "folder_ids"]
    for field in required_fields:
        if field not in config:
            raise ValueError(f"Missing required field: {field}")
    
    # Update enterprise configuration
    result = await db.execute(select(Enterprise).where(Enterprise.id == enterprise_id))
    enterprise = result.scalar_one()
    
    connected_systems = enterprise.connected_systems or {}
    connected_systems["google_drive"] = {
        "status": "configured",
        "configured_at": datetime.utcnow().isoformat(),
        "folder_ids": config["folder_ids"],
        "sync_schedule": config.get("sync_schedule"),
        "is_active": True
    }
    
    enterprise.connected_systems = connected_systems
    await db.commit()
    
    return {"connector_id": "google_drive", "status": "configured"}


async def _setup_dropbox_connector(config: Dict[str, Any], enterprise_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Set up Dropbox connector"""
    required_fields = ["app_key", "app_secret", "folder_paths"]
    for field in required_fields:
        if field not in config:
            raise ValueError(f"Missing required field: {field}")
    
    result = await db.execute(select(Enterprise).where(Enterprise.id == enterprise_id))
    enterprise = result.scalar_one()
    
    connected_systems = enterprise.connected_systems or {}
    connected_systems["dropbox"] = {
        "status": "configured",
        "configured_at": datetime.utcnow().isoformat(),
        "folder_paths": config["folder_paths"],
        "sync_schedule": config.get("sync_schedule"),
        "is_active": True
    }
    
    enterprise.connected_systems = connected_systems
    await db.commit()
    
    return {"connector_id": "dropbox", "status": "configured"}


async def _setup_salesforce_connector(config: Dict[str, Any], enterprise_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Set up Salesforce connector"""
    required_fields = ["client_id", "client_secret", "username", "password", "security_token"]
    for field in required_fields:
        if field not in config:
            raise ValueError(f"Missing required field: {field}")
    
    result = await db.execute(select(Enterprise).where(Enterprise.id == enterprise_id))
    enterprise = result.scalar_one()
    
    connected_systems = enterprise.connected_systems or {}
    connected_systems["salesforce"] = {
        "status": "configured",
        "configured_at": datetime.utcnow().isoformat(),
        "objects_to_sync": config.get("objects_to_sync", ["Account", "Contact", "Opportunity"]),
        "sync_schedule": config.get("sync_schedule", "0 2 * * *"),  # Daily at 2 AM
        "is_active": True
    }
    
    enterprise.connected_systems = connected_systems
    await db.commit()
    
    return {"connector_id": "salesforce", "status": "configured"}


async def _setup_generic_connector(connector_type: str, config: Dict[str, Any], enterprise_id: int, db: AsyncSession) -> Dict[str, Any]:
    """Set up generic connector (placeholder for future implementations)"""
    result = await db.execute(select(Enterprise).where(Enterprise.id == enterprise_id))
    enterprise = result.scalar_one()
    
    connected_systems = enterprise.connected_systems or {}
    connected_systems[connector_type] = {
        "status": "configured",
        "configured_at": datetime.utcnow().isoformat(),
        "configuration": config,
        "is_active": True
    }
    
    enterprise.connected_systems = connected_systems
    await db.commit()
    
    return {"connector_id": connector_type, "status": "configured"}


# Sync helper functions (placeholder implementations)
async def _sync_google_drive(config: Dict[str, Any], enterprise: Enterprise, db: AsyncSession) -> Dict[str, Any]:
    """Sync documents from Google Drive"""
    # TODO: Implement actual Google Drive API integration
    return {
        "status": "completed",
        "documents_processed": 0,
        "details": "Google Drive sync not yet implemented - placeholder response"
    }


async def _sync_dropbox(config: Dict[str, Any], enterprise: Enterprise, db: AsyncSession) -> Dict[str, Any]:
    """Sync documents from Dropbox"""
    # TODO: Implement actual Dropbox API integration
    return {
        "status": "completed", 
        "documents_processed": 0,
        "details": "Dropbox sync not yet implemented - placeholder response"
    }


async def _sync_salesforce(config: Dict[str, Any], enterprise: Enterprise, db: AsyncSession) -> Dict[str, Any]:
    """Sync data from Salesforce"""
    # TODO: Implement actual Salesforce API integration
    return {
        "status": "completed",
        "documents_processed": 0,
        "details": "Salesforce sync not yet implemented - placeholder response"
    }