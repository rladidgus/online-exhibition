from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class ReviewBase(BaseModel):
    content: str
    work_id: UUID

class ReviewCreate(ReviewBase):
    pass
    # user_id는 토큰에서 추출하여 주입하므로 보통 Body로 받지 않음

class ReviewResponse(ReviewBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
