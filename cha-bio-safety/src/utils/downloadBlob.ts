// src/utils/downloadBlob.ts
//
// Authenticated document download utility.
// Cannot use `window.open('/api/documents/{id}')` because the new tab does not
// carry the Authorization header — request 401s and triggers auto-logout.
// Instead: fetch with Bearer token → Blob → programmatic <a download> click.
// This mirrors LegalFindingsPage.tsx:491-501 which is proven on iOS 16.3+ PWA.

import { useAuthStore } from '../stores/authStore'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

/**
 * Parse an RFC 5987 Content-Disposition header.
 * Our server emits `attachment; filename*=UTF-8''<percent-encoded>` so we try
 * that first, then fall back to plain `filename="..."` / `filename=...`.
 */
export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null
  const star = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header)
  if (star) {
    try {
      return decodeURIComponent(star[2].trim())
    } catch {
      /* fall through */
    }
  }
  const quoted = /filename\s*=\s*"([^"]+)"/i.exec(header)
  if (quoted) return quoted[1]
  const bare = /filename\s*=\s*([^;]+)/i.exec(header)
  if (bare) return bare[1].trim()
  return null
}

/**
 * Download a protected API file as a Blob and trigger a native save dialog.
 * Works on iOS 16.3+ PWA standalone mode (verified by LegalFindingsPage ZIP path).
 *
 * @param id Document id from /api/documents list
 * @param fallbackFilename Shown if server did not emit Content-Disposition
 */
export async function downloadDocument(
  id: number,
  fallbackFilename: string,
): Promise<void> {
  const { token } = useAuthStore.getState()
  const res = await fetch(`${BASE}/documents/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return
    }
    throw new Error(`다운로드 실패 (${res.status})`)
  }
  const filename =
    parseContentDispositionFilename(res.headers.get('Content-Disposition')) ??
    fallbackFilename
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // iOS PWA: delay revoke so the Files save sheet has time to read the blob.
  // Matches LegalFindingsPage.tsx:500 timing.
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}
