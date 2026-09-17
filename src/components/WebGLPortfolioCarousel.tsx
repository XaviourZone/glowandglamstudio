import { useEffect, useRef } from 'react';

declare const gsap: any;
declare const THREE: any;

const imageModules = import.meta.glob<string>(
  '/src/assets/images/portfolio-featured/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default' }
);

// Dynamically build slides from whatever images are in portfolio-featured
function buildSlides() {
  return Object.entries(imageModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => {
      const filename = path.split('/').pop() || '';
      const title = filename
        .replace(/\.[^/.]+$/, '')
        .replace(/^\d+-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      return {
        title,
        description: 'Signature bespoke artistry by Glow & Glam Studio.',
        media: src,
      };
    });
}

export function WebGLPortfolioCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unmounted = false;
    let localStopTimer: () => void = () => {};
    let localDispose: () => void = () => {};
    let progressAnimation: any = null;
    let autoSlideTimer: any = null;

    // --- DYNAMIC SCRIPT LOADING ---
    const loadScripts = async () => {
      const loadScript = (src: string, globalName: string) => new Promise<void>((res, rej) => {
        if ((window as any)[globalName]) { res(); return; }
        if (document.querySelector(`script[src="${src}"]`)) {
          const check = setInterval(() => {
            if ((window as any)[globalName]) { clearInterval(check); res(); }
          }, 50);
          setTimeout(() => { clearInterval(check); rej(new Error(`Timeout waiting for ${globalName}`)); }, 10000);
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => { setTimeout(() => res(), 100); };
        s.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });
      
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE');
      } catch (e) {
        console.error('Failed to load base scripts:', e);
      }
      
      if (!unmounted) {
        initApplication();
      }
    };

    const initApplication = async () => {
        const SLIDER_CONFIG: any = {
            settings: {
                transitionDuration: 2.5, autoSlideSpeed: 5000, currentEffect: "glass", currentEffectPreset: "Default",
                globalIntensity: 1.0, speedMultiplier: 1.0, distortionStrength: 1.0, colorEnhancement: 1.0,
                glassRefractionStrength: 1.0, glassChromaticAberration: 1.0, glassBubbleClarity: 1.0, glassEdgeGlow: 1.0, glassLiquidFlow: 1.0,
            }
        };

        // --- GLOBAL STATE ---
        let currentSlideIndex = 0;
        let isTransitioning = false;
        let shaderMaterial: any, renderer: any, scene: any, camera: any;
        let slideTextures: any[] = [];
        let texturesLoaded = false;
        let sliderEnabled = false;
        let rafId: number;

        const SLIDE_DURATION = () => SLIDER_CONFIG.settings.autoSlideSpeed;
        const PROGRESS_UPDATE_INTERVAL = 50;
        const TRANSITION_DURATION = () => SLIDER_CONFIG.settings.transitionDuration;

        const slides = buildSlides();

        // --- SHADERS ---
        const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
        const fragmentShader = `
            uniform sampler2D uTexture1, uTexture2;
            uniform float uProgress;
            uniform vec2 uResolution, uTexture1Size, uTexture2Size;
            uniform float uGlobalIntensity, uSpeedMultiplier, uDistortionStrength, uColorEnhancement;
            uniform float uGlassRefractionStrength, uGlassChromaticAberration, uGlassBubbleClarity, uGlassEdgeGlow, uGlassLiquidFlow;
            varying vec2 vUv;

            vec2 getCoverUV(vec2 uv, vec2 textureSize) {
                vec2 s = uResolution / textureSize;
                float scale = max(s.x, s.y);
                vec2 scaledSize = textureSize * scale;
                vec2 offset = (uResolution - scaledSize) * 0.5;
                return (uv * uResolution - offset) / scaledSize;
            }
            
            vec4 glassEffect(vec2 uv, float progress) {
                float time = progress * 5.0 * uSpeedMultiplier;
                vec2 uv1 = getCoverUV(uv, uTexture1Size); vec2 uv2 = getCoverUV(uv, uTexture2Size);
                float maxR = length(uResolution) * 0.85; float br = progress * maxR;
                vec2 p = uv * uResolution; vec2 c = uResolution * 0.5;
                float d = length(p - c); float nd = d / max(br, 0.001);
                float param = smoothstep(br + 3.0, br - 3.0, d);
                vec4 img;
                if (param > 0.0) {
                     float ro = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity * pow(smoothstep(0.3 * uGlassBubbleClarity, 1.0, nd), 1.5);
                     vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
                     vec2 distUV = uv2 - dir * ro;
                     distUV += vec2(sin(time + nd * 10.0), cos(time * 0.8 + nd * 8.0)) * 0.015 * uGlassLiquidFlow * uSpeedMultiplier * nd * param;
                     float ca = 0.02 * uGlassChromaticAberration * uGlobalIntensity * pow(smoothstep(0.3, 1.0, nd), 1.2);
                     img = vec4(texture2D(uTexture2, distUV + dir * ca * 1.2).r, texture2D(uTexture2, distUV + dir * ca * 0.2).g, texture2D(uTexture2, distUV - dir * ca * 0.8).b, 1.0);
                     if (uGlassEdgeGlow > 0.0) {
                        float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
                        img.rgb += rim * 0.08 * uGlassEdgeGlow * uGlobalIntensity;
                     }
                } else { img = texture2D(uTexture2, uv2); }
                vec4 oldImg = texture2D(uTexture1, uv1);
                if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
                return mix(oldImg, img, param);
            }

            void main() {
                gl_FragColor = glassEffect(vUv, uProgress);
            }
        `;

        // --- CORE FUNCTIONS ---
        const splitText = (text: string) => {
            return text.split('').map((char: string) => `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
        };

        const updateContent = (idx: number) => {
            const titleEl = document.getElementById('mainTitle');
            const descEl = document.getElementById('mainDesc');
            if (titleEl && descEl) {
                 gsap.killTweensOf(titleEl.children);
                 gsap.killTweensOf(descEl);
                 gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.5, stagger: 0.02, ease: "power2.in" });
                 gsap.to(descEl, { y: -10, opacity: 0, duration: 0.4, ease: "power2.in" });
                 
                 setTimeout(() => {
                     if (unmounted) return;
                     titleEl.innerHTML = splitText(slides[idx].title);
                     descEl.textContent = slides[idx].description; 
                     
                     gsap.set(titleEl.children, { opacity: 0 });
                     gsap.set(descEl, { y: 20, opacity: 0 });

                     const children = titleEl.children;
                     gsap.set(children, { filter: "blur(10px)", scale: 1.2, y: 0 });
                     gsap.to(children, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 1, stagger: { amount: 0.5, from: "random" }, ease: "power2.out" });
                     gsap.to(descEl, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power2.out" });
                 }, 500); 
            }
        };

        const navigateToSlide = (targetIndex: number) => {
            if (isTransitioning || targetIndex === currentSlideIndex || unmounted) return;
            stopAutoSlideTimer();
            quickResetProgress(currentSlideIndex);
            
            const currentTexture = slideTextures[currentSlideIndex];
            const targetTexture = slideTextures[targetIndex];
            if (!currentTexture || !targetTexture) return;

            isTransitioning = true;
            shaderMaterial.uniforms.uTexture1.value = currentTexture;
            shaderMaterial.uniforms.uTexture2.value = targetTexture;
            shaderMaterial.uniforms.uTexture1Size.value = currentTexture.userData.size;
            shaderMaterial.uniforms.uTexture2Size.value = targetTexture.userData.size;
            
            updateContent(targetIndex);

            currentSlideIndex = targetIndex;
            updateCounter(currentSlideIndex);
            updateNavigationState(currentSlideIndex);
            
            gsap.fromTo(shaderMaterial.uniforms.uProgress, 
                { value: 0 },
                {
                    value: 1,
                    duration: TRANSITION_DURATION(),
                    ease: "power2.inOut",
                    onComplete: () => {
                        if (unmounted) return;
                        shaderMaterial.uniforms.uProgress.value = 0;
                        shaderMaterial.uniforms.uTexture1.value = targetTexture;
                        shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
                        isTransitioning = false;
                        safeStartTimer(100);
                    }
                }
            );
        };

        const handleSlideChange = () => {
            if (isTransitioning || !texturesLoaded || !sliderEnabled || unmounted) return;
            navigateToSlide((currentSlideIndex + 1) % slides.length);
        };

        const createSlidesNavigation = () => {
            const navs = document.querySelectorAll(".slides-navigation"); 
            if (!navs.length) return;
            navs.forEach(nav => {
                nav.innerHTML = "";
                const isMobile = nav.classList.contains("nav-mobile");
                slides.forEach((slide, i) => {
                    const item = document.createElement("div");
                    if (isMobile) {
                        item.className = `slide-nav-item cursor-pointer relative flex items-center justify-center px-3 py-2.5 border border-border/50 hover:border-border/80 bg-card/20 rounded-xl overflow-hidden flex-1 min-w-[90px] max-w-[130px] transition-all duration-300 group ${i === 0 ? " active" : ""}`;
                        item.innerHTML = `
                          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-transparent z-0"></div>
                          <div class="slide-progress-fill absolute bottom-0 left-0 h-[2px] bg-primary w-0 transition-none z-10"></div>
                          <div class="text-muted-foreground text-[10px] font-medium group-[.active]:text-primary group-hover:text-primary transition-colors text-center line-clamp-1 z-20">${slide.title}</div>
                        `;
                    } else {
                        item.className = `slide-nav-item cursor-pointer flex flex-col items-start gap-1.5 flex-1 min-w-0 max-w-[120px] transition-all duration-300 group ${i === 0 ? " active" : ""}`;
                        item.innerHTML = `
                          <div class="w-full h-0.5 bg-white/20 rounded-full overflow-hidden relative">
                            <div class="slide-progress-fill absolute top-0 left-0 h-full bg-white w-0 transition-none"></div>
                          </div>
                          <div class="text-white/50 text-xs font-medium group-[.active]:text-white group-hover:text-white transition-colors text-left line-clamp-1 z-20 mt-1.5 w-full">${slide.title}</div>
                        `;
                    }
                    item.dataset.slideIndex = String(i);
                    item.addEventListener("click", (e) => {
                        e.stopPropagation();
                        if (!isTransitioning && i !== currentSlideIndex) {
                             stopAutoSlideTimer();
                             quickResetProgress(currentSlideIndex);
                             navigateToSlide(i);
                        }
                    });
                    nav.appendChild(item);
                });
            });
        };

        const updateNavigationState = (idx: number) => {
            if (unmounted) return;
            document.querySelectorAll(".slide-nav-item").forEach(el => el.classList.remove("active"));
            document.querySelectorAll(`.slide-nav-item[data-slide-index="${idx}"]`).forEach(el => el.classList.add("active"));
        };
        const updateSlideProgress = (idx: number, prog: number) => { if (unmounted) return; document.querySelectorAll(`.slide-nav-item[data-slide-index="${idx}"] .slide-progress-fill`).forEach(el => { (el as HTMLElement).style.width = `${prog}%`; (el as HTMLElement).style.opacity = '1'; }); };
        const fadeSlideProgress = (idx: number) => { if (unmounted) return; document.querySelectorAll(`.slide-nav-item[data-slide-index="${idx}"] .slide-progress-fill`).forEach(el => { (el as HTMLElement).style.opacity = '0'; setTimeout(() => { if (!unmounted) (el as HTMLElement).style.width = "0%"; }, 300); }); };
        const quickResetProgress = (idx: number) => { if (unmounted) return; document.querySelectorAll(`.slide-nav-item[data-slide-index="${idx}"] .slide-progress-fill`).forEach(el => { (el as HTMLElement).style.transition = "width 0.2s ease-out"; (el as HTMLElement).style.width = "0%"; setTimeout(() => { if (!unmounted) (el as HTMLElement).style.transition = "width 0.1s ease, opacity 0.3s ease"; }, 200); }); };
        const updateCounter = (idx: number) => { 
            if (unmounted) return;
            const sn = document.getElementById("slideNumber"); if (sn) sn.textContent = String(idx + 1).padStart(2, "0"); 
            const st = document.getElementById("slideTotal"); if (st) st.textContent = String(slides.length).padStart(2, "0"); 
        };

        const startAutoSlideTimer = () => {
             if (!texturesLoaded || !sliderEnabled || unmounted) return;
             stopAutoSlideTimer();
             let progress = 0;
             const increment = (100 / SLIDE_DURATION()) * PROGRESS_UPDATE_INTERVAL;
             progressAnimation = setInterval(() => {
                 if (!sliderEnabled || unmounted) { stopAutoSlideTimer(); return; }
                 progress += increment;
                 updateSlideProgress(currentSlideIndex, progress);
                 if (progress >= 100) {
                     clearInterval(progressAnimation); progressAnimation = null;
                     fadeSlideProgress(currentSlideIndex);
                     if (!isTransitioning) handleSlideChange();
                 }
             }, PROGRESS_UPDATE_INTERVAL);
        };
        
        const stopAutoSlideTimer = () => { 
            if (progressAnimation) clearInterval(progressAnimation); 
            if (autoSlideTimer) clearTimeout(autoSlideTimer); 
            progressAnimation = null; 
            autoSlideTimer = null; 
        };
        
        localStopTimer = stopAutoSlideTimer;
        
        const safeStartTimer = (delay = 0) => { stopAutoSlideTimer(); if (sliderEnabled && texturesLoaded && !unmounted) { if (delay > 0) autoSlideTimer = setTimeout(startAutoSlideTimer, delay); else startAutoSlideTimer(); } };

        const loadImageTexture = (src: string) => new Promise<any>((resolve, reject) => {
             const l = new THREE.TextureLoader();
             l.load(src, (t: any) => { t.minFilter = t.magFilter = THREE.LinearFilter; t.userData = { size: new THREE.Vector2(t.image.width, t.image.height) }; resolve(t); }, undefined, reject);
        });

        const initRenderer = async () => {
            if (unmounted) return;
            const canvas = containerRef.current?.querySelector(".webgl-canvas") as HTMLCanvasElement; if (!canvas) return;
            scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
            
            const container = containerRef.current;
            const width = container ? container.clientWidth : window.innerWidth;
            const height = container ? container.clientHeight : window.innerHeight;
            
            renderer.setSize(width, height); 
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            shaderMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture1: { value: null }, uTexture2: { value: null }, uProgress: { value: 0 },
                    uResolution: { value: new THREE.Vector2(width, height) },
                    uTexture1Size: { value: new THREE.Vector2(1, 1) }, uTexture2Size: { value: new THREE.Vector2(1, 1) },
                    uGlobalIntensity: { value: 1.0 }, uSpeedMultiplier: { value: 1.0 }, uDistortionStrength: { value: 1.0 }, uColorEnhancement: { value: 1.0 },
                    uGlassRefractionStrength: { value: 1.0 }, uGlassChromaticAberration: { value: 1.0 }, uGlassBubbleClarity: { value: 1.0 }, uGlassEdgeGlow: { value: 1.0 }, uGlassLiquidFlow: { value: 1.0 }
                },
                vertexShader, fragmentShader
            });
            scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));
            
            for (const s of slides) { 
                if (unmounted) return;
                try { slideTextures.push(await loadImageTexture(s.media)); } catch { console.warn("Failed texture"); } 
            }
            if (slideTextures.length >= 2 && !unmounted) {
                shaderMaterial.uniforms.uTexture1.value = slideTextures[0];
                shaderMaterial.uniforms.uTexture2.value = slideTextures[1];
                shaderMaterial.uniforms.uTexture1Size.value = slideTextures[0].userData.size;
                shaderMaterial.uniforms.uTexture2Size.value = slideTextures[1].userData.size;
                texturesLoaded = true; sliderEnabled = true;
                safeStartTimer(500);
            }
            
            const render = () => { 
                if (unmounted) return;
                rafId = requestAnimationFrame(render); 
                renderer.render(scene, camera); 
            };
            render();
        };
        
        createSlidesNavigation(); updateCounter(0); 
        
        const tEl = document.getElementById('mainTitle');
        const dEl = document.getElementById('mainDesc');
        if (tEl && dEl) {
            tEl.innerHTML = splitText(slides[0].title);
            dEl.textContent = slides[0].description;
            gsap.fromTo(tEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.5 });
            gsap.fromTo(dEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 });
        }

        initRenderer();
        
        const handleVisibilityChange = () => document.hidden ? stopAutoSlideTimer() : (!isTransitioning && safeStartTimer());
        document.addEventListener("visibilitychange", handleVisibilityChange);
        
        const handleResize = () => { 
            if (renderer && containerRef.current && !unmounted) { 
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;
                renderer.setSize(width, height); 
                shaderMaterial.uniforms.uResolution.value.set(width, height); 
            } 
        };
        window.addEventListener("resize", handleResize);

        localDispose = () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("resize", handleResize);
            if (rafId) cancelAnimationFrame(rafId);
            if (renderer) renderer.dispose();
            if (scene) scene.clear();
        };
    };

    loadScripts();
    
    return () => {
        unmounted = true;
        localStopTimer();
        localDispose();
        if ((window as any).gsap) {
            (window as any).gsap.killTweensOf("#mainTitle");
            (window as any).gsap.killTweensOf("#mainDesc");
        }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative w-full">
        <main className="slider-wrapper relative w-full h-[450px] md:h-[700px] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-primary/20 bg-background" ref={containerRef}>
          <canvas className="webgl-canvas absolute inset-0 w-full h-full z-0 pointer-events-none"></canvas>
          
          <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10 text-white font-display text-xl md:text-2xl drop-shadow-md">
            <span className="slide-number font-medium text-primary" id="slideNumber">01</span>
            <span className="opacity-50 mx-2 text-white/50">/</span>
            <span className="slide-total text-white/80" id="slideTotal">06</span>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-[1] pointer-events-none" />

          <div className="slide-content absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none text-white text-center p-6 md:mt-8">
              <h1 className="slide-title font-display text-4xl md:text-6xl lg:text-7xl mb-3 md:mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]" id="mainTitle"></h1>
              <p className="slide-description text-sm md:text-lg font-light max-w-xl drop-shadow-md opacity-90 text-zinc-100" id="mainDesc"></p>
          </div>

          <nav className="slides-navigation hidden md:flex absolute bottom-8 inset-x-0 z-20 justify-center gap-6 px-6"></nav>
        </main>
        
        {/* Navigation - mobile (outside image) */}
        <nav className="slides-navigation nav-mobile flex md:hidden relative mt-6 flex-wrap justify-center gap-3 px-2"></nav>
      </div>
    </div>
  );
}

