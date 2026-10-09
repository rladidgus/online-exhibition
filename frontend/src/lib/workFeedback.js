import { supabase } from './supabase'

// 작품 상세의 댓글·좋아요 — 방명록처럼 런타임에 DB를 쓰는 곳.
// 댓글은 status='pending' 으로만 들어가고(RLS) 준비위가 승인한 것만 보인다.
// 좋아요는 로그인이 없어서 이 브라우저에서 눌렀는지만 기억한다.
// ponytail: 다른 브라우저·기기로 다시 누르는 건 막지 못한다. 실제로 문제가 되면 숫자를 숨기거나 로그인 도입.

export async function fetchComments(slug) {
  const { data, error } = await supabase
    .from('work_comments')
    .select('id, nickname, content, created_at')
    .eq('work_slug', slug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error('댓글을 불러오지 못했습니다.')
  return data ?? []
}

export async function submitComment(slug, nickname, content) {
  const { error } = await supabase
    .from('work_comments')
    .insert({ work_slug: slug, nickname, content, status: 'pending' })

  if (error) throw new Error('등록에 실패했습니다. 잠시 후 다시 시도해 주세요.')
}

export async function fetchLikes(slug) {
  const { data, error } = await supabase
    .from('work_likes')
    .select('count')
    .eq('work_slug', slug)
    .maybeSingle()

  if (error) throw new Error('좋아요 수를 불러오지 못했습니다.')
  return data?.count ?? 0
}

const likedKey = slug => `liked:${slug}`

export function hasLiked(slug) {
  try {
    return localStorage.getItem(likedKey(slug)) === '1'
  } catch {
    return false
  }
}

// 누르면 좋아요, 다시 누르면 취소. 바뀐 숫자를 돌려준다.
export async function toggleLike(slug) {
  const liked = hasLiked(slug)
  const { data, error } = await supabase.rpc(liked ? 'unlike_work' : 'like_work', { p_slug: slug })
  if (error) throw new Error('잠시 후 다시 시도해 주세요.')
  try {
    if (liked) localStorage.removeItem(likedKey(slug))
    else localStorage.setItem(likedKey(slug), '1')
  } catch {
    // 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)는 기억만 못 할 뿐 동작은 한다
  }
  return data
}
