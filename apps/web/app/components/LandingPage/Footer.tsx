"use client";

import Link from "next/link";
import { FiTerminal, FiGithub, FiTwitter, FiDisc as FiDiscord } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-[#07070a] border-t border-white/[0.08] text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-[#0a0a0d] rounded-[7px] flex items-center justify-center">
                  <FiTerminal className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Stack<span className="text-amber-400">Pilot</span> AI
              </span>
            </Link>

            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
              Autonomous multi-agent platform that turns specifications into production-ready full-stack applications with persistent context memory and Docker sandboxes.
            </p>

            {/* Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#features" className="hover:text-amber-300 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#agents" className="hover:text-amber-300 transition-colors">
                  Multi-Agent Engine
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-amber-300 transition-colors">
                  Architecture
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-300 transition-colors">
                  Launch Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-amber-300 transition-colors">
                  LangGraph Spec
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-amber-300 transition-colors">
                  Monaco & xterm Setup
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-300 transition-colors">
                  Self-Healing Pipeline
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-300 transition-colors">
                  <FiGithub className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-300 transition-colors">
                  <FiTwitter className="w-4 h-4" />
                  <span>Twitter / X</span>
                </a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-300 transition-colors">
                  <FiDiscord className="w-4 h-4" />
                  <span>Discord</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} StackPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
