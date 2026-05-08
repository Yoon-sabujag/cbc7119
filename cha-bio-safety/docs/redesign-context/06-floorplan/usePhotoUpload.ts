import { useState, useCallback, useRef } from 'react'
import { compressImage } from '../utils/imageUtils'

// ── 사진 업로드 훅 ─────────────────────────────────────
export function usePhotoUpload() {
  const [photoBlob,     setPhotoBlob]     = useState<Blob | null>(null)
  const [photoPreview,  setPhotoPreview]  = useState<string | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const [showPicker,    setShowPicker]    = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef  = useRef<HTMLInputElement>(null)

  const openPicker  = () => setShowPicker(true)
  const closePicker = () => setShowPicker(false)
  const pickCamera  = () => cameraRef.current?.click()
  const pickAlbum   = () => albumRef.current?.click()

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // 입력 초기화 (같은 파일 재선택 허용)
    e.target.value = ''
    const blob = await compressImage(file)
    setPhotoBlob(blob)
    setPhotoPreview(URL.createObjectURL(blob))
  }, [])

  const removePhoto = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoBlob(null)
    setPhotoPreview(null)
  }, [photoPreview])

  // 업로드 → photo_key 반환
  const upload = useCallback(async (): Promise<string | null> => {
    if (!photoBlob) return null
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
      return json.success ? json.data!.key : null
    } finally {
      setUploading(false)
    }
  }, [photoBlob])

  const reset = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoBlob(null)
    setPhotoPreview(null)
  }, [photoPreview])

  return { cameraRef, albumRef, showPicker, openPicker, closePicker, pickCamera, pickAlbum, photoPreview, uploading, handleFile, removePhoto, upload, reset, hasPhoto: !!photoBlob }
}
