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
