// functions/api/health.ts
import type { Env } from '../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  let dbStatus = 'ok'
  try {
    await env.DB.prepare('SELECT 1').first()
  } catch {
    dbStatus = 'error'
  }

  return Response.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: { database: dbStatus, storage: 'ok' },
    version: '1.0.0',
  })
}
