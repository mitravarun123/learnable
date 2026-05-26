'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const numColors = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#51CF66', '#845EF7',
  '#FF922B', '#339AF0', '#F06595', '#20C997', '#868E96'
]

export default function ChildLoginPage() {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleNumberPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num)
    }
  }

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const handleSubmit = async () => {
    if (!name.trim() || pin.length !== 4) return

    try {
      const { data, error: dbError } = await supabase
        .from('children')
        .select('*')
        .eq('name', name.trim())
        .single()

      if (dbError || !data) {
        setShake(true)
        setError('Name not found!')
        setTimeout(() => setShake(false), 500)
        return
      }

      const pinMatch = data.pin === pin
      if (!pinMatch) {
        setShake(true)
        setError('Wrong PIN! Try again 💪')
        setPin('')
        setTimeout(() => setShake(false), 500)
        return
      }

      localStorage.setItem('childData', JSON.stringify(data))
      router.push('/child/chat')
    } catch (err) {
      setShake(true)
      setError('Oops! Something went wrong 😅')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
         style={{ background: '#FFF9F0' }}>
      <motion.h1
        className="text-4xl md:text-5xl font-black mb-8"
        style={{ color: '#FF6B6B' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Who are you? 😊
      </motion.h1>

      <motion.input
        type="text"
        placeholder="Your name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-sm text-xl p-4 rounded-2xl border-2 border-gray-200 mb-8 text-center font-semibold outline-none focus:border-[#FF6B6B]"
        style={{ fontSize: '20px', background: 'white' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      />

      <motion.div
        className="flex gap-4 mb-6"
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2"
            style={{
              borderColor: '#FF6B6B',
              background: i < pin.length ? '#FF6B6B' : 'transparent'
            }}
          />
        ))}
      </motion.div>

      {error && (
        <motion.p
          className="text-lg font-semibold mb-4"
          style={{ color: '#FF6B6B', fontSize: '20px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-8 max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <motion.button
            key={num}
            onClick={() => handleNumberPress(String(num))}
            className="text-2xl font-bold text-white rounded-2xl cursor-pointer"
            style={{
              background: numColors[num - 1],
              minWidth: '64px',
              minHeight: '64px',
              fontSize: '24px'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {num}
          </motion.button>
        ))}
        <div />
        <motion.button
          onClick={() => handleNumberPress('0')}
          className="text-2xl font-bold text-white rounded-2xl cursor-pointer"
          style={{
            background: numColors[9],
            minWidth: '64px',
            minHeight: '64px',
            fontSize: '24px'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          0
        </motion.button>
        <motion.button
          onClick={handleBackspace}
          className="text-2xl font-bold text-white rounded-2xl cursor-pointer"
          style={{
            background: '#E0E0E0',
            minWidth: '64px',
            minHeight: '64px',
            fontSize: '24px',
            color: '#555'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ⌫
        </motion.button>
      </div>

      <motion.button
        onClick={handleSubmit}
        className="w-full max-w-sm text-xl font-bold text-white rounded-2xl cursor-pointer"
        style={{ background: '#FF6B6B', minHeight: '64px', fontSize: '20px' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Let&apos;s Go! 🚀
      </motion.button>
    </div>
  )
}
