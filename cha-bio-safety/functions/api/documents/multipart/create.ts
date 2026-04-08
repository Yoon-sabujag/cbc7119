import { requireAdmin, validateFileType, buildR2Key, jsonError, jsonOk, isDocType, MAX_DOC_SIZE, type Env, type DocType } from '../_helpers'

// POST /api/documents/multipart/create
// body: { type: 'plan'|'drill', year: number, title: string, filename: string, contentType: string, size: number }
// response: { success: true, data: { uploadId, key, partSize } }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const denied = requireAdmin(ctx as any)
  if (denied) return denied

  let body: any
  try { body = await ctx.request.json() }
  catch { return jsonError(400, '잘못된 요청 본문입니다') }

  const { type, year, title, filename, contentType, size } = body || {}

  if (!isDocType(type)) return jsonError(400, 'type은 plan 또는 drill이어야 합니다')
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 2000 || year > 2100) return jsonError(400, 'year가 유효하지 않습니다')
  if (typeof title !== 'string' || title.trim().length === 0) return jsonError(400, '제목을 입력하세요')
  if (typeof filename !== 'string' || filename.trim().length === 0) return jsonError(400, '파일명이 없습니다')
  if (typeof contentType !== 'string' || contentType.length === 0) return jsonError(400, 'contentType이 없습니다')
  if (typeof size !== 'number' || !Number.isInteger(size) || size <= 0) return jsonError(400, 'size가 유효하지 않습니다')
  if (size > MAX_DOC_SIZE) return jsonError(400, `파일 크기가 최대 허용치(${MAX_DOC_SIZE} bytes)를 초과했습니다`)

  const v = validateFileType(contentType, filename)
  if (!v.ok) return jsonError(400, v.error)

  const key = buildR2Key(type as DocType, year, filename)

  try {
    const mp = await ctx.env.STORAGE.createMultipartUpload(key, {
      httpMetadata: { contentType },
    })
    return jsonOk({ uploadId: mp.uploadId, key: mp.key, partSize: 10 * 1024 * 1024 })
  } catch (e) {
    console.error('MULTIPART_INIT_FAILED', e)
    return jsonError(500, '업로드 초기화에 실패했습니다', { code: 'MULTIPART_INIT_FAILED' })
  }
}
