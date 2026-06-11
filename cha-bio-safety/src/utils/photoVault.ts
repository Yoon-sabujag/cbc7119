// ── 사진 보관함 (IndexedDB) ────────────────────────────────
// 촬영/첨부한 원본 Blob 을 업로드와 무관하게 디바이스에 보관해,
// 업로드 실패·화면 이탈·앱 재실행 후에도 같은 사진으로 재시도할 수 있게 한다.
// 업로드 성공 시 해당 entry 를 삭제하므로 평상시 보관함은 비어 있다.
//
// 모든 함수는 절대 throw 하지 않는다 — 보관함 불능(사파리 프라이빗 모드,
// 저장소 거부 등)이 업로드/저장 흐름을 깨면 안 되기 때문.

const DB_NAME = 'photo-vault'
const STORE = 'photos'
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000 // 14일 지난 entry 는 자동 정리

export interface VaultEntry {
  id: string
  scope: string
  blob: Blob
  createdAt: number
}

function genId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }
}

// ── 탭 내 claim 레지스트리 ──────────────────────────────
// 현재 어떤 훅 인스턴스에 "첨부 중" 인 entry id 집합 (per-tab 메모리).
// 같은 scope 를 쓰는 다른 픽커가 첨부 중인 사진을 복구 대상으로 제시/탈취해
// 한 장이 두 record 에 중복 저장되는 것을 막는다. 리로드 후엔 아무것도 첨부
// 상태가 아니므로 전부 다시 복구 가능해지는 것이 의도.
const claimed = new Set<string>()
export function vaultClaim(id: string | null | undefined) { if (id) claimed.add(id) }
export function vaultRelease(id: string | null | undefined) { if (id) claimed.delete(id) }
export function isVaultClaimed(id: string): boolean { return claimed.has(id) }

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise(resolve => {
    try {
      if (typeof indexedDB === 'undefined') { resolve(null); return }
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('scope', 'scope')
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  // 첫 접근 시 오래된 entry 정리 (fire-and-forget)
  dbPromise.then(db => { if (db) pruneOld(db) })
  return dbPromise
}

function pruneOld(db: IDBDatabase) {
  try {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.openCursor()
    const cutoff = Date.now() - MAX_AGE_MS
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) return
      const entry = cursor.value as VaultEntry
      if (entry.createdAt < cutoff) cursor.delete()
      cursor.continue()
    }
  } catch { /* 정리 실패는 무시 */ }
}

/** Blob 을 보관함에 저장하고 id 반환. 실패 시 null (흐름은 계속 진행). */
export async function vaultPut(scope: string, blob: Blob): Promise<string | null> {
  const db = await openDb()
  if (!db) return null
  return new Promise(resolve => {
    try {
      const id = genId()
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put({ id, scope, blob, createdAt: Date.now() } satisfies VaultEntry)
      tx.oncomplete = () => resolve(id)
      tx.onerror = () => resolve(null)
      tx.onabort = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

/** 보관함에서 entry 삭제 (업로드 성공·사용자 제거 시). */
export async function vaultDelete(id: string | null | undefined): Promise<void> {
  if (!id) return
  const db = await openDb()
  if (!db) return
  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}

/** scope 의 보관 entry 목록 (오래된 순). 실패 시 빈 배열. */
export async function vaultList(scope: string): Promise<VaultEntry[]> {
  const db = await openDb()
  if (!db) return []
  return new Promise(resolve => {
    try {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).index('scope').getAll(scope)
      req.onsuccess = () => {
        const entries = (req.result as VaultEntry[]).filter(e => e.blob instanceof Blob)
        entries.sort((a, b) => a.createdAt - b.createdAt)
        resolve(entries)
      }
      req.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}
