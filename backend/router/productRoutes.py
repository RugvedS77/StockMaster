from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.postgresConn import get_db
from auth.oauth2 import get_current_user
from models.all_models import Product, StockMove, Location, LocationType, MoveStatus
from sqlalchemy import func
from schemas.all_schema import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

# 1. CREATE (Already established, but refined)
@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Check for duplicate SKU
    if db.query(Product).filter(Product.sku == product.sku).first():
        raise HTTPException(status_code=400, detail=f"Product with SKU '{product.sku}' already exists")

    new_product = Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# 2. READ ALL
@router.get("/", response_model=List[ProductOut])
def get_all_products(
    search: str = None, 
    category: str = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
# 1. Get all products
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    products = query.all()
    
    # 2. Calculate Stock for EACH product
    results = []
    for p in products:
        # A. Calculate "On Hand" (Physical Stock in Warehouse)
        # Logic: Incoming Moves (Done) - Outgoing Moves (Done)
        
        incoming_qty = db.query(func.sum(StockMove.quantity)).join(StockMove.dest_location)\
            .filter(StockMove.product_id == p.id)\
            .filter(StockMove.status == MoveStatus.DONE)\
            .filter(Location.type == LocationType.INTERNAL).scalar() or 0
            
        outgoing_qty = db.query(func.sum(StockMove.quantity)).join(StockMove.source_location)\
            .filter(StockMove.product_id == p.id)\
            .filter(StockMove.status == MoveStatus.DONE)\
            .filter(Location.type == LocationType.INTERNAL).scalar() or 0
            
        current_on_hand = incoming_qty - outgoing_qty

        # B. Calculate "Reserved" (Items promised to customers but not shipped yet)
        reserved_qty = db.query(func.sum(StockMove.quantity)).join(StockMove.source_location)\
            .filter(StockMove.product_id == p.id)\
            .filter(StockMove.status == MoveStatus.WAITING)\
            .filter(Location.type == LocationType.INTERNAL).scalar() or 0

        # C. Free to Use
        free_qty = current_on_hand - reserved_qty

        # D. Attach data to the product object
        # (Pydantic will read these attributes)
        p.on_hand = current_on_hand
        p.free_to_use = free_qty
        results.append(p)
        
    return results

# 3. READ ONE
@router.get("/{id}", response_model=ProductOut)
def get_product(
    id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# 4. UPDATE
@router.put("/{id}", response_model=ProductOut)
def update_product(
    id: int, 
    product_update: ProductUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    product_query = db.query(Product).filter(Product.id == id)
    product = product_query.first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check SKU uniqueness if SKU is being updated
    if product_update.sku and product_update.sku != product.sku:
        existing_sku = db.query(Product).filter(Product.sku == product_update.sku).first()
        if existing_sku:
            raise HTTPException(status_code=400, detail=f"SKU '{product_update.sku}' is already taken")

    # Update only provided fields
    update_data = product_update.dict(exclude_unset=True)
    product_query.update(update_data, synchronize_session=False)
    
    db.commit()
    db.refresh(product)
    return product

# 5. DELETE
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # NOTE: In a real app, you should check if 'StockMoves' exist for this product 
    # before deleting to prevent database integrity errors.
    # for now, standard delete is fine.
    
    db.delete(product)
    db.commit()
    return None