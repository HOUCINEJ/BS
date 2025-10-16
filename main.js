  // DOM
    const intro = document.getElementById('intro');
    const page = document.getElementById('page');
    const introLogo = document.getElementById('introLogo');
    const bgAudio = document.getElementById('bgAudio');
    const playPauseBtn = document.getElementById('playPause');

    // menu
    const hamburger = document.getElementById('hamburger');
    const menuModal = document.getElementById('menuModal');
    const closeMenu = document.getElementById('closeMenu');

    hamburger.addEventListener('click', ()=> {
      menuModal.classList.add('open');
      menuModal.setAttribute('aria-hidden','false');
    });
    closeMenu.addEventListener('click', ()=> {
      menuModal.classList.remove('open');
      menuModal.setAttribute('aria-hidden','true');
    });
    // close menu on backdrop click
    menuModal.addEventListener('click', (e)=>{
      if(e.target === menuModal) { menuModal.classList.remove('open'); menuModal.setAttribute('aria-hidden','true'); }
    });

    // intro sequence:
    // 1) show logo fade-in (CSS anim).
    // 2) after 1.2s trigger tv-on pulse for 1s (CSS class)
    // 3) attempt to play bg audio
    // 4) hide intro and show page
    function startIntroSequence(){
      // avoid double start
      if(window.__introStarted) return;
      window.__introStarted = true;

      // tv pulse after some delay
      setTimeout(()=>{
        intro.classList.add('tv-on');
      }, 900);

      // try to play audio around the pulse time
      function tryPlay(){
        const p = bgAudio.play();
        if(p !== undefined){
          p.then(()=> {
            // playing
          }).catch(()=> {
            // autoplay blocked — user must click play manually
            // show small visual hint (the play/pause button can start it)
          });
        }
      }
      tryPlay();

      // end intro after 1.8s (gives time for pulse)
      setTimeout(()=> {
        intro.style.transition = 'opacity .45s ease';
        intro.style.opacity = 0;
        setTimeout(()=> { intro.remove(); page.classList.add('visible'); }, 480);
      }, 1400);
    }

    // Start intro on user interaction (to satisfy autoplay policies)
    // If browser allows autoplay without interaction, start immediately.
    // We'll attempt once, and also bind to first click/touch to guarantee audio.
    (async ()=>{
      // attempt immediate start (may be blocked)
      try { await bgAudio.play(); bgAudio.pause(); bgAudio.currentTime = 0; } catch(e){}
      // start visual intro
      startIntroSequence();
    })();

    // bind one-time play on first user gesture to ensure audio can start
    function userGestureStart(){
      try{ bgAudio.play(); }catch(e){}
      document.removeEventListener('click', userGestureStart);
      document.removeEventListener('touchstart', userGestureStart);
    }
    document.addEventListener('click', userGestureStart);
    document.addEventListener('touchstart', userGestureStart);

    // play/pause button
    playPauseBtn.addEventListener('click', ()=>{
      if(bgAudio.paused){
        bgAudio.play().catch(()=>{ alert('يرجى النقر مرة على الصفحة للسماح بتشغيل الصوت إذا كان متصفحك يمنع التشغيل التلقائي.');});
        playPauseBtn.setAttribute('aria-pressed','true');
      } else {
        bgAudio.pause();
        playPauseBtn.setAttribute('aria-pressed','false');
      }
    });

    // Carousel logic
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    let idx = 0;
    let carouselTimer = null;

    function showSlide(i){
      slides.forEach((s,si)=> s.classList.toggle('active', si===i));
      idx = i;
    }
    function nextSlide(){
      let ni = (idx + 1) % slides.length;
      showSlide(ni);
    }
    function prevSlide(){
      let ni = (idx - 1 + slides.length) % slides.length;
      showSlide(ni);
    }

    nextBtn.addEventListener('click', ()=> { nextSlide(); resetTimer(); });
    prevBtn.addEventListener('click', ()=> { prevSlide(); resetTimer(); });

    function startTimer(){
      carouselTimer = setInterval(nextSlide, 2000);
    }
    function resetTimer(){
      clearInterval(carouselTimer);
      startTimer();
    }
    startTimer();

    // Accessibility: keyboard close menu with Esc
    document.addEventListener('keydown', (e)=>{
      if(e.key === "Escape") { menuModal.classList.remove('open'); menuModal.setAttribute('aria-hidden','true'); }
    });

    // ensure page visible class set if intro removed by user
    window.addEventListener('load', ()=> {
      if(!intro.parentElement) page.classList.add('visible');
    });