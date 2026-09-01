import { supabase } from './supabase'

// 방명록 — 사이트에서 유일하게 런타임에 DB를 쓰는 곳.
// 작성은 status='pending' 으로만 들어가고(RLS), 공개 목록은 승인된 것만 보인다.

export function guestbookEnabled() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export async function fetchApproved() {
  const { data, error } = await supabase
    .from('guestbook')
    .select('id, nickname, content, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error('방명록을 불러오지 못했습니다.')
  return data ?? []
}

export async function submitEntry(nickname, content) {
  const { error } = await supabase
    .from('guestbook')
    .insert({ nickname, content, status: 'pending' })

  if (error) throw new Error('등록에 실패했습니다. 잠시 후 다시 시도해 주세요.')
}
