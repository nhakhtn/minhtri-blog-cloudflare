// Menu trên điện thoại: nút ☰ mở/đóng menu chính (CSS trong style.css, mục .js .site-header)
(() => {
  const header = document.querySelector('.site-header')
  const button = header && header.querySelector('.nav-toggle')
  if (!button) return
  const setOpen = (open) => {
    header.classList.toggle('nav-open', open)
    button.setAttribute('aria-expanded', String(open))
    button.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu')
  }
  button.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')))
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false))
  document.addEventListener('click', (e) => !header.contains(e.target) && setOpen(false))
})()

// Video YouTube trong bài: hiện ảnh bìa + nút ▶, bấm mới tải trình phát (trang nhẹ, nhanh).
// Không có JavaScript thì link mở video trên YouTube.
document.addEventListener('click', (e) => {
  const link = e.target.closest && e.target.closest('a[data-yt]')
  if (!link || !/^[\w-]{11}$/.test(link.dataset.yt)) return
  e.preventDefault()
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.youtube-nocookie.com/embed/${link.dataset.yt}?autoplay=1&rel=0`
  iframe.title = link.querySelector('img')?.alt || 'Video YouTube'
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  iframe.allowFullscreen = true
  // Site gửi Referrer-Policy: no-referrer; YouTube cần referrer để phát video nhúng
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'
  link.replaceWith(iframe)
})
