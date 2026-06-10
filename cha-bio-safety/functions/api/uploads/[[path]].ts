import type { Env } from '../../_middleware'

// ── 확장자 → Content-Type 매핑 ──────────────────────
const EXT_MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.pdf':  'application/pdf',
  '.svg':  'image/svg+xml',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip':  'application/zip',
}

function contentTypeFromKey(key: string): string {
  const dotIdx = key.lastIndexOf('.')
  if (dotIdx !== -1) {
    const ext = key.slice(dotIdx).toLowerCase()
    if (EXT_MIME[ext]) return EXT_MIME[ext]
  }
  return 'application/octet-stream'
}

// GET /api/uploads/{...path}
// ?download=<파일명> 이 있으면 Content-Disposition: attachment 로 강제 다운로드.
// (iOS Safari/PWA 는 <a download> 파일명을 무시하고 서버 헤더를 따르며,
//  octet-stream 을 텍스트로 간주해 .txt 를 덧붙이므로 헤더로 파일명·확장자를 지정한다.)
export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const key = (params.path as string[]).join('/')
  if (!key) return new Response('Not Found', { status: 404 })

  // backups/ 는 자동 백업(DB 덤프 등) 보관 경로 — 이 엔드포인트는 미인증 공개라
  // 날짜 키로 추측 가능한 백업이 외부 노출되지 않게 차단. (백업은 admin 게이트가 있는
  // r2-download 로만 접근하며 SettingsPanel 도 그쪽을 사용한다.)
  if (key.startsWith('backups/')) return new Response('Not Found', { status: 404 })

  const obj = await env.STORAGE.get(key)
  if (!obj) return new Response('Not Found', { status: 404 })

  const headers: Record<string, string> = {
    'Content-Type':  contentTypeFromKey(key),
    'Cache-Control': 'private, max-age=31536000',
  }

  const downloadName = new URL(request.url).searchParams.get('download')
  if (downloadName) {
    // RFC 5987: 한글 등 비ASCII 파일명은 filename*=UTF-8'' 로 인코딩
    headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`
  }

  return new Response(obj.body, { headers })
}
