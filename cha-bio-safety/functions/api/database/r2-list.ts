// GET /api/database/r2-list — R2 버킷의 모든 객체 키 목록
import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 접근 가능' }, { status: 403 })

  const keys: { key: string; size: number; uploaded: string }[] = []
  const cronZips: { key: string; date: string; size: number }[] = []
  let cursor: string | undefined
  let totalSize = 0

  do {
    const listed = await env.STORAGE.list({ cursor, limit: 500 })
    for (const obj of listed.objects) {
      // 크론 R2 백업 zip 목록
      if (obj.key.startsWith('backups/r2/') && obj.key.endsWith('.zip')) {
        const date = obj.key.replace('backups/r2/', '').replace('.zip', '')
        cronZips.push({ key: obj.key, date, size: obj.size })
        continue
      }
      keys.push({ key: obj.key, size: obj.size, uploaded: obj.uploaded.toISOString() })
      totalSize += obj.size
    }
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)

  return Response.json({ success: true, data: { keys, totalSize, count: keys.length, cronZips } })
}
