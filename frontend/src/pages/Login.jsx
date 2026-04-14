import { supabase } from '../lib/supabase'
import './Login.css'

export default function Login() {
  const handleLogin = async (provider) => {
    try {
      // 프론트엔드용 Supabase SDK를 이용해 소셜 로그인 요청 (OAuth Flow 시작)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // 회원가입/로그인 완료 후 원래 위치(또는 메인 화면)로 돌아오게 지정
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      alert('로그인 중 에러가 발생했습니다: ' + error.message)
    }
  }

  return (
    <div className="login-container">
      <h2>소셜 로그인</h2>
      <p>온라인 전시에 오신 것을 환영합니다!<br/>로그인하고 리뷰와 좋아요를 남겨보세요.</p>
      
      <div className="login-buttons">
        <button 
          className="login-btn google"
          onClick={() => handleLogin('google')}
        >
          Google로 계속하기
        </button>
        <button 
          className="login-btn kakao"
          onClick={() => handleLogin('kakao')}
        >
          Kakao로 계속하기
        </button>
      </div>
    </div>
  )
}
