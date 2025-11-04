'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Home() {
  const words = ['anytime', 'anywhere']
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[currentWordIndex]
    let timeout: NodeJS.Timeout

    if (!isDeleting && displayedText.length < currentWord.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.slice(0, displayedText.length + 1))
      }, 120)
    } else if (!isDeleting && displayedText.length === currentWord.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true)
      }, 1500)
    } else if (isDeleting && displayedText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.slice(0, displayedText.length - 1))
      }, 80)
    } else if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false)
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, currentWordIndex])

  return (
    <>
      {/* ENHANCED BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 60, -80, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-3/4 right-1/3 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-indigo-500/15 to-blue-400/15 rounded-full blur-3xl"
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-5 bg-noise-texture" />
      </div>

      {/* CONTENT */}
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: TEXT CONTENT - Takes 3 columns on large screens */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-3 space-y-6 text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Woldia University
            </h1>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Library Management System
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
              Library connects readers with knowledge{' '}
              <span className="inline-block min-w-[130px] relative">
                <span className="font-bold text-cyan-400">
                  {displayedText.split('').map((letter, i) => (
                    <motion.span
                      key={`${currentWordIndex}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.05 }}
                      className="inline-block"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
                
                {/* Animated Cursor */}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    repeatType: 'reverse' 
                  }}
                  className="inline-block w-0.5 h-6 bg-cyan-400 ml-0.5 align-middle"
                />
              </span>
              !
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/login"
                className="inline-block mt-8 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:brightness-110"
              >
                Get Started
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="inline-block ml-2"
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT: GLASS CARDS - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-w-md mx-auto lg:max-w-full">
              
              {/* CARD 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: 10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl h-40 backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                
                <Image 
                  src="/w1.jpg" 
                  alt="Library" 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  priority
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                    <p className="text-white font-semibold text-base mb-1">Explore Our Collection</p>
                    <p className="text-gray-300 text-xs">Discover thousands of books and resources</p>
                  </div>
                </div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </motion.div>

              {/* CARD 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: -10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl h-40 backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                
                <Image 
                  src="/w4.jpg" 
                  alt="Students" 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  priority
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                    <p className="text-white font-semibold text-base mb-1">Learn Without Limits</p>
                    <p className="text-gray-300 text-xs">Access knowledge from anywhere in the world</p>
                  </div>
                </div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}