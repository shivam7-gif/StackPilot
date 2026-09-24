"use client";

import { useEffect, useRef } from "react";

type Strand = {
    points: { x: number; y: number }[];
    dotIndices: number[];
};

// Simple deterministic PRNG so the layout is stable across renders
function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function buildStrands(width: number, height: number): Strand[] {
    const rand = mulberry32(42);
    const clusters = [
        { cx: width * 0.52, cy: height * 0.32, r: Math.max(width * 0.32, 280) },
        { cx: width * 0.75, cy: height * 0.58, r: Math.max(width * 0.28, 240) },
        { cx: width * 0.35, cy: height * 0.72, r: Math.max(width * 0.24, 200) },
    ];

    const strands: Strand[] = [];

    clusters.forEach((cluster, ci) => {
        const count = 12 + Math.floor(rand() * 5);
        for (let i = 0; i < count; i++) {
            const baseAngle = (i / count) * Math.PI * 2 + ci * 0.8;
            const wobble = (rand() - 0.5) * 0.6;
            const angle = baseAngle + wobble;
            const length = cluster.r * (0.65 + rand() * 0.45);

            const points: { x: number; y: number }[] = [];
            const steps = 28;
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const wave = Math.sin(t * Math.PI * (2 + rand()) + i) * 16 * t;
                const px = cluster.cx + Math.cos(angle) * length * t + wave;
                const py =
                    cluster.cy +
                    Math.sin(angle) * length * t * 0.8 +
                    Math.cos(t * 6 + i) * 7 * t;
                points.push({ x: px, y: py });
            }

            const dotIndices = [
                Math.floor(steps * 0.45),
                Math.floor(steps * 0.75),
                steps,
            ];

            strands.push({ points, dotIndices });
        }
    });

    return strands;
}

export default function ThreadArt() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mouse = useRef<{ x: number; y: number } | null>(null);
    const strandsRef = useRef<Strand[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let width = 0;
        let height = 0;
        let time = 0;

        function resize() {
            if (!container || !canvas || !ctx) return;
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            width = rect.width;
            height = rect.height;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            strandsRef.current = buildStrands(width, height);
        }

        resize();
        window.addEventListener("resize", resize);

        const resizeObserver = new ResizeObserver(() => {
            resize();
        });
        resizeObserver.observe(container);

        function handlePointerMove(e: PointerEvent | MouseEvent) {
            if (!container) return;
            const rect = container.getBoundingClientRect();
            if (
                e.clientX >= rect.left - 50 &&
                e.clientX <= rect.right + 50 &&
                e.clientY >= rect.top - 50 &&
                e.clientY <= rect.bottom + 50
            ) {
                mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            } else {
                mouse.current = null;
            }
        }

        function handleLeave() {
            mouse.current = null;
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerleave", handleLeave);

        const hoverRadius = 220;

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            time += 0.015;
            const m = mouse.current;

            for (let sIdx = 0; sIdx < strandsRef.current.length; sIdx++) {
                const strand = strandsRef.current[sIdx];
                const pts = strand.points;

                // Subtle ambient harmonic pulsation
                const ambientWave = Math.sin(time + sIdx * 0.4) * 0.5 + 0.5;

                // Draw strand segments
                for (let i = 0; i < pts.length - 1; i++) {
                    const a = pts[i];
                    const b = pts[i + 1];

                    let strength = 0;
                    if (m) {
                        const midx = (a.x + b.x) / 2;
                        const midy = (a.y + b.y) / 2;
                        const dist = Math.hypot(midx - m.x, midy - m.y);
                        strength = Math.max(0, 1 - dist / hoverRadius);
                    }

                    if (strength > 0.01) {
                        const hue = (((a.x + a.y) * 0.5 + i * 5 + time * 20) % 360 + 360) % 360;
                        ctx.strokeStyle = `hsla(${hue}, 88%, 68%, ${0.2 + strength * 0.8})`;
                        ctx.lineWidth = 1 + strength * 1.5;
                    } else {
                        // Ambient subtle glow
                        const alpha = 0.12 + ambientWave * 0.05;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                    }

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }

                // Dot markers along the strand
                for (const idx of strand.dotIndices) {
                    const p = pts[idx];
                    if (!p) continue;
                    let strength = 0;
                    if (m) {
                        const dist = Math.hypot(p.x - m.x, p.y - m.y);
                        strength = Math.max(0, 1 - dist / hoverRadius);
                    }
                    const hue = (((p.x + p.y) * 0.5 + idx * 5 + time * 30) % 360 + 360) % 360;
                    ctx.beginPath();
                    const radius = 1.6 + strength * 1.8 + ambientWave * 0.4;
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    ctx.fillStyle =
                        strength > 0.01
                            ? `hsla(${hue}, 92%, 72%, ${0.5 + strength * 0.5})`
                            : `rgba(255, 255, 255, ${0.35 + ambientWave * 0.25})`;
                    ctx.fill();
                }
            }

            raf = requestAnimationFrame(draw);
        }

        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            resizeObserver.disconnect();
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerleave", handleLeave);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
            <canvas ref={canvasRef} className="block h-full w-full" />
        </div>
    );
}