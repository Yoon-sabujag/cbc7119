import { useState, useCallback, useRef, useEffect } from 'react'
import { compressImage } from '../utils/imageUtils'
import { useAuthStore } from '../stores/authStore'

// ── 다중 사진 업로드 훅 ────────────────────────────────────
const MAX_PHOTOS = 5

interface PhotoSlot {
  blob: Blob
  preview: string       // URL.createObjectURL result
  uploading: boolean
  key: string | null    // R2 key after upload
  error: string | null
}

export function useMultiPhotoUpload() {
  const [slots, setSlots] = useState<PhotoSlot[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllers = useRef<AbortController[]>([])
  // Track preview URLs in a ref for safe unmount cleanup
  const previewUrls = useRef<string[]>([])

  // Keep previewUrls ref in sync with slots
  useEffect(() => {
    previewUrls.current = slots.map(s => s.preview)
  }, [slots])

  // Cleanup on unmount: revoke all blob URLs and abort pending uploads
  useEffect(() => {
    return () => {
      previewUrls.current.forEach(url => URL.revokeObjectURL(url))
      abortControllers.current.forEach(ac => ac.abort())
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

    // Limit to remaining slots
    setSlots(prev => {
      const remaining = MAX_PHOTOS - prev.length
      return prev // will update after compression
    })

    const currentSlots = slots.length
    const remaining = MAX_PHOTOS - currentSlots
    const filesToProcess = files.slice(0, remaining)

    const newSlots: PhotoSlot[] = []
    for (const file of filesToProcess) {
      try {
        const blob = await compressImage(file)
        const preview = URL.createObjectURL(blob)
        newSlots.push({ blob, preview, uploading: false, key: null, error: null })
      } catch {
        // skip files that fail compression
      }
    }

    if (newSlots.length > 0) {
      setSlots(prev => [...prev, ...newSlots].slice(0, MAX_PHOTOS))
    }
  }, [slots.length])

  const removeSlot = useCallback((idx: number) => {
    setSlots(prev => {
      const slot = prev[idx]
      if (slot) URL.revokeObjectURL(slot.preview)
      return prev.filter((_, i) => i !== idx)
    })
  }, [])

  const uploadAll = useCallback(async (): Promise<string[]> => {
    const token = useAuthStore.getState().token

    // Collect already-uploaded keys and pending slots
    const alreadyUploaded: string[] = []
    const pendingIndices: number[] = []

    slots.forEach((slot, idx) => {
      if (slot.key) {
        alreadyUploaded.push(slot.key)
      } else {
        pendingIndices.push(idx)
      }
    })

    if (pendingIndices.length === 0) return alreadyUploaded

    // Mark pending slots as uploading
    setSlots(prev => prev.map((s, i) =>
      pendingIndices.includes(i) ? { ...s, uploading: true, error: null } : s
    ))

    // Create abort controllers for this batch
    const controllers = pendingIndices.map(() => new AbortController())
    abortControllers.current = [...abortControllers.current, ...controllers]

    const uploadPromises = pendingIndices.map(async (slotIdx, i) => {
      const slot = slots[slotIdx]
      const form = new FormData()
      form.append('file', slot.blob, 'photo.jpg')
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${token}` },
        signal: controllers[i].signal,
      })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      if (!json.success) throw new Error('업로드 실패')
      return { slotIdx, key: json.data!.key }
    })

    const results = await Promise.allSettled(uploadPromises)

    const newKeys: string[] = []
    setSlots(prev => {
      const next = [...prev]
      results.forEach((result, i) => {
        const slotIdx = pendingIndices[i]
        if (result.status === 'fulfilled') {
          next[slotIdx] = { ...next[slotIdx], uploading: false, key: result.value.key, error: null }
          newKeys.push(result.value.key)
        } else {
          next[slotIdx] = { ...next[slotIdx], uploading: false, error: '업로드 실패' }
        }
      })
      return next
    })

    return [...alreadyUploaded, ...newKeys]
  }, [slots])

  const reset = useCallback(() => {
    slots.forEach(s => URL.revokeObjectURL(s.preview))
    abortControllers.current.forEach(ac => ac.abort())
    abortControllers.current = []
    setSlots([])
  }, [slots])

  const isUploading = slots.some(s => s.uploading)

  return {
    inputRef,
    slots,
    canAdd,
    pickPhotos,
    handleFiles,
    removeSlot,
    uploadAll,
    reset,
    isUploading,
  }
}
