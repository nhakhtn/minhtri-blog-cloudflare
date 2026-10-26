// Kiểm tra một bài viết sau khi đăng: ảnh, link nội bộ, trang chủ, sitemap, dữ liệu cho Google.
//   npm run post:check -- <slug>                          (site thật, theo SITE_URL trong wrangler.jsonc)
//   npm run post:check -- <slug> http://localhost:8787    (wrangler dev)
import { readFileSync } from 'node:fs'

const [slug, baseArg] = process.argv.slice(2)
if (!slug) {
  console.error('Usage: npm run post:check -- <slug> [địa chỉ site]')
  process.exit(1)
}
const configured = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8').match(/"SITE_URL":\s*"([^"]*)"/)?.[1]
const B = (baseArg || configured || 'http://localhost:8787').replace(/\/+$/, '')
const abs = (u) => (u.startsWith('http') ? u : B + u)

// Mạng chập chờn: thử lại một lần; vẫn lỗi thì trả về status 0 thay vì dừng cả script
async function get(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(20000) })
    } catch (err) {
      if (attempt >= 2) return { status: 0, text: async () => '', error: err.cause?.code || err.name }
    }
  }
}

let problems = 0
const ok = (label, cond, extra = '') => {
  if (!cond) problems++
  console.log(`${cond ? '✔' : '✘'} ${label}${extra ? ` — ${extra}` : ''}`)
}

const res = await get(`${B}/bai-viet/${slug}`)
const html = await res.text()
ok('Bài mở được', res.status === 200, `${B}/bai-viet/${slug} → ${res.status}`)
console.log(`  Tiêu đề: ${html.match(/<title>([^<]+)/)?.[1]}`)
console.log(`  Mục lớn (h2): ${(html.match(/<h2[^>]*>/g) || []).length}, ảnh minh hoạ: ${(html.match(/<figure/g) || []).length}`)

const images = [...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]))]
const badImages = []
for (const u of images) if ((await get(abs(u))).status !== 200) badImages.push(u)
ok(`Ảnh tải được (${images.length - badImages.length}/${images.length})`, !badImages.length, badImages.join(', '))

const links = [...new Set([...html.matchAll(/href="(\/bai-viet\/[^"#]+)"/g)].map((m) => m[1]))]
const badLinks = []
for (const l of links) if ((await get(B + l)).status !== 200) badLinks.push(l)
ok(`Link nội bộ (${links.length - badLinks.length}/${links.length})`, !badLinks.length, badLinks.join(', '))

ok('Có dữ liệu Article cho Google', html.includes('"@type":"Article"'))
ok('Có ảnh chia sẻ (og:image)', /property="og:image"/.test(html), html.match(/og:image" content="([^"]+)/)?.[1])
ok('Có trên trang chủ', (await (await get(`${B}/`)).text()).includes(`/bai-viet/${slug}`))
ok('Có trong sitemap', (await (await get(`${B}/sitemap.xml`)).text()).includes(`/bai-viet/${slug}<`))

process.exit(problems ? 1 : 0)
