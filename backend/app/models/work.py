from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from uuid import UUID

class WorkBase(BaseModel):
    title: str
    author: str
    category: str  # 창업, 웹툰, 영상, 게임
    description: str
    image_url: Optional[str] = None

class WorkCreate(WorkBase):
    pass

class WorkUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class WorkResponse(WorkBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
