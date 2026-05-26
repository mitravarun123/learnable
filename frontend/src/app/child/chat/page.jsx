'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getLesson, saveVideo, deleteVideo, getSavedVideos } from '@/lib/api'

function MiniGame({ game, onCorrect }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  const handleSelect = (index) => {
    setSelected(index)
    if (index === game.correct_index) {
      setResult('correct')
      onCorrect()
    } else {
      setResult('wrong')
      setTimeout(() => {
        setSelected(null)
        setResult(null)
      }, 1200)
    }
  }

  return (
    <motion.div
      className="rounded-2xl p-6 my-4"
      style={{ background: '#F0F7FF' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-2xl font-bold text-center mb-2" style={{ fontSize: '22px' }}>
        {game.emoji} {game.question}
      </p>
      <div className="flex flex-col gap-3 mt-4">
        {game.options.map((opt, i) => (
          <motion.button
            key={i}
            onClick={() => !result || result === 'wrong' ? handleSelect(i) : null}
            className="text-xl font-bold text-white rounded-2xl cursor-pointer"
            style={{
              background: selected === i
                ? (result === 'correct' ? '#51CF66' : result === 'wrong' ? '#FF6B6B' : '#4ECDC4')
                : '#4ECDC4',
              minHeight: '64px',
              fontSize: '20px',
            }}
            animate={selected === i && result === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : {}}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {opt.emoji} {opt.text}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {result === 'correct' && (
          <motion.p
            className="text-2xl font-bold text-center mt-4"
            style={{ color: '#51CF66', fontSize: '22px' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {game.correct_message}
          </motion.p>
        )}
        {result === 'wrong' && (
          <motion.p
            className="text-xl font-semibold text-center mt-4"
            style={{ color: '#FF922B', fontSize: '20px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {game.try_again_message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SavedVideoCard({ video, onRemove }) {
  return (
    <motion.div
      className="rounded-2xl p-4 flex flex-col items-center justify-between text-center relative"
      style={{ background: 'white', border: '2px solid #E0E0E0', minHeight: '100px' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className="font-bold text-lg" style={{ fontSize: '20px' }}>{video.topic}</p>
      <motion.button
        onClick={() => onRemove(video.id)}
        className="text-lg cursor-pointer mt-2"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        ❤️ Remove
      </motion.button>
    </motion.div>
  )
}

function EmptySlot() {
  return (
    <div
      className="rounded-2xl flex items-center justify-center text-4xl"
      style={{
        border: '2px dashed #CCC',
        minHeight: '100px',
        color: '#CCC',
      }}
    >
      +
    </div>
  )
}

export default function ChildChatPage() {
  const [childData, setChildData] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stars, setStars] = useState(0)
  const [savedVideos, setSavedVideos] = useState([])
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('childData')
    if (!stored) {
      router.push('/child/login')
      return
    }
    const data = JSON.parse(stored)
    setChildData(data)
    setStars(data.stars || 0)
    setMessages([{
      type: 'bot',
      text: `Hi ${data.name}! What do you want to learn today? 🌈`
    }])
    loadSavedVideos(data.id)
  }, [router])

  const loadSavedVideos = async (childId) => {
    try {
      const videos = await getSavedVideos(childId)
      setSavedVideos(videos || [])
    } catch (err) {
      console.error('Failed to load saved videos')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { type: 'child', text: userMsg }])
    setLoading(true)

    try {
      const result = await getLesson(userMsg, {
        name: childData.name,
        age: childData.age,
        disability_type: childData.disability_type || 'none',
      })
      setMessages(prev => [...prev, {
        type: 'lesson',
        videoUrl: result.video_url,
        topic: result.topic,
        videoPrompt: result.video_prompt,
        game: result.game,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Oops! Something went wrong. Try again! 💪'
      }])
    }
    setLoading(false)
  }

  const handleSaveVideo = async (topic, videoUrl) => {
    if (savedVideos.length >= 3) return
    try {
      await saveVideo(childData.id, topic, videoUrl)
      await loadSavedVideos(childData.id)
    } catch (err) {
      console.error('Failed to save video')
    }
  }

  const handleRemoveVideo = async (videoId) => {
    try {
      await deleteVideo(videoId)
      await loadSavedVideos(childData.id)
    } catch (err) {
      console.error('Failed to remove video')
    }
  }

  const handleGameCorrect = () => {
    setStars(prev => prev + 1)
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }
    recognition.onerror = () => setIsListening(false)

    recognition.start()
  }

  if (!childData) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF9F0' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4"
           style={{ background: '#FF6B6B' }}>
        <p className="text-xl font-bold text-white" style={{ fontSize: '22px' }}>
          Hi, {childData.name}! 👋
        </p>
        <p className="text-xl font-bold text-white" style={{ fontSize: '22px' }}>
          ⭐ {stars}
        </p>
      </div>

      {/* Saved Videos Row */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            savedVideos[i] ? (
              <SavedVideoCard
                key={savedVideos[i].id}
                video={savedVideos[i]}
                onRemove={handleRemoveVideo}
              />
            ) : (
              <EmptySlot key={`empty-${i}`} />
            )
          ))}
        </div>
        {savedVideos.length >= 3 && (
          <p className="text-center font-semibold mt-2" style={{ color: '#FF922B', fontSize: '20px' }}>
            💾 Full! Remove one to save new
          </p>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => {
            if (msg.type === 'bot') {
              return (
                <motion.div
                  key={i}
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="rounded-2xl px-5 py-3 max-w-[80%]"
                       style={{ background: '#4ECDC4', color: 'white', fontSize: '20px' }}>
                    <p className="font-semibold">{msg.text}</p>
                  </div>
                </motion.div>
              )
            }
            if (msg.type === 'child') {
              return (
                <motion.div
                  key={i}
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="rounded-2xl px-5 py-3 max-w-[80%]"
                       style={{ background: '#FF6B6B', color: 'white', fontSize: '20px' }}>
                    <p className="font-semibold">{msg.text}</p>
                  </div>
                </motion.div>
              )
            }
            if (msg.type === 'lesson') {
              return (
                <motion.div
                  key={i}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Video Player */}
                  <div className="relative rounded-2xl overflow-hidden" style={{ background: '#000' }}>
                    <video
                      src={msg.videoUrl}
                      controls
                      className="w-full rounded-2xl"
                      style={{ maxHeight: '300px' }}
                    />
                    {savedVideos.length < 3 && (
                      <motion.button
                        onClick={() => handleSaveVideo(msg.topic, msg.videoUrl)}
                        className="absolute top-3 right-3 text-2xl cursor-pointer bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ❤️
                      </motion.button>
                    )}
                  </div>
                  {/* Mini Game */}
                  {msg.game && (
                    <MiniGame game={msg.game} onCorrect={handleGameCorrect} />
                  )}
                </motion.div>
              )
            }
            return null
          })}
        </AnimatePresence>

        {loading && (
          <motion.div
            className="flex justify-center items-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              className="text-4xl"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <p className="text-xl font-semibold ml-3" style={{ color: '#4ECDC4', fontSize: '20px' }}>
              Making your lesson ✨
            </p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Bar */}
      <div className="flex items-center gap-3 px-4 py-4 border-t"
           style={{ background: 'white', borderColor: '#E0E0E0' }}>
        <motion.button
          onClick={startListening}
          className="text-2xl rounded-full cursor-pointer flex items-center justify-center"
          style={{
            minWidth: '64px',
            minHeight: '64px',
            background: isListening ? '#FF6B6B' : '#F0F0F0',
            fontSize: '24px',
          }}
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={isListening ? { duration: 0.8, repeat: Infinity } : {}}
          whileTap={{ scale: 0.9 }}
        >
          🎤
        </motion.button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything! 🌟"
          className="flex-1 text-xl p-4 rounded-2xl border-2 border-gray-200 outline-none focus:border-[#FF6B6B] font-semibold"
          style={{ fontSize: '20px', minHeight: '64px' }}
        />

        <motion.button
          onClick={handleSend}
          className="text-xl font-bold text-white rounded-2xl cursor-pointer px-6"
          style={{ background: '#FF6B6B', minHeight: '64px', fontSize: '20px' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Send
        </motion.button>
      </div>
    </div>
  )
}
