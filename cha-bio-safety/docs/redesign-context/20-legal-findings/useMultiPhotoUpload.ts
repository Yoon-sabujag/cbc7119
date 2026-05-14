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
  const slotsRef = useRef<PhotoSlot[]>([])
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef  = useRef<HTMLInputElement>(null)
  const [showPicker, setShowPicker] = useState(false)
  // Mutex: serialize handleFiles calls to prevent race conditions
  const processingRef = useRef<Promise<void>>(Promise.resolve())

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      slotsRef.current.forEach(s => URL.revokeObjectURL(s.preview))
    }
  }, [])

  const canAdd = slots.length < MAX_PHOTOS

  const openPicker  = useCallback(() => setShowPicker(true), [])
  const closePicker = useCallback(() => setShowPicker(false), [])
  const pickCamera  = useCallback(() => cameraRef.current?.click(), [])
  const pickAlbum   = useCallback(() => albumRef.current?.click(), [])

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return

    // Chain onto previous handleFiles to serialize
    processingRef.current = processingRef.current.then(async () => {
      const remaining = MAX_PHOTOS - slotsRef.current.length
      if (remaining <= 0) return

      const newSlots: PhotoSlot[] = []
      for (const file of files.slice(0, remaining)) {
        try {
          const blob = await compressImage(file)
          const preview = URL.createObjectURL(blob)
          newSlots.push({ blob, preview, uploading: false, key: null, error: null })
        } catch {
          // skip
        }
      }

      if (newSlots.length > 0) {
        const merged = [...slotsRef.current, ...newSlots].slice(0, MAX_PHOTOS)
        slotsRef.current = merged
        setSlots(merged)
      }
    })
  }, [])

  const removeSlot = useCallback((idx: number) => {
    const slot = slotsRef.current[idx]
    if (slot) URL.revokeObjectURL(slot.preview)
    const next = slotsRef.current.filter((_, i) => i !== idx)
    slotsRef.current = next
    setSlots(next)
  }, [])

  const uploadAll = useCallback(async (): Promise<string[]> => {
    // Wait for any pending handleFiles to finish
    await processingRef.current
    const current = slotsRef.current
    if (current.length === 0) return []
    const token = useAuthStore.getState().token
    const keys: string[] = []

    for (let i = 0; i < current.length; i++) {
      const slot = current[i]
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
    slotsRef.current.forEach(s => URL.revokeObjectURL(s.preview))
    slotsRef.current = []
    setSlots([])
  }, [])

  const isUploading = slots.some(s => s.uploading)
  const hasPhotos = slots.length > 0

  return {
    cameraRef,
    albumRef,
    showPicker,
    openPicker,
    closePicker,
    pickCamera,
    pickAlbum,
    slots,
    canAdd,
    hasPhotos,
    handleFiles,
    removeSlot,
    uploadAll,
    reset,
    isUploading,
  }
}
