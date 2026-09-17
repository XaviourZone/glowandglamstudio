import React, { useState, useEffect, useRef } from "react";
import { BrushIcon } from "./StudioEffects";
import { Masonry } from "./ui/masonry";
import { cn } from "@/lib/utils";

// Load all portfolio images eagerly via Vite
const imageModules = import.meta.glob<string>(
  '/src/assets/images/portfolio-featured/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default' }
);

export interface PortfolioItem {
  id: string;
  src: string;
  tag: string;
  title: string;
  description: string;
}

// Dynamically build portfolio items from folder contents
function buildPortfolioItems(): PortfolioItem[] {
  return Object.entries(imageModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src], idx) => {
      const filename = path.split('/').pop() || '';
      const title = filename
        .replace(/\.[^/.]+$/, '')
        .replace(/^\d+-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      return {
        id: String(idx + 1),
        src,
        tag: 'Featured',
        title,
        description: 'Signature bespoke artistry by Glow & Glam Studio.',
      };
    });
}

export function CylindricalGallery() {
  const portfolio = buildPortfolioItems();

  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState<"3d" | "grid">("3d");
  const [selectedItem, setSelectedItem] = useState<{ src: string; title: string; tag: string; desc: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const count = portfolio.length;
  const angleStep = 360 / count;
  const radius = 460;

  // Continuous gentle 3D auto-spin when idle
  useEffect(() => {
    if (!autoRotate || isDragging || viewMode !== "3d") {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const spin = () => {
      setRotation((prev) => prev - 0.12);
      animationRef.current = requestAnimationFrame(spin);
    };
    animationRef.current = requestAnimationFrame(spin);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [autoRotate, isDragging, viewMode]);

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setRotation((prev) => prev + deltaX * 0.35);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setAutoRotate(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    setRotation((prev) => prev + deltaX * 0.35);
    setStartX(e.touches[0].clientX);
  };

  const rotateTo = (step: number) => {
    setAutoRotate(false);
    setRotation((prev) => prev + step * angleStep);
  };

  // Close lightbox on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full relative select-none">
      {/* View Switcher & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 container mx-auto px-6">
        <div className="flex items-center gap-2 bg-card/40 border border-border/40 p-1.5 rounded-full backdrop-blur-md">
          <button
            onClick={() => setViewMode("3d")}
            className={cn(
              "nav-label text-xs px-4 py-1.5 rounded-full transition-all duration-300",
              viewMode === "3d"
                ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(28_55%_58%/0.6)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            3D Cylinder View
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "nav-label text-xs px-4 py-1.5 rounded-full transition-all duration-300",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(28_55%_58%/0.6)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Editorial Grid View
          </button>
        </div>

        {viewMode === "3d" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={cn(
                "nav-label text-xs px-3.5 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-1.5",
                autoRotate
                  ? "border-primary/50 text-primary bg-primary/10"
                  : "border-border/40 text-muted-foreground hover:border-primary/40"
              )}
            >
              <span>{autoRotate ? "Auto-Spinning" : "Paused"}</span>
            </button>
            <button
              onClick={() => rotateTo(1)}
              className="w-9 h-9 rounded-full border border-border/50 bg-card/40 hover:border-primary text-foreground hover:text-primary flex items-center justify-center transition-all duration-300"
              aria-label="Rotate Left"
            >
              <BrushIcon className="w-3.5 h-3.5 -rotate-90" />
            </button>
            <button
              onClick={() => rotateTo(-1)}
              className="w-9 h-9 rounded-full border border-border/50 bg-card/40 hover:border-primary text-foreground hover:text-primary flex items-center justify-center transition-all duration-300"
              aria-label="Rotate Right"
            >
              <BrushIcon className="w-3.5 h-3.5 rotate-90" />
            </button>
          </div>
        )}
      </div>

      {viewMode === "3d" ? (
        /* ── MENG TO 3D ROTATING CYLINDER STAGE ── */
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="relative w-full h-[580px] md:h-[640px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ perspective: "1300px" }}
        >
          {/* Ambient center spotlight glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,hsl(28_55%_58%/0.14)_0%,transparent_70%)] pointer-events-none" />

          {/* 3D Cylindrical Ring Container */}
          <div
            className="relative w-[280px] h-[390px] md:w-[310px] md:h-[430px]"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
          >
            {portfolio.map((item, idx) => {
              const cardAngle = idx * angleStep;

              return (
                <div
                  key={item.id}
                  onClick={() =>
                    setSelectedItem({
                      src: item.src,
                      title: item.title,
                      tag: item.tag,
                      desc: item.description,
                    })
                  }
                  className="absolute inset-0 rounded-xl overflow-hidden border border-primary/30 hover:border-primary shadow-[0_15px_40px_rgba(0,0,0,0.7)] group backdrop-blur-md cursor-pointer will-change-transform transition-all duration-300"
                  style={{
                    transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />

                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                  {/* Top Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="nav-label text-[10px] text-primary bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-primary/40">
                      {item.tag}
                    </span>
                  </div>

                  {/* Bottom Text */}
                  <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                    <h3 className="font-display text-xl md:text-2xl text-foreground font-light mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-light">
                      {item.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] nav-label text-primary">
                      <span>Inspect Look</span>
                      <BrushIcon className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-4 text-center text-xs nav-label text-muted-foreground/60 pointer-events-none">
            Drag horizontally to spin 3D gallery
          </div>
        </div>
      ) : (
        /* ── MASONRY GRID VIEW ── */
        <div className="container mx-auto px-6">
          <Masonry
            images={portfolio.map((item) => ({
              src: item.src,
              alt: item.title,
            }))}          />
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity"
          onClick={() => setSelectedItem(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              className="absolute top-4 right-4 z-10 text-white hover:text-primary bg-black/60 rounded-full p-2.5 border border-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(null);
              }}
              aria-label="Close lightbox"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <img
              src={selectedItem.src}
              alt={selectedItem.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-primary/20"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="mt-4 text-center" onClick={(e) => e.stopPropagation()}>
              <span className="nav-label text-xs text-primary">{selectedItem.tag}</span>
              <h4 className="font-display text-2xl text-white font-light mt-1">{selectedItem.title}</h4>
              <p className="text-sm text-gray-300 font-light mt-1 max-w-md">{selectedItem.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

