from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from supabase import Client

from app.db import get_supabase
from app.models.auth import LoginRequest

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/login")
def login_with_provider(request: LoginRequest, db: Client = Depends(get_supabase)):
    """
    클라이언트에게 Supabase Google/Kakao 소셜 로그인 URL을 반환하는 API입니다.
    """
    if request.provider not in ["google", "kakao"]:
        raise HTTPException(status_code=400, detail="지원하지 않는 소셜 로그인 제공자입니다.")
        
    try:
        # Supabase Python 클라이언트를 통한 소셜 로그인 URL 생성 요청
        res = db.auth.sign_in_with_oauth({
            "provider": request.provider,
            "options": {
                "redirect_to": request.redirect_to
            }
        })
        
        return {"login_url": res.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
def get_current_user(authorization: str = Header(None), db: Client = Depends(get_supabase)):
    """
    프론트에서 Supabase 로그인을 마친 뒤 전달하는 Access Token을 검증하고, 유저 정보를 확인하는 예시입니다.
    이 방식으로 권한(리뷰, 좋아요 등) 체크를 할 수 있습니다.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰(Bearer Token)이 누락되었거나 양식이 잘못되었습니다.")
        
    token = authorization.split(" ")[1]
    
    try:
        # 토큰을 통해 유저 검증 수행
        user_response = db.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
        
        # 정상적인 경우 유저 정보 반환
        return {"user": user_response.user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"인증에 실패했습니다. 상세한 오류: {str(e)}")
