import { Button } from "@/components/ui/button";
import { CardFanCarousel } from "@/components/CardFanCarousel";
import { Reveal } from "@/components/Layout";
import {
  VanityRing,
  BrushIcon,
  LipstickIcon,
  PaletteIcon,
  BlushIcon
} from "@/components/StudioEffects";

import galleryCover from '@/assets/images/hero/01-bridal-radiance.webp';
import packagesCover from '@/assets/images/hero/02-evening-glam.webp';
import aboutCover from '@/assets/images/about/02-studio-glow.webp';
import bookCover from '@/assets/images/hero/03-dewy-perfection.webp';

const NAV_CARDS = [
  {
    id: 'gallery',
    title: 'Gallery',
    subtitle: 'Curated Portfolios',
    description: 'Explore 6 bespoke collections from sacred temple bridal to high-fashion reception & editorial glamour.',
    badge: '6 Collections • 28 Looks',
    href: '/portfolio.html',
    image: galleryCover,
    action: 'Explore Gallery',
    Icon: PaletteIcon,
  },
  {
    id: 'packages',
    title: 'Packages',
    subtitle: 'Transparent Pricing',
    description: 'Bespoke bridal, reception, and party packages tailored with HD airbrushing, draping, and styling.',
    badge: 'Starting ₹18,000',
    href: '/packages.html',
    image: packagesCover,
    action: 'View Packages',
    Icon: BlushIcon,
  },
  {
    id: 'about',
    title: 'About Studio',
    subtitle: 'Artistry & Craft',
    description: 'Over 8 years mastering the "Quiet Glow". An intentional, serene sanctuary for brides in Chennai.',
    badge: '500+ Brides • 8+ Yrs',
    href: '/about.html',
    image: aboutCover,
    action: 'Our Philosophy',
    Icon: BrushIcon,
  },
  {
    id: 'book-now',
    title: 'Book Now',
    subtitle: 'Reserve Your Date',
    description: 'Direct date availability check, personal consultation, and customized bridal scheduling.',
    badge: 'Weekend Slots Limited',
    href: '/book-now.html',
    image: bookCover,
    action: 'Reserve Now',
    Icon: LipstickIcon,
  },
];

export function Home() {
  return (
    <div className="relative">
      {/* ── HERO ── */}
      <section 
        className="relative min-h-[450px] md:min-h-[85svh] lg:min-h-[100svh] flex flex-col items-center justify-center text-center px-4 md:px-6 pt-2 pb-12 mb-32 md:mb-0 lg:mb-[450px]"
        style={{ overflowX: 'clip', overflowY: 'visible' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[600px] sm:h-[600px] md:w-[850px] md:h-[850px] lg:w-[1350px] lg:h-[1150px] pointer-events-none">
          <VanityRing count={28} />
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(ellipse,hsl(28_55%_58%/0.14)_0%,hsl(38_40%_65%/0.05)_45%,transparent_70%)]" />
          
          {/* ── DESKTOP: Cards positioned on the necklace nodes ── */}
          <div className="hidden lg:block pointer-events-auto">
            {NAV_CARDS.map((card, idx) => {
              // Mathematically perfectly spaced points on the curve (distance of 3.5 nodes between each card)
              // Center of necklace is exactly at index 7. 
              // 7 + 1.75 = 8.75 (Left Inner)
              // 7 - 1.75 = 5.25 (Right Inner)
              // 8.75 + 3.5 = 12.25 (Left Outer)
              // 5.25 - 3.5 = 1.75 (Right Outer)
              const nodeIndices = [12.25, 8.75, 5.25, 1.75]; 
              const nodeIndex = nodeIndices[idx];
              const angle = (nodeIndex / 28) * 360;
              const rad = (angle * Math.PI) / 180;
              // VanityRing uses r=46. We use r=48 here and translate downward so they hang like pendants below the stars
              const r = 48; 
              
              const left = `${50 + r * Math.cos(rad)}%`;
              const top = `${50 + r * Math.sin(rad)}%`;

              return (
                <a
                  key={card.id}
                  href={card.href}
                  className="absolute w-[260px] h-[360px] flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 transition-all duration-500 hover:border-primary/70 hover:shadow-[0_12px_40px_hsl(28_55%_58%/0.25)] hover:-translate-y-2 cursor-pointer group z-20"
                  style={{
                    left,
                    top,
                    transform: 'translate(-50%, 55px)',
                  }}
                >
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10 group-hover:via-background/70 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(28_55%_58%/0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] tracking-wider uppercase font-medium bg-background/70 backdrop-blur-md border border-primary/40 text-primary shadow-sm">
                      {card.badge}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-background/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary group-hover:border-primary/60 group-hover:scale-110 transition-all duration-300">
                      <card.Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="relative z-10 pt-12">
                    <span className="nav-label text-[9px] text-primary tracking-widest uppercase block mb-1">
                      {card.subtitle}
                    </span>
                    <h3 className="font-display text-xl font-light text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light mb-4 line-clamp-3">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border/30 text-primary font-medium text-[10px] tracking-wider uppercase">
                      <span>{card.action}</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-bold">→</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-3 mt-4 md:mt-0 mb-4 md:mb-6 fade-in relative z-10 max-w-[260px] md:max-w-none mx-auto text-center">
          <BrushIcon className="hidden md:block w-4 h-4 md:w-5 md:h-5 text-primary -rotate-45" />
          <span className="nav-label text-primary tracking-[0.15em] md:tracking-[0.25em] text-[9px] md:text-xs uppercase leading-relaxed">
            Signature Bridal & Editorial Artistry
          </span>
          <BrushIcon className="hidden md:block w-4 h-4 md:w-5 md:h-5 text-primary rotate-45" />
        </div>

        <h1 className="relative z-10 font-display font-light text-[2.6rem] sm:text-6xl md:text-8xl lg:text-9xl leading-[0.92] tracking-tight fade-in max-w-5xl mb-5 md:mb-7">
          The Art of a<br />
          <span className="text-shimmer italic">Quiet Glow.</span>
        </h1>

        <div className="absolute top-[calc(50%+190px)] left-0 w-full px-4 md:relative md:top-auto md:w-auto md:px-0 z-10 md:mb-10">
          <p className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-[300px] sm:max-w-md md:max-w-2xl mx-auto fade-in leading-relaxed font-light">
            Futuristic precision meets timeless grace. Bespoke makeup, hair architecture, and couture styling 
            for brides who prefer subtle luxury over heavy masking.
          </p>
        </div>
      </section>

      {/* ── MOBILE: 4 NAVIGATION CARDS GRID ── */}
      <section className="py-8 md:py-16 px-4 md:px-6 relative z-20 lg:hidden mt-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LipstickIcon className="w-4 h-4 text-primary" />
                <span className="nav-label text-primary text-[10px] md:text-xs">Explore the Studio</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light">
                Discover <span className="text-shimmer italic">Glow & Glam.</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm max-w-md font-light">
              Select an experience below to browse our photo galleries, transparent service packages, studio philosophy, or secure your date.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {NAV_CARDS.map((card) => (
              <a
                key={card.id}
                href={card.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 min-h-[360px] transition-all duration-500 hover:border-primary/70 hover:shadow-[0_12px_40px_hsl(28_55%_58%/0.25)] hover:-translate-y-1.5 cursor-pointer"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10 group-hover:via-background/70 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(28_55%_58%/0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                <div className="relative z-10 flex items-start justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-medium bg-background/70 backdrop-blur-md border border-primary/40 text-primary shadow-sm">
                    {card.badge}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary group-hover:border-primary/60 group-hover:scale-110 transition-all duration-300">
                    <card.Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative z-10 pt-12">
                  <span className="nav-label text-[10px] text-primary tracking-widest uppercase block mb-1">
                    {card.subtitle}
                  </span>
                  <h3 className="font-display text-2xl font-light text-foreground group-hover:text-primary transition-colors duration-300 mb-2.5">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light mb-5 line-clamp-3">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/30 text-primary font-medium text-xs tracking-wider uppercase">
                    <span>{card.action}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-bold">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>



      {/* ── STUDIO MOMENTS (CARD FAN CAROUSEL) ── */}
      <Reveal>
        <CardFanCarousel
          category="about"
          title="Studio Moments"
          description="Glide through our signature transformations — each look sculpted with restraint and quiet radiance."
        />
      </Reveal>

      {/* ── CTA ── */}
      <section className="py-12 md:py-20 px-4 md:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,hsl(28_55%_58%/0.1)_0%,transparent_70%)] pointer-events-none" />
        <Reveal className="relative container mx-auto">
          <BrushIcon className="w-7 h-7 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4 -rotate-12" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-6xl font-light mb-3 md:mb-4">
            Your moment, <br/><span className="text-shimmer italic">flawlessly rendered.</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg mb-6 md:mb-8 leading-relaxed max-w-xs sm:max-w-sm md:max-w-lg mx-auto font-light">
            Weekend slots fill weeks in advance. Reserve your bridal or celebration date today.
          </p>
          <Button size="lg" className="btn-lipstick text-sm md:text-base px-6 md:px-8 py-5 md:py-6 w-full max-w-xs sm:w-auto" asChild>
            <a href="/book-now.html" className="flex items-center justify-center gap-2">
              <LipstickIcon className="w-4 h-4 md:w-5 md:h-5" />
              Book a Consultation
            </a>
          </Button>
        </Reveal>
      </section>
    </div>
  );
}

