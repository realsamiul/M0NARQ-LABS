/*
══════════════════════════════════════════════════════════════════
M0NARQ AI - PREMIUM ANIMATION SYSTEM v2.2 PERFORMANCE
✅ Removed: Bloom filters, aggressive parallax
✅ Optimized: Video IO, scroll class throttling
✅ Added: GPU acceleration hints, passive listeners
══════════════════════════════════════════════════════════════════
*/

class M0NARQ_Animations {
  constructor() {
    this.killLoader();

    if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      console.error('❌ GSAP/Lenis missing');
      return;
    }

    this.initGSAP();
    this.initLenis();
    this.initMenu();
    this.initVideoIO();
    this.initHeaderBlend();
    this.initHoverEffects();
    this.detectPage();
    this.animatePageEntry();

    // Delay heavy scroll animations
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1));
    idle(() => {
      this.initScrollAnimations();
      ScrollTrigger.refresh();
    });

    this.handleResize();
  }

  /* ════════════════════════════════════════════════════════════
     LOADER
     ═══════════════════════════════════════════════════════════ */
  killLoader() {
    document.querySelectorAll('.loader,[data-loader]').forEach(l => l.remove());
    document.body.style.opacity = '1';
    console.log('✅ Loader removed');
  }

  /* ════════════════════════════════════════════════════════════
     GSAP CORE
     ═══════════════════════════════════════════════════════════ */
  initGSAP() {
    gsap.registerPlugin(ScrollTrigger, CustomEase);

    CustomEase.create('customGentle', 'M0,0 C0,0.202 0.204,1 1,1');
    CustomEase.create('customStrong', 'M0,0 C0.496,0.004 0,1 1,1');

    gsap.defaults({ ease: 'power2.out', duration: 0.6 });
    
    // ✅ Global GPU acceleration hint
    gsap.config({
      force3D: true,
      nullTargetWarn: false
    });
    
    console.log('✅ GSAP ready');
  }

  /* ════════════════════════════════════════════════════════════
     LENIS SMOOTH SCROLL (✅ OPTIMIZED)
     ═══════════════════════════════════════════════════════════ */
  initLenis() {
    this.lenis = new Lenis({
      duration: 0.7,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false
    });

    const raf = time => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    
    this.lenis.on('scroll', ScrollTrigger.update);

    // ✅ FIXED: Throttled scroll class (debounced to 16ms ~= 60fps)
    let scrollTicking = false;
    let scrollTimeout;
    
    this.lenis.on('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          document.documentElement.classList.add('is-scrolling');
          scrollTicking = false;
        });
        scrollTicking = true;
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 150);
    });

    console.log('✅ Lenis (optimized)');
  }

  /* ════════════════════════════════════════════════════════════
     MENU
     ═══════════════════════════════════════════════════════════ */
  initMenu() {
    const btn = document.querySelector('.menu-button');
    const overlay = document.querySelector('.menu-overlay');
    const burger = document.querySelector('.burger');
    const lines = document.querySelectorAll('.burger-line');
    const items = document.querySelectorAll('.menu-item');
    
    if (!btn || !overlay) {
      console.warn('⚠️ Menu elements missing');
      return;
    }

    let open = false;

    btn.addEventListener('click', () => {
      open = !open;
      open ? this.openMenu(overlay, burger, lines, items) 
           : this.closeMenu(overlay, burger, lines, items);
    });

    items.forEach(li => li.addEventListener('click', () => {
      if (open) {
        this.closeMenu(overlay, burger, lines, items);
        open = false;
      }
    }));

    console.log('✅ Menu ready');
  }

  openMenu(ov, burger, lines, items) {
    this.lenis.stop();
    gsap.fromTo(ov,
      { clipPath: 'circle(0% at 100% 0%)' },
      { clipPath: 'circle(141.42% at 100% 0%)', duration: 0.8, ease: 'power3.inOut' }
    );
    ov.classList.add('is-active');
    burger.classList.add('is-active');

    const [t, m, b] = lines;
    gsap.to(t, { y: 8, rotation: 45, duration: 0.3 });
    gsap.to(m, { autoAlpha: 0, duration: 0.1 });
    gsap.to(b, { y: -8, rotation: -45, duration: 0.3 });

    gsap.fromTo(items,
      { autoAlpha: 0, y: 30, rotation: -5 },
      { autoAlpha: 1, y: 0, rotation: 0, stagger: 0.08, duration: 0.6, delay: 0.3 }
    );
  }

  closeMenu(ov, burger, lines, items) {
    this.lenis.start();
    gsap.to(ov, {
      clipPath: 'circle(0% at 100% 0%)',
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => ov.classList.remove('is-active')
    });
    burger.classList.remove('is-active');

    const [t, m, b] = lines;
    gsap.to(t, { y: 0, rotation: 0, duration: 0.3 });
    gsap.to(m, { autoAlpha: 1, duration: 0.2 });
    gsap.to(b, { y: 0, rotation: 0, duration: 0.3 });
    gsap.to(items, { autoAlpha: 0, duration: 0.2 });
  }

  /* ════════════════════════════════════════════════════════════
     VIDEO AUTOPLAY (✅ OPTIMIZED - Removed play/pause on scroll)
     ═══════════════════════════════════════════════════════════ */
  initVideoIO() {
    const vids = document.querySelectorAll('.project-video');
    if (!vids.length) return;

    // ✅ FIXED: Only preload, no auto-play on scroll
    const preloadIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const v = e.target;
            v.preload = 'metadata';
            v.load();
            obs.unobserve(v);
          }
        });
      },
      { rootMargin: '200px' }
    );

    vids.forEach(v => {
      v.preload = 'none';
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      preloadIO.observe(v);
    });

    console.log('✅ Video IO (preload only)');
  }

  /* ════════════════════════════════════════════════════════════
     HEADER MIX-BLEND (hero only)
     ═══════════════════════════════════════════════════════════ */
  initHeaderBlend() {
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero-section,.project-hero,.page-hero');
    if (!header || !hero) return;

    new IntersectionObserver(
      ([e]) => {
        document.body.classList.toggle('is-at-hero', e.isIntersecting);
      },
      { threshold: 0.1 }
    ).observe(hero);

    console.log('✅ Header blend observer');
  }

  /* ════════════════════════════════════════════════════════════
     BUTTON HOVER EFFECTS
     ═══════════════════════════════════════════════════════════ */
  initHoverEffects() {
    document.querySelectorAll('.button').forEach(btn => {
      const arr = btn.querySelector('.arrow');
      if (!arr) return;
      btn.addEventListener('mouseenter', () => gsap.to(arr, { x: 5, duration: 0.3 }));
      btn.addEventListener('mouseleave', () => gsap.to(arr, { x: 0, duration: 0.3 }));
    });
    console.log('✅ Button hover');
  }

  /* ════════════════════════════════════════════════════════════
     HERO / PAGE ENTRY
     ═══════════════════════════════════════════════════════════ */
  animatePageEntry() {
    const lines = gsap.utils.toArray('.hero-title .title-line,.project-title-main .title-line');
    const media = document.querySelector('.hero-section .image-wrapper img,.page-hero .image-wrapper img,.project-hero .hero-video');
    const meta = gsap.utils.toArray('.hero-subtitle,.project-subtitle,.hero-section .stats li');

    const tl = gsap.timeline({ defaults: { ease: 'customGentle' } });
    
    if (lines.length) {
      tl.from(lines, { 
        autoAlpha: 0, 
        rotation: 7, 
        yPercent: 100, 
        stagger: 0.12, 
        duration: 1,
        force3D: true  // ✅ GPU acceleration
      });
    }
    
    if (media) {
      tl.from(media, { scale: 1.3, duration: 1.2, force3D: true }, 0);
    }
    
    if (meta.length) {
      tl.from(meta, { autoAlpha: 0, y: 20, stagger: 0.15, duration: 0.8 }, 0.4);
    }
  }

  /* ════════════════════════════════════════════════════════════
     SCROLLTRIGGER ANIMATIONS (✅ PERFORMANCE OPTIMIZED)
     ═══════════════════════════════════════════════════════════ */
  initScrollAnimations() {

    // ✅ Title split
    ScrollTrigger.batch('[data-animate="title-split"] .title-line', {
      start: 'top 80%',
      onEnter: b => gsap.fromTo(b,
        { autoAlpha: 0, rotation: 7, yPercent: 100 },
        { 
          autoAlpha: 1, 
          rotation: 0, 
          yPercent: 0, 
          stagger: 0.1, 
          duration: 1, 
          ease: 'customGentle',
          force3D: true
        }
      )
    });

    // ✅ Fade-up
    gsap.set('[data-animate="fade-up"]', { autoAlpha: 0, y: 30 });
    ScrollTrigger.batch('[data-animate="fade-up"]', {
      start: 'top 85%',
      onEnter: b => gsap.to(b, { 
        autoAlpha: 1, 
        y: 0, 
        stagger: 0.08, 
        duration: 0.6,
        force3D: true
      })
    });

    // ✅ Stagger children
    ScrollTrigger.batch('[data-stagger-children]', {
      start: 'top 70%',
      onEnter: batch => {
        batch.forEach(p => {
          const kids = p.querySelectorAll('[data-animate]');
          gsap.fromTo(kids,
            { autoAlpha: 0, y: 30, scale: 0.95 },
            { 
              autoAlpha: 1, 
              y: 0, 
              scale: 1, 
              stagger: { amount: 0.8 }, 
              duration: 0.8,
              force3D: true
            }
          );
        });
      }
    });

    // ✅ REMOVED: Bloom filter (was causing paint issues)

    // ✅ OPTIMIZED: Simplified parallax (fewer elements, clamped range)
    gsap.utils.toArray('[data-parallax]').forEach(el => {
      const sp = parseFloat(el.dataset.parallax || 0.3); // ✅ Reduced default
      gsap.to(el, {
        y: () => -100 * sp,  // ✅ Fixed range instead of viewport-based
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1  // ✅ Changed from true to 1 (smoothing)
        }
      });
    });

    // ✅ Project cards
    gsap.set('.project-card', { autoAlpha: 0, y: 80, scale: 0.95 });
    ScrollTrigger.batch('.project-card', {
      start: 'top 80%',
      onEnter: b => gsap.to(b, { 
        autoAlpha: 1, 
        y: 0, 
        scale: 1, 
        stagger: 0.15, 
        duration: 1,
        force3D: true
      })
    });

    // ✅ Footer
    const f = document.querySelector('.footer');
    if (f) {
      gsap.fromTo(f,
        { y: 100, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          force3D: true,
          scrollTrigger: { trigger: f, start: 'top 90%' }
        }
      );
    }

    console.log('✅ Scroll animations (optimized)');
  }

  /* ════════════════════════════════════════════════════════════
     PAGE-SPECIFIC
     ═══════════════════════════════════════════════════════════ */
  detectPage() {
    const b = document.body;
    if (b.classList.contains('page-home')) this.initHomepage();
    if (b.classList.contains('page-studio')) this.initStudioPage();
    if (b.classList.contains('page-story')) this.initStoryPage();
    if (b.classList.contains('page-project')) this.initProjectPage();
  }

  initHomepage() {
    document.querySelectorAll('.stat-value').forEach(stat => {
      const val = parseFloat(stat.textContent);
      if (isNaN(val)) return;
      gsap.fromTo(stat,
        { textContent: 0 },
        {
          textContent: val,
          duration: 2,
          ease: 'power1.out',
          snap: { textContent: 1 },
          scrollTrigger: { trigger: stat, start: 'top 80%' }
        }
      );
    });
  }

  initStudioPage() {}
  initStoryPage() {}
  initProjectPage() {}

  /* ════════════════════════════════════════════════════════════
     RESIZE (✅ Throttled)
     ═══════════════════════════════════════════════════════════ */
  handleResize() {
    let ticking = false;
    window.addEventListener('resize', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });  // ✅ Passive listener
  }

  refresh() {
    ScrollTrigger.refresh();
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => st.kill());
    gsap.globalTimeline.clear();
    this.lenis && this.lenis.destroy();
  }
}

/* ═════════════════════════════════════════════════════════════
   INITIALIZE
   ═════════════════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new M0NARQ_Animations());
} else {
  new M0NARQ_Animations();
}