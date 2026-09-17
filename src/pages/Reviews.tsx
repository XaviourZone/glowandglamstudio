import React, { useState, useRef, useEffect } from "react";
import contentData from "@/data/content.json";
import { Reveal } from "@/components/Layout";
import { BrushIcon } from "@/components/StudioEffects";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Sparkles,
  Star,
  ChevronDown,
  Check,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

// Load review avatars dynamically
const avatarModules = import.meta.glob<string>(
  '/src/assets/images/model-photoshoot/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default' }
);
const avatarUrls = Object.values(avatarModules);

interface ReviewItem {
  name: string;
  text: string;
  event: string;
  date: string;
  rating: number;
}

// 3D Perspective Tilt Card with Mouse Spotlight
function TiltReviewCard({ review, avatar }: { review: ReviewItem; avatar?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const rect = cardRef.current?.getBoundingClientRect();
  const width = rect?.width || 350;
  const height = rect?.height || 280;
  const rotateX = isHovered ? -((coords.y - height / 2) / (height / 2)) * 7 : 0;
  const rotateY = isHovered ? ((coords.x - width / 2) / (width / 2)) * 7 : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: width / 2, y: height / 2 });
      }}
      className="relative rounded-xl p-8 transition-all duration-300 ease-out preserve-3d will-change-transform border border-border/40 hover:border-primary/60 bg-card/40 hover:bg-card/70 flex flex-col justify-between h-full group shadow-lg hover:shadow-2xl overflow-hidden"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, border-color 0.3s ease',
      }}
    >
      {/* Dynamic Cursor Spotlight inside the card */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, hsl(28 55% 58% / 0.15), transparent 70%)`,
          }}
        />
      )}

      {/* Decorative Gold Watermark Quote Icon */}
      <span className="absolute top-6 right-6 font-display text-7xl text-primary/10 select-none pointer-events-none leading-none -translate-y-2">
        “
      </span>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            {[...Array(review.rating)].map((_, j) => (
              <span key={j} className="text-primary text-base drop-shadow-[0_0_6px_hsl(28_55%_58%/0.5)]">
                ★
              </span>
            ))}
          </div>
          <span className="nav-label text-[10px] text-primary/90 bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>✦</span> Verified Bride
          </span>
        </div>

        <p className="text-foreground/90 text-base md:text-lg leading-relaxed italic mb-6 font-light">
          "{review.text}"
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
        <div className="flex items-center gap-3.5">
          {avatar ? (
            <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/50 p-0.5 bg-background shadow-md flex-shrink-0">
              <img
                src={avatar}
                alt={review.name}
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-display text-base flex-shrink-0">
              {review.name[0]}
            </div>
          )}
          <div>
            <h4 className="font-display text-lg text-foreground font-normal group-hover:text-primary transition-colors">
              {review.name}
            </h4>
            <p className="nav-label text-primary/90 text-[11px] mt-0.5 tracking-wider">
              {review.event}
            </p>
          </div>
        </div>

        <span className="nav-label text-muted-foreground/60 text-xs">
          {review.date}
        </span>
      </div>
    </div>
  );
}

// Review services with curated tags & descriptions matching Forms.tsx theme
const REVIEW_SERVICES = [
  {
    id: "Bridal Makeup",
    label: "Bridal Makeup",
    tag: "Signature Bride",
    desc: "Complete ceremonial bridal transformation with luxury skin prep & veil setting.",
  },
  {
    id: "Reception Makeup",
    label: "Reception Makeup",
    tag: "High Glam",
    desc: "Luminous evening glam, dramatic eyes & long-lasting camera-ready finish.",
  },
  {
    id: "Party Glam Makeup",
    label: "Party Glam Makeup",
    tag: "Event Guest",
    desc: "Cocktail, sangeet, and red-carpet glam tailored to your celebration ensemble.",
  },
  {
    id: "Engagement Makeup",
    label: "Engagement Makeup",
    tag: "Daytime Glow",
    desc: "Dewy, romantic aesthetics engineered for morning light and intimate ceremonies.",
  },
  {
    id: "Hairstyling & Saree Draping",
    label: "Hairstyling & Saree Draping",
    tag: "Artisanal Styling",
    desc: "Traditional braid styling, modern textured updos & ironed pleat pinning.",
  },
  {
    id: "Bridal Trial Session",
    label: "Bridal Trial Session",
    tag: "Preview",
    desc: "Pre-wedding studio preview, look consultation and customized shade matching.",
  },
];

interface ReviewServiceDropdownProps {
  value: string;
  onChange: (serviceId: string) => void;
}

function ReviewServiceDropdown({ value, onChange }: ReviewServiceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const selectedService =
    REVIEW_SERVICES.find((s) => s.id === value) || REVIEW_SERVICES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 px-3.5 rounded-lg border bg-[#100D0B] text-foreground text-xs md:text-sm flex items-center justify-between transition-all outline-none text-left relative z-10",
          isOpen
            ? "border-primary ring-1 ring-primary/40 bg-[#16120F]"
            : "border-border/60 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/40"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="font-medium text-foreground truncate">
            {selectedService.label}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary border border-primary/30 font-medium flex-shrink-0">
            {selectedService.tag}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-primary transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Smooth Ambient Dimmed Backdrop & Dropdown Animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="review-dropdown-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown Menu Options - 100% Solid Obsidian Surface, Zero Glare, High Contrast */}
            <motion.div
              key="review-dropdown-menu"
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border-2 border-primary/50 bg-[#120F0D] shadow-[0_30px_70px_rgba(0,0,0,0.98),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-black overflow-hidden p-2 space-y-1.5 max-h-[320px] overflow-y-auto isolate"
            >
              {REVIEW_SERVICES.map((svc) => {
                const isSelected = svc.id === value;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      onChange(svc.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all duration-150 flex items-start justify-between gap-3 group border",
                      isSelected
                        ? "bg-[#261B13] border-primary/70 text-white shadow-sm"
                        : "bg-[#181310] border-white/5 hover:bg-[#221914] hover:border-primary/40 text-zinc-300 hover:text-white"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-xs md:text-sm group-hover:text-primary transition-colors text-white">
                          {svc.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-primary border border-primary/30">
                          {svc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-snug line-clamp-2">
                        {svc.desc}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border",
                        isSelected
                          ? "bg-primary border-primary text-black font-bold"
                          : "border-white/20 text-transparent group-hover:border-primary/50"
                      )}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const RATING_CHIPS = [
  { val: "5", label: "5 Stars · Exceptional" },
  { val: "4", label: "4 Stars · Great" },
  { val: "3", label: "3 Stars · Good" },
];

export function Reviews() {
  const { reviews } = contentData;
  const [filter, setFilter] = useState("All");

  // Review submission form state
  const [revForm, setRevForm] = useState({
    name: "",
    event: "Bridal Makeup",
    rating: "5",
    text: "",
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const categories = ["All", "Bridal", "Reception", "Party", "Trial"];

  const filteredReviews = filter === "All"
    ? reviews
    : reviews.filter((r) => r.event.toLowerCase().includes(filter.toLowerCase()));

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stars = "★".repeat(parseInt(revForm.rating));
    const message =
      `✨ *GLOW & GLAM STUDIO - CLIENT TESTIMONIAL* ✨\n\n` +
      `👤 *Client Name:* ${revForm.name}\n` +
      `💄 *Service / Event:* ${revForm.event}\n` +
      `⭐ *Rating:* ${stars} (${revForm.rating}/5)\n` +
      `💬 *Feedback:* "${revForm.text}"\n\n` +
      `_Sent directly from glowandglamstudio.in review portal_`;

    const waUrl = `https://wa.me/918838819820?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="pb-16">
      <section className="relative py-16 md:py-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-[radial-gradient(ellipse,hsl(28_55%_58%/0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4 fade-in">
            <BrushIcon className="w-5 h-5 text-primary" />
            <span className="nav-label text-primary">Client Stories</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-light mb-4 fade-in">
            Testimonials
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed fade-in font-light mb-8">
            Genuine words from brides and clients who trusted our "Quiet Glow" artistry.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 mb-10 fade-in">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "nav-label text-xs px-4 py-1.5 rounded-full border transition-all duration-300",
                  filter === cat
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_hsl(28_55%_58%/0.5)]"
                    : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card/30"
                )}
              >
                {cat} Looks
              </button>
            ))}
          </div>

          {/* 3D Tilt Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReviews.map((r, i) => (
              <Reveal key={r.name + i}>
                <TiltReviewCard
                  review={r}
                  avatar={avatarUrls[i % avatarUrls.length]}
                />
              </Reveal>
            ))}
          </div>

          {/* WhatsApp Direct Review Submission Form - Redesigned to Luxury Atelier Theme */}
          <Reveal className="mt-20">
            <div className="powder-card rounded-2xl border-2 border-primary/40 bg-[#161310]/95 backdrop-blur-xl p-6 sm:p-9 md:p-11 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_hsl(28_55%_58%/0.12)] ring-1 ring-primary/25 w-full space-y-6">
              {/* Form Header */}
              <div className="border-b border-border/30 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="nav-label text-[10px] text-primary tracking-[0.25em] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Client Wall of Fame · Testimonial Portal
                  </span>
                  <span className="text-[10px] text-primary/80 border border-primary/40 px-2.5 py-0.5 rounded-full bg-primary/10">
                    Direct WhatsApp Submission
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-light text-foreground">
                  Share Your Quiet Glow Experience
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground font-light mt-1.5 leading-relaxed">
                  Were you a Glow & Glam bride or celebration client? Send your words directly to our artist hotline on WhatsApp to be featured on our curated wall.
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                {/* Row 1: Client Name & Service Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="nav-label text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3 h-3 text-primary" /> Client Name *
                    </label>
                    <input
                      type="text"
                      value={revForm.name}
                      onChange={(e) => setRevForm({ ...revForm, name: e.target.value })}
                      placeholder="e.g. Divya Natarajan"
                      required
                      className="w-full h-11 px-3.5 rounded-lg border border-border/60 bg-[#100D0B] text-foreground text-xs md:text-sm placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="nav-label text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" /> Service / Look *
                      </label>
                      <span className="text-[10px] text-primary/70 font-light hidden sm:inline">
                        click to select look
                      </span>
                    </div>
                    <ReviewServiceDropdown
                      value={revForm.event}
                      onChange={(serviceId) => setRevForm({ ...revForm, event: serviceId })}
                    />
                  </div>
                </div>

                {/* Row 2: Star Rating (Interactive Glowing Gold Stars + Centered Chips) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="nav-label text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-primary fill-primary" /> Overall Experience & Artistry Rating
                    </label>
                    <span className="text-xs font-display text-primary font-medium">
                      {revForm.rating === "5" && "★★★★★ 5.0 / 5 · Exceptional"}
                      {revForm.rating === "4" && "★★★★☆ 4.0 / 5 · Great"}
                      {revForm.rating === "3" && "★★★☆☆ 3.0 / 5 · Good"}
                      {revForm.rating === "2" && "★★☆☆☆ 2.0 / 5 · Fair"}
                      {revForm.rating === "1" && "★☆☆☆☆ 1.0 / 5 · Needs Improvement"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/60 bg-[#100D0B] flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* 5 Interactive Clickable Stars with Hover Glow */}
                    <div
                      className="flex items-center gap-1.5"
                      onMouseLeave={() => setHoverRating(null)}
                    >
                      {[1, 2, 3, 4, 5].map((starNum) => {
                        const activeLevel = hoverRating !== null ? hoverRating : parseInt(revForm.rating, 10);
                        const isFilled = activeLevel >= starNum;
                        return (
                          <button
                            key={starNum}
                            type="button"
                            onClick={() => setRevForm({ ...revForm, rating: starNum.toString() })}
                            onMouseEnter={() => setHoverRating(starNum)}
                            className="p-1 rounded-md transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                            aria-label={`${starNum} Stars`}
                          >
                            <Star
                              className={cn(
                                "w-6 h-6 transition-all duration-150",
                                isFilled
                                  ? "text-primary fill-primary filter drop-shadow-[0_0_8px_hsl(28_55%_58%/0.65)]"
                                  : "text-zinc-600 hover:text-primary/60"
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick-tap Centered Chips */}
                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                      {RATING_CHIPS.map((chip) => {
                        const isSelected = revForm.rating === chip.val;
                        return (
                          <button
                            key={chip.val}
                            type="button"
                            onClick={() => setRevForm({ ...revForm, rating: chip.val })}
                            className={cn(
                              "h-10 px-3 rounded-lg border text-xs font-medium transition-all duration-150 flex items-center justify-center text-center select-none tracking-wide",
                              isSelected
                                ? "bg-primary/20 border-primary text-primary font-semibold shadow-[0_0_10px_hsl(28_55%_58%/0.2)] ring-1 ring-primary/50"
                                : "bg-[#16120F] border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-[#1C1612]"
                            )}
                          >
                            <span className="truncate leading-none">{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Row 3: Review Textarea */}
                <div className="space-y-1.5">
                  <label className="nav-label text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary" /> Your Review & Experience *
                  </label>
                  <textarea
                    value={revForm.text}
                    onChange={(e) => setRevForm({ ...revForm, text: e.target.value })}
                    placeholder="Tell us about your look, how it lasted throughout your rituals, and your experience with our artistry team..."
                    required
                    rows={4}
                    className="w-full p-3.5 rounded-lg border border-border/60 bg-[#100D0B] text-foreground text-xs md:text-sm placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/40 outline-none transition-all resize-none min-h-[110px]"
                  />
                </div>

                {/* Row 4: Action Button & Trust Guarantee */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="submit"
                    className="w-full h-12 py-3 rounded-xl font-medium text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-[0_4px_20px_hsl(28_55%_58%/0.3)] btn-lipstick"
                    size="lg"
                  >
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Forward Review to WhatsApp (+91 88388 19820) →</span>
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground/75 font-light tracking-wide flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    Verified Client Feature · Direct Artist Review Hotline
                  </p>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

