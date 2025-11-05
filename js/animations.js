/* ═════════════════════════════════════════════════════════════
   M0NARQ AI  –  “Best-Blend” v4.0
   Parallax  ✓  Bloom  ✓  Butter Lenis ✓  Page-transition ✓
   No main-thread jank on MBA 2020, Pixel 6 or iPhone 12
   ═════════════════════════════════════════════════════════════ */
class M0NARQ_Animations {
  /* ───────────  USER-TUNEABLE CONSTS  ─────────── */
  BLOOM_MAX_BRIGHTNESS = 0.45;   // 0.45 => 45 % brighter at mid-scroll
  BLOOM_MAX_SATURATION = 0.35;   // 0.35 => 35 % more saturated
  LENIS_INERTIA        = 1.1;    // seconds – sweet-spot

  constructor () {
    this.killLoader();

    if (!window.gsap || !window.ScrollTrigger || !window.Lenis) {
      console.error('❌ GSAP / ScrollTrigger / Lenis missing. Abort.');
      return;
    }

    /* CORE */
    this.initGSAP();
    this.initLenis();

    /* ABOVE-THE-FOLD features (blockers) */
    this.initMenu();
    this.initHeaderBlend();
    this.initVideoIO();
    this.initHoverEffects();
    this.animatePageEntry();

    /* BELOW-THE-FOLD work – idle */
    (window.requestIdleCallback || (fn=>setTimeout(fn,1)))(() => {
      this.initScrollAnimations();
      this.detectPage();
      ScrollTrigger.refresh();   // 1 final pass
    });

    this.handleResize();
    console.log('%cM0NARQ v4.0 → smooth, bloom, parallax', 'color:#2c8c99');
  }

  /* ============================================================
     0.  LOADER
     ============================================================ */
  killLoader () {
    document.querySelectorAll('.loader,[data-loader]')
            .forEach(l => l.remove());
    document.body.style.opacity = '1';
  }

  /* ============================================================
     1.  GSAP
     ============================================================ */
  initGSAP () {
    gsap.registerPlugin(ScrollTrigger, CustomEase, TextPlugin);
    CustomEase.create('gentle', 'M0,0 C0,0.202 0.204,1 1,1');
    gsap.defaults({ ease:'power2.out', duration:.6 });
    gsap.config({ force3D:true, nullTargetWarn:false });
  }

  /* ============================================================
     2.  LENIS (butter)
     ============================================================ */
  initLenis () {
    this.lenis = new Lenis({
      duration : this.LENIS_INERTIA,
      easing   : t => Math.min(1,1.001-Math.pow(2,-10*t)),
      smooth   : true,
      smoothTouch : false
    });
    const raf = t => { this.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    this.lenis.on('scroll', ScrollTrigger.update);
  }

  /* ============================================================
     3.  MENU + PAGE-TRANSITION
     ============================================================ */
  initMenu () {
    const btn   = document.querySelector('.menu-button');
    const ov    = document.querySelector('.menu-overlay');
    const burger= document.querySelector('.burger');
    const lines = document.querySelectorAll('.burger-line');
    const items = document.querySelectorAll('.menu-item');
    if (!btn || !ov) return;

    let open=false;
    btn.addEventListener('click',()=>toggle());
    items.forEach(li=>li.addEventListener('click',()=>open&&toggle()));

    const toggle = () => {
      open=!open;
      burger.classList.toggle('is-active',open);
      this.lenis[open?'stop':'start']();
      open ? this.revealOverlay(ov) : this.hideOverlay(ov);
    };

    /* page-transition (opt-in) */
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[data-transition]');
      if(!a) return;
      e.preventDefault();
      this.revealOverlay(ov,()=>window.location=a.href);
    });
  }
  revealOverlay (ov,done){
    ov.classList.add('is-active');
    gsap.fromTo(ov,{clipPath:'circle(0% at 100% 0%)'},
                    {clipPath:'circle(141% at 100% 0%)',
                     duration:.7,ease:'power3.inOut',onComplete:done});
  }
  hideOverlay (ov){
    gsap.to(ov,{clipPath:'circle(0% at 100% 0%)',
                duration:.6,ease:'power3.inOut',
                onComplete:()=>ov.classList.remove('is-active')});
  }

  /* ============================================================
     4.  VIDEO IO  (autoplay in view)
     ============================================================ */
  initVideoIO () {
    document.querySelectorAll('.project-video,.hero-video').forEach(v=>{
      v.loop=true; v.muted=v.playsInline=true; v.preload='none';
      new IntersectionObserver(([e])=>{
        if(e.isIntersecting) v.preload='metadata', v.load();
      },{rootMargin:'400px'}).observe(v);

      new IntersectionObserver(([e])=>{
        e.isIntersecting ? v.play().catch(()=>{}) : v.pause();
      },{threshold:.6}).observe(v);
    });
  }

  /* ============================================================
     5.  HOVER (buttons)
     ============================================================ */
  initHoverEffects () {
    document.querySelectorAll('.button .arrow').forEach(arr=>{
      const btn=arr.closest('.button');
      btn.addEventListener('mouseenter',()=>gsap.to(arr,{x:5,duration:.25}));
      btn.addEventListener('mouseleave',()=>gsap.to(arr,{x:0,duration:.25}));
    });
  }

  /* ============================================================
     6.  HEADER MIX-BLEND over hero
     ============================================================ */
  initHeaderBlend () {
    const hero=document.querySelector('.hero-section,.page-hero,.project-hero');
    if(!hero) return;
    new IntersectionObserver(([e])=>{
      document.body.classList.toggle('is-at-hero', e.isIntersecting);
    },{threshold:.1}).observe(hero);
  }

  /* ============================================================
     7.  HERO ENTRY
     ============================================================ */
  animatePageEntry () {
    const lines=gsap.utils.toArray('.hero-title .title-line,.project-title-main .title-line');
    const media=document.querySelector('.hero-section .image-wrapper img,.page-hero .image-wrapper img,.project-hero .hero-video');
    const meta =gsap.utils.toArray('.hero-subtitle,.project-subtitle');
    const tl=gsap.timeline();
    tl.from(lines,{autoAlpha:0,rotation:7,yPercent:100,stagger:.12,duration:1,ease:'gentle'});
    media&&tl.from(media,{scale:1.3,duration:1.2},0);
    tl.from(meta,{autoAlpha:0,y:20,stagger:.1,duration:.8},.4);
  }

  /* ============================================================
     8.  SCROLL ANIMS : Parallax + Bloom coexist
     ============================================================ */
  initScrollAnimations () {
    /* 8.1 Bloom (GPU-friendly) */
    ScrollTrigger.batch('[data-bloom]',{
      start:'top 95%', end:'bottom 5%', scrub:1,
      onToggle:self=>{
        /* will-change hint only while active */
        self.trigger.style.willChange = self.isActive ? 'filter' : '';
      },
      onUpdate:self=>{
        const p=self.progress;
        const br=1+p*this.BLOOM_MAX_BRIGHTNESS;
        const sa=1+p*this.BLOOM_MAX_SATURATION;
        self.trigger.style.filter=`brightness(${br}) saturate(${sa})`;
      },
      onLeave:self=>self.trigger.style.filter='brightness(1) saturate(1)'
    });

    /* 8.2 Parallax (any element that opts-in) */
    gsap.utils.toArray('[data-parallax]').forEach(el=>{
      const speed=parseFloat(el.dataset.parallax||.4);
      gsap.to(el,{y:()=>(-window.innerHeight*speed),ease:'none',
        scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:.6}});
    });

    /* 8.3 Title split */
    ScrollTrigger.batch('[data-animate="title-split"] .title-line',{
      start:'top 80%',
      onEnter:b=>gsap.fromTo(b,{autoAlpha:0,rotation:7,yPercent:100},
                               {autoAlpha:1,rotation:0,yPercent:0,
                                stagger:.1,duration:1,ease:'gentle'})
    });

    /* 8.4 Fade-ups */
    gsap.set('[data-animate="fade-up"]',{autoAlpha:0,y:32});
    ScrollTrigger.batch('[data-animate="fade-up"]',{
      start:'top 85%',
      onEnter:b=>gsap.to(b,{autoAlpha:1,y:0,stagger:.08,duration:.65})
    });

    /* 8.5 Cards */
    gsap.set('.project-card',{autoAlpha:0,y:70,scale:.95});
    ScrollTrigger.batch('.project-card',{
      start:'top 80%',
      onEnter:b=>gsap.to(b,{autoAlpha:1,y:0,scale:1,stagger:.15,duration:1})
    });

    /* 8.6 Footer */
    const f=document.querySelector('.footer');
    if(f){
      gsap.fromTo(f,{y:100,autoAlpha:0},
                     {y:0,autoAlpha:1,duration:.9,
                      scrollTrigger:{trigger:f,start:'top 90%'}});
    }
  }

  /* ============================================================
     9.  PAGE-SPECIFIC
     ============================================================ */
  detectPage () {
    if (document.body.classList.contains('page-home')) this.initHomepage();
  }
  initHomepage () {
    document.querySelectorAll('.stat-value').forEach(stat=>{
      const raw=stat.textContent.trim();
      const num=parseFloat(raw.replace(/[^0-9.]/g,''));
      if(isNaN(num)) return;
      const prefix=raw.match(/^\D*/)[0];
      const suffix=raw.match(/\D*$/)[0];

      gsap.fromTo(stat,{val:0},{val:num,duration:2.1,ease:'power1.out',
        scrollTrigger:{trigger:stat,start:'top 85%'},
        onUpdate:function(){
          const v=this.targets()[0].val;
          stat.textContent=prefix+(num<10?v.toFixed(1):Math.round(v)).toLocaleString()+suffix;
        }});
    });
  }

  initStudioPage(){} initStoryPage(){} initProjectPage(){}

  /* ============================================================
     10.  RESIZE
     ============================================================ */
  handleResize () {
    let ticking=false;
    window.addEventListener('resize',()=>{
      if(!ticking){
        requestAnimationFrame(()=>{ScrollTrigger.refresh(); ticking=false;});
        ticking=true;
      }
    },{passive:true});
  }

  /* helpers */
  refresh(){ScrollTrigger.refresh();}
  destroy(){
    ScrollTrigger.getAll().forEach(st=>st.kill());
    gsap.globalTimeline.clear(); this.lenis&&this.lenis.destroy();
  }
}

/* ============================================================
   INITIALISE
   ============================================================ */
if (document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>new M0NARQ_Animations());
}else{ new M0NARQ_Animations(); }