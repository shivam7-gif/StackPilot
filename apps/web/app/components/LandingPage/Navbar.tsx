"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiTerminal,
  FiMenu,
  FiX,
  FiArrowRight,
  FiGithub,
  FiCpu,
  FiLayers,
  FiPlay,
} from "react-icons/fi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Multi-Agent Engine", href: "#agents" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Architecture", href: "#architecture" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/40"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-[1px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0d0d12] rounded-[11px] flex items-center justify-center">
                <FiTerminal className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Stack<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Pilot</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 tracking-wider font-mono">
                AUTONOMOUS SOFTWARE ENGINE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-full px-4 py-1.5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* GitHub Stars Pill */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-all duration-200 hover:text-white"
            >
              <FiGithub className="w-4 h-4 text-zinc-300" />
              <span>GitHub</span>
              <span className="px-1.5 py-0.2 bg-white/10 rounded text-[10px] text-amber-300 font-mono">
                ★ 2.4k
              </span>
            </a>

            {/* Dashboard / Sign In */}
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>

            {/* Primary CTA */}
            <Link
              href="/dashboard"
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-lg shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-sans"
            >
              <span>Launch Studio</span>
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-xs font-semibold text-black bg-amber-400 rounded-md"
            >
              Launch
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d12]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pt-4 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-zinc-200 hover:bg-white/[0.05] rounded-md transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 text-sm text-zinc-300 bg-white/[0.04] border border-white/[0.08] rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FiGithub className="w-4 h-4" />
                <span>Star on GitHub</span>
              </div>
              <span className="font-mono text-xs text-amber-400">★ 2.4k</span>
            </a>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-black bg-amber-400 rounded-lg shadow-lg shadow-amber-500/20"
            >
              <span>Launch Studio</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
