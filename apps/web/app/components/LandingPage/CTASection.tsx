"use client";

import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiZap, FiTerminal } from "react-icons/fi";

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0a0a0a]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#161620] to-[#0e0e14] border border-white/10 p-8 sm:p-14 text-center shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Subtle decorative grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <FiZap className="w-3.5 h-3.5 text-amber-400" />
              Instant Full-Stack Prototyping
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl leading-tight">
              Build Faster Than Ever. Ship with Complete Confidence.
            </h2>

            <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-xl">
              Join thousands of developers turning ambitious product ideas into production-ready software with StackPilot's autonomous agent engine.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Launch Studio Now</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:text-white transition-all"
              >
                <FiTerminal className="w-4 h-4 text-amber-400" />
                <span>View Documentation</span>
              </a>
            </div>

            {/* Guarantees */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-400 w-4 h-4" />
                <span>Free during beta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-400 w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-400 w-4 h-4" />
                <span>Zero vendor lock-in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
