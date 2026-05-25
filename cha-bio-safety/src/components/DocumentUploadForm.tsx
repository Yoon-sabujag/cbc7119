// src/components/DocumentUploadForm.tsx
//
// Upload form for 소방계획서/소방훈련자료:
// year + title + file (with empty-MIME .hwp/.zip fallback) → runMultipartUpload
// with progress bar, abort/retry, and beforeunload guard during upload.

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  runMultipartUpload,
  formatBytes,
  formatEta,
  type ProgressState,
} from '../utils/multipartUpload'
import { ApiError } from '../utils/api'

interface Props {
  type: 'plan' | 'drill'
  onClose: () => void
}

const ALLOWED = [
  { ext: '.pdf', mimes: ['application/pdf'] },
  { ext: '.xlsx', mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
  { ext: '.docx', mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { ext: '.pptx', mimes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'] },
  { ext: '.hwp', mimes: ['application/x-hwp', 'application/vnd.hancom.hwp', 'application/haansofthwp', ''] },
  { ext: '.zip', mimes: ['application/zip', 'application/x-zip-compressed', ''] },
] as const

const EXT_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.hwp': 'application/x-hwp',
  '.zip': 'application/zip',
}

const MAX_SIZE = 500 * 1024 * 1024

// Auto-prefill title format (D-19): `${year}년 소방계획서` or `${year}년 소방훈련자료`
const typeLabel = (t: 'plan' | 'drill') => (t === 'plan' ? '소방계획서' : '소방훈련자료')

function findAllowed(filename: string) {
  const lower = filename.toLowerCase()
  return ALLOWED.find((e) => lower.endsWith(e.ext))
}

export default function DocumentUploadForm({ type, onClose }: Props) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState<number>(currentYear)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()

  // beforeunload guard while uploading (D-23)
  useEffect(() => {
    if (!isUploading) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '업로드 중입니다. 페이지를 나가면 전송이 중단됩니다.'
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isUploading])

  // Cleanup on unmount — abort any in-flight upload
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    // Reset the input so selecting the same file again re-triggers change
    e.target.value = ''
    if (!f) return
    if (f.size > MAX_SIZE) {
      toast.error('파일 크기가 500MB를 초과합니다.')
      return
    }
    const entry = findAllowed(f.name)
    if (!entry) {
      toast.error('지원하지 않는 파일 형식입니다. (PDF, XLSX, DOCX, PPTX, HWP, ZIP)')
      return
    }
    // If file.type is non-empty, it must match. Empty MIME is OK (iOS .hwp/.zip fallback).
    if (f.type && !(entry.mimes as readonly string[]).includes(f.type)) {
      toast.error('지원하지 않는 파일 형식입니다. (PDF, XLSX, DOCX, PPTX, HWP, ZIP)')
      return
    }
    setFile(f)
    if (!title.trim()) {
      setTitle(`${year}년 ${typeLabel(type)}`)
    }
  }

  async function handleSubmit() {
    if (!file || !title.trim()) {
      toast.error('연도, 제목, 파일을 모두 입력해주세요.')
      return
    }
    const entry = findAllowed(file.name)
    const contentType = file.type || (entry ? EXT_TO_MIME[entry.ext] : 'application/octet-stream')

    setError(null)
    setIsUploading(true)
    setProgress(null)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      await runMultipartUpload({
        file,
        type,
        year,
        title: title.trim(),
        contentType,
        signal: ctrl.signal,
        onProgress: (p) => setProgress(p),
      })
      queryClient.invalidateQueries({ queryKey: ['documents', type] })
      toast.success('업로드가 완료되었습니다.')
      onClose()
    } catch (err: unknown) {
      let message: string
      let isAbort = false
      if (err && typeof err === 'object' && 'name' in err && (err as { name?: string }).name === 'AbortError') {
        message = '업로드가 취소되었습니다.'
        isAbort = true
      } else if (err instanceof ApiError && err.status === 403) {
        message = '관리자만 업로드할 수 있습니다.'
      } else if (err instanceof ApiError) {
        message = err.message || '업로드 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      } else {
        message = '업로드 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      }
      setError(message)
      if (!isAbort) toast.error(message)
    } finally {
      setIsUploading(false)
      abortRef.current = null
    }
  }

  function handleCancel() {
    if (isUploading) {
      const ok = window.confirm(
        '업로드를 취소하시겠습니까? 지금까지 전송된 데이터는 저장되지 않습니다.',
      )
      if (ok) {
        abortRef.current?.abort()
      }
      return
    }
    onClose()
  }

  function handleRetry() {
    setError(null)
    void handleSubmit()
  }

  // Year options descending from currentYear+1 to 2020
  const yearOptions: number[] = []
  for (let y = currentYear + 1; y >= 2020; y--) yearOptions.push(y)

  const label = typeLabel(type)
  const canSubmit = !isUploading && !!file && !!title.trim()

  return (
    <div className="docs-form">
      {/* Title */}
      <div className="docs-form-title">{label} 업로드</div>

      {/* Year */}
      <div>
        <label className="docs-input-label">연도</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          disabled={isUploading}
          className="docs-input"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="docs-input-label">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`예: ${currentYear}년 ${label}`}
          disabled={isUploading}
          className="docs-input"
        />
      </div>

      {/* File */}
      <div>
        <label className="docs-input-label">파일</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xlsx,.docx,.pptx,.hwp,.zip"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={file ? 'docs-file-btn docs-file-btn--filled' : 'docs-file-btn'}
        >
          {file ? `${file.name} · ${formatBytes(file.size)}` : '파일 선택'}
        </button>
        <div className="docs-file-hint">PDF, XLSX, DOCX, PPTX, HWP, ZIP · 최대 500MB</div>
      </div>

      {/* Progress block */}
      {progress !== null && (
        <div className="docs-progress-wrap">
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress.percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="docs-progress-bar"
          >
            <div className="docs-progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <div className="docs-progress-meta">
            <span className="docs-progress-percent">{Math.round(progress.percent)}%</span>
            <span className="docs-progress-speed">
              {progress.speedBps < 100 * 1024
                ? `${formatBytes(progress.loadedBytes)} / ${formatBytes(progress.totalBytes)} · 속도 계산 중…`
                : `${formatBytes(progress.loadedBytes)} / ${formatBytes(progress.totalBytes)} · ${(
                    progress.speedBps /
                    1024 /
                    1024
                  ).toFixed(1)} MB/s · 남은 시간 ${formatEta(progress.etaSeconds)}`}
            </span>
          </div>
        </div>
      )}

      {/* Error block */}
      {error && !isUploading && (
        <div className="docs-error-block">
          <span className="docs-error-msg">{error}</span>
          <button type="button" onClick={handleRetry} className="docs-error-retry">
            다시 시도
          </button>
        </div>
      )}

      {/* Action row */}
      <div className="docs-action-row">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary-gradient"
        >
          {isUploading ? '업로드 중…' : '업로드'}
        </button>
        <button type="button" onClick={handleCancel} className="docs-cancel-btn">
          취소
        </button>
      </div>
    </div>
  )
}
