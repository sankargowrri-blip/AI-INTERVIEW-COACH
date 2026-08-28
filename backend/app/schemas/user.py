from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True

from pydantic import BaseModel, EmailStr, Field

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserProfileBase(BaseModel):
    bio: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    skills: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    user_id: int

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
