import { useEffect, useState } from 'react'
import { getSettings, saveSettings, uploadImage } from '../../lib/admin'
import { useNotice, errorText } from './useNotice.js'
import Notice from './Notice'
import AdminImage from './AdminImage'

// [칸 이름, 라벨, 종류, 안내]
const SECTIONS = [
  ['전시 정보', [
    ['department_name', '학과명', 'text'],
    ['exhibition_title', '전시명', 'text'],
    ['major_label', '참여자 전공 표기', 'text', '참여자 상세에 나오는 전공명 (타전공은 "타전공"으로 따로 표시)'],
    ['slogan', '첫 화면 문구', 'textarea', '줄바꿈이 그대로 보입니다.'],
    ['exhibit_start', '시작일', 'date'],
    ['exhibit_end', '종료일', 'date'],
  ]],
  ['기획의도', [
    ['intro_title', '제목', 'text'],
    ['intro_body', '본문', 'textarea'],
  ]],
  ['오시는 길', [
    ['venue_name', '전시장명', 'text'],
    ['venue_address', '주소', 'text'],
    ['venue_directions', '교통 안내', 'textarea'],
    ['venue_map_url', '지도 주소', 'url', 'https://map.naver.com/...'],
  ]],
  ['영상 · SNS', [
    ['opening_video_url', '오프닝 영상 주소', 'url', '비우면 메인에서 영상 칸이 숨겨집니다.'],
    ['sns_instagram', '인스타그램', 'url'],
    ['sns_x', 'X (트위터)', 'url'],
  ]],
  ['배포', [
    ['deploy_hook_url', 'Cloudflare 배포 훅 주소', 'url', '"사이트에 반영" 버튼이 이 주소를 부릅니다. 공개 사이트에는 실리지 않습니다.'],
  ]],
]

export default function AdminSettings() {
  const [msg, notify] = useNotice()
  const [settings, setSettings] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(err => notify(errorText(err, '불러오지 못했습니다.'), 'err'))
  }, [notify])

  if (!settings) return <Notice msg={msg} />

  const set = patch => setSettings(s => ({ ...s, ...patch }))

  async function handleCover(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      notify('올리는 중입니다…', 'warn')
      set({ cover_path: await uploadImage(file, 'site/cover') })
      notify('첫 화면 그림을 올렸습니다. 저장을 눌러야 반영됩니다.', 'ok')
    } catch (err) {
      notify(errorText(err, '업로드에 실패했습니다.'), 'err')
    }
  }

  async function handleSave() {
    if (settings.exhibit_start && settings.exhibit_end && settings.exhibit_start > settings.exhibit_end) {
      return notify('종료일이 시작일보다 빠릅니다.', 'err')
    }
    setBusy(true)
    try {
      await saveSettings(settings)
      notify('저장했습니다. 공개 사이트 반영은 대시보드의 "사이트에 반영"을 누르세요.', 'ok')
    } catch (err) {
      notify(errorText(err, '저장에 실패했습니다.'), 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>사이트 설정</h1>
          <p>메인 화면에 나오는 전시 정보입니다.</p>
        </div>
        <div className="a-actions">
          <button className="a-btn a-btn--primary" type="button" onClick={handleSave} disabled={busy}>저장</button>
        </div>
      </div>

      <Notice msg={msg} />

      <div className="a-grid a-grid--2">
        <div>
          {SECTIONS.slice(0, 3).map(section => <Section key={section[0]} section={section} values={settings} set={set} />)}
        </div>
        <div>
          <div className="a-card">
            <p className="a-card__title">첫 화면 그림</p>
            <div className="a-slot">
              {settings.cover_path && <AdminImage path={settings.cover_path} className="a-slot__preview" />}
              <p className="a-slot__name">{settings.cover_path || '아직 없습니다.'}</p>
              <div className="a-actions">
                <label className="a-btn a-btn--sm">
                  파일 선택
                  <input type="file" accept="image/*" hidden onChange={handleCover} />
                </label>
              </div>
            </div>
          </div>
          {SECTIONS.slice(3).map(section => <Section key={section[0]} section={section} values={settings} set={set} />)}
        </div>
      </div>
    </>
  )
}

function Section({ section: [title, fields], values, set }) {
  return (
    <div className="a-card">
      <p className="a-card__title">{title}</p>
      {fields.map(([key, label, type, hint]) => (
        <div className="a-field" key={key}>
          <label htmlFor={`s-${key}`}>{label}</label>
          {type === 'textarea' ? (
            <textarea id={`s-${key}`} value={values[key] ?? ''} onChange={e => set({ [key]: e.target.value })} />
          ) : (
            <input id={`s-${key}`} type={type} value={values[key] ?? ''} onChange={e => set({ [key]: e.target.value })} />
          )}
          {hint && <span className="a-hint">{hint}</span>}
        </div>
      ))}
    </div>
  )
}
