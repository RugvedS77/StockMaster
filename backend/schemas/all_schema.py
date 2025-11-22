# from pydantic import BaseModel, EmailStr
# from enum import Enum
# from typing import List, Optional
# from datetime import datetime

# class UserBase(BaseModel):
#     email: EmailStr
#     # Add other fields like full_name, role if needed

# class User(UserBase):
#     id: int
#     class Config:
#         from_attributes = True  # CRITICAL: Allows Pydantic to read SQLAlchemy objects

# class UserCreate(UserBase):
#     full_name: str
#     password: str  # Plain password for creation

# # Add this NEW schema
# class UserOut(BaseModel):
#     id: int
#     email: EmailStr
#     full_name: Optional[str] = None
#     role: str
#     is_active: bool
#     created_at: datetime

#     # This is CRITICAL. It tells Pydantic to read data 
#     # from the SQLAlchemy database object
#     class Config:
#         from_attributes = True


# # --- Auth Schemas ---
# class Token(BaseModel):
#     access_token: str
#     token_type: str
#     userRole: str
    
# class TokenData(BaseModel):
#     username: Optional[str] = None

# # This will be your new response model for the login route
# class TokenWithUser(BaseModel):
#     access_token: str
#     token_type: str
#     user: User # <-- Nest the user object here

# # --- LOCATION & WAREHOUSE SCHEMAS ---
# class LocationType(str, Enum):
#     INTERNAL = "internal"
#     CUSTOMER = "customer"
#     VENDOR = "vendor"
#     INVENTORY_LOSS = "inventory_loss"

# # --- WAREHOUSE SCHEMAS ---
# class WarehouseBase(BaseModel):
#     name: str
#     short_code: str
#     address: Optional[str] = None

# class WarehouseCreate(WarehouseBase):
#     pass

# class WarehouseOut(WarehouseBase):
#     id: int
#     class Config:
#         from_attributes = True

# # --- LOCATION SCHEMAS ---
# class LocationBase(BaseModel):
#     name: str
#     short_code: str
#     type: LocationType = LocationType.INTERNAL
#     warehouse_id: Optional[int] = None # Selected from dropdown

# class LocationCreate(LocationBase):
#     pass

# class LocationOut(LocationBase):
#     id: int
#     warehouse_id: Optional[int]
#     class Config:
#         from_attributes = True

# # --- STOCK MOVE SCHEMAS ---

# class StockMoveBase(BaseModel):
#     product_id: int
#     quantity: int
#     source_location_id: int
#     destination_location_id: int
#     status: str = "Draft" # Draft, Ready, Done

# class StockMoveCreate(StockMoveBase):
#     # User doesn't send 'reference' or 'date', backend generates them
#     pass 

# class StockMoveOut(StockMoveBase):
#     id: int
#     reference: str        # e.g. WH1/IN/0001
#     created_at: datetime  # The "Date" column
    
#     # Nested models to show names instead of just IDs in the table
#     product: ProductOut 
#     source_location: LocationOut
#     dest_location: LocationOut

#     class Config:
#         from_attributes = True



from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime

# ===========================
#        1. ENUMS
# ===========================
class LocationType(str, Enum):
    INTERNAL = "internal"
    CUSTOMER = "customer"
    VENDOR = "vendor"
    INVENTORY_LOSS = "inventory_loss"

# ===========================
#        2. AUTH SCHEMAS
# ===========================
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenWithUser(Token):
    user: UserOut

class TokenData(BaseModel):
    username: Optional[str] = None

# ===========================
#     3. PRODUCT SCHEMAS
# ===========================
# (Must be defined BEFORE StockMoveOut)
class ProductBase(BaseModel):
    name: str
    sku: str
    category: Optional[str] = "General"
    uom: str = "Units"
    cost: float = 0.0
    min_reorder_level: int = 0

class ProductUpdate(BaseModel):
    """Schema for updating product details"""
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    uom: Optional[str] = None
    min_reorder_level: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    on_hand: int    
    free_to_use: int
    class Config:
        from_attributes = True

# ===========================
#    4. WAREHOUSE SCHEMAS
# ===========================
class WarehouseBase(BaseModel):
    name: str
    short_code: str
    address: Optional[str] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseOut(WarehouseBase):
    id: int
    class Config:
        from_attributes = True

# ===========================
#     5. LOCATION SCHEMAS
# ===========================
# (Must be defined BEFORE StockMoveOut)
class LocationBase(BaseModel):
    name: str
    short_code: str
    type: LocationType = LocationType.INTERNAL
    warehouse_id: Optional[int] = None

class LocationCreate(LocationBase):
    pass

class LocationOut(LocationBase):
    id: int
    warehouse_id: Optional[int]
    # warehouse: Optional[WarehouseOut] # Optional: if you want to show warehouse details nested
    class Config:
        from_attributes = True

# ===========================
#    6. STOCK MOVE SCHEMAS
# ===========================
# (Defined LAST because it uses ProductOut and LocationOut)
class StockMoveBase(BaseModel):
    product_id: int
    quantity: int
    source_location_id: int
    destination_location_id: int
    status: str = "draft" 

class StockMoveCreate(StockMoveBase):
    pass 

class StockMoveOut(StockMoveBase):
    id: int
    reference: str        
    created_at: datetime  
    
    # Now Python knows what these are because they were defined above
    product: ProductOut 
    source_location: LocationOut
    dest_location: LocationOut

    class Config:
        from_attributes = True