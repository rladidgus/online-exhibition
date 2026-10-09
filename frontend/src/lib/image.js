// 업로드 전에 브라우저에서 이미지를 줄인다.
// Supabase 무료 저장소는 1GB 이고 이미지 변환은 유료 전용이라, 원본(장당 10MB 안팎)을 그대로 올리면 500장에서 한도를 넘긴다.
// 게재용은 긴 변 2000px 이면 충분하다. 원본 보관은 준비위 드라이브 몫.

const PASSTHROUGH = ['image/svg+xml', 'image/gif']

export async function resizeImage(file, maxEdge = 2000, quality = 0.85) {
  if (PASSTHROUGH.includes(file.type)) return { blob: file, type: file.type }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  // PNG 는 투명도가 필요할 수 있어 유지, 나머지는 JPEG 로 통일
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('이미지 변환에 실패했습니다.'))), type, quality)
  })
  return { blob, type }
}

// 저장 경로에 쓸 확장자 — 줄인 결과 형식을 따른다
export function extFor(type) {
  if (type === 'image/png') return 'png'
  if (type === 'image/gif') return 'gif'
  if (type === 'image/svg+xml') return 'svg'
  return 'jpg'
}
