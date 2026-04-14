from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    provider: str  # 소셜 로그인 제공자: 'google' 또는 'kakao'
    redirect_to: Optional[str] = "http://localhost:5173"  # 프론트엔드 환경 기본 주소
