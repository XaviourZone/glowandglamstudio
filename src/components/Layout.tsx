import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '@/assets/images/logo.webp';
import { cn } from '@/lib/utils';
import { Spotlight, DustParticles } from './StudioEffects';
import '../studio.css';

// Scroll-reveal wrapper for sections using Framer Motion with ultra-relaxed luxury easing
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px -40px 0px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1], // silky, relaxed luxury deceleration curve
      }}
      className={cn("w-full will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

export default function Layout({
  children,
  currentPath = window.location.pathname,
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  const isHome = (() => {
    const current = (currentPath || '').toLowerCase();
    return current === '/' || current.endsWith('/index.html') || current === '';
  })();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Spotlight />
      <DustParticles />

      {/* ── TOP CENTERED BRAND HEADER (NO HEADER BAR) ── */}
      <header className="relative w-full pt-8 md:pt-12 pb-4 px-4 flex flex-col items-center justify-center text-center z-30">
        <a href="/index.html" className="inline-flex flex-col items-center group cursor-pointer">
          <div className="relative mb-3">
            <img
              src={logoImg}
              alt="Glow & Glam Studio"
              className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full object-cover border-2 border-primary/60 group-hover:border-primary transition-all duration-500 shadow-[0_0_25px_hsl(28_55%_58%/0.4)] group-hover:scale-105 group-hover:shadow-[0_0_35px_hsl(28_55%_58%/0.6)]"
            />
            <div className="absolute -inset-1.5 md:-inset-2 rounded-full border border-primary/25 pointer-events-none group-hover:border-primary/60 transition-colors" />
          </div>
          <span className="font-display text-2xl md:text-3xl lg:text-4xl tracking-wide text-foreground font-light block leading-tight">
            Glow & Glam
          </span>
          <span className="nav-label text-[9px] md:text-[11px] text-primary tracking-[0.25em] md:tracking-[0.3em] uppercase block mt-1">
            Luxury Studio
          </span>
        </a>

        {/* Minimalist "Back to Home" pill for inner pages */}
        {!isHome && (
          <div className="mt-5">
            <a
              href="/index.html"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 hover:bg-card border border-border/50 hover:border-primary/50 text-xs text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm group"
            >
              <span className="text-primary font-semibold transition-transform group-hover:-translate-x-0.5">←</span>
              <span>Back to Home</span>
            </a>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1">
        {children}
      </main>



      {/* ── WhatsApp Float (left side) with Official Pixel-Perfect Vector ── */}
      <a
        href="https://wa.me/918838819820?text=Hi%20Glow%20%26%20Glam%20Studio!%20I'd%20like%20to%20inquire%20about%20a%20booking."
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-5 left-4 md:left-6 z-[200] flex items-center gap-2.5"
        aria-label="Chat with us on WhatsApp"
      >
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] shadow-[0_6px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_35px_rgba(37,211,102,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 md:w-7 md:h-7 fill-white relative z-10"
            aria-hidden="true"
          >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 18.16c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.13 8.13 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.23 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.14-.56.11-.16.25-.64.81-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.37 1 2.53c.13.16 1.72 2.63 4.17 3.68.58.25 1.04.4 1.39.51.58.18 1.12.16 1.54.1.46-.07 1.43-.58 1.63-1.15.21-.57.21-1.06.15-1.15-.06-.1-.22-.16-.47-.28z"/>
          </svg>
        </div>
        <span className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 text-foreground border border-border/60 text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none backdrop-blur-sm whitespace-nowrap">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
