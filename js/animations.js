/*
══════════════════════════════════════════════════════════════════
M0NARQ AI - BUTTER SMOOTH v3.0
✅ Lenis inertia tuned for maximum smoothness
✅ Pronounced parallax with proper transform3d
✅ Videos NEVER interrupt scroll (passive observers only)
✅ GPU-accelerated everything
══════════════════════════════════════════════════════════════════
*/

class M0NARQ_Animations {
constructor() {
// Kill loader instantly
this.killLoader();

// Validate dependencies
if (typeof gsap === "undefined" || typeof Lenis === "undefined") {
  console.error("❌ Missing GSAP/Lenis");
  return;
}

// Initialize in order
this.initGSAP();
this.initLenis();        // ← SMOOTHNESS PRIORITY
this.initMenu();
this.initVideos();       // ← PASSIVE ONLY
this.initHoverEffects();
this.initDynamicIsland(); // ← INITIALIZE DYNAMIC ISLAND IMMEDIATELY

// Heavy animations after idle (with fallback)
const idleCallback = window.requestIdleCallback || function(cb) {
  return setTimeout(cb, 1);
};

idleCallback(() => {
  this.animatePageEntry();
  this.initScrollAnimations();
  this.initHeaderBlend();
  this.detectPage();
  ScrollTrigger.refresh();
});

this.handleResize();
console.log("🚀 M0NARQ v3.0 - Butter mode engaged");

}

/* ════════════════════════════════════════════════════════════
INSTANT LOADER KILL
═══════════════════════════════════════════════════════════ */
killLoader() {
document.querySelectorAll('.loader,[data-loader]').forEach(l => l.remove());
document.body.style.opacity = '1';
document.body.style.visibility = 'visible';
document.documentElement.style.overflow = '';
}

/* ════════════════════════════════════════════════════════════
GSAP - GPU EVERYTHING
═══════════════════════════════════════════════════════════ */
initGSAP() {
gsap.registerPlugin(ScrollTrigger, CustomEase);

// ✅ CRITICAL: Lag smoothing to avoid stutters after tab switching
gsap.ticker.lagSmoothing(1000, 16);

// Custom easing curves (Exo Ape style)
CustomEase.create("customGentle", "M0,0 C0,0.202 0.204,1 1,1");
CustomEase.create("customStrong", "M0,0 C0.496,0.004 0,1 1,1");

// Defaults
gsap.defaults({
  ease: "power2.out",
  duration: 0.6
});

// ✅ CRITICAL: Force 3D transforms everywhere
gsap.config({
  force3D: true,
  nullTargetWarn: false
});

console.log("✅ GSAP (GPU mode)");


}

/* ════════════════════════════════════════════════════════════
LENIS - MAXIMUM BUTTER SMOOTHNESS
═══════════════════════════════════════════════════════════ */
initLenis() {
this.lenis = new Lenis({
// ✅ BUTTER SETTINGS - Tuned for maximum smoothness
duration: 1.8,           // Longer = smoother inertia (was 0.7)
easing: (t) => {
// ✅ Custom ease-out curve for natural deceleration
return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
},
orientation: 'vertical',
gestureOrientation: 'vertical',
smooth: true,
smoothTouch: false,      // Disable on mobile for native feel
syncTouch: false,
syncTouchLerp: 0.1,
touchInertiaMultiplier: 35,  // ✅ Strong inertia on touch
infinite: false
});


// ✅ RAF loop - no blocking operations
const raf = (time) => {
  this.lenis.raf(time);
  requestAnimationFrame(raf);
};
requestAnimationFrame(raf);

// ✅ Sync with ScrollTrigger
this.lenis.on("scroll", ScrollTrigger.update);

// ✅ REMOVED: Scroll class toggling (causes reflow)
// No DOM manipulation on scroll = maximum smoothness

console.log("✅ Lenis (butter mode: 1.8s inertia)");


}

/* ════════════════════════════════════════════════════════════
MENU - Standard
═══════════════════════════════════════════════════════════ */
initMenu() {
const btn = document.querySelector('.menu-button');
const overlay = document.querySelector('.menu-overlay');
const burger = document.querySelector('.burger');
const lines = document.querySelectorAll('.burger-line');
const items = document.querySelectorAll('.menu-item');


if (!btn || !overlay) return;

let open = false;

btn.addEventListener("click", () => {
  open = !open;
  open ? this.openMenu(overlay, burger, lines, items)
       : this.closeMenu(overlay, burger, lines, items);
});

items.forEach(item => {
  item.addEventListener("click", () => {
    if (open) {
      this.closeMenu(overlay, burger, lines, items);
      open = false;
    }
  });
});

// ✅ ESC key to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && open) {
    this.closeMenu(overlay, burger, lines, items);
    open = false;
  }
});

console.log("✅ Menu");


}

openMenu(overlay, burger, lines, items) {
if (this.lenis) this.lenis.stop();


gsap.fromTo(overlay,
  { clipPath: "circle(0% at 100% 0%)" },
  {
    clipPath: "circle(141.42% at 100% 0%)",
    duration: 0.8,
    ease: "power3.inOut"
  }
);

overlay.classList.add("is-active");
burger.classList.add("is-active");

const [top, mid, bot] = lines;
gsap.to(top, { y: 8, rotation: 45, transformOrigin: "center", duration: 0.3 });
gsap.to(mid, { autoAlpha: 0, duration: 0.1 });
gsap.to(bot, { y: -8, rotation: -45, transformOrigin: "center", duration: 0.3 });

gsap.fromTo(items,
  { autoAlpha: 0, y: 30, rotation: -5 },
  {
    autoAlpha: 1,
    y: 0,
    rotation: 0,
    stagger: 0.08,
    duration: 0.6,
    delay: 0.3,
    ease: "power2.out"
  }
);


}

closeMenu(overlay, burger, lines, items) {
if (this.lenis) this.lenis.start();


gsap.to(overlay, {
  clipPath: "circle(0% at 100% 0%)",
  duration: 0.6,
  ease: "power3.inOut",
  onComplete: () => overlay.classList.remove("is-active")
});

burger.classList.remove("is-active");

const [top, mid, bot] = lines;
gsap.to(top, { y: 0, rotation: 0, duration: 0.3 });
gsap.to(mid, { autoAlpha: 1, duration: 0.2 });
gsap.to(bot, { y: 0, rotation: 0, duration: 0.3 });
gsap.to(items, { autoAlpha: 0, duration: 0.2 });


}

/* ════════════════════════════════════════════════════════════
VIDEOS - 100% PASSIVE (NEVER INTERRUPT SCROLL)
═══════════════════════════════════════════════════════════ */
initVideos() {
const videos = document.querySelectorAll('.project-video, .hero-video');
if (!videos.length) return;


videos.forEach(video => {
  // ✅ Setup
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = "metadata";

  // ✅ PASSIVE observer - only preload when near viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Just ensure loaded, don't manipulate playback
          if (video.readyState < 2) {
            video.load();
          }
        }
      });
    },
    {
      rootMargin: "400px",  // Preload well in advance
      threshold: 0
    }
  );

  observer.observe(video);
});

// ✅ Hover-triggered video crossfade (project cards only)
document.querySelectorAll(".project-card").forEach(card => {
  const img = card.querySelector(".project-image");
  const vid = card.querySelector(".project-video");

  if (!vid || !img) return;

  // Preload video immediately for this card
  vid.load();

  let isPlaying = false;

  card.addEventListener("mouseenter", () => {
    if (!isPlaying) {
      isPlaying = true;

      // Crossfade
      gsap.to(img, { autoAlpha: 0, duration: 0.4 });
      gsap.to(vid, { autoAlpha: 1, duration: 0.4 });

      // Play (catch promise rejection silently)
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser blocked autoplay - that's fine
        });
      }
    }
  });

  card.addEventListener("mouseleave", () => {
    if (isPlaying) {
      isPlaying = false;

      // Fade back
      gsap.to(vid, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: () => {
          vid.pause();
          vid.currentTime = 0;
        }
      });
      gsap.to(img, { autoAlpha: 1, duration: 0.3 });
    }
  });
});

console.log(`✅ Videos (${videos.length} passive)`);


}

/* ════════════════════════════════════════════════════════════
BUTTON HOVER (Arrow translation)
═══════════════════════════════════════════════════════════ */
initHoverEffects() {
document.querySelectorAll('.button').forEach(btn => {
const arrow = btn.querySelector('.arrow');
if (!arrow) return;


  btn.addEventListener("mouseenter", () => {
    gsap.to(arrow, { x: 5, duration: 0.3, ease: "power2.out" });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(arrow, { x: 0, duration: 0.3, ease: "power2.out" });
  });
});

console.log("✅ Button hover");


}

/* ════════════════════════════════════════════════════════════
PAGE ENTRY ANIMATIONS
═══════════════════════════════════════════════════════════ */
animatePageEntry() {
const titleLines = gsap.utils.toArray('.hero-title .title-line, .project-title-main .title-line');
const heroMedia = document.querySelector('.hero-section .image-wrapper img, .page-hero .image-wrapper img, .project-hero .hero-video, .full-bleed img');
const heroMeta = gsap.utils.toArray('.hero-subtitle, .project-subtitle, .full-bleed h1, .full-bleed .sub');


const tl = gsap.timeline({ defaults: { ease: "customGentle" } });

// ✅ Title lines (Exo Ape pattern)
if (titleLines.length) {
  gsap.set(titleLines, {
    autoAlpha: 0,
    rotation: 7,
    yPercent: 100,
    force3D: true
  });

  tl.to(titleLines, {
    autoAlpha: 1,
    rotation: 0,
    yPercent: 0,
    stagger: 0.12,
    duration: 1,
    clearProps: "all"
  }, 0.2);
}

// ✅ Hero image zoom
if (heroMedia) {
  gsap.set(heroMedia, {
    scale: 1.3,
    transformOrigin: "center center",
    force3D: true
  });

  tl.to(heroMedia, {
    scale: 1,
    duration: 1.4,
    ease: "power2.out",
    clearProps: "scale"
  }, 0);
}

// ✅ Metadata fade
if (heroMeta.length) {
  gsap.set(heroMeta, { autoAlpha: 0, y: 20 });

  tl.to(heroMeta, {
    autoAlpha: 1,
    y: 0,
    stagger: 0.15,
    duration: 0.8
  }, 0.6);
}

console.log("✅ Page entry animated");


}

/* ════════════════════════════════════════════════════════════
SCROLL ANIMATIONS - PRONOUNCED PARALLAX
═══════════════════════════════════════════════════════════ */
initScrollAnimations() {


// ✅ Title splits on scroll
gsap.utils.toArray('[data-animate="title-split"]').forEach(element => {
  const lines = element.querySelectorAll(".title-line");
  if (!lines.length) return;

  gsap.fromTo(lines,
    {
      autoAlpha: 0,
      rotation: 7,
      yPercent: 100,
      force3D: true
    },
    {
      autoAlpha: 1,
      rotation: 0,
      yPercent: 0,
      stagger: 0.1,
      duration: 1,
      ease: "customGentle",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    }
  );
});

// ✅ Fade-up elements
gsap.utils.toArray('[data-animate="fade-up"]').forEach(el => {
  gsap.fromTo(el,
    { autoAlpha: 0, y: 40, force3D: true },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%"
      }
    }
  );
});

// ✅ Stagger children
gsap.utils.toArray('[data-stagger-children]').forEach(parent => {
  const children = parent.querySelectorAll('[data-animate]');
  if (!children.length) return;

  gsap.fromTo(children,
    { autoAlpha: 0, y: 40, scale: 0.95, force3D: true },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      stagger: { amount: 0.6, from: "start" },
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: parent,
        start: "top 75%"
      }
    }
  );
});

// ✅ PRONOUNCED PARALLAX (Key feature!)
gsap.utils.toArray('[data-parallax]').forEach(el => {
  const speed = parseFloat(el.dataset.speed || el.dataset.parallax) || 0.5;
  
  // ✅ CRITICAL: Use transform3d for GPU acceleration
  gsap.to(el, {
    y: () => {
      // Calculate based on element height for proportional movement
      const distance = window.innerHeight * speed * 0.5;
      return -distance;
    },
    ease: "none",
    force3D: true,
    scrollTrigger: {
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.5,  // ✅ Slight smoothing for butter feel
      invalidateOnRefresh: true
    }
  });
});

// ✅ Project cards
gsap.utils.toArray(".project-card").forEach(card => {
  gsap.fromTo(card,
    { autoAlpha: 0, y: 80, scale: 0.96, force3D: true },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 80%"
      }
    }
  );
});

// ✅ Image bloom effect on scroll
gsap.utils.toArray('[data-bloom], .full-bleed img, .page-hero .image-wrapper img, .story-chapter .image-wrapper img').forEach(img => {
  // Set initial filter state
  gsap.set(img, { filter: "brightness(1) saturate(1)" });
  
  ScrollTrigger.create({
    trigger: img,
    start: "top 80%",
    end: "bottom 20%",
    onEnter: () => {
      gsap.to(img, {
        filter: "brightness(1.45) saturate(1.35)",
        duration: 0.8,
        ease: "power2.out"
      });
    },
    onLeaveBack: () => {
      gsap.to(img, {
        filter: "brightness(1) saturate(1)",
        duration: 0.8,
        ease: "power2.out"
      });
    }
  });
});

// ✅ Footer
const footer = document.querySelector(".footer");
if (footer) {
  gsap.fromTo(footer,
    { y: 100, autoAlpha: 0, force3D: true },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footer,
        start: "top 90%"
      }
    }
  );
}

console.log("✅ Scroll animations (pronounced parallax)");


}

/* ════════════════════════════════════════════════════════════
HEADER BLEND MODE - DYNAMIC BASED ON HERO VISIBILITY
═══════════════════════════════════════════════════════════ */
initHeaderBlend() {
// Find the first hero/bleed section
const heroSection = document.querySelector(".full-bleed, .hero-section, .page-hero");
if (!heroSection) return;

// Create IntersectionObserver to track when hero is in view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Hero is in view - activate blend mode
        document.body.classList.add("is-at-hero");
      } else {
        // Hero is out of view - deactivate blend mode
        document.body.classList.remove("is-at-hero");
      }
    });
  },
  {
    threshold: 0.3  // Trigger when 30% of hero is visible
  }
);

observer.observe(heroSection);
console.log("✅ Header blend mode activated");
}

/* ════════════════════════════════════════════════════════════
DYNAMIC ISLAND - INITIALIZATION
═══════════════════════════════════════════════════════════ */
initDynamicIsland(){
  if(document.getElementById("dynamicIsland")){
    this.dynamicIsland = new DynamicIslandNav(this.lenis);
  }
}

/* ════════════════════════════════════════════════════════════
PAGE-SPECIFIC ANIMATIONS
═══════════════════════════════════════════════════════════ */
detectPage() {
const body = document.body;


if (body.classList.contains("page-home")) this.initHomepage();
if (body.classList.contains("page-studio")) this.initStudioPage();
if (body.classList.contains("page-story")) this.initStoryPage();
if (body.classList.contains("page-project")) this.initProjectPage();


}

initHomepage() {
// ✅ Stats counter with proper number extraction
document.querySelectorAll('.stat-value').forEach(stat => {
const text = stat.textContent.trim();


  // Extract number from text like "336×", "$2.1M", "<4h"
  const match = text.match(/([\d.]+)/);
  if (!match) return;

  const value = parseFloat(match[1]);
  const prefix = text.substring(0, match.index);
  const suffix = text.substring(match.index + match[1].length);

  gsap.fromTo(stat,
    { textContent: 0 },
    {
      textContent: value,
      duration: 2.5,
      ease: "power1.out",
      snap: { textContent: value < 10 ? 0.1 : 1 },
      scrollTrigger: {
        trigger: stat,
        start: "top 80%"
      },
      onUpdate: function() {
        const current = gsap.getProperty(stat, "textContent");
        stat.textContent = prefix + (value < 10 ? current.toFixed(1) : Math.round(current)) + suffix;
      }
    }
  );
});

console.log("✅ Homepage stats");


}

initStudioPage() {
// Studio-specific animations can go here
}

initStoryPage() {
// Story chapter pinning can be added here if needed
}

initProjectPage() {
// Project-specific animations
}

/* ════════════════════════════════════════════════════════════
RESIZE HANDLING (Throttled)
═══════════════════════════════════════════════════════════ */
handleResize() {
let ticking = false;


window.addEventListener("resize", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });


}

/* ════════════════════════════════════════════════════════════
UTILITIES
═══════════════════════════════════════════════════════════ */
refresh() {
ScrollTrigger.refresh();
}

destroy() {
ScrollTrigger.getAll().forEach(st => st.kill());
gsap.globalTimeline.clear();
if (this.lenis) this.lenis.destroy();
}
}

/* ==============================================================
   DYNAMIC ISLAND NAVIGATION CLASSES
   ============================================================== */
class ScrambleText {
  constructor(el){ 
    this.el=el; 
    this.chars="!#$%&'()*+,-./:;<=>?@[]^_`{|}~"; 
  }
  scramble(newText,dur=.6){
    const old=this.el.textContent;
    const len=Math.max(old.length,newText.length), frames=Math.round(dur*60);
    let f=0; 
    clearInterval(this._id);
    this._id=setInterval(()=>{
      f++;
      let out="";
      for(let i=0;i<len;i++){
        if(i/len< f/frames){ out+=newText[i]||""; }
        else { out+=this.chars[Math.floor(Math.random()*this.chars.length)]; }
      }
      this.el.textContent=out;
      if(f>=frames) { clearInterval(this._id); this.el.textContent=newText; }
    },1000/60);
  }
}

class DynamicIslandNav{
  constructor(lenisInstance=null){
    this.lenis=lenisInstance;
    this.sections=[...document.querySelectorAll('[data-nav-section]')]
                    .map((sec,i)=>(sec.dataset.index=i,sec));
    
    if(!this.sections.length) return; // Exit if no sections found
    
    this.island      =document.getElementById('dynamicIsland');
    this.textWrapper =this.island?.querySelector('.text-content');
    this.scrambler   =new ScrambleText(this.textWrapper);
    this.prevBtn     =document.getElementById('prevBtn');
    this.nextBtn     =document.getElementById('nextBtn');
    this.progressBar =document.getElementById('progressBar');
    this.menuBtn     =document.getElementById('menuButton');
    this.menuPanel   =document.getElementById('menuPanel');
    this.menuItems   =[...this.menuPanel?.querySelectorAll('.menu-item')||[]];

    this.state={idx:0,expanded:false,menu:false};

    this.sections.forEach(sec=>{
      if(!sec.dataset.navTitle){
        const h=sec.querySelector('h1,h2,h3'); 
        sec.dataset.navTitle= h? h.textContent.trim() : `Section ${sec.dataset.index}`;
      }
    });

    this.bind(); 
    this.observe(); 
    this.updateUI(0,true);
    this.updatePageMenu();
  }

  observe(){
    this.sections.forEach(sec=>{
      new IntersectionObserver(([e])=>{
        e.isIntersecting&&this.updateUI(+e.target.dataset.index);
      },{threshold:.6}).observe(sec);
    });
  }

  bind(){
    this.island.addEventListener('click',e=>{
      if(e.target.closest('.nav-arrow')) return;
      this.toggleExpand();
    });
    this.prevBtn.addEventListener('click',e=>{e.stopPropagation();this.go(this.state.idx-1);});
    this.nextBtn.addEventListener('click',e=>{e.stopPropagation();this.go(this.state.idx+1);});
    this.menuBtn.addEventListener('click',e=>{e.stopPropagation();this.toggleMenu();});
    
    document.addEventListener('click',e=>{
      if(!this.island.contains(e.target)&&!this.menuBtn.contains(e.target)){
        this.toggleExpand(false); 
        this.toggleMenu(false);
      }
    });
    
    document.addEventListener('keydown',e=>{
      if(e.key==='ArrowUp'||e.key==='ArrowLeft') this.go(this.state.idx-1);
      if(e.key==='ArrowDown'||e.key==='ArrowRight') this.go(this.state.idx+1);
      if(e.key==='Escape'){this.toggleExpand(false);this.toggleMenu(false);}
    });
  }

  updateUI(i,init=false){
    if(i===this.state.idx && !init) return;
    this.state.idx=i;
    const title=this.sections[i].dataset.navTitle.toUpperCase();
    this.scrambler.scramble(title,.55);

    this.sections.forEach(s=>s.classList.toggle('active',+s.dataset.index===i));
    gsap.to(this.progressBar,{width:`${(i+1)/this.sections.length*100}%`,duration:.5,ease:'power2.out'});

    this.menuItems.forEach(li=>{
      const href = li.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      li.classList.toggle('active', href === currentPage);
    });
  }

  go(i){
    i=Math.max(0,Math.min(this.sections.length-1,i));
    if(i===this.state.idx) return;
    const target=this.sections[i];
    if(this.lenis){
      this.lenis.scrollTo(target,{offset:0,duration:1.1,ease:(t)=>1-Math.pow(1-t,3)});
    }else{
      gsap.to(window,{duration:1,scrollTo:{y:target,autoKill:false},ease:'power2.inOut'});
    }
  }

  toggleExpand(force){
    const exp = force!==undefined?force:!this.state.expanded;
    if(exp===this.state.expanded) return;
    this.state.expanded=exp;
    this.island.classList.toggle('expanded',exp);
    gsap.to(this.island,{width:`var(--island-width-${exp?'expanded':'collapsed'})`,duration:.4,ease:'power2.out'});
    gsap.to([this.prevBtn,this.nextBtn],{opacity:exp?1:0,scale:exp?1:.6,pointerEvents:exp?'all':'none',duration:.3,stagger:.05});
  }

  toggleMenu(force){
    const open = force!==undefined?force:!this.state.menu;
    if(open===this.state.menu) return;
    this.state.menu=open;
    this.menuBtn.classList.toggle('menu-open',open);
    gsap.to(this.menuPanel,{opacity:open?1:0,scale:open?1:.8,pointerEvents:open?'all':'none',duration:.3,ease:'power2.out'});
  }

  updatePageMenu(){
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    this.menuItems.forEach(item=>{
      const href = item.getAttribute('href');
      item.classList.toggle('active', href === currentPage);
    });
  }
}

/* ═════════════════════════════════════════════════════════════
INITIALIZE
═════════════════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
window.m0narqAnimations = new M0NARQ_Animations();
});
} else {
window.m0narqAnimations = new M0NARQ_Animations();
}