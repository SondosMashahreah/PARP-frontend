import { useEffect, useRef } from 'react'
import { journeySteps } from './journeySteps.js'
import ResearchArtifact from './ResearchArtifact.jsx'
import './SpaceJourney.css'
import './JourneyFocus.css'

const STATIC_QUERY = '(prefers-reduced-motion: reduce), (max-height: 650px)'
const clamp = (value) => Math.min(1, Math.max(0, value))
const number = (value) => String(value).padStart(2, '0')

function sceneRange(root) {
  const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0
  const sticky = root.querySelector('.space-journey__sticky')
  return {
    start: root.getBoundingClientRect().top + window.scrollY - header,
    distance: Math.max(1, root.offsetHeight - sticky.offsetHeight),
  }
}

function createStars(count) {
  let seed = 1729
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  return Array.from({ length: count }, () => ({
    x: random() - 0.5, y: random() - 0.5, z: random(), radius: 0.4 + random(),
  }))
}

export default function SpaceJourney() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const stageRefs = useRef([])
  const artifactRefs = useRef([])

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined
    const context = canvas.getContext('2d')
    const staticMode = window.matchMedia(STATIC_QUERY)
    const stars = createStars(150)
    let frame = 0
    let previousTime = 0
    let current = 0
    let target = 0
    let visible = true
    let width = 1
    let height = 1

    const progress = () => {
      const range = sceneRange(root)
      return clamp((window.scrollY - range.start) / range.distance)
    }
    const drawStars = (value) => {
      if (!context) return
      context.clearRect(0, 0, width, height)
      const travel = value * (journeySteps.length - 1)
      const centerX = width * (0.4 + Math.sin(travel * 0.75) * 0.06)
      const centerY = height * (0.48 + Math.cos(travel * 0.6) * 0.035)
      const speed = clamp(Math.abs(target - current) * 70)
      for (const star of stars) {
        const depth = ((star.z - travel * 0.62) % 1 + 1) % 1
        const scale = 1 / (0.16 + depth * 1.1)
        const x = centerX + star.x * width * 0.75 * scale
        const y = centerY + star.y * height * 0.75 * scale
        if (x < 0 || x > width || y < 0 || y > height) continue
        const fade = clamp(depth / 0.06) * clamp((1 - depth) / 0.15)
        const alpha = (0.15 + (1 - depth) * 0.65) * fade
        context.beginPath()
        context.arc(x, y, star.radius * (0.55 + (1 - depth) * 1.4), 0, Math.PI * 2)
        context.fillStyle = `rgba(223,211,249,${alpha})`
        context.fill()
        if (speed > 0.08) {
          const dx = x - centerX
          const dy = y - centerY
          const distance = Math.max(1, Math.hypot(dx, dy))
          const tail = speed * (1 - depth) * 12
          const direction = target >= current ? 1 : -1
          context.beginPath()
          context.moveTo(x, y)
          context.lineTo(x - dx / distance * tail * direction, y - dy / distance * tail * direction)
          context.strokeStyle = `rgba(205,180,247,${alpha * speed * 0.4})`
          context.lineWidth = 0.7
          context.stroke()
        }
      }
    }
    const updateScene = (value) => {
      const position = value * (journeySteps.length - 1)
      const active = Math.round(position)
      root.style.setProperty('--journey-progress', value.toFixed(5))
      root.style.setProperty('--journey-angle', `${position * 15}deg`)
      root.style.setProperty('--journey-orbit-scale', String(0.9 + Math.sin(position * 0.7) * 0.12))
      root.style.setProperty('--journey-nebula-one-x', `${-position * 2.4}vw`)
      root.style.setProperty('--journey-nebula-two-x', `${position * 1.7}vw`)
      root.style.setProperty('--journey-nebula-two-y', `${Math.sin(position * 0.65) * 9}vh`)
      stageRefs.current.forEach((stage, index) => {
        if (!stage) return
        stage.classList.toggle('is-current', index === active)
        stage.setAttribute('aria-hidden', String(index !== active))
        stage.inert = index !== active
      })
      artifactRefs.current.forEach((artifact, index) => {
        if (!artifact) return
        const delta = index - position
        // Research objects approach, grow, then pass the camera as we move on.
        const scale = 1 / (1 + Math.max(-0.65, delta * 0.8))
        const arrival = clamp((2 - delta) / 1.6)
        const departure = clamp((delta + 1.2) / 0.8)
        const isActive = index === active
        const opacity = arrival * departure * (isActive ? 0.96 : 0.24)
        const blur = isActive ? 0 : 7 + Math.min(5, Math.abs(delta) * 3)
        const x = delta * 58 + Math.sin(index * 1.3) * 5
        const y = Math.sin(delta * 1.15) * 23 + Math.sin(index * 1.7) * 4
        artifact.style.visibility = opacity > 0 ? 'visible' : 'hidden'
        artifact.style.opacity = String(opacity)
        artifact.style.filter = `blur(${blur}px)`
        artifact.style.zIndex = String(journeySteps.length - index)
        artifact.style.transform = `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, 0) scale(${scale}) rotate(${delta * 24}deg)`
      })
      drawStars(value)
    }
    const render = (time) => {
      frame = 0
      const elapsed = previousTime ? Math.min(64, time - previousTime) : 16
      previousTime = time
      current += (target - current) * (1 - Math.exp(-elapsed / 180))
      const moving = Math.abs(target - current) > 0.00005
      if (!moving) current = target
      updateScene(current)
      if (moving) schedule()
    }
    function schedule() {
      if (!frame && visible && !staticMode.matches && !document.hidden) {
        frame = window.requestAnimationFrame(render)
      }
    }
    const handleScroll = () => {
      target = progress()
      schedule()
    }
    const syncLayout = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context?.setTransform(ratio, 0, 0, ratio, 0, 0)
      if (staticMode.matches) {
        stageRefs.current.forEach((stage) => {
          if (!stage) return
          stage.removeAttribute('style')
          stage.removeAttribute('aria-hidden')
          stage.inert = false
        })
        drawStars(0)
      } else {
        current = target = progress()
        updateScene(current)
      }
    }
    const handleVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame)
        frame = 0
      } else {
        previousTime = 0
        handleScroll()
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        previousTime = 0
        handleScroll()
      } else {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    })
    syncLayout()
    observer.observe(root)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', syncLayout)
    document.addEventListener('visibilitychange', handleVisibility)
    staticMode.addEventListener('change', syncLayout)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', syncLayout)
      document.removeEventListener('visibilitychange', handleVisibility)
      staticMode.removeEventListener('change', syncLayout)
    }
  }, [])

  return (
    <section className="space-journey" ref={rootRef} dir="rtl" aria-labelledby="journey-title">
      <div className="space-journey__sticky">
        <canvas className="space-journey__stars" ref={canvasRef} aria-hidden="true" />
        <div className="space-journey__nebula space-journey__nebula--one" aria-hidden="true" />
        <div className="space-journey__nebula space-journey__nebula--two" aria-hidden="true" />
        <div className="space-journey__orbit" aria-hidden="true" />
        <header className="space-journey__heading">
          <div>
            <span>PARP · رحلة الباحث</span>
            <h2 id="journey-title">من بداية التعلّم إلى مشاركة الأثر</h2>
          </div>
          <p>ثماني خطوات · مرّر لاستكمال الرحلة</p>
        </header>
        <div className="space-journey__objects" aria-hidden="true">
          {journeySteps.map((step, index) => (
            <div
              key={step.id}
              className="space-journey__artifact"
              ref={(node) => { artifactRefs.current[index] = node }}
            >
              <ResearchArtifact step={step.id} />
            </div>
          ))}
        </div>
        <div className="space-journey__stages">
          {journeySteps.map((step, index) => (
            <article
              className={`space-journey__stage${index === 0 ? ' is-current' : ''}`}
              id={`journey-step-${step.id}`}
              key={step.id}
              ref={(node) => { stageRefs.current[index] = node }}
            >
              <span className="space-journey__eyebrow">الخطوة {number(step.id)} / 08</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <dl className="space-journey__facts">
                <div><dt>من يشارك؟</dt><dd>{step.actor}</dd></div>
                <div><dt>الناتج المتوقع</dt><dd>{step.outcome}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="space-journey__reading-progress" aria-hidden="true">
          <span className="space-journey__reading-progress-fill" />
        </div>
      </div>
    </section>
  )
}
