'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AddChildModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [disabilityType, setDisabilityType] = useState('none')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !age || pin.length !== 4) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('children').insert({
        parent_id: user.id,
        name: name.trim(),
        age: parseInt(age),
        disability_type: disabilityType,
        pin: pin,
        stars: 0,
      }).select().single()

      if (error) throw error
      onAdd(data)
      onClose()
    } catch (err) {
      alert('Failed to add child. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#333' }}>Add Child</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#555' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-[#4ECDC4]"
              placeholder="Child's name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#555' }}>Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-[#4ECDC4]"
              placeholder="Age"
              min="3"
              max="18"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#555' }}>Disability Type</label>
            <select
              value={disabilityType}
              onChange={(e) => setDisabilityType(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-[#4ECDC4]"
            >
              <option value="none">None</option>
              <option value="adhd">ADHD</option>
              <option value="autism">Autism</option>
              <option value="dyslexia">Dyslexia</option>
              <option value="physical">Physical</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#555' }}>4-Digit PIN</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                setPin(val)
              }}
              className="w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-[#4ECDC4] text-center text-2xl tracking-widest"
              placeholder="••••"
              maxLength={4}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 rounded-xl border-2 border-gray-200 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 rounded-xl text-white font-semibold cursor-pointer disabled:opacity-50"
              style={{ background: '#4ECDC4' }}
            >
              {loading ? 'Adding...' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChildCard({ child }) {
  const [expanded, setExpanded] = useState(false)
  const [sessions, setSessions] = useState([])

  const disabilityColors = {
    none: '#E0E0E0',
    adhd: '#FF922B',
    autism: '#845EF7',
    dyslexia: '#339AF0',
    physical: '#51CF66',
    both: '#F06595',
  }

  const loadSessions = async () => {
    if (expanded) {
      setExpanded(false)
      return
    }
    try {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('child_id', child.id)
        .order('created_at', { ascending: false })
      setSessions(data || [])
    } catch (err) {
      console.error('Failed to load sessions')
    }
    setExpanded(true)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={loadSessions}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#333' }}>{child.name}</h3>
            <p className="text-gray-500">Age: {child.age}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ background: disabilityColors[child.disability_type] || '#E0E0E0' }}
            >
              {child.disability_type || 'none'}
            </span>
            <span className="text-lg font-bold" style={{ color: '#FFD43B' }}>
              ⭐ {child.stars || 0}
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-6">
          <h4 className="font-bold mb-3" style={{ color: '#555' }}>Session History</h4>
          {sessions.length === 0 ? (
            <p className="text-gray-400">No sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-sm font-semibold text-gray-500">Topic</th>
                    <th className="pb-2 text-sm font-semibold text-gray-500">Game Score</th>
                    <th className="pb-2 text-sm font-semibold text-gray-500">Date</th>
                    <th className="pb-2 text-sm font-semibold text-gray-500">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b border-gray-50">
                      <td className="py-3">{session.topic}</td>
                      <td className="py-3">{session.game_score ?? '-'}</td>
                      <td className="py-3">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {session.completed ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ParentDashboardPage() {
  const [children, setChildren] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/parent/login')
      return
    }
    await loadChildren(user.id)
    setLoading(false)
  }

  const loadChildren = async (parentId) => {
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })
    setChildren(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/parent/login')
  }

  const handleAddChild = (child) => {
    setChildren(prev => [child, ...prev])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FA' }}>
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FA' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white shadow-sm">
        <h1 className="text-2xl font-bold" style={{ color: '#333' }}>
          Welcome back! 👨‍👩‍👧
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 font-semibold text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#333' }}>Your Children</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer"
            style={{ background: '#4ECDC4' }}
          >
            + Add Child
          </button>
        </div>

        <div className="space-y-4">
          {children.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <p className="text-xl text-gray-400">No children added yet.</p>
              <p className="text-gray-400 mt-2">Click &quot;Add Child&quot; to get started!</p>
            </div>
          ) : (
            children.map(child => (
              <ChildCard key={child.id} child={child} />
            ))
          )}
        </div>
      </div>

      {showModal && (
        <AddChildModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddChild}
        />
      )}
    </div>
  )
}
