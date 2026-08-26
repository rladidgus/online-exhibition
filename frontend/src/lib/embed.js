// 유튜브 / 비메오 공유 URL → iframe embed URL. 둘 다 아니면 null (그냥 링크로 노출)
export function toEmbedUrl(url) {
  if (!url) return null

  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return null
}
