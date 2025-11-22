# backend/models/all_models.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.postgresConn import Base

class MoveStatus(str, enum.Enum):
    """Tracks the lifecycle of a stock movement [cite: 25]"""
    
    DRAFT = "draft"       # Planning phase
    WAITING = "waiting"   # Waiting for availability
    DONE = "done"         # Validated & Stock moved
    CANCELLED = "cancelled"


class UserRole(str, enum.Enum):
    """[cite: 9, 10]"""
    MANAGER = "manager"
    STAFF = "staff"

class LocationType(str, enum.Enum):
    INTERNAL = "internal"         # Shelf, Rack inside a warehouse
    CUSTOMER = "customer"         # Virtual
    VENDOR = "vendor"             # Virtual
    INVENTORY_LOSS = "inventory_loss" # Virtual


# --- Database Tables ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(PgEnum(UserRole), default=UserRole.STAFF) # Inventory Manager vs Warehouse Staff
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    """
    Master data for items. [cite: 46]
    Note: Current stock quantity is NOT stored here to avoid sync errors. 
    It is calculated on-the-fly from StockMoves.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)     # [cite: 47]
    sku = Column(String, unique=True, index=True, nullable=False) # Stock Keeping Unit [cite: 48]
    category = Column(String, index=True)                 # [cite: 49]
    uom = Column(String, default="Units")                # Unit of Measure (kg, pcs)
    cost = Column(Integer, default=0) # Storing in cents/paise or just raw number
    
    min_reorder_level = Column(Integer, default=0)                
    min_reorder_level = Column(Integer, default=0)        # For Low Stock Alerts [cite: 86]
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 1. NEW TABLE: Warehouse
class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    short_code = Column(String, unique=True, index=True, nullable=False) # e.g., "WH1"
    address = Column(String, nullable=True)
    
    # Relationship: A warehouse has many locations
    locations = relationship("Location", back_populates="warehouse")

# 2. UPDATED TABLE: Location
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False) # e.g., "Rack A"
    short_code = Column(String, index=True, nullable=False) # e.g., "RA-01"
    type = Column(PgEnum(LocationType), default=LocationType.INTERNAL)
    
    # Link to Warehouse (Nullable because 'Vendor' locations don't have a physical warehouse)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    
    warehouse = relationship("Warehouse", back_populates="locations")


class StockMove(Base):
    """
    The Ledger. Every physical movement of stock is recorded here. [cite: 103]
    - Receipt: Vendor -> Internal
    - Delivery: Internal -> Customer
    - Internal Transfer: Internal -> Internal
    - Adjustment: Internal -> Inventory Loss
    """
    __tablename__ = "stock_moves"

    id = Column(Integer, primary_key=True, index=True)
    
    # What is moving?
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)            # [cite: 61, 98]
    
    # Where is it coming from and going to?
    source_location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    destination_location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    
    # Metadata
    status = Column(PgEnum(MoveStatus), default=MoveStatus.DRAFT) # [cite: 25]
    reference = Column(String) # Optional: Order #, Receipt #
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    product = relationship("Product")
    source_location = relationship("Location", foreign_keys=[source_location_id])
    dest_location = relationship("Location", foreign_keys=[destination_location_id])