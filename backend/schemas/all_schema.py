from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    # Add other fields like full_name, role if needed

class User(UserBase):
    id: int
    class Config:
        from_attributes = True  # CRITICAL: Allows Pydantic to read SQLAlchemy objects

class UserCreate(UserBase):
    full_name: str
    password: str  # Plain password for creation

# Add this NEW schema
class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    # This is CRITICAL. It tells Pydantic to read data 
    # from the SQLAlchemy database object
    class Config:
        from_attributes = True


# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    userRole: str
    
class TokenData(BaseModel):
    username: Optional[str] = None

# This will be your new response model for the login route
class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: User # <-- Nest the user object here