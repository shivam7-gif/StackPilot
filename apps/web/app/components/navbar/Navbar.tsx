const links = ["Home", "Documentation", "API", "Pricing"];

const Navbar = () => {
    return (
        <nav className="fixed top-6 left-1/2 z-50 w-[92%] max-w-5xl -translate-x-1/2">
            <div className="relative flex items-center justify-between overflow-hidden rounded-full bg-mist px-8 py-4 shadow-lg shadow-black/20">
                {/* paper-grain texture layer */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                />

                <span className="relative z-10 text-xl font-semibold tracking-tight text-ink">
                    StackPilot
                </span>

                <div className="relative z-10 flex items-center gap-8">
                    {links.map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            className="text-sm font-medium text-ink/70 transition hover:text-ink"
                        >
                            {link}
                        </a>
                    ))}
                </div>
            </div>
        </nav >
    )
}

export default Navbar;