"use client"
import { useState } from "react"
import { IBM_Plex_Mono } from "next/font/google"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className={`${ibmPlexMono.className} min-h-screen flex items-center justify-center bg-[#E4E4E4] relative`}>
      <nav className="absolute top-0 left-0 w-full h-16 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-2">
          <span className="text-[#1a1a1a] font-bold text-xl tracking-tight">KARMA</span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#1a1a1a] text-base tracking-widest font-bold uppercase"
          >
            {menuOpen ? "× MENU" : "+ MENU"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs tracking-widest text-right text-[#1a1a1a] uppercase leading-tight">
            A 30-MINUTE CALL TO CLARIFY YOUR <br />
            NEXT STEPS. <span className="font-bold">ZERO OBLIGATIONS</span>
          </p>
          <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
            <img src="" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <button className="w-9 h-9 rounded-full bg-black text-white text-lg flex items-center justify-center">
            +
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-black text-white z-30 p-8 flex flex-col gap-4">
          <span className="font-bold text-xl tracking-tight text-white">KARMA</span>
          <ul className="flex flex-col gap-3 mt-4">
            {["HOME", "ABOUT", "CASE STUDIES", "NEWS", "CONTACT", "CAREERS"].map((item) => (
              <li
                key={item}
                className="text-base tracking-widest cursor-pointer hover:opacity-60 transition-opacity"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-white/20 pt-6">
            <p className="text-xl font-bold tracking-wider">KARMA.com</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex flex-row items-stretch justify-around">
        <div className="h-full w-[800px] bg-[#9c9c9c] opacity-20" >
          <img src="/photos/frontPage.jpg" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="h-full w-[1px] bg-[#9c9c9c] opacity-20" />
        <div className="h-full w-[1px] bg-[#9c9c9c] opacity-20" />
        <div className="h-full w-[1px] bg-[#9c9c9c] opacity-20" />
        <div className="h-full w-[1px] bg-[#9c9c9c] opacity-20" />
      </div>
    </main>
  )
}