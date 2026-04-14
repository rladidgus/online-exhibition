from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    nickname: str

class UserCreate(UserBase):
    id: UUID # Supabase Auth UUID를 그대로 사용

class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
