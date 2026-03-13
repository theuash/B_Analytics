import React, { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'

const ParallaxHeader = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const calcTransform = (depth) => {
    const x = (mousePosition.x - window.innerWidth / 2) * 0.02 * depth
    const y = (mousePosition.y - window.innerHeight / 2) * 0.02 * depth
    return `translate(${x}px, ${y + scrollY * 0.5}px)`
  }

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Large gradient orbs with parallax */}
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20"
          style={{
            transform: calcTransform(3),
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20"
          style={{
            transform: calcTransform(-2),
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-500 rounded-full filter blur-3xl opacity-10"
          style={{
            transform: calcTransform(2),
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>

      {/* Animated Grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent 24%, rgba(100,116,139,.05) 25%, rgba(100,116,139,.05) 26%, transparent 27%, transparent 74%, rgba(100,116,139,.05) 75%, rgba(100,116,139,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(100,116,139,.05) 25%, rgba(100,116,139,.05) 26%, transparent 27%, transparent 74%, rgba(100,116,139,.05) 75%, rgba(100,116,139,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px',
          animation: 'drift 20s linear infinite'
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center" style={{ transform: calcTransform(1) }}>
        <div className="mb-8 inline-block">
          <div
            className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl"
            style={{
              transform: 'rotateX(15deg) rotateY(-15deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            <BarChart3 size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          <span className="gradient-text">Dashboard</span>
          <br />
          <span className="text-slate-100">Analytics</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Transform your data into stunning visualizations with
          <br />
          <span className="gradient-text font-semibold">natural language</span>
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#app"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="px-8 py-3 border-2 border-blue-400 text-blue-300 font-bold rounded-lg hover:bg-blue-400/10 transition-all transform hover:scale-105"
          >
            API Docs
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(25px, 25px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  )
}

export default ParallaxHeader
