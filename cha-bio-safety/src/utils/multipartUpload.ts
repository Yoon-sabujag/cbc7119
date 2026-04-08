// src/utils/multipartUpload.ts
//
// Client-side orchestration for the Phase 20 R2 multipart upload protocol.
// Sequential 10MB parts (no parallelism per CONTEXT D-20), 3-second rolling
// average for speed/ETA display, best-effort abort on any error path.

import { documentsApi, uploadPartRaw } from './api'

export interface ProgressState {
  loadedBytes: number
  totalBytes: number
  percent: number // 0..100
  speedBps: number // bytes per second (3s rolling)
  etaSeconds: number // remaining seconds
}

export interface MultipartOptions {
  file: File
  type: 'plan' | 'drill'
  year: number
  title: string
  contentType: string // caller pre-resolves empty file.type via extension fallback
  onProgress?: (p: ProgressState) => void
  signal?: AbortSignal
}

const PART_SIZE = 10 * 1024 * 1024 // 10MB fixed (CONTEXT D-21)

export async function runMultipartUpload(
  opts: MultipartOptions,
): Promise<{ id: number }> {
  const { file, type, year, title, contentType, onProgress, signal } = opts

  // 1. create
  const { uploadId, key } = await documentsApi.multipartCreate({
    type,
    year,
    title,
    filename: file.name,
    contentType,
    size: file.size,
  })

  // If caller aborts, best-effort call multipartAbort once.
  const onAbort = () => {
    documentsApi.multipartAbort({ uploadId, key }).catch(() => {
      /* D-27: abort failure is tolerated */
    })
  }
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    // 2. slice + sequential upload-part
    const parts: Array<{ partNumber: number; etag: string }> = []
    const total = file.size
    const numParts = Math.max(1, Math.ceil(total / PART_SIZE))
    let loaded = 0

    // Rolling 3-second window of { timestamp, bytesUploaded } samples.
    const samples: Array<{ t: number; b: number }> = []
    const emitProgress = () => {
      const now = Date.now()
      samples.push({ t: now, b: loaded })
      while (samples.length > 1 && now - samples[0].t > 3000) samples.shift()
      const first = samples[0]
      const dtSec = (now - first.t) / 1000
      const speed = dtSec > 0 ? (loaded - first.b) / dtSec : 0
      const remain = total - loaded
      const eta = speed > 0 ? remain / speed : 0
      onProgress?.({
        loadedBytes: loaded,
        totalBytes: total,
        percent: total > 0 ? (loaded / total) * 100 : 0,
        speedBps: speed,
        etaSeconds: eta,
      })
    }
    emitProgress() // initial 0%

    for (let i = 0; i < numParts; i++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const start = i * PART_SIZE
      const end = Math.min(start + PART_SIZE, total)
      const slice = file.slice(start, end)
      const partNumber = i + 1
      const { etag } = await uploadPartRaw(uploadId, key, partNumber, slice, signal)
      parts.push({ partNumber, etag })
      loaded = end
      emitProgress()
    }

    // 3. complete
    const { id } = await documentsApi.multipartComplete({
      uploadId,
      key,
      parts,
      type,
      year,
      title,
      filename: file.name,
      size: total,
      contentType,
    })
    signal?.removeEventListener('abort', onAbort)
    return { id }
  } catch (err) {
    signal?.removeEventListener('abort', onAbort)
    // Best-effort cleanup on any failure (network, server, user cancel)
    try {
      await documentsApi.multipartAbort({ uploadId, key })
    } catch {
      /* D-27 */
    }
    throw err
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—'
  const s = Math.ceil(seconds)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
