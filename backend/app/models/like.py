from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class LikeBase(BaseModel):
    work_id: UUID

class LikeCreate(LikeBase):
    pass
    # user_id는 토큰에서 추출

class LikeResponse(LikeBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
