'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-white/8 bg-[#0a0a0a] py-8 sm:py-10 text-neutral-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Copyright */}
        <div className="flex items-center gap-3">
          <p>© 2026 StackPilot AI — All rights reserved.</p>
          <span className="hidden sm:inline text-neutral-700">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[11px]">Systems Operational</span>
          </div>
        </div>

        {/* Right: Minimal Links */}
        <div className="flex items-center gap-5 uppercase tracking-wider text-[11px]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="#hero"
            className="hover:text-white transition-colors"
          >
            Docs
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Discord
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Twitter/X
          </a>
          <a
            href="#hero"
            className="hover:text-white transition-colors"
          >
            Privacy
          </a>
          <a
            href="#hero"
            className="hover:text-white transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  )
}
