export function scrollToRoute(hash) {
  let id = ''
  try { id = decodeURIComponent(hash.replace(/^#/, '')) } catch { /* Ignore malformed fragments. */ }
  const target = id ? document.getElementById(id) : null
  const step = /^journey-step-([1-8])$/.exec(id)
  const scene = step && target?.closest('.space-journey')
  if (scene && !window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 650px)').matches) {
    const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0
    const sticky = scene.querySelector('.space-journey__sticky')
    const start = scene.getBoundingClientRect().top + window.scrollY - header
    const distance = Math.max(1, scene.offsetHeight - sticky.offsetHeight)
    window.scrollTo({ top: start + distance * (Number(step[1]) - 1) / 7, behavior: 'instant' })
  } else if (target) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' })
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }
  if (!hash) document.getElementById('main-content')?.focus({ preventScroll: true })
}
