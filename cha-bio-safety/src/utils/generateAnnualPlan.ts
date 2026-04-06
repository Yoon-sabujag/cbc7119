// 연간 업무 추진 계획 엑셀 생성
// 양식 파일에서 연도만 치환: drawing1.xml 텍스트박스 + sheet2.xml C6 셀

export async function generateAnnualPlan(returnBlob?: boolean): Promise<Blob | void> {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')

  const nextYear = new Date().getFullYear() + 1

  // 1) 템플릿 fetch
  const res = await fetch('/templates/annual_plan_template.xlsx')
  const buf = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(buf))

  // 2) 파일 패치
  const newFiles: Record<string, Uint8Array> = {}
  for (const [key, data] of Object.entries(files)) {
    if (key === 'xl/drawings/drawing1.xml') {
      // 표지 텍스트박스: <a:t>2026</a:t> → <a:t>nextYear</a:t>
      let xml = strFromU8(data as Uint8Array)
      xml = xml.replace(/<a:t>2026<\/a:t>/, `<a:t>${nextYear}</a:t>`)
      newFiles[key] = strToU8(xml)
    } else if (key === 'xl/worksheets/sheet2.xml') {
      // 두번째 시트 C6 셀: <v>2026</v> → <v>nextYear</v>
      let xml = strFromU8(data as Uint8Array)
      xml = xml.replace(/(<c r="C6"[^>]*>)<v>2026<\/v>/, `$1<v>${nextYear}</v>`)
      newFiles[key] = strToU8(xml)
    } else {
      newFiles[key] = data as Uint8Array
    }
  }

  // 3) 재조립
  const zipped = zipSync(newFiles, { level: 6 })
  const blob = new Blob([zipped.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  if (returnBlob) return blob

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nextYear}년 연간 업무 추진 계획.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
