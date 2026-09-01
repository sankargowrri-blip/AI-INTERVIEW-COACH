import time
import logging
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

logger = logging.getLogger(__name__)
router = APIRouter()


def _user_to_dict(user: User) -> dict:
    """Serialise a User ORM object to a plain dict safe for JSON."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name or "",
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    t0 = time.monotonic()
    try:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        if len(user_in.password) > 72:
            raise HTTPException(status_code=400, detail="Password too long (max 72 characters)")

        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        access_token = create_access_token(
            subject=db_user.email,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        logger.info("[AUTH] register completed in %.0f ms", (time.monotonic() - t0) * 1000)
        return {
            "user": _user_to_dict(db_user),
            "access_token": access_token,
            "token_type": "bearer",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[AUTH] register error: %s", e)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


@router.post("/login")
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    Authenticate the user and return BOTH the access token AND the user
    profile in a single response.

    This eliminates the need for a second GET /users/me round trip on the
    frontend, cutting login latency by ~50 % on remote backends.
    """
    t0 = time.monotonic()

    # ── 1. Database lookup ─────────────────────────────────────────────────
    user = db.query(User).filter(User.email == form_data.username).first()
    logger.info("[AUTH] DB lookup: %.0f ms", (time.monotonic() - t0) * 1000)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── 2. Password verification ───────────────────────────────────────────
    t1 = time.monotonic()
    if not verify_password(form_data.password, user.hashed_password):
        logger.info("[AUTH] password verify (fail): %.0f ms", (time.monotonic() - t1) * 1000)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info("[AUTH] password verify (ok): %.0f ms", (time.monotonic() - t1) * 1000)

    # ── 3. Token generation ────────────────────────────────────────────────
    access_token = create_access_token(
        subject=user.email,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    logger.info("[AUTH] login total: %.0f ms", (time.monotonic() - t0) * 1000)

    # Return token + user so the frontend needs only ONE request
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }
