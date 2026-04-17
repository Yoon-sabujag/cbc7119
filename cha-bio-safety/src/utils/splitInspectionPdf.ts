// PDF에서 특정 페이지 1개를 추출해 새 PDF Blob으로 반환
import { PDFDocument } from 'pdf-lib'

export async function extractSinglePagePdf(file: File, pageNumber: number): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()
  const src = await PDFDocument.load(arrayBuffer)
  const dst = await PDFDocument.create()
  const [copied] = await dst.copyPages(src, [pageNumber - 1]) // pdf-lib는 0-기반
  dst.addPage(copied)
  const bytes = await dst.save()
  return new Blob([bytes as BlobPart], { type: 'application/pdf' })
}
