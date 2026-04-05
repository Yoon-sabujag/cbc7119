import type { Env } from '../../_middleware'
import { todayKST } from '../../utils/kst'

function nanoid(n = 21) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => c[b % c.length]).join('')
}

// ── Content-Type → 확장자/디렉토리 매핑 ──────────────────────
const MIME_MAP: Record<string, { ext: string; dir: string }> = {
  'image/jpeg':      { ext: '.jpg',  dir: 'inspections' },
  'image/png':       { ext: '.png',  dir: 'inspections' },
  'image/gif':       { ext: '.gif',  dir: 'inspections' },
  'image/webp':      { ext: '.webp', dir: 'inspections' },
  'application/pdf': { ext: '.pdf',  dir: 'documents' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', dir: 'preview' },
}

function resolveFileInfo(file: File): { ext: string; dir: string; contentType: string } {
  const ct = file.type || 'application/octet-stream'

  // 직접 매핑
  if (MIME_MAP[ct]) return { ...MIME_MAP[ct], contentType: ct }

  // 파일 이름에서 확장자 추출 시도
  const name = file.name || ''
  const dotIdx = name.lastIndexOf('.')
  if (dotIdx !== -1) {
    const ext = name.slice(dotIdx).toLowerCase()
    if (ext === '.pdf') return { ext: '.pdf', dir: 'documents', contentType: 'application/pdf' }
    if (['.jpg', '.jpeg'].includes(ext)) return { ext: '.jpg', dir: 'inspections', contentType: 'image/jpeg' }
    if (ext === '.png') return { ext: '.png', dir: 'inspections', contentType: 'image/png' }
    // 기타 확장자 — documents 디렉토리에 보관
    return { ext, dir: 'documents', contentType: ct }
  }

  // fallback: 이미지로 간주
  return { ext: '.jpg', dir: 'inspections', contentType: 'image/jpeg' }
}

// POST /api/uploads  → 파일 업로드 (이미지, PDF 등)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ success: false, error: '파일 없음' }, { status: 400 })

  const date = todayKST().replace(/-/g, '')
  const { ext, dir, contentType } = resolveFileInfo(file)
  const key = `${dir}/${date}/${nanoid()}${ext}`

  await env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType },
  })

  return Response.json({ success: true, data: { key, url: `/api/uploads/${key}` } }, { status: 201 })
}
