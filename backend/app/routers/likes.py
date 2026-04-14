from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from uuid import UUID

from app.db import get_supabase
from app.models.like import LikeCreate
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/likes",
    tags=["Likes"]
)

@router.get("/work/{work_id}/count")
def get_like_count(work_id: UUID, db: Client = Depends(get_supabase)):
    """특정 작품에 눌린 총 좋아요 개수를 조회합니다."""
    try:
        # DB에서 해당 작품의 데이터를 전부 세어옴
        response = db.table("likes").select("*", count="exact").eq("work_id", str(work_id)).execute()
        return {"work_id": work_id, "like_count": response.count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
def toggle_like(
    like: LikeCreate, 
    db: Client = Depends(get_supabase),
    user=Depends(get_current_user)
):
    """
    특정 작품에 좋아요를 누르거나 (이미 눌렀다면) 취소합니다. (토글 스위치 형태)
    반드시 접근 권한(로그인된 액세스 토큰)이 필요합니다.
    """
    user_id = user["user"].id
    work_id_str = str(like.work_id)
    
    try:
        # 기존에 이 유저가 해당 글에 좋아요를 눌렀는지 확인
        existing = db.table("likes").select("*").eq("work_id", work_id_str).eq("user_id", user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # 이미 있으면 기존 좋아요 삭제
            db.table("likes").delete().eq("id", existing.data[0]["id"]).execute()
            return {"message": "좋아요가 취소되었습니다.", "liked": False}
        else:
            # 없으면 좋아요 생성
            db.table("likes").insert({"work_id": work_id_str, "user_id": user_id}).execute()
            return {"message": "좋아요가 추가되었습니다.", "liked": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
