from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, User as UserSchema

router = APIRouter()

@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists",
            )
        if len(user_in.password) > 72:
             raise HTTPException(
                status_code=400,
                detail="Password too long (max 72 characters)",
            )
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create access token immediately
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=db_user.email, expires_delta=access_token_expires
        )
        
        # Convert SQLAlchemy object to dict for JSON serialization
        user_data = {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "is_active": db_user.is_active,
            "created_at": db_user.created_at.isoformat() if db_user.created_at else None
        }
        
        return {
            "user": user_data,
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        print(f"Registration Error: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Internal Server Error: {str(e)}"
        )

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
