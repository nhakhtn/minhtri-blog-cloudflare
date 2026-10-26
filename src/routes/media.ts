import { Hono } from 'hono'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Phục vụ ảnh từ R2: /media/<key>
app.get('/*', async (c) => {
  let key: string
  try {
    key = decodeURIComponent(new URL(c.req.url).pathname.replace(/^\/media\//, ''))
  } catch {
    // Link hỏng (mã hoá % sai): báo không tìm thấy thay vì lỗi 500
    return c.notFound()
  }
  if (!key) return c.notFound()

  const object = await c.env.MEDIA.get(key, {
    onlyIf: c.req.raw.headers,
    range: c.req.raw.headers,
  })
  if (!object) return c.notFound()

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  if (!('body' in object)) {
    return new Response(null, { status: 304, headers })
  }
  return new Response(object.body, { headers })
})

export default app
