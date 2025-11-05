/*  ═══════════════════════════════════════════════════════════════
    M0NARQ AI –  PREMIUM ANIMATION SYSTEM  v2.1
    • Lenis smooth-scroll  (0.7 s inertia)
    • IntersectionObserver video autoplay  (no hover)
    • Batched GSAP ScrollTriggers  + Bloom & Parallax
    • Conditional header mix-blend-mode
    • Loader kill + Menu + Button hovers
    • Page-specific counters
    ═══════════════════════════════════════════════════════════════ */

class M0NARQ_Animations {
  constructor () {

    /* -------------------------------------------------- 0. Loader */
    this.killLoader();

    /* -------------------------------------------------- 1. Dependency check */
    if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      console.error('❌  GSAP or Lenis missing – aborting init');
      return;
    }

    /* -------------------------------------------------- 2. Core engines */
    this.initGSAP();
    this.initLenis();

    /* -------------------------------------------------- 3. Feature modules */
    this.initMenu();
    this.initVideoIO();
    this.initHeaderBlend();
    this.initHoverEffects();
    this.detectPage();
    this.animatePageEntry();

    /* -------------------------------------------------- 4. ScrollTriggers (idle load) */
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1));
    idle(() => {
      this.initScrollAnimations();
      ScrollTrigger.refresh();               // final position pass
    });

    /* -------------------------------------------------- 5. Resize handling */
    this.handleResize();
  }

  /* ════════════════════════════════════════════════════════════
     LOADER
     ═══════════════════════════════════════════════════════════ */
  killLoader () {
    document.querySelectorAll('.loader,[data-loader]').forEach(l => l.remove());
    document.body.style.opacity = '1';
    console.log('✅ Loader removed');
  }

  /* ════════════════════════════════════════════════════════════
     GSAP CORE
     ═══════════════════════════════════════════════════════════ */
  initGSAP () {
    gsap.registerPlugin(ScrollTrigger, CustomEase);

    CustomEase.create('customGentle', 'M0,0 C0,0.202 0.204,1 1,1');
    CustomEase.create('customStrong', 'M0,0 C0.496,0.004 0,1 1,1');

    gsap.defaults({ ease: 'power2.out', duration: 0.6 });
    console.log('✅ GSAP ready');
  }

  /* ════════════════════════════════════════════════════════════
     LENIS SMOOTH SCROLL
     ═══════════════════════════════════════════════════════════ */
  initLenis () {
    this.lenis = new Lenis({
      duration : 0.7,
      easing   : t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth   : true,
      smoothTouch : false
    });

    const raf = time => { this.lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    this.lenis.on('scroll', ScrollTrigger.update);

    /* Disable hover while scrolling */
    let to;
    this.lenis.on('scroll', () => {
      document.documentElement.classList.add('is-scrolling');
      clearTimeout(to);
      to = setTimeout(() =>
        document.documentElement.classList.remove('is-scrolling'), 120);
    });

    console.log('✅ Lenis (0.7 s inertia)');
  }

  /* ════════════════════════════════════════════════════════════
     MENU  (unchanged logic)
     ═══════════════════════════════════════════════════════════ */
  initMenu () {
    const btn     = document.querySelector('.menu-button');
    const overlay = document.querySelector('.menu-overlay');
    const burger  = document.querySelector('.burger');
    const lines   = document.querySelectorAll('.burger-line');
    const items   = document.querySelectorAll('.menu-item');
    if (!btn || !overlay) { console.warn('⚠️ No menu elements'); return; }

    let open = false;

    btn.addEventListener('click', () => {
      open = !open;
      open ? this.openMenu(overlay, burger, lines, items)
           : this.closeMenu(overlay, burger, lines, items);
    });

    items.forEach(li => li.addEventListener('click', () => {
      if (open) { this.closeMenu(overlay, burger, lines, items); open = false; }
    }));

    console.log('✅ Menu ready');
  }
  openMenu (ov, burger, lines, items) {
    this.lenis.stop();
    gsap.fromTo(ov, {clipPath:'circle(0% at 100% 0%)'},
                     {clipPath:'circle(141.42% at 100% 0%)',duration:.8,ease:'power3.inOut'});
    ov.classList.add('is-active'); burger.classList.add('is-active');

    const [t,m,b] = lines;
    gsap.to(t,{y:8,  rotation:45, duration:.3});
    gsap.to(m,{autoAlpha:0,duration:.1});
    gsap.to(b,{y:-8, rotation:-45,duration:.3});

    gsap.fromTo(items,
      {autoAlpha:0,y:30,rotation:-5},
      {autoAlpha:1,y:0,rotation:0,stagger:.08,duration:.6,delay:.3});
  }
  closeMenu (ov, burger, lines, items) {
    this.lenis.start();
    gsap.to(ov,{clipPath:'circle(0% at 100% 0%)',duration:.6,ease:'power3.inOut',
      onComplete:()=>ov.classList.remove('is-active')});
    burger.classList.remove('is-active');

    const [t,m,b] = lines;
    gsap.to(t,{y:0,rotation:0,duration:.3});
    gsap.to(m,{autoAlpha:1,duration:.2});
    gsap.to(b,{y:0,rotation:0,duration:.3});
    gsap.to(items,{autoAlpha:0,duration:.2});
  }

  /* ════════════════════════════════════════════════════════════
     VIDEO AUTOPLAY (IntersectionObserver)
     ═══════════════════════════════════════════════════════════ */
  initVideoIO () {
    const vids = document.querySelectorAll('.project-video');
    if (!vids.length) return;

    /* preload metadata a bit early */
    const preloadIO = new IntersectionObserver((es,obs)=>{
      es.forEach(e=>{
        if(e.isIntersecting){
          const v=e.target; v.preload='metadata'; v.load(); obs.unobserve(v);
        }
      });
    },{rootMargin:'300px'});

    /* play / pause based on 60 % visibility */
    const playIO = new IntersectionObserver(es=>{
      es.forEach(e=>{
        const v=e.target;
        e.intersectionRatio>=.6 ? v.play().catch(()=>{}) : v.pause();
      });
    },{threshold:[0,.6]});

    vids.forEach(v=>{
      v.preload='none'; v.muted=true; v.playsInline=true;
      preloadIO.observe(v); playIO.observe(v);
    });

    console.log('✅ Video IO on');
  }

  /* ════════════════════════════════════════════════════════════
     HEADER MIX-BLEND (hero only)
     ═══════════════════════════════════════════════════════════ */
  initHeaderBlend () {
    const header = document.querySelector('.header');
    const hero   = document.querySelector('.hero-section,.project-hero,.page-hero');
    if (!header || !hero) return;

    new IntersectionObserver(([e])=>{
      document.body.classList.toggle('is-at-hero', e.isIntersecting);
    },{threshold:0.1}).observe(hero);

    console.log('✅ Header blend observer');
  }

  /* ════════════════════════════════════════════════════════════
     BUTTON HOVER EFFECTS
     ═══════════════════════════════════════════════════════════ */
  initHoverEffects () {
    document.querySelectorAll('.button').forEach(btn=>{
      const arr = btn.querySelector('.arrow');
      if(!arr) return;
      btn.addEventListener('mouseenter',()=>gsap.to(arr,{x:5,duration:.3}));
      btn.addEventListener('mouseleave',()=>gsap.to(arr,{x:0,duration:.3}));
    });
    console.log('✅ Button hover');
  }

  /* ════════════════════════════════════════════════════════════
     HERO / PAGE ENTRY
     ═══════════════════════════════════════════════════════════ */
  animatePageEntry () {
    const lines = gsap.utils.toArray('.hero-title .title-line,.project-title-main .title-line');
    const media = document.querySelector('.hero-section .image-wrapper img,.page-hero .image-wrapper img,.project-hero .hero-video');
    const meta  = gsap.utils.toArray('.hero-subtitle,.project-subtitle,.hero-section .stats li');

    const tl = gsap.timeline({defaults:{ease:'customGentle'}});
    tl.from(lines,{autoAlpha:0,rotation:7,yPercent:100,stagger:.12,duration:1});
    if(media) tl.from(media,{scale:1.3,duration:1.2},0);
    tl.from(meta,{autoAlpha:0,y:20,stagger:.15,duration:.8},.4);
  }

  /* ════════════════════════════════════════════════════════════
     SCROLLTRIGGER ANIMATIONS (batched)
     ═══════════════════════════════════════════════════════════ */
  initScrollAnimations () {

    /* ----- title split */
    ScrollTrigger.batch('[data-animate="title-split"] .title-line',{
      start:'top 80%',
      onEnter:b=>gsap.fromTo(b,{autoAlpha:0,rotation:7,yPercent:100},
                               {autoAlpha:1,rotation:0,yPercent:0,
                                stagger:.1,duration:1,ease:'customGentle'})
    });

    /* ----- fade-up */
    gsap.set('[data-animate="fade-up"]',{autoAlpha:0,y:30});
    ScrollTrigger.batch('[data-animate="fade-up"]',{
      start:'top 85%',
      onEnter:b=>gsap.to(b,{autoAlpha:1,y:0,stagger:.08,duration:.6})
    });

    /* ----- stagger children */
    ScrollTrigger.batch('[data-stagger-children]',{
      start:'top 70%',
      onEnter:batch=>{
        batch.forEach(p=>{
          const kids=p.querySelectorAll('[data-animate]');
          gsap.fromTo(kids,{autoAlpha:0,y:30,scale:.95},
                           {autoAlpha:1,y:0,scale:1,stagger:{amount:.8},duration:.8});
        });
      }
    });

    /* ----- bloom */
    ScrollTrigger.batch('[data-bloom]',{
      start:'top 95%', end:'bottom 5%', scrub:1,
      onUpdate:s=>{
        const p=s.progress;
        s.trigger.style.filter=`brightness(${1+.4*p}) saturate(${1+.3*p})`;
      },
      onLeave:s=>s.trigger.style.filter='brightness(1) saturate(1)'
    });

    /* ----- parallax */
    gsap.utils.toArray('[data-parallax]').forEach(el=>{
      const sp=parseFloat(el.dataset.parallax||.6);
      gsap.to(el,{y:()=>(-window.innerHeight*sp),ease:'none',
        scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});
    });

    /* ----- project cards */
    gsap.set('.project-card',{autoAlpha:0,y:80,scale:.95});
    ScrollTrigger.batch('.project-card',{
      start:'top 80%',
      onEnter:b=>gsap.to(b,{autoAlpha:1,y:0,scale:1,stagger:.15,duration:1})
    });

    /* ----- footer */
    const f=document.querySelector('.footer');
    if(f){
      gsap.fromTo(f,{y:100,autoAlpha:0},
                     {y:0,autoAlpha:1,duration:.8,
                      scrollTrigger:{trigger:f,start:'top 90%'}});
    }

    /* performance hints */
    ScrollTrigger.addEventListener('refreshInit',()=>gsap.set('[data-bloom],[data-parallax]',{willChange:'transform'}));
    ScrollTrigger.addEventListener('refresh',()=>gsap.set('[data-bloom],[data-parallax]',{clearProps:'will-change'}));

    console.log('✅ Scroll animations');
  }

  /* ════════════════════════════════════════════════════════════
     PAGE-SPECIFIC SMALL BITS
     ═══════════════════════════════════════════════════════════ */
  detectPage () {
    const b=document.body;
    if (b.classList.contains('page-home'))   this.initHomepage();
    if (b.classList.contains('page-studio')) this.initStudioPage();
    if (b.classList.contains('page-story'))  this.initStoryPage();
    if (b.classList.contains('page-project'))this.initProjectPage();
  }
  initHomepage () {
    document.querySelectorAll('.stat-value').forEach(stat=>{
      const val=parseFloat(stat.textContent);
      if(isNaN(val)) return;
      gsap.fromTo(stat,{textContent:0},
        {textContent:val,duration:2,ease:'power1.out',
         snap:{textContent:1},
         scrollTrigger:{trigger:stat,start:'top 80%'}});
    });
  }
  initStudioPage(){}  initStoryPage(){}  initProjectPage(){}

  /* ════════════════════════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════════════════════ */
  handleResize () {
    let ticking=false;
    window.addEventListener('resize',()=>{
      if(!ticking){
        requestAnimationFrame(()=>{ScrollTrigger.refresh(); ticking=false;});
        ticking=true;
      }
    });
  }

  /* optional helpers */
  refresh(){ScrollTrigger.refresh();}
  destroy(){
    ScrollTrigger.getAll().forEach(st=>st.kill());
    gsap.globalTimeline.clear();
    this.lenis && this.lenis.destroy();
  }
}

/* ═════════════════════════════════════════════════════════════
   INITIALISE
   ═════════════════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded',()=>new M0NARQ_Animations());
} else {
  new M0NARQ_Animations();
}