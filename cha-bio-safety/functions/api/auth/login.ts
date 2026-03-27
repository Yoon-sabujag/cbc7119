import type { Env } from '../../_middleware'

// ── JWT 생성 ──────────────────────────────────────────────
async function createJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const enc = new TextEncoder()
  // JSON → Uint8Array → base64url (한국어 포함 모든 문자 처리)
  const header = b64urlBytes(enc.encode(JSON.stringify({ alg:'HS256', typ:'JWT' })))
  const body   = b64urlBytes(enc.encode(JSON.stringify(payload)))
  const key    = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign'])
  const sig    = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`))
  return `${header}.${body}.${b64urlBytes(new Uint8Array(sig))}`
}

function b64urlBytes(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach(b => bin += String.fromCharCode(b))
  return btoa(bin).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
}

// ── 비밀번호 검증 ─────────────────────────────────────────
async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (hash.startsWith('plain:')) return plain === hash.slice(6)
  const [salt, stored] = hash.split(':')
  if (!salt || !stored) return false
  const data   = new TextEncoder().encode(salt + plain)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex    = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
  return hex === stored
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { staffId, password } = await request.json<{ staffId: string; password: string }>()
    if (!staffId?.trim() || !password?.trim())
      return Response.json({ success:false, error:'사번과 비밀번호를 입력하세요' }, { status:400 })

    const staff = await env.DB.prepare(
      'SELECT * FROM staff WHERE id = ? LIMIT 1'
    ).bind(staffId.trim()).first<Record<string,string>>()

    if (!staff)
      return Response.json({ success:false, error:'존재하지 않는 사번입니다' }, { status:401 })

    const valid = await verifyPassword(password, staff.password_hash)
    if (!valid)
      return Response.json({ success:false, error:'비밀번호가 올바르지 않습니다' }, { status:401 })

    const now   = Math.floor(Date.now() / 1000)
    const token = await createJWT({
      sub:   staff.id,
      name:  staff.name,
      role:  staff.role,
      title: staff.title,
      iat:   now,
      exp:   now + 60 * 60 * 12,
    }, env.JWT_SECRET)

    return Response.json({
      success: true,
      data: {
        token,
        staff: {
          id:        staff.id,
          name:      staff.name,
          role:      staff.role,
          title:     staff.title,
          shiftType: staff.shift_type ?? null,
        },
      },
    })
  } catch (e) {
    console.error('login error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
}
