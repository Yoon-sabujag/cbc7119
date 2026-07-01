export interface Env {
  DB: D1Database
  STORAGE: R2Bucket
  JWT_SECRET: string
  ENVIRONMENT: string
  VAPID_PUBLIC_KEY?: string
  VAPID_PRIVATE_KEY?: string
  AGENT_KEY?: string
}

interface JWTPayload { sub:string; name:string; role:string; title:string; iat:number; exp:number }

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [h, p, s] = token.split('.')
    if (!h||!p||!s) return null
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['verify'])
    const sigBuf = Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0))
    if (!await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(`${h}.${p}`))) return null
    const payload = JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))) as JWTPayload
    if (payload.exp < Date.now()/1000) return null
    return payload
  } catch { return null }
}

const PUBLIC = ['/api/auth/login', '/api/health', '/api/holidays/sync', '/api/push/vapid-public-key',
  // 화재수신반 에이전트 인입 (JWT 예외 — 각 핸들러가 X-Agent-Key 로 보호). active/events/ack/status/maint 는 JWT 유지.
  '/api/panel/frame', '/api/alarm/trigger', '/api/alarm/clear', '/api/alarm/heartbeat', '/api/alarm/renotify']
const PUBLIC_PREFIX = ['/api/uploads/', '/api/public/', '/api/holidays', '/api/_telemetry/']

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env, next } = ctx
  const url = new URL(request.url)

  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Agent-Key,X-Frame-Key,X-Frame-Ts',
  }

  if (request.method === 'OPTIONS')
    return new Response(null, { status:204, headers:cors })

  if (!url.pathname.startsWith('/api/') || PUBLIC.includes(url.pathname) || PUBLIC_PREFIX.some(p => url.pathname.startsWith(p))) {
    const res = await next()
    Object.entries(cors).forEach(([k,v]) => res.headers.set(k,v))
    return res
  }

  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer '))
    return Response.json({ success:false, error:'인증이 필요합니다' }, { status:401, headers:cors })

  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET)
  if (!payload)
    return Response.json({ success:false, error:'유효하지 않은 토큰' }, { status:401, headers:cors })

  ;(ctx as any).data = { staffId:payload.sub, staffName:payload.name, role:payload.role }

  const res = await next()
  Object.entries(cors).forEach(([k,v]) => res.headers.set(k,v))
  return res
}
