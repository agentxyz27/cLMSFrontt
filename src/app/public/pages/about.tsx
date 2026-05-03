/**
 * about.tsx
 *
 * Mario-themed horizontal-scroll onboarding for cLMS.
 *
 * This component is a pure renderer — all scroll, parallax, audio,
 * and Mario animation logic lives in useMarioScroller.
 *
 * Slide order:
 *   0          → Title card  "What is cLMS?"
 *   1 – 5      → One slide per cLMS feature
 *   last       → Castle + Register / Login CTA
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/about.css'

import marioIdle      from '@/assets/about/mario.png'
import castleImg      from '@/assets/about/castle.png'
import bgMusic        from '@/assets/about/sounds/mariobgm.mp3'
import coinSfx        from '@/assets/about/sounds/smb_coin.wav'
import clearSfx       from '@/assets/about/sounds/smb_stage_clear.wav'

import { useMarioScroller } from '../hooks/useMarioScroller'

// ── Feature data ─────────────────────────────────────────────────────────────
type Feature = {
  title: string
  desc: string
  for: string
  titleSize: string
  boxH: string
}

const FEATURES: Feature[] = [
  {
    title: 'Classrooms',
    desc: 'Teachers create and manage virtual classrooms, then invite students using a simple join code. Everything — lessons, progress, badges — lives inside one organized space per class.',
    for: 'Everyone',
    titleSize: 'text-[25px] lg:text-[40px]',
    boxH: 'h-[70px] md:h-[70px] lg:h-[150px]',
  },
  {
    title: 'Lessons',
    desc: 'Build interactive lessons with a drag-and-drop canvas editor. Add text blocks, images, and quizzes — or pick a ready-made template and go live in minutes.',
    for: 'Teachers',
    titleSize: 'text-[25px] lg:text-[40px]',
    boxH: 'h-[70px] md:h-[70px] lg:h-[150px]',
  },
  {
    title: 'Badges',
    desc: "Students earn badges as they complete lessons and hit milestones. Every badge is displayed on their profile — a permanent record of everything they've achieved.",
    for: 'Students',
    titleSize: 'text-[25px] lg:text-[40px]',
    boxH: 'h-[70px] md:h-[70px] lg:h-[150px]',
  },
  {
    title: 'Leaderboard',
    desc: 'A live class ranking updated in real time. Students compete for the top spot by completing lessons, earning badges, and staying active. Healthy competition, maximum motivation.',
    for: 'Students',
    titleSize: 'text-[25px] lg:text-[40px]',
    boxH: 'h-[70px] md:h-[90px] lg:h-[150px]',
  },
  {
    title: 'Progress',
    desc: 'Every lesson completed, every badge earned, every point scored — tracked automatically. Students see their own journey; teachers see the whole class at a glance.',
    for: 'Everyone',
    titleSize: 'text-[25px] lg:text-[40px]',
    boxH: 'h-[70px] md:h-[90px] lg:h-[150px]',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function About() {
  const [menuOpen, setMenuOpen] = useState(false)

  // All scroll / parallax / audio / Mario logic lives here
  const {
    scrollRef,
    bodyRef,
    hillsRef,
    floorRef,
    characterImgRef,
    bgSoundRef,
    coinSoundRef,
    clearSoundRef,
    isMuted,
    setIsMuted,
  } = useMarioScroller()

  return (
    <div ref={bodyRef} className="project-body flex flex-col min-h-screen overflow-hidden">

      {/* ── Navbar ── */}
      <header className="w-full">
        <nav className="project-navbar">

          {/* Desktop nav */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Link className="nav-item" to="/">Home</Link>
              <Link className="nav-item" to="/login">Login</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link className="nav-item" to="/register">Register</Link>
              <Link className="nav-item" to="/about">About</Link>
            </div>
          </div>

          {/* Mobile nav — hamburger */}
          <div className="md:hidden flex items-center justify-between w-full">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="absolute top-0 right-0 bg-black w-full mt-14 z-50">
              <Link className="block py-2 px-4 text-white" to="/"         onClick={() => setMenuOpen(false)}>Home</Link>
              <Link className="block py-2 px-4 text-white" to="/login"    onClick={() => setMenuOpen(false)}>Login</Link>
              <Link className="block py-2 px-4 text-white" to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
              <Link className="block py-2 px-4 text-white" to="/about"    onClick={() => setMenuOpen(false)}>About</Link>
            </div>
          )}

        </nav>
      </header>

      {/* ── Horizontal scroll container ── */}
      <div className="scroll-container" ref={scrollRef}>
        <div className="section-wrapper">

          {/* ── Slide 0: Title card ── */}
          <div className="project-section">
            <div className="project-box w-2/3">
              <div className="project-content fonty tracking-wider md:text-[60px] mt-4">
                <p>What is</p>
                <p>cLMS?</p>
              </div>
              <div className="corner top-left" />
              <div className="corner top-right" />
              <div className="corner bottom-left" />
              <div className="corner bottom-right" />
            </div>
          </div>

          {/* ── Slides 1–5: One per feature ── */}
          {FEATURES.map((feat, i) => (
            <div key={i} className="project-section">
              <div className="container mx-auto w-11/12 md:w-11/12 z-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-0">

                  {/* Left col: description text + links */}
                  <div className="order-2 flex flex-col items-center justify-center gap-4">
                   <div className="desc-box row-span-1 flex flex-col p-1 w-full md:w-3/4 text-[10px] lg:text-[14px] text-white">
                      <p className="desctext">{feat.desc}</p>
                    </div>
                    <div className="row-span-1 flex justify-around w-full">
                      {/* Who this feature is for */}
                      <span className="text-white desctext text-[10px] lg:text-[14px]">
                        For: {feat.for}
                      </span>
                      {/* CTA → register */}
                      <Link
                        to="/register"
                        className="text-white underline hover:tracking-widest desctext text-[10px] lg:text-[14px]"
                      >
                        Get Started →
                      </Link>
                    </div>
                  </div>

                  {/* Right col: pixel feature-title box */}
                  <div className="order-1 flex justify-center items-center">
                    <div className={`project-box ${feat.boxH} w-fit md:w-2/3 mb-4 lg:mb-0`}>
                      <div className={`project-content fonty ${feat.titleSize} tracking-wider px-10 lg:px-5 mt-2 text-center`}>
                        {feat.title}
                      </div>
                      <div className="corner top-left" />
                      <div className="corner top-right" />
                      <div className="corner bottom-left" />
                      <div className="corner bottom-right" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {/* ── Last slide: Castle + Register / Login CTA ── */}
          <div className="project-section relative">
            <div className="z-50 flex flex-col items-center gap-6">

              {/* "Ready to play?" pixel box */}
              <div className="w-fit px-8">
                <div className="project-content fonty text-[20px] lg:text-[36px] tracking-wider mt-2 text-center px-4">
                  Ready to play?
                </div>
                <div className="corner top-left" />
                <div className="corner top-right" />
                <div className="corner bottom-left" />
                <div className="corner bottom-right" />
              </div>

              {/* Auth links */}
              <div className="flex gap-8 mb-8">
                <Link to="/register" className="text-white underline hover:tracking-widest desctext text-[12px] lg:text-[16px]">
                  Register →
                </Link>
                <Link to="/login" className="text-white underline hover:tracking-widest desctext text-[12px] lg:text-[16px]">
                  Login →
                </Link>
              </div>

            </div>

            {/* Castle sprite — Mario disappears when he reaches here */}
            <img
              src={castleImg}
              alt="Castle"
              className="castle lg:w-64 lg:h-64 md:w-48 md:h-48 w-64 h-64"
            />
          </div>

        </div>
      </div>

      {/* ── Parallax layers (positioned absolute/fixed in CSS) ── */}
      <div className="hills" ref={hillsRef} />   {/* mid-ground hills */}
      <div className="floor" ref={floorRef} />   {/* ground floor */}

      {/* ── Mario character sprite ── */}
      <div className="character">
        <img
          ref={characterImgRef}
          src={marioIdle}
          alt="Character"
          className="lg:w-32 lg:h-32 md:w-20 md:h-20 w-24 h-24"
        />
      </div>

      {/* ── Mute toggle (Starman = muted, Q-block = unmuted) ── */}
      <div
        className={`mute-button ${isMuted ? 'muted' : 'unmuted'}`}
        onClick={() => setIsMuted(m => !m)}
      />

      {/* ── Audio elements (controlled via refs in the hook) ── */}
      <audio ref={bgSoundRef}    src={bgMusic} loop />  {/* background BGM */}
      <audio ref={coinSoundRef}  src={coinSfx} />       {/* coin ding */}
      <audio ref={clearSoundRef} src={clearSfx} />      {/* stage clear */}

      {/* ── Footer ── */}
      <footer className="z-50 w-full flex items-start justify-start md:items-center md:justify-center absolute bottom-0">
        <div className="bg-gray-900 bg-opacity-50 w-fit">
          <p className="text-white max-[320px]:text-[8px] text-[10px] lg:text-[14px] mr-2 p-1">
            cLMS — Gamified Learning Platform
          </p>
        </div>
      </footer>

    </div>
  )
}