'use client'

import React, { useState, useEffect } from 'react'
import { FiArrowUpRight, FiMenu, FiX } from 'react-icons/fi'

interface NavbarProps {
  onOpenWaitlist: () => void
}

export default function Navbar({ onOpenWaitlist }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', superscript: '⁰¹', href: '#hero' },
    { label: 'Problem', superscript: '⁰²', href: '#problem' },
    { label: 'Solution', superscript: '⁰³', href: '#solution' },
    { label: 'H-Series', superscript: '⁰⁴', href: '#h-series' },
    { label: 'Workflow', superscript: '⁰⁵', href: '#workflow' },
    { label: 'Tech', superscript: '⁰⁶', href: '#tech' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/8 py-3.5 shadow-lg shadow-black/40'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Logo Left */}
        <a href="#hero" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
            <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors">
              StackPilot<span className="text-amber-500 font-mono text-sm ml-0.5">.AI</span>
            </span>
            <span className="ml-2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]" />
          </div>
        </a>

        {/* Desktop Nav Links Right */}
        <nav className="hidden md:flex items-center gap-7">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group font-medium"
                >
                  <span>{link.label}</span>
                  <span className="text-[10px] text-amber-500/80 font-mono group-hover:text-amber-400 transition-colors">
                    {link.superscript}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* CTA pill button */}
          <button
            onClick={onOpenWaitlist}
            className="group relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200"
          >
            <span>Join Waitlist</span>
            <FiArrowUpRight className="w-3.5 h-3.5 text-amber-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onOpenWaitlist}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400"
          >
            <span>Waitlist</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl px-6 py-6 animate-in slide-in-from-top-3 duration-200">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1 text-sm uppercase tracking-widest text-neutral-300 hover:text-white"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-amber-500 font-mono">{link.superscript}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenWaitlist()
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-black font-semibold py-3 text-sm"
            >
              <span>Join the Waitlist</span>
              <FiArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
