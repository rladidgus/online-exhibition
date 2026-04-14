from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from supabase import Client
from uuid import UUID

from app.db import get_supabase
from app.models.work import WorkCreate, WorkResponse
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/works",
    tags=["Works"]
)

@router.get("", response_model=List[WorkResponse])
def get_works(
    category: Optional[str] = None, 
    search: Optional[str] = None,
    db: Client = Depends(get_supabase)
):
    """
    모든 작품 목록을 조회합니다. 
    - category: 창업, 웹툰, 영상, 게임 중 필터링
    - search: 작품명(title) 또는 작가명(author) 검색어
    """
    query = db.table("works").select("*")
    
    if category:
        query = query.eq("category", category)
        
    if search:
        # or_를 사용해 title 또는 author에 검색어가 포함되는지 확인 (대소문자 무시)
        query = query.or_(f"title.ilike.%{search}%,author.ilike.%{search}%")
        
    try:
        response = query.order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{work_id}", response_model=WorkResponse)
def get_work(work_id: UUID, db: Client = Depends(get_supabase)):
    """특정 작품의 상세 정보를 조회합니다."""
    try:
        response = db.table("works").select("*").eq("id", str(work_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="작품을 찾을 수 없습니다.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=WorkResponse)
def create_work(
    work: WorkCreate, 
    db: Client = Depends(get_supabase),
    user=Depends(get_current_user)  # 작성 시 안전장치로 로그인을 요구합니다.
):
    """새로운 작품을 등록합니다. 배포 테스트 시를 위해 로그인 검증을 추가했습니다."""
    try:
        response = db.table("works").insert(work.model_dump()).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="작품 생성에 실패했습니다.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
