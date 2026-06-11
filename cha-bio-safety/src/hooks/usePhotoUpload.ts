import { useState, useCallback, useRef, useEffect } from 'react'
import { compressImage } from '../utils/imageUtils'
import { vaultPut, vaultDelete, vaultList, vaultClaim, vaultRelease, isVaultClaimed } from '../utils/photoVault'

// ── 사진 업로드 훅 ─────────────────────────────────────
// upload() 는 사진 미첨부 시에도 null 을 반환하므로, 호출부는
// `hook.hasPhoto && key === null` 로 "업로드 실패"와 "미첨부(정상)" 를 구분해야 한다.
export function usePhotoUpload(vaultScope?: string) {
  const [photoBlob,     setPhotoBlob]     = useState<Blob | null>(null)
  const [photoPreview,  setPhotoPreview]  = useState<string | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const [showPicker,    setShowPicker]    = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef  = useRef<HTMLInputElement>(null)
  // 현재 첨부 사진의 보관함 entry id
  const vaultIdRef = useRef<string | null>(null)
  // 업로드 성공 결과 캐시 — 같은 blob 재시도 시 재업로드 방지 + 저장 성공 시 entry 정리용
  const uploadedRef = useRef<{ blob: Blob; key: string; vaultId: string | null } | null>(null)
  const [vaultPendingCount, setVaultPendingCount] = useState(0)

  const refreshVaultCount = useCallback(async () => {
    if (!vaultScope) return
    const entries = await vaultList(vaultScope)
    setVaultPendingCount(entries.filter(e => !isVaultClaimed(e.id)).length)
  }, [vaultScope])

  useEffect(() => { refreshVaultCount() }, [refreshVaultCount])

  // Unmount: claim 만 반납 (entry 는 남아 복구 가능)
  useEffect(() => {
    return () => { vaultRelease(vaultIdRef.current) }
  }, [])

  const openPicker  = () => { setShowPicker(true); refreshVaultCount() }
  const closePicker = () => setShowPicker(false)
  const pickCamera  = () => cameraRef.current?.click()
  const pickAlbum   = () => albumRef.current?.click()

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // 입력 초기화 (같은 파일 재선택 허용)
    e.target.value = ''
    const blob = await compressImage(file)
    // 기존 첨부를 교체 — 이전 보관함 entry 정리
    if (vaultIdRef.current) {
      vaultRelease(vaultIdRef.current)
      vaultDelete(vaultIdRef.current)
      vaultIdRef.current = null
    }
    uploadedRef.current = null
    // 첨부 즉시 원본을 보관함에 캐싱 — 업로드 실패/이탈에도 디바이스에 보존
    if (vaultScope) {
      vaultIdRef.current = await vaultPut(vaultScope, blob)
      vaultClaim(vaultIdRef.current)
    }
    setPhotoBlob(blob)
    setPhotoPreview(URL.createObjectURL(blob))
  }, [vaultScope])

  const removePhoto = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    if (vaultIdRef.current) {
      vaultRelease(vaultIdRef.current)
      vaultDelete(vaultIdRef.current).then(refreshVaultCount)
      vaultIdRef.current = null
    }
    uploadedRef.current = null
    setPhotoBlob(null)
    setPhotoPreview(null)
  }, [photoPreview, refreshVaultCount])

  // 업로드 → photo_key 반환 (미첨부·실패 모두 null — 호출부에서 hasPhoto 로 구분).
  // 보관함 entry 는 여기서 지우지 않는다 — 저장 API 성공 후 reset() 에서 정리 (저장 실패 시 보존).
  const upload = useCallback(async (): Promise<string | null> => {
    if (!photoBlob) return null
    // 같은 blob 이 이미 업로드 성공했으면 key 재사용 (BC 동반 저장 등 부분 실패 후 재시도 시 중복 업로드 방지)
    if (uploadedRef.current && uploadedRef.current.blob === photoBlob) return uploadedRef.current.key
    const vid = vaultIdRef.current // 이 업로드가 올리는 blob 의 entry id 스냅샷
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', photoBlob, 'photo.jpg')
      const res  = await fetch('/api/uploads', {
        method: 'POST',
        body:   form,
        headers: { Authorization: `Bearer ${(await import('../stores/authStore')).useAuthStore.getState().token}` },
      })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      const key = json.success ? json.data!.key : null
      if (key) uploadedRef.current = { blob: photoBlob, key, vaultId: vid }
      return key
    } finally {
      setUploading(false)
    }
  }, [photoBlob])

  /** 보관함의 최근 사진을 다시 첨부 (현재 첨부는 교체되지만 entry 는 보존). 복구 성공 여부 반환. */
  const restoreFromVault = useCallback(async (): Promise<boolean> => {
    if (!vaultScope) return false
    const entries = await vaultList(vaultScope)
    const latest = entries.filter(e => !isVaultClaimed(e.id)).pop()
    if (!latest) return false
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    // 교체되는 기존 첨부의 entry 는 지우지 않고 claim 만 반납 — 다시 복구 가능
    vaultRelease(vaultIdRef.current)
    vaultClaim(latest.id)
    vaultIdRef.current = latest.id
    uploadedRef.current = null
    setPhotoBlob(latest.blob)
    setPhotoPreview(URL.createObjectURL(latest.blob))
    refreshVaultCount()
    return true
  }, [vaultScope, photoPreview, refreshVaultCount])

  /** 저장 성공 후(또는 폼 전환 시) 호출. 업로드까지 끝난 사진의 보관함 entry 를 이 시점에 정리. */
  const reset = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    // 업로드 성공분만 보관함에서 제거 — 미업로드분은 복구용 안전망으로 남김 (14일 후 자동 정리)
    if (uploadedRef.current?.vaultId) vaultDelete(uploadedRef.current.vaultId)
    vaultRelease(vaultIdRef.current)
    vaultIdRef.current = null
    uploadedRef.current = null
    setPhotoBlob(null)
    setPhotoPreview(null)
    refreshVaultCount()
  }, [photoPreview, refreshVaultCount])

  return { cameraRef, albumRef, showPicker, openPicker, closePicker, pickCamera, pickAlbum, photoPreview, uploading, handleFile, removePhoto, upload, reset, hasPhoto: !!photoBlob, vaultPendingCount, restoreFromVault }
}
