/**
 * useMarioScroller.ts
 *
 * Encapsulates all the Mario horizontal-scroll mechanics:
 *   - Parallax background movement
 *   - Mario idle ↔ running animation on scroll
 *   - Mario disappears + stage-clear SFX at the end
 *   - Coin SFX when a middle section is fully in view
 *   - Wheel, touch, and keyboard scroll listeners
 *   - Mute / unmute applied to all audio refs
 *
 * Usage:
 *   const { scrollRef, bodyRef, hillsRef, floorRef, characterImgRef,
 *           bgSoundRef, coinSoundRef, clearSoundRef,
 *           isMuted, setIsMuted } = useMarioScroller()
 */

import { useEffect, useRef, useState } from 'react'
import marioIdle from '@/assets/about/mario.png'
import marioRunning from '@/assets/about/mariorunning.gif'

export function useMarioScroller() {
  // ── DOM refs passed to JSX elements ───────────────────────────────────────
  const scrollRef       = useRef<HTMLDivElement | null>(null)  // horizontal scroll container
  const bodyRef         = useRef<HTMLDivElement | null>(null)  // outermost div (bg parallax)
  const hillsRef        = useRef<HTMLDivElement | null>(null)  // mid-ground hills layer
  const floorRef        = useRef<HTMLDivElement | null>(null)  // floor layer
  const characterImgRef = useRef<HTMLImageElement | null>(null) // Mario sprite

  // ── Audio refs ─────────────────────────────────────────────────────────────
  const bgSoundRef    = useRef<HTMLAudioElement | null>(null)  // looping BGM
  const coinSoundRef  = useRef<HTMLAudioElement | null>(null)  // coin ding per section
  const clearSoundRef = useRef<HTMLAudioElement | null>(null)  // stage-clear at the end

  // ── Mute state (starts muted — browser autoplay policy) ───────────────────
  const [isMuted, setIsMuted] = useState(true)

  // ── Internal scroll-state tracking ────────────────────────────────────────
  const scrollTimeoutRef = useRef<number | null>(null)
  const isScrollingRef   = useRef(false)

  // ── Parallax: shift each layer at a different speed ───────────────────────
  function updateBackgrounds() {
    const scrollX = scrollRef.current?.scrollLeft || 0
    if (bodyRef.current)  bodyRef.current.style.backgroundPositionX  = `${-scrollX / 2}px`
    if (hillsRef.current) hillsRef.current.style.backgroundPositionX = `${-scrollX / 3}px`
    if (floorRef.current) floorRef.current.style.backgroundPositionX = `${-scrollX / 4}px`
  }

  // ── Mario animation + end-of-scroll detection ─────────────────────────────
  function handleScroll() {
    // Switch to running sprite while scrolling, back to idle after 150 ms of stillness
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
    if (!isScrollingRef.current) {
      isScrollingRef.current = true
      if (characterImgRef.current) characterImgRef.current.src = marioRunning
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false
      if (characterImgRef.current) characterImgRef.current.src = marioIdle
    }, 150)

    const el = scrollRef.current
    if (!el) return
    const maxScrollLeft = el.scrollWidth - el.clientWidth

    if (el.scrollLeft >= maxScrollLeft) {
      // Reached the castle — hide Mario, stop BGM, play stage-clear
      if (characterImgRef.current) characterImgRef.current.style.display = 'none'
      if (bgSoundRef.current) bgSoundRef.current.pause()
      if (clearSoundRef.current) void clearSoundRef.current.play().catch(() => {})
    } else {
      // Mid-scroll — show Mario, resume BGM if unmuted, reset stage-clear
      if (characterImgRef.current) characterImgRef.current.style.display = 'block'
      if (!isMuted && bgSoundRef.current) void bgSoundRef.current.play().catch(() => {})
      if (clearSoundRef.current) {
        clearSoundRef.current.pause()
        clearSoundRef.current.currentTime = 0
      }
    }
  }

  // ── Register all event listeners ──────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const scrollEl = el

    // Mouse wheel → horizontal scroll
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      scrollEl.scrollLeft += e.deltaY
      updateBackgrounds()
      handleScroll()
    }

    // Touch swipe → horizontal scroll
    let touchStartX = 0
    function onTouchStart(e: TouchEvent) {
      touchStartX = e.touches[0]?.clientX ?? 0
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const dx = touchStartX - (e.touches[0]?.clientX ?? 0)
      scrollEl.scrollLeft += dx
      touchStartX = e.touches[0]?.clientX ?? touchStartX
      updateBackgrounds()
      handleScroll()
    }

    // Arrow / Space / PageUp / PageDown keys → snap one viewport width
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case ' ':
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault()
          scrollEl.scrollLeft += window.innerWidth
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          scrollEl.scrollLeft -= window.innerWidth
          break
      }
      updateBackgrounds()
      handleScroll()
    }

    // Native scroll event → coin SFX when a middle section enters full view
    function onScroll() {
      const sections = scrollEl.querySelectorAll<HTMLElement>('.project-section')
      sections.forEach((section, idx) => {
        // Skip the first (title) and last (castle) slides
        if (idx === 0 || idx === sections.length - 1) return
        const rect = section.getBoundingClientRect()
        if (rect.left >= 0 && rect.right <= window.innerWidth) {
          if (coinSoundRef.current) void coinSoundRef.current.play().catch(() => {})
        }
      })
    }

    scrollEl.addEventListener('wheel', onWheel, { passive: false })
    scrollEl.addEventListener('touchstart', onTouchStart)
    scrollEl.addEventListener('touchmove', onTouchMove, { passive: false })
    scrollEl.addEventListener('scroll', onScroll)
    document.addEventListener('keydown', onKeyDown)

    // Initialise parallax position on mount
    updateBackgrounds()

    return () => {
      scrollEl.removeEventListener('wheel', onWheel)
      scrollEl.removeEventListener('touchstart', onTouchStart)
      scrollEl.removeEventListener('touchmove', onTouchMove)
      scrollEl.removeEventListener('scroll', onScroll)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMuted]) // re-register when mute changes so handleScroll closure is fresh

  // ── Apply mute/unmute to all audio elements ───────────────────────────────
  useEffect(() => {
    if (bgSoundRef.current) {
      bgSoundRef.current.volume = isMuted ? 0 : 1
      void bgSoundRef.current.play().catch(() => {})
    }
    if (coinSoundRef.current)  coinSoundRef.current.volume  = isMuted ? 0 : 1
    if (clearSoundRef.current) clearSoundRef.current.volume = isMuted ? 0 : 1
  }, [isMuted])

  return {
    // DOM refs — spread onto JSX elements
    scrollRef,
    bodyRef,
    hillsRef,
    floorRef,
    characterImgRef,
    // Audio refs — spread onto <audio> elements
    bgSoundRef,
    coinSoundRef,
    clearSoundRef,
    // Mute state — passed to mute button
    isMuted,
    setIsMuted,
  }
}