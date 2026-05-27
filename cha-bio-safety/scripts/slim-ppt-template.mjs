// 양식 PPTX 슬림화 — slide1(표지) + slide2(본문 단위) 만 유지
// 사용: node scripts/slim-ppt-template.mjs
// 출력: /tmp/template-slim.pptx → 이후 wrangler r2 로 R2 업로드
//
// submission-ppt 트랙 W7

import JSZip from 'jszip'
import fs from 'fs'

const SRC = '/Users/jykevin/Documents/20260328/작업용/2025년소방점검 지적사항 조치사진.pptx'
const OUT = '/tmp/template-slim.pptx'

const buf = fs.readFileSync(SRC)
const zip = await JSZip.loadAsync(buf)

// 1. 삭제 대상: slide3~8 + 각 rels + notesSlide2~ (있을 경우) + image5~26
const remove = []
for (let i = 3; i <= 8; i++) {
  remove.push(`ppt/slides/slide${i}.xml`)
  remove.push(`ppt/slides/_rels/slide${i}.xml.rels`)
}
for (let i = 2; i <= 8; i++) {
  remove.push(`ppt/notesSlides/notesSlide${i}.xml`)
  remove.push(`ppt/notesSlides/_rels/notesSlide${i}.xml.rels`)
}
for (let i = 5; i <= 26; i++) {
  remove.push(`ppt/media/image${i}.jpeg`)
}
for (const p of remove) zip.remove(p)

// 2. presentation.xml: sldIdLst 에서 slide3~8 (rId4~rId9) 제거
{
  let s = await zip.file('ppt/presentation.xml').async('string')
  // <p:sldId id="..." r:id="rId4"/> ... rId9 까지 제거
  s = s.replace(/<p:sldId\s+[^/]*r:id="rId([4-9])"\s*\/>/g, '')
  zip.file('ppt/presentation.xml', s)
}

// 3. presentation.xml.rels: rId4~rId9 entry 제거
{
  let s = await zip.file('ppt/_rels/presentation.xml.rels').async('string')
  s = s.replace(/<Relationship\s+Id="rId([4-9])"[^/]*Target="slides\/slide([3-8])\.xml"[^/]*\/>/g, '')
  zip.file('ppt/_rels/presentation.xml.rels', s)
}

// 4. [Content_Types].xml: slide3~8 Override + image5~26 + notesSlide2~ 제거
{
  let s = await zip.file('[Content_Types].xml').async('string')
  s = s.replace(/<Override\s+PartName="\/ppt\/slides\/slide([3-8])\.xml"[^/]*\/>/g, '')
  s = s.replace(/<Override\s+PartName="\/ppt\/notesSlides\/notesSlide([2-8])\.xml"[^/]*\/>/g, '')
  // image5~26
  s = s.replace(/<Override\s+PartName="\/ppt\/media\/image(\d+)\.jpeg"[^/]*\/>/g, (m, n) => {
    const num = parseInt(n, 10)
    return num >= 5 && num <= 26 ? '' : m
  })
  // Default for jpeg/jpg 등은 image1-4 가 여전히 있으므로 유지
  zip.file('[Content_Types].xml', s)
}

// 5. 출력
const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
fs.writeFileSync(OUT, out)

// 검증 로그
const verify = await JSZip.loadAsync(out)
const remaining = Object.keys(verify.files).filter(p => p.startsWith('ppt/slides/') || p.startsWith('ppt/media/'))
console.log('출력:', OUT, `${out.length} bytes`)
console.log('남은 ppt/slides + ppt/media:')
for (const p of remaining) console.log('  ', p)
