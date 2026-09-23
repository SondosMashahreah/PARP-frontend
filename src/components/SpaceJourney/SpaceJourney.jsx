import { useEffect, useRef } from 'react'
import './SpaceJourney.css'

const STAGES = [
  {
    eyebrow: 'المحطة 01',
    title: 'ابدأ بالسؤال',
    body: 'كل بحث إجرائي يبدأ من ملاحظة حقيقية في الميدان. مرّر بهدوء، ودع الفكرة تقودك إلى المرحلة التالية.',
  },
  {
    eyebrow: 'المحطة 02',
    title: 'حوّل التجربة إلى دليل',
    body: 'وثّق ما جرّبته، ما تغيّر، وما الذي تعلّمته. هنا تصبح التفاصيل الصغيرة معرفة يمكن الرجوع إليها.',
  },
  {
    eyebrow: 'المحطة 03',
    title: 'اربط النتائج بالآخرين',
    body: 'اكتشف تجارب باحثين وممارسين آخرين، وقارن المسارات بدل أن تبدأ كل مرة من الصفر.',
  },
  {
    eyebrow: 'PARP',
    title: 'المعرفة رحلة مشتركة',
    body: 'منصة فلسطينية للبحوث الإجرائية؛ مساحة تجمع السؤال، التجربة، والنتيجة في مسار واحد قابل للاستكشاف.',
  },
]

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function createStars(count) {
  let seed = 1729
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  return Array.from({ length: count }, () => ({
    x: random() - 0.5,
    y: random() - 0.5,
    z: random(),
    radius: 0.45 + random() * 1.4,
  }))
}

function SpaceJourney() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const stageRefs = useRef([])
  const orbRefs = useRef([])
  const dotRefs = useRef([])
  const cueRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    const stars = createStars(220)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let width = 0
    let height = 0
    let currentProgress = 0
    let targetProgress = 0
    let scrollVelocity = 0
    let lastScrollY = window.scrollY

    const getHeaderHeight = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue('--header-height')
      return Number.parseFloat(value) || 0
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const getScrollProgress = () => {
      const headerHeight = getHeaderHeight()
      const rootTop = root.getBoundingClientRect().top + window.scrollY
      const start = rootTop - headerHeight
      const end = rootTop + root.offsetHeight - window.innerHeight
      const distance = Math.max(1, end - start)
      return clamp((window.scrollY - start) / distance)
    }

    const drawStars = (progress, velocity = 0) => {
      context.clearRect(0, 0, width, height)
      const centerX = width * 0.48
      const centerY = height * 0.5
      const travel = progress * 5.2
      const warp = clamp(Math.abs(velocity) * 2.8, 0, 1)

      stars.forEach((star) => {
        const depth = ((star.z - travel) % 1 + 1) % 1
        const perspective = 0.16 + depth * 0.92
        const scale = 1 / perspective
        const x = centerX + star.x * width * 0.72 * scale
        const y = centerY + star.y * height * 0.72 * scale

        if (x < -30 || x > width + 30 || y < -30 || y > height + 30) return

        const alpha = clamp((1 - depth) * 0.9 + 0.08)
        const radius = star.radius * (0.6 + (1 - depth) * 1.25)

        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 255, 255, ${alpha})`
        context.fill()

        const streakSeed = Math.abs(
          Math.sin(star.x * 91.7 + star.y * 57.3 + star.z * 37.1),
        )

        if (warp > 0.18 && streakSeed > 0.98) {
          const deltaX = x - centerX
          const deltaY = y - centerY
          const distance = Math.max(1, Math.hypot(deltaX, deltaY))
          const streakLength = warp * (2.5 + (1 - depth) * 6)
          const previousX = x - (deltaX / distance) * streakLength
          const previousY = y - (deltaY / distance) * streakLength

          context.beginPath()
          context.moveTo(previousX, previousY)
          context.lineTo(x, y)
          context.strokeStyle = `rgba(190, 164, 235, ${alpha * 0.28 * warp})`
          context.lineWidth = Math.max(0.35, radius * 0.32)
          context.lineCap = 'round'
          context.stroke()
        }
      })
    }

    const updateScene = (progress) => {
      root.style.setProperty('--journey-progress', progress.toFixed(4))
      root.style.setProperty('--journey-angle', `${(progress * 42).toFixed(2)}deg`)
      root.style.setProperty('--journey-orbit-scale', (0.88 + progress * 0.16).toFixed(4))
      root.style.setProperty('--journey-nebula-one-x', `${(-progress * 7).toFixed(2)}vw`)
      root.style.setProperty('--journey-nebula-two-x', `${(progress * 8).toFixed(2)}vw`)
      root.style.setProperty('--journey-nebula-two-y', `${(progress * 5).toFixed(2)}vh`)
      const lastIndex = STAGES.length - 1
      const activeIndex = Math.round(progress * lastIndex)

      stageRefs.current.forEach((stage, index) => {
        if (!stage) return
        const point = index / lastIndex
        const delta = point - progress
        const visibility = clamp(1 - Math.abs(delta) * 4.1)
        const offset = delta * 260
        const scale = 0.92 + visibility * 0.08
        stage.style.opacity = visibility.toFixed(3)
        stage.style.transform = `translate3d(0, calc(-50% + ${offset}px), 0) scale(${scale})`
        stage.style.pointerEvents = visibility > 0.72 ? 'auto' : 'none'
      })

      orbRefs.current.forEach((orb, index) => {
        if (!orb) return
        const point = index / lastIndex
        const delta = point - progress
        const proximity = clamp(1 - Math.abs(delta) * 2.15)
        const x = delta * 112 - 20 + index * 1.8
        const y = Math.sin((progress - point) * Math.PI) * 21 + (index % 2 === 0 ? 5 : -7)
        const scale = 0.38 + proximity * 0.76
        const opacity = 0.06 + proximity * 0.94
        const blur = (1 - proximity) * 8
        const rotate = (progress - point) * 34

        orb.style.opacity = opacity.toFixed(3)
        orb.style.filter = `blur(${blur.toFixed(2)}px)`
        orb.style.transform = `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, 0) scale(${scale}) rotate(${rotate}deg)`
      })

      dotRefs.current.forEach((dot, index) => {
        if (!dot) return
        dot.classList.toggle('is-active', index === activeIndex)
      })

      if (cueRef.current) {
        cueRef.current.style.opacity = clamp(1 - progress * 8).toFixed(3)
      }
    }

    const handleScroll = () => {
      const nextScrollY = window.scrollY
      scrollVelocity = clamp((nextScrollY - lastScrollY) / 120, -1, 1)
      lastScrollY = nextScrollY
      targetProgress = getScrollProgress()
    }

    const render = () => {
      currentProgress += (targetProgress - currentProgress) * 0.085
      scrollVelocity *= 0.88
      updateScene(currentProgress)
      drawStars(currentProgress, scrollVelocity)
      frameId = window.requestAnimationFrame(render)
    }

    const handleResize = () => {
      resizeCanvas()
      targetProgress = getScrollProgress()
      currentProgress = targetProgress
      updateScene(currentProgress)
      drawStars(currentProgress)
    }

    resizeCanvas()
    targetProgress = getScrollProgress()
    currentProgress = targetProgress

    if (reduceMotion.matches) {
      drawStars(currentProgress)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }

    updateScene(currentProgress)
    drawStars(currentProgress)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    frameId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <section className="space-journey" ref={rootRef} aria-labelledby="journey-title">
      <div className="space-journey__sticky">
        <canvas className="space-journey__stars" ref={canvasRef} aria-hidden="true" />
        <div className="space-journey__nebula space-journey__nebula--one" aria-hidden="true" />
        <div className="space-journey__nebula space-journey__nebula--two" aria-hidden="true" />
        <div className="space-journey__orbit" aria-hidden="true" />

        <div className="space-journey__objects" aria-hidden="true">
          <div className="space-journey__orb space-journey__orb--origin" ref={(node) => { orbRefs.current[0] = node }} />
          <div className="space-journey__orb space-journey__orb--research" ref={(node) => { orbRefs.current[1] = node }} />
          <div className="space-journey__orb space-journey__orb--network" ref={(node) => { orbRefs.current[2] = node }} />
          <div className="space-journey__orb space-journey__orb--core" ref={(node) => { orbRefs.current[3] = node }} />
        </div>

        <div className="space-journey__stages">
          {STAGES.map((stage, index) => (
            <article
              className="space-journey__stage"
              key={stage.eyebrow}
              ref={(node) => { stageRefs.current[index] = node }}
            >
              <span className="space-journey__eyebrow">{stage.eyebrow}</span>
              {index === 0 ? (
                <h1 id="journey-title">{stage.title}</h1>
              ) : (
                <h2>{stage.title}</h2>
              )}
              <p>{stage.body}</p>
            </article>
          ))}
        </div>

        <div className="space-journey__progress" aria-hidden="true">
          <span className="space-journey__progress-line">
            <span className="space-journey__progress-fill" />
          </span>
          <span className="space-journey__progress-dots">
            {STAGES.map((stage, index) => (
              <span
                className={`space-journey__dot${index === 0 ? ' is-active' : ''}`}
                key={stage.eyebrow}
                ref={(node) => { dotRefs.current[index] = node }}
              />
            ))}
          </span>
        </div>

        <div className="space-journey__cue" ref={cueRef} aria-hidden="true">
          <span>مرّر للاستكشاف</span>
          <span className="space-journey__mouse"><span /></span>
        </div>
      </div>
    </section>
  )
}

export default SpaceJourney
