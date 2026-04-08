import { requireAdmin, jsonError, jsonOk, type Env } from '../_helpers'

// POST /api/documents/multipart/abort
// body: { uploadId: string, key: string }
// response: { success: true, data: { aborted: true } }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const denied = requireAdmin(ctx as any)
  if (denied) return denied

  let body: any
  try { body = await ctx.request.json() }
  catch { return jsonError(400, '잘못된 요청 본문입니다') }

  const { uploadId, key } = body || {}
  if (typeof uploadId !== 'string' || typeof key !== 'string') return jsonError(400, 'uploadId와 key가 필요합니다')

  try {
    const mp = ctx.env.STORAGE.resumeMultipartUpload(key, uploadId)
    await mp.abort()
    return jsonOk({ aborted: true })
  } catch (e) {
    console.error('MULTIPART_ABORT_FAILED', e)
    return jsonError(500, '업로드 중단에 실패했습니다', { code: 'MULTIPART_ABORT_FAILED' })
  }
}
