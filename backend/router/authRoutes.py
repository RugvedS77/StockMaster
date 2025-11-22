# router/auth_routes.py
import os
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import HTMLResponse, RedirectResponse 
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
# from requests_html import HTMLResponse
import uuid

from database.postgresConn import get_db
# FIX: Import the specific model and schemas needed, with aliases
from models.all_models import User as UserModel, UserRole
from schemas.all_schema import TokenWithUser, UserCreate, UserOut
from auth import hashing, token
from auth.oauth2 import get_current_user

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/signup", response_model=UserOut) # Assuming you have a schema for response
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user exists
    user_in_db = db.query(UserModel).filter(UserModel.email == user.email).first()
    if user_in_db:
        raise HTTPException(status_code=409, detail="Email already registered")
        
    # 2. Create new user
    new_user = UserModel(
        email=user.email,
        hashed_password=hashing.Hash.bcrypt(user.password),
        full_name=user.full_name,
        role=UserRole.STAFF # Default role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenWithUser)
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Note: request.username will contain the email
    user = db.query(UserModel).filter(UserModel.email == request.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")

    if not hashing.Hash.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")

    access_token = token.create_access_token(data={"sub": user.email})
  
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user 
    }

@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: UserModel = Depends(get_current_user)):
    """
    This route requires a token. 
    Because of this dependency, the 'Authorize' button will appear.
    """
    return current_user