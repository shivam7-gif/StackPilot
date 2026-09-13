'use client'

import React, { useState } from 'react'
import { FiX, FiCheck, FiArrowRight } from 'react-icons/fi'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Developer')
  const [submitted, setSubmitted] = useState(false)
  const [queueNumber] = useState(() => Math.floor(1400 + Math.random() * 500))

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    setEmail('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 shadow-2xl shadow-amber-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-amber-500 uppercase tracking-widest">(00) EARLY ACCESS</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Join the StackPilot AI Waitlist
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              Experience the multi-agent engine that plans, writes, and heals production code in parallel.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-2">
                  Your Primary Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Developer', 'Founder / CTO', 'Architect', 'Tech Lead'].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all text-left ${
                        role === r
                          ? 'border-amber-500/60 bg-amber-500/10 text-white'
                          : 'border-white/5 bg-[#161616] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-3 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-[0.99]"
              >
                <span>Request Priority Access</span>
                <FiArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-neutral-500 pt-1">
                Zero spam. Priority rollout given to engineering teams.
              </p>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <FiCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
              You&apos;re on the list!
            </h3>
            <p className="text-sm text-neutral-400 mb-5 max-w-sm mx-auto">
              We saved your spot for <span className="text-white font-mono">{email}</span>. You are priority queue:
            </p>
            <div className="inline-block rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-3 font-mono text-xl font-bold text-amber-400 tracking-wider mb-6">
              #{queueNumber}
            </div>
            <div>
              <button
                onClick={handleReset}
                className="rounded-xl border border-white/10 hover:border-white/25 px-5 py-2.5 text-xs uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
              >
                Back to Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
