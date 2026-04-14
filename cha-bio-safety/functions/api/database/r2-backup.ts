// GET /api/database/r2-backup — R2 전체를 ZIP으로 다운로드 (서버에서 ZIP 생성)
import type { Env } from '../../_middleware'

// Minimal uncompressed ZIP builder (Store method, no compression)
function buildZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const entries: { name: Uint8Array; data: Uint8Array; offset: number }[] = []
  const parts: Uint8Array[] = []
  let offset = 0

  const enc = new TextEncoder()

  for (const f of files) {
    const nameBytes = enc.encode(f.name)
    const crc = crc32(f.data)

    // Local file header (30 + name + data)
    const local = new Uint8Array(30 + nameBytes.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)  // signature
    lv.setUint16(4, 20, true)           // version needed
    lv.setUint16(6, 0, true)            // flags
    lv.setUint16(8, 0, true)            // compression: store
    lv.setUint16(10, 0, true)           // mod time
    lv.setUint16(12, 0, true)           // mod date
    lv.setUint32(14, crc, true)         // crc32
    lv.setUint32(18, f.data.length, true) // compressed size
    lv.setUint32(22, f.data.length, true) // uncompressed size
    lv.setUint16(26, nameBytes.length, true) // name length
    lv.setUint16(28, 0, true)           // extra length
    local.set(nameBytes, 30)

    entries.push({ name: nameBytes, data: f.data, offset })
    parts.push(local, f.data)
    offset += local.length + f.data.length
  }

  // Central directory
  const centralStart = offset
  for (const e of entries) {
    const cd = new Uint8Array(46 + e.name.length)
    const cv = new DataView(cd.buffer)
    cv.setUint32(0, 0x02014b50, true)   // signature
    cv.setUint16(4, 20, true)            // version made by
    cv.setUint16(6, 20, true)            // version needed
    cv.setUint16(8, 0, true)             // flags
    cv.setUint16(10, 0, true)            // compression
    cv.setUint16(12, 0, true)            // mod time
    cv.setUint16(14, 0, true)            // mod date
    cv.setUint32(16, crc32(e.data), true)
    cv.setUint32(20, e.data.length, true)
    cv.setUint32(24, e.data.length, true)
    cv.setUint16(28, e.name.length, true)
    cv.setUint16(30, 0, true)            // extra length
    cv.setUint16(32, 0, true)            // comment length
    cv.setUint16(34, 0, true)            // disk start
    cv.setUint16(36, 0, true)            // internal attrs
    cv.setUint32(38, 0, true)            // external attrs
    cv.setUint32(42, e.offset, true)     // local header offset
    cd.set(e.name, 46)
    parts.push(cd)
    offset += cd.length
  }

  // End of central directory
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(4, 0, true)              // disk number
  ev.setUint16(6, 0, true)              // disk with CD
  ev.setUint16(8, entries.length, true)  // entries on disk
  ev.setUint16(10, entries.length, true) // total entries
  ev.setUint32(12, offset - centralStart, true) // CD size
  ev.setUint32(16, centralStart, true)   // CD offset
  ev.setUint16(20, 0, true)             // comment length
  parts.push(eocd)

  // Concatenate
  const total = parts.reduce((s, p) => s + p.length, 0)
  const result = new Uint8Array(total)
  let pos = 0
  for (const p of parts) { result.set(p, pos); pos += p.length }
  return result
}

// CRC32 (IEEE)
function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

export const onRequestGet: PagesFunction<Env> = async ({ env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 접근 가능' }, { status: 403 })

  // R2 전체 파일 목록
  const allKeys: string[] = []
  let cursor: string | undefined
  do {
    const listed = await env.STORAGE.list({ cursor, limit: 500 })
    for (const obj of listed.objects) {
      // backups/ 폴더는 제외 (자동 백업 파일)
      if (!obj.key.startsWith('backups/')) allKeys.push(obj.key)
    }
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)

  if (allKeys.length === 0) return Response.json({ success: false, error: 'R2에 파일이 없습니다' }, { status: 404 })

  // 파일 다운로드 + ZIP 생성
  const files: { name: string; data: Uint8Array }[] = []
  for (const key of allKeys) {
    const obj = await env.STORAGE.get(key)
    if (!obj) continue
    const buf = await obj.arrayBuffer()
    files.push({ name: key, data: new Uint8Array(buf) })
  }

  const zip = buildZip(files)
  const date = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)

  return new Response(zip.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="cha-bio-r2_${date}.zip"`,
      'Access-Control-Allow-Origin': '*',
    },
  })
}
