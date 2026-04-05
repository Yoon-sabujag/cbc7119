import { useState, useCallback, useRef, useEffect } from 'react'
import { compressImage } from '../utils/imageUtils'
import { useAuthStore } from '../stores/authStore'

// ── 다중 사진 업로드 훅 ────────────────────────────────────
const MAX_PHOTOS = 5

export interface PhotoSlot {
  blob: Blob
  preview: string
  uploading: boolean
  key: string | null
  error: string | null
}

async function uploadBlob(blob: Blob, token: string | null): Promise<string> {
  const form = new FormData()
  form.append('file', blob, 'photo.jpg')
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch('/api/uploads', { method: 'POST', body: form, headers })
  const json = await res.json() as { success: boolean; data?: { key: string } }
  if (!json.success || !json.data?.key) throw new Error('업로드 실패')
  return json.data.key
}

export function useMultiPhotoUpload() {
  const [slots, setSlots] = useState<PhotoSlot[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      slots.forEach(s => URL.revokeObjectURL(s.preview))
    }
  }, [])

  const canAdd = slots.length < MAX_PHOTOS

  const pickPhotos = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return

    const newSlots: PhotoSlot[] = []
    for (const file of files) {
      if (newSlots.length >= MAX_PHOTOS) break
      try {
        const blob = await compressImage(file)
        const preview = URL.createObjectURL(blob)
        newSlots.push({ blob, preview, uploading: false, key: null, error: null })
      } catch {
        // skip
      }
    }

    if (newSlots.length > 0) {
      setSlots(prev => [...prev, ...newSlots].slice(0, MAX_PHOTOS))
    }
  }, [])

  const removeSlot = useCallback((idx: number) => {
    setSlots(prev => {
      const slot = prev[idx]
      if (slot) URL.revokeObjectURL(slot.preview)
      return prev.filter((_, i) => i !== idx)
    })
  }, [])

  // Upload all blobs and return R2 keys
  // Takes explicit slot array to avoid ANY closure issues
  const uploadAll = useCallback(async (explicitSlots: PhotoSlot[]): Promise<string[]> => {
    if (explicitSlots.length === 0) return []
    const token = useAuthStore.getState().token
    const keys: string[] = []

    for (let i = 0; i < explicitSlots.length; i++) {
      const slot = explicitSlots[i]
      if (slot.key) {
        keys.push(slot.key)
        continue
      }
      try {
        const key = await uploadBlob(slot.blob, token)
        keys.push(key)
      } catch {
        // skip failed
      }
    }
    return keys
  }, [])

  const reset = useCallback(() => {
    setSlots(prev => {
      prev.forEach(s => URL.revokeObjectURL(s.preview))
      return []
    })
  }, [])

  const isUploading = slots.some(s => s.uploading)
  const hasPhotos = slots.length > 0

  return {
    inputRef,
    slots,
    canAdd,
    hasPhotos,
    pickPhotos,
    handleFiles,
    removeSlot,
    uploadAll,
    reset,
    isUploading,
  }
}
