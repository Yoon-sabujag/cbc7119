import { requireAdmin, validateFileType, jsonError, jsonOk, isDocType, MAX_DOC_SIZE, type Env } from '../_helpers'

interface CompleteBody {
  uploadId: string
  key: string
  parts: Array<{ partNumber: number; etag: string }>
  type: 'plan' | 'drill'
  year: number
  title: string
  filename: string
  size: number
  contentType: string
}

// POST /api/documents/multipart/complete
// body: CompleteBody
// response: { success: true, data: { id, key } }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const denied = requireAdmin(ctx as any)
  if (denied) return denied

  let body: CompleteBody
  try { body = await ctx.request.json() as CompleteBody }
  catch { return jsonError(400, '잘못된 요청 본문입니다') }

  const { uploadId, key, parts, type, year, title, filename, size, contentType } = body || ({} as CompleteBody)

  if (typeof uploadId !== 'string' || typeof key !== 'string') return jsonError(400, 'uploadId와 key가 필요합니다')
  if (!Array.isArray(parts) || parts.length === 0) return jsonError(400, 'parts 배열이 필요합니다')
  for (const p of parts) {
    if (typeof p.partNumber !== 'number' || typeof p.etag !== 'string') {
      return jsonError(400, 'parts는 {partNumber, etag} 형식이어야 합니다')
    }
  }
  if (!isDocType(type)) return jsonError(400, 'type은 plan 또는 drill이어야 합니다')
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 2000 || year > 2100) return jsonError(400, 'year가 유효하지 않습니다')
  if (typeof title !== 'string' || title.trim().length === 0) return jsonError(400, '제목을 입력하세요')
  if (typeof filename !== 'string' || filename.trim().length === 0) return jsonError(400, '파일명이 없습니다')
  if (typeof size !== 'number' || !Number.isInteger(size) || size <= 0 || size > MAX_DOC_SIZE) return jsonError(400, 'size가 유효하지 않습니다')
  if (typeof contentType !== 'string') return jsonError(400, 'contentType이 없습니다')

  const vt = validateFileType(contentType, filename)
  if (!vt.ok) return jsonError(400, (vt as { ok: false; error: string }).error)

  // Step 1: complete the R2 multipart upload
  try {
    const mp = ctx.env.STORAGE.resumeMultipartUpload(key, uploadId)
    // R2 requires parts sorted by partNumber
    const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber)
    await mp.complete(sorted)
  } catch (e) {
    console.error('MULTIPART_COMMIT_FAILED', e)
    return jsonError(500, '업로드 완료 처리에 실패했습니다', { code: 'MULTIPART_COMMIT_FAILED' })
  }

  // Step 2: INSERT metadata into D1. On failure, delete the R2 object (D-25).
  const staffId = (ctx as any).data?.staffId
  if (!staffId) {
    // Should not happen — middleware enforces auth — but be defensive
    try { await ctx.env.STORAGE.delete(key) } catch {}
    return jsonError(401, '인증 정보가 없습니다')
  }

  try {
    const result = await ctx.env.DB.prepare(
      `INSERT INTO documents (type, year, title, filename, r2_key, size, content_type, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(type, year, title, filename, key, size, contentType, Number(staffId)).run()

    const id = (result as any).meta?.last_row_id
    if (!id) {
      try { await ctx.env.STORAGE.delete(key) } catch {}
      return jsonError(500, '메타데이터 저장에 실패했습니다', { code: 'METADATA_INSERT_FAILED' })
    }

    return jsonOk({ id, key }, 201)
  } catch (e) {
    console.error('METADATA_INSERT_FAILED', e)
    // D-25: cleanup R2 object on DB failure
    try { await ctx.env.STORAGE.delete(key) } catch (cleanupErr) {
      console.error('R2_CLEANUP_FAILED', cleanupErr)
    }
    return jsonError(500, '메타데이터 저장에 실패했습니다', { code: 'METADATA_INSERT_FAILED' })
  }
}
