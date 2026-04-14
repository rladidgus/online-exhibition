import os
from supabase import create_client, Client
from dotenv import load_dotenv, find_dotenv

# 상위 폴더(online exhibition) 또는 백엔드 폴더 내부의 .env를 로드합니다.
load_dotenv(find_dotenv())

SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY 또는 SUPABASE_ANON_KEY 둘 중 하나라도 읽도록 호환성 확대
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL과 SUPABASE_KEY가 .env 파일에 설정되어 있어야 합니다.")

# 전역 Supabase 클라이언트 인스턴스 생성
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase() -> Client:
    """
    FastAPI 의존성 주입(Dependency Injection)을 위한 Supabase 클라이언트 반환 함수
    """
    return supabase
