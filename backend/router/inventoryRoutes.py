from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from sqlalchemy import desc

from database.postgresConn import get_db
from auth.oauth2 import get_current_user
from models.all_models import StockMove, Warehouse, Location, LocationType, Product
from schemas.all_schema import WarehouseCreate, WarehouseOut, LocationCreate, LocationOut, StockMoveCreate, StockMoveOut

router = APIRouter(
    prefix="/api",
    tags=["Inventory Settings"]
)

# ===========================
#        WAREHOUSES
# ===========================

@router.get("/warehouses", response_model=List[WarehouseOut])
def get_warehouses(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Warehouse).all()

@router.post("/warehouses", response_model=WarehouseOut)
def create_warehouse(wh: WarehouseCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_wh = Warehouse(
        name=wh.name,
        short_code=wh.short_code,
        address=wh.address
    )
    db.add(new_wh)
    db.commit()
    db.refresh(new_wh)
    return new_wh

# ===========================
#         LOCATIONS
# ===========================

@router.get("/locations", response_model=List[LocationOut])
def get_locations(
    warehouse_id: int = None, # Optional filter: ?warehouse_id=1
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    query = db.query(Location)
    if warehouse_id:
        query = query.filter(Location.warehouse_id == warehouse_id)
    return query.all()

@router.post("/locations", response_model=LocationOut)
def create_location(loc: LocationCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    
    # Validation: If it's an internal location, it SHOULD have a warehouse
    if loc.type == "internal" and not loc.warehouse_id:
         raise HTTPException(status_code=400, detail="Internal locations must belong to a Warehouse")

    new_loc = Location(
        name=loc.name,
        short_code=loc.short_code,
        type=loc.type,
        warehouse_id=loc.warehouse_id
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return new_loc

# ===========================
#        STOCK MOVES
# ===========================
# Make sure HTTPException is imported at the top
from fastapi import HTTPException 

def generate_reference(db: Session, source_id: int, dest_id: int) -> str:
    """
    Generates IDs like WH1/IN/0001 based on movement type.
    """
    source = db.query(Location).get(source_id)
    dest = db.query(Location).get(dest_id)
    
    # --- VALIDATION FIX START ---
    if not source:
        raise HTTPException(status_code=404, detail=f"Source Location with ID {source_id} not found")
    
    if not dest:
        raise HTTPException(status_code=404, detail=f"Destination Location with ID {dest_id} not found")
    # --- VALIDATION FIX END ---
    
    # 1. Determine Operation Type
    op_code = "INT" # Default Internal
    warehouse_code = "GEN" # General
    
    # Safely check source type
    if source.type == LocationType.VENDOR:
        op_code = "IN"
        if dest.warehouse: warehouse_code = dest.warehouse.short_code
            
    # Safely check dest type
    elif dest.type == LocationType.CUSTOMER:
        op_code = "OUT"
        if source.warehouse: warehouse_code = source.warehouse.short_code

    # 2. Find the next ID number
    count = db.query(StockMove).filter(StockMove.reference.contains(f"{op_code}/")).count()
    sequence = count + 1
    
    return f"{warehouse_code}/{op_code}/{sequence:04d}"

@router.get("/moves", response_model=List[StockMoveOut])
def get_move_history(
    search: str = None, # For the search bar in your wireframe
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Fetch the Move History for the List View.
    Supports filtering by Reference or Contact Name (Location Name).
    """
    query = db.query(StockMove)
    
    if search:
        # Search in Reference OR Product Name OR Location Name
        query = query.join(StockMove.product).join(StockMove.source_location).filter(
            (StockMove.reference.contains(search)) |
            (Product.name.contains(search)) |
            (Location.name.contains(search))
        )
        
    return query.order_by(desc(StockMove.created_at)).all()

@router.post("/moves", response_model=StockMoveOut)
def create_stock_move(move: StockMoveCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    
    # 1. Generate the Reference ID (WH1/IN/001)
    ref = generate_reference(db, move.source_location_id, move.destination_location_id)
    
    # 2. Create the Move Record
    new_move = StockMove(
        product_id=move.product_id,
        quantity=move.quantity,
        source_location_id=move.source_location_id,
        destination_location_id=move.destination_location_id,
        status=move.status,
        reference=ref
    )
    
    db.add(new_move)
    db.commit()
    db.refresh(new_move)
    return new_move