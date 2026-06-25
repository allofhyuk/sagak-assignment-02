import type { VercelRequest, VercelResponse } from '@vercel/node'

// /candiy/* 요청을 rewrite로 받아 api.candiy.io로 프록시
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path ?? '')
  const target = `https://api.candiy.io/${path}`

  const upstream = await fetch(target, {
    method: req.method,
    headers: {
      'content-type': 'application/json',
      'x-api-key': (req.headers['x-api-key'] as string) ?? '',
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body ?? {}),
  })

  const body = await upstream.text()
  res.status(upstream.status)
  res.setHeader('content-type', upstream.headers.get('content-type') ?? 'application/json')
  res.send(body)
}
