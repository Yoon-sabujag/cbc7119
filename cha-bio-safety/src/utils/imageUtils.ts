/**
 * 브라우저 Canvas API로 이미지 리사이즈 + JPEG 압축
 * @param file    원본 File 객체
 * @param maxPx   장변 최대 픽셀 (기본 1280)
 * @param quality JPEG 품질 0~1 (기본 0.80)
 */
export function compressImage(file: File, maxPx = 1280, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width  * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('압축 실패')),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 로드 실패')) }
    img.src = url
  })
}
