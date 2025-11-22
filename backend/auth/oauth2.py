from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database.postgresConn import get_db
from models.all_models import User as UserModel
from auth import token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ADD db dependency here
def get_current_user(data: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Verify token format
    token_data = token.verify_token(data, credentials_exception)
    
    # 2. Fetch the actual user from DB
    user = db.query(UserModel).filter(UserModel.email == token_data.username).first()
    
    if user is None:
        raise credentials_exception
        
    return user # Now returns the full Database Object