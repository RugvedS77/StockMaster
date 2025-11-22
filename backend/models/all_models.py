# backend/models/all_models.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.postgresConn import Base

# --- Enums for Fixed Choices ---

class MoveStatus(str, enum.Enum):
    """Tracks the lifecycle of a stock movement [cite: 25]"""
    DRAFT = "draft"       # Planning phase
    WAITING = "waiting"   # Waiting for availability
    DONE = "done"         # Validated & Stock moved
    CANCELLED = "cancelled"

class LocationType(str, enum.Enum):
    """Defines the behavior of a location [cite: 41, 87]"""
    INTERNAL = "internal"         # Physical warehouse, Rack, Shelf
    CUSTOMER = "customer"         # Virtual location for customers (Sending goods out)
    VENDOR = "vendor"             # Virtual location for vendors (Receiving goods in)
    INVENTORY_LOSS = "inventory_loss" # Virtual location for lost/damaged goods [cite: 102]
    PRODUCTION = "production"     # Manufacturing floor

class UserRole(str, enum.Enum):
    """[cite: 9, 10]"""
    MANAGER = "manager"
    STAFF = "staff"

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

class Location(Base):
    """
    Represents Warehouses, Racks, or Partner Locations.
    Stock is calculated by summing moves IN minus moves OUT of a specific location ID.
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False) # e.g., "Main Warehouse", "Rack A" [cite: 73, 74]
    type = Column(PgEnum(LocationType), default=LocationType.INTERNAL) 
    
    # Optional: Parent location for hierarchy (e.g., Rack A is inside Main Warehouse)
    parent_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # Relationships (Self-referential for hierarchy)
    children = relationship("Location", backref="parent", remote_side=[id])

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
    uom = Column(String, default="Units")                 # Unit of Measure (kg, pcs) [cite: 50]
    min_reorder_level = Column(Integer, default=0)        # For Low Stock Alerts [cite: 86]
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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