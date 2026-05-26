'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const floatingEmojis = ['🌟', '⭐', '🎈', '🎨', '🔢', '🎮']

function FloatingEmoji({ emoji, index }) {
  const randomX = 10 + (index * 15) % 80
  const randomDelay = index * 0.5
  const randomDuration = 4 + (index % 3)

  return (
    <motion.div
      className="absolute text-4xl pointer-events-none select-none"
      style={{ left: `${randomX}%`, top: '-10%' }}
      animate={{
        y: ['0vh', '110vh'],
        rotate: [0, 360],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: 'linear',
      }}
    >
      {emoji}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
         style={{ background: '#FFF9F0' }}>
      {floatingEmojis.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} index={i} />
      ))}

      <motion.h1
        className="text-6xl md:text-8xl font-black mb-4 z-10"
        style={{ color: '#FF6B6B' }}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        LearnAble
      </motion.h1>

      <motion.p
        className="text-2xl md:text-3xl font-semibold mb-12 z-10"
        style={{ color: '#555' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Learning is fun for everyone! 🌈
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Link href="/child/login">
          <motion.button
            className="text-xl font-bold text-white rounded-2xl px-10 cursor-pointer"
            style={{ background: '#FF6B6B', minHeight: '72px', fontSize: '20px' }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            I&apos;m a Child 🎒
          </motion.button>
        </Link>

        <Link href="/parent/login">
          <motion.button
            className="text-xl font-bold text-white rounded-2xl px-10 cursor-pointer"
            style={{ background: '#4ECDC4', minHeight: '72px', fontSize: '20px' }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            I&apos;m a Parent 👨‍👩‍👧
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}
