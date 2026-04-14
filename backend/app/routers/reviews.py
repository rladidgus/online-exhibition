from fastapi import APIRouter, Depends, HTTPException
from typing import List
from supabase import Client
from uuid import UUID

from app.db import get_supabase
from app.models.review import ReviewCreate, ReviewResponse
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

@router.get("/work/{work_id}", response_model=List[ReviewResponse])
def get_reviews_by_work(work_id: UUID, db: Client = Depends(get_supabase)):
    """특정 작품에 달린 모든 리뷰를 최신순으로 조회합니다. (비로그인도 가능)"""
    try:
        response = db.table("reviews").select("*").eq("work_id", str(work_id)).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate, 
    db: Client = Depends(get_supabase),
    user=Depends(get_current_user) # 리뷰 작성은 유저 검증 필수
):
    """
    로그인한 상태의 Access Token(Header)을 이용해 작품에 리뷰를 작성합니다.
    """
    try:
        review_data = review.model_dump()
        # auth.py에서 설정한 {"user": User 객체}를 통해 ID 추출
        review_data["user_id"] = user["user"].id
        
        response = db.table("reviews").insert(review_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="리뷰 등록에 실패했습니다.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
