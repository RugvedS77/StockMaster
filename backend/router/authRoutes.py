# router/auth_routes.py
import os
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import HTMLResponse, RedirectResponse 
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
# from requests_html import HTMLResponse
import uuid , random
from datetime import datetime, timedelta

from database.postgresConn import get_db
# FIX: Import the specific model and schemas needed, with aliases
from models.all_models import User as UserModel, UserRole
from schemas.all_schema import (
    TokenWithUser, 
    UserCreate, 
    UserOut, 
    ForgotPasswordRequest,   # <-- Added
    VerifyOtpRequest,        # <-- Added
    ResetPasswordRequest     # <-- Added
)
from utils.email_service import send_otp_email
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

# -------------------------------------------------------
# 1. FORGOT PASSWORD (Generate OTP & Send Email)
# -------------------------------------------------------
@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # A. Check if user exists
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    
    if not user:
        # Security: Fake success message to prevent email enumeration
        return {"message": "If your email is registered, you will receive an OTP."}

    # B. Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # C. Save OTP to Database (Valid for 10 minutes)
    user.reset_token = otp
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # D. Send Email
    email_status = send_otp_email(user.email, otp)
    
    if not email_status:
        raise HTTPException(status_code=500, detail="Failed to send email. Check server logs.")

    return {"message": "OTP sent successfully to your email."}


# -------------------------------------------------------
# 2. VERIFY OTP
# -------------------------------------------------------
@router.post("/verify-otp")
def verify_otp(request: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # A. Check if OTP matches
    if user.reset_token != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # B. Check if OTP is expired
    if not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    return {"message": "OTP Verified. Proceed to reset password."}


# -------------------------------------------------------
# 3. RESET PASSWORD
# -------------------------------------------------------
@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # A. Re-Verify OTP (Security Check)
    # We verify again to ensure no one bypasses step 2 directly to step 3
    if user.reset_token != request.otp:
        raise HTTPException(status_code=400, detail="Invalid request. OTP mismatch.")
        
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # B. Hash New Password & Update
    user.hashed_password = hashing.Hash.bcrypt(request.new_password)
    
    # C. Clear OTP (One-time use only)
    user.reset_token = None
    user.reset_token_expiry = None
    
    db.commit()
    
    return {"message": "Password reset successfully. Please login with new password."}


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: UserModel = Depends(get_current_user)):
    """
    This route requires a token. 
    Because of this dependency, the 'Authorize' button will appear.
    """
    return current_user