from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import desc

from database.postgresConn import get_db
from auth.oauth2 import get_current_user
from models.all_models import StockMove, Location, LocationType
from schemas.all_schema import StockMoveOut

router = APIRouter(
    prefix="/api/operations",
    tags=["Operations (Receipts & Deliveries)"]
)

# ==============================
#        RECEIPTS (IN)
# ==============================

@router.get("/receipts", response_model=List[StockMoveOut])
def get_receipts(
    search: str = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Fetch ONLY Incoming Receipts (Vendor -> Warehouse).
    Matches the wireframe 'Receipts' view.
    """
    # Logic: Source location MUST be a Vendor
    query = db.query(StockMove).join(StockMove.source_location)\
        .filter(Location.type == LocationType.VENDOR)
    
    if search:
        # Search by Reference or Vendor Name
        query = query.filter(
            (StockMove.reference.ilike(f"%{search}%")) |
            (Location.name.ilike(f"%{search}%"))
        )
        
    return query.order_by(desc(StockMove.created_at)).all()

# ==============================
#      DELIVERIES (OUT)
# ==============================

@router.get("/deliveries", response_model=List[StockMoveOut])
def get_deliveries(
    search: str = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Fetch ONLY Outgoing Deliveries (Warehouse -> Customer).
    """
    # Logic: Destination location MUST be a Customer
    query = db.query(StockMove).join(StockMove.dest_location)\
        .filter(Location.type == LocationType.CUSTOMER)
    
    if search:
        query = query.filter(
            (StockMove.reference.ilike(f"%{search}%")) |
            (Location.name.ilike(f"%{search}%"))
        )
        
    return query.order_by(desc(StockMove.created_at)).all()