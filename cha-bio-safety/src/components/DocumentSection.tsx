// src/components/DocumentSection.tsx
//
// Per-type document list view (plan | drill):
// hero card (latest) + 과거 이력 list + empty/loading/error states
// + admin-only upload button. Download wiring via downloadDocument().

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FileText, Plus, Loader2, Trash2 } from 'lucide-react'
import { documentsApi, type DocumentListItem } from '../utils/api'
import { downloadDocument } from '../utils/downloadBlob'
import { formatBytes } from '../utils/multipartUpload'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'

interface Props {
  type: 'plan' | 'drill'
  onUploadClick: () => void
}

function formatDate(iso: string, mode: 'full' | 'date-only' = 'full'): string {
  try {
    const d = new Date(iso)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    if (mode === 'date-only') return `${yyyy}-${mm}-${dd}`
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
  } catch {
    return iso
  }
}

const typeLabel = (t: 'plan' | 'drill') => (t === 'plan' ? '소방계획서' : '소방훈련자료')

export default function DocumentSection({ type, onUploadClick }: Props) {
  const isAdmin = useAuthStore((s) => s.staff?.role === 'admin')
  const isDesktop = useIsDesktop()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['documents', type],
    queryFn: () => documentsApi.list(type),
    staleTime: 60_000,
  })

  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  // Error toast (one-shot per error change)
  useEffect(() => {
    if (query.error) {
      toast.error('문서 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    }
  }, [query.error])

  async function handleDownload(item: DocumentListItem) {
    if (downloadingIds.has(item.id)) return
    setDownloadingIds((prev) => {
      const next = new Set(prev)
      next.add(item.id)
      return next
    })
    const toastId = toast.loading('다운로드 중입니다…')
    try {
      await downloadDocument(item.id, item.filename)
      toast.dismiss(toastId)
      toast.success('다운로드를 시작했습니다', { duration: 2000 })
    } catch {
      toast.dismiss(toastId)
      toast.error('다운로드에 실패했습니다. 네트워크를 확인해주세요.')
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  async function handleDelete(item: DocumentListItem, e: React.MouseEvent) {
    e.stopPropagation()
    if (deletingIds.has(item.id)) return
    const confirmed = window.confirm(
      `"${item.title}"\n(${item.filename})\n\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    )
    if (!confirmed) return
    setDeletingIds((prev) => {
      const next = new Set(prev)
      next.add(item.id)
      return next
    })
    try {
      await documentsApi.remove(item.id)
      toast.success('문서를 삭제했습니다')
      await queryClient.invalidateQueries({ queryKey: ['documents', type] })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '문서 삭제에 실패했습니다'
      toast.error(msg)
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const title = typeLabel(type)
  const data = query.data ?? []
  const latest = data[0]
  const history = data.slice(1)

  // Upload button — mobile = 40x40 icon-only, desktop = 40px accent pill
  const uploadBtn = isAdmin ? (
    isDesktop ? (
      <button
        type="button"
        onClick={onUploadClick}
        aria-label={`${title} 업로드`}
        className="docs-upload-btn-desktop"
      >
        <Plus size={16} />
        업로드
      </button>
    ) : (
      <button
        type="button"
        onClick={onUploadClick}
        aria-label={`${title} 업로드`}
        className="docs-upload-btn-mobile"
      >
        <Plus size={20} />
      </button>
    )
  ) : null

  return (
    <section className="docs-section">
      {/* Header row */}
      <div className="docs-section-header">
        <h2 className="docs-section-title">{title}</h2>
        {uploadBtn}
      </div>

      {/* Loading */}
      {query.isLoading && (
        <div className="docs-loading-wrap">
          <div className="docs-loading-skeleton-hero" />
          <div className="docs-loading-skeleton-row" />
          <div className="docs-loading-skeleton-row" />
        </div>
      )}

      {/* Error */}
      {!query.isLoading && query.error && (
        <div className="docs-error-state">
          <div className="docs-error-state-msg">문서 목록을 불러오지 못했습니다.</div>
          <button type="button" onClick={() => query.refetch()} className="docs-error-state-btn">
            다시 시도
          </button>
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && !query.error && data.length === 0 && (
        <div className="docs-empty-state">
          <FileText size={48} className="text-text-tertiary" />
          <div className="docs-empty-title">아직 업로드된 문서가 없습니다</div>
          <div className="docs-empty-hint">
            {isAdmin
              ? `우측 상단 업로드 버튼으로 ${title}를 추가하세요.`
              : '관리자가 문서를 업로드하면 이곳에 표시됩니다.'}
          </div>
        </div>
      )}

      {/* Hero card (latest) */}
      {!query.isLoading && !query.error && latest && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleDownload(latest)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleDownload(latest)
            }
          }}
          aria-disabled={downloadingIds.has(latest.id) || deletingIds.has(latest.id)}
          className={
            downloadingIds.has(latest.id) || deletingIds.has(latest.id)
              ? 'docs-hero-card docs-hero-card--busy'
              : 'docs-hero-card'
          }
        >
          {/* Latest pill */}
          <span className="docs-latest-pill">최신</span>

          {/* Year tile */}
          <div className="docs-year-tile">{latest.year}</div>

          {/* Meta */}
          <div className="docs-hero-meta-col">
            <div className="docs-hero-title">{latest.title}</div>
            <div className="docs-hero-meta">
              {latest.filename} · {formatBytes(latest.size)} ·{' '}
              {latest.uploaded_by_name ?? '알 수 없음'} · {formatDate(latest.uploaded_at)}
            </div>
          </div>

          {downloadingIds.has(latest.id) && (
            <Loader2 size={16} className="docs-trash-spin text-text-secondary flex-shrink-0" />
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={(e) => handleDelete(latest, e)}
              disabled={deletingIds.has(latest.id)}
              aria-label={`${latest.title} 삭제`}
              className="docs-trash-btn docs-trash-btn--hero"
            >
              {deletingIds.has(latest.id) ? (
                <Loader2 size={16} className="docs-trash-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          )}
        </div>
      )}

      {/* Past history */}
      {!query.isLoading && !query.error && history.length > 0 && (
        <div>
          <div className="docs-history-section-label">과거 이력</div>
          <div className="docs-history-list">
            {history.map((row, idx) => {
              const isFirst = idx === 0
              const isLast = idx === history.length - 1
              const isDownloading = downloadingIds.has(row.id)
              const isDeleting = deletingIds.has(row.id)
              const classes = [
                'docs-history-row',
                isFirst ? 'docs-history-row--first' : '',
                isLast ? 'docs-history-row--last' : '',
                isDownloading || isDeleting ? 'docs-history-row--busy' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDownload(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleDownload(row)
                    }
                  }}
                  aria-disabled={isDownloading || isDeleting}
                  className={classes}
                >
                  <div className="docs-history-meta-col">
                    <div className="docs-history-title">
                      {row.year}년 · {row.title}
                    </div>
                    <div className="docs-history-meta">
                      {formatBytes(row.size)} · {row.uploaded_by_name ?? '알 수 없음'} ·{' '}
                      {formatDate(row.uploaded_at, 'date-only')}
                    </div>
                  </div>
                  {isDownloading && (
                    <Loader2
                      size={16}
                      className="docs-trash-spin text-text-secondary flex-shrink-0"
                    />
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(row, e)}
                      disabled={isDeleting}
                      aria-label={`${row.title} 삭제`}
                      className="docs-trash-btn"
                    >
                      {isDeleting ? (
                        <Loader2 size={16} className="docs-trash-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
