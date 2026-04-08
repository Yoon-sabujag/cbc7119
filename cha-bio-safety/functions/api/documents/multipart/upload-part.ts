import { requireAdmin, jsonError, jsonOk, type Env } from '../_helpers'

// PUT /api/documents/multipart/upload-part?uploadId=...&key=...&partNumber=N
// body: raw binary (Content-Type: application/octet-stream)
// response: { success: true, data: { partNumber, etag } }
export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const denied = requireAdmin(ctx as any)
  if (denied) return denied

  const url = new URL(ctx.request.url)
  const uploadId = url.searchParams.get('uploadId')
  const key = url.searchParams.get('key')
  const partNumberRaw = url.searchParams.get('partNumber')

  if (!uploadId || !key || !partNumberRaw) {
    return jsonError(400, 'uploadId, key, partNumber 쿼리 파라미터가 필요합니다')
  }

  const partNumber = Number(partNumberRaw)
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
    return jsonError(400, 'partNumber는 1..10000 범위의 정수여야 합니다')
  }

  if (!ctx.request.body) {
    return jsonError(400, '본문(body)이 비어있습니다')
  }

  try {
    const mp = ctx.env.STORAGE.resumeMultipartUpload(key, uploadId)
    // IMPORTANT: pass ReadableStream directly — do NOT buffer
    const uploaded = await mp.uploadPart(partNumber, ctx.request.body)
    return jsonOk({ partNumber: uploaded.partNumber, etag: uploaded.etag })
  } catch (e) {
    console.error('MULTIPART_PART_FAILED', { key, partNumber, err: e })
    return jsonError(500, '파트 업로드에 실패했습니다', { code: 'MULTIPART_PART_FAILED', uploadId, key, partNumber })
  }
}
