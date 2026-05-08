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
        style={{
          height: 40,
          padding: '0 16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#2f81f7',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        <Plus size={16} />
        업로드
      </button>
    ) : (
      <button
        type="button"
        onClick={onUploadClick}
        aria-label={`${title} 업로드`}
        style={{
          width: 40,
          height: 40,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: 'var(--t1)',
          border: '1px solid var(--bd)',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        <Plus size={20} />
      </button>
    )
  ) : null

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`@keyframes docsec-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 40,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--t1)' }}>{title}</h2>
        {uploadBtn}
      </div>

      {/* Loading */}
      {query.isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              height: 96,
              background: 'var(--bg2)',
              borderRadius: 12,
              border: '1px solid var(--bd)',
            }}
          />
          <div style={{ height: 56, background: 'var(--bg2)', borderRadius: 8 }} />
          <div style={{ height: 56, background: 'var(--bg2)', borderRadius: 8 }} />
        </div>
      )}

      {/* Error */}
      {!query.isLoading && query.error && (
        <div
          style={{
            padding: 24,
            background: 'var(--bg2)',
            border: '1px solid var(--bd)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ color: 'var(--danger)', fontSize: 16, fontWeight: 600 }}>
            문서 목록을 불러오지 못했습니다.
          </div>
          <button
            type="button"
            onClick={() => query.refetch()}
            style={{
              height: 40,
              padding: '0 16px',
              background: '#2f81f7',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && !query.error && data.length === 0 && (
        <div
          style={{
            padding: '48px 24px',
            background: 'var(--bg2)',
            border: '1px solid var(--bd)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <FileText size={48} color="var(--t3)" />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t1)' }}>
            아직 업로드된 문서가 없습니다
          </div>
          <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t2)' }}>
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
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDownload(latest) } }}
          aria-disabled={downloadingIds.has(latest.id) || deletingIds.has(latest.id)}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 96,
            padding: 24,
            background: 'var(--bg2)',
            border: '1px solid var(--bd)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: downloadingIds.has(latest.id) || deletingIds.has(latest.id) ? 'wait' : 'pointer',
            textAlign: 'left',
            opacity: downloadingIds.has(latest.id) || deletingIds.has(latest.id) ? 0.7 : 1,
          }}
        >
          {/* Latest pill */}
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: 11,
              fontWeight: 600,
              color: '#ffffff',
              background: '#2f81f7',
              padding: '4px 8px',
              borderRadius: 999,
            }}
          >
            최신
          </span>

          {/* Year tile */}
          <div
            style={{
              width: 64,
              height: 64,
              background: 'var(--bg3)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 28,
                fontWeight: 600,
                color: 'var(--t1)',
              }}
            >
              {latest.year}
            </span>
          </div>

          {/* Meta */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--t1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {latest.title}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--t2)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {latest.filename} · {formatBytes(latest.size)} ·{' '}
              {latest.uploaded_by_name ?? '알 수 없음'} · {formatDate(latest.uploaded_at)}
            </div>
          </div>

          {downloadingIds.has(latest.id) && (
            <Loader2
              size={16}
              style={{ animation: 'docsec-spin 1s linear infinite', color: 'var(--t2)', flexShrink: 0 }}
            />
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={(e) => handleDelete(latest, e)}
              disabled={deletingIds.has(latest.id)}
              aria-label={`${latest.title} 삭제`}
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                width: 32,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: 'var(--danger)',
                border: '1px solid var(--bd)',
                borderRadius: 8,
                cursor: deletingIds.has(latest.id) ? 'wait' : 'pointer',
              }}
            >
              {deletingIds.has(latest.id) ? (
                <Loader2 size={16} style={{ animation: 'docsec-spin 1s linear infinite' }} />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          )}
        </div>
      )}

      {/* Past history */}
      {!query.isLoading && !query.error && history.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--t1)',
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            과거 이력
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((row, idx) => {
              const isFirst = idx === 0
              const isLast = idx === history.length - 1
              const isDownloading = downloadingIds.has(row.id)
              const isDeleting = deletingIds.has(row.id)
              return (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleDownload(row)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDownload(row) } }}
                  aria-disabled={isDownloading || isDeleting}
                  style={{
                    width: '100%',
                    minHeight: 56,
                    padding: 16,
                    background: 'var(--bg2)',
                    borderTop: isFirst ? '1px solid var(--bd)' : 'none',
                    borderRight: '1px solid var(--bd)',
                    borderLeft: '1px solid var(--bd)',
                    borderBottom: '1px solid var(--bd)',
                    borderTopLeftRadius: isFirst ? 8 : 0,
                    borderTopRightRadius: isFirst ? 8 : 0,
                    borderBottomLeftRadius: isLast ? 8 : 0,
                    borderBottomRightRadius: isLast ? 8 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: isDownloading || isDeleting ? 'wait' : 'pointer',
                    textAlign: 'left',
                    opacity: isDownloading || isDeleting ? 0.7 : 1,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--t1)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.year}년 · {row.title}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: 'var(--t2)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatBytes(row.size)} · {row.uploaded_by_name ?? '알 수 없음'} ·{' '}
                      {formatDate(row.uploaded_at, 'date-only')}
                    </div>
                  </div>
                  {isDownloading && (
                    <Loader2
                      size={16}
                      style={{
                        animation: 'docsec-spin 1s linear infinite',
                        color: 'var(--t2)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(row, e)}
                      disabled={isDeleting}
                      aria-label={`${row.title} 삭제`}
                      style={{
                        width: 32,
                        height: 32,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        color: 'var(--danger)',
                        border: '1px solid var(--bd)',
                        borderRadius: 8,
                        cursor: isDeleting ? 'wait' : 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {isDeleting ? (
                        <Loader2 size={16} style={{ animation: 'docsec-spin 1s linear infinite' }} />
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
