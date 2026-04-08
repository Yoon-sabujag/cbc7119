import { jsonError, type Env } from './_helpers'

// GET /api/documents/{id}
// Auth: any authenticated staff
// Response: binary stream with Content-Type, Content-Length, Content-Disposition
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const idRaw = ctx.params.id as string
  const id = Number(idRaw)
  if (!Number.isInteger(id) || id <= 0) {
    return jsonError(400, '문서 id가 유효하지 않습니다')
  }

  try {
    const row = await ctx.env.DB.prepare(
      `SELECT id, filename, r2_key, size, content_type
       FROM documents
       WHERE id = ? AND deleted_at IS NULL`
    ).bind(id).first<{ id: number; filename: string; r2_key: string; size: number; content_type: string }>()

    if (!row) return jsonError(404, '문서를 찾을 수 없습니다')

    const obj = await ctx.env.STORAGE.get(row.r2_key)
    if (!obj) return jsonError(404, '파일을 찾을 수 없습니다')

    // D-14: UTF-8 encoded filename for Korean file name support
    const encodedName = encodeURIComponent(row.filename)
    const disposition = `attachment; filename*=UTF-8''${encodedName}`

    return new Response(obj.body, {
      headers: {
        'Content-Type':        row.content_type || 'application/octet-stream',
        'Content-Length':      String(row.size),
        'Content-Disposition': disposition,
        'Cache-Control':       'private, max-age=3600',
      },
    })
  } catch (e) {
    console.error('DOCUMENT_DOWNLOAD_FAILED', e)
    return jsonError(500, '문서 다운로드에 실패했습니다')
  }
}
