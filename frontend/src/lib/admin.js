import { supabase } from './supabase'

// 로그인한 계정이 admins 명단에 있는지 확인.
// 소셜 로그인은 누구나 가입되므로 로그인 여부만으로 관리자라고 보면 안 된다.
export async function isAdmin() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false

  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error) return false
  return Boolean(data)
}
