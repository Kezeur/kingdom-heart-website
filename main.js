// Sélection des boutons
let boutonMode = document.getElementById("btn-lightmode");
let burgerMenu = document.getElementById("burger-menu");

// Menu burger (Sécurité : seulement s'il existe)
if (burgerMenu) {
  burgerMenu.addEventListener("click", function () {
    document.body.classList.toggle("sidebar-open");
  });
}

// Mode clair/sombre (Sécurité : seulement s'il existe)
if (boutonMode) {
  boutonMode.addEventListener("click", function () {
    document.body.classList.toggle("light-mode");
    if (document.body.classList.contains("light-mode")) {
      boutonMode.textContent = "Mode sombre";
    } else {
      boutonMode.textContent = "Mode clair";
    }
  });
}

// Initialisation Swiper
let swiperElement = document.querySelector(".swiperJeux");
if (swiperElement) {
  let swiperJeux = new Swiper(".swiperJeux", {
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

// =========================================
// CARROUSEL PERSONNAGES (GSAP - Version Stable sans scroll)
// =========================================
let gallery = document.querySelector('.gallery');

if (gallery && typeof gsap !== 'undefined') {
  // On ne garde que Draggable, plus de ScrollTrigger
  gsap.registerPlugin(Draggable);

  gsap.set('.cards li', {xPercent: 400, opacity: 0, scale: 0});

  // Variables de base
  const spacing = 0.1, 
    snapTime = gsap.utils.snap(spacing), 
    cards = gsap.utils.toArray('.cards li'),
    animateFunc = element => {
      const tl = gsap.timeline();
      tl.fromTo(element, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false})
        .fromTo(element, {xPercent: 400}, {xPercent: -400, duration: 1, ease: "none", immediateRender: false}, 0);
      return tl;
    },
    seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc),
    playhead = {offset: 0}, 
    wrapTime = gsap.utils.wrap(0, seamlessLoop.duration()), 
    
    // Animation de transition fluide
    scrub = gsap.to(playhead, { 
      offset: 0,
      onUpdate() { seamlessLoop.time(wrapTime(playhead.offset)); },
      duration: 0.5,
      ease: "power3",
      paused: true
    });

  // Fonction pour déplacer le carrousel
  function scrollToOffset(offset) { 
    scrub.vars.offset = offset;
    scrub.invalidate().restart(); 
  }

  // Clic sur Suivant / Précédent
  let nextBtn = document.querySelector(".next");
  let prevBtn = document.querySelector(".prev");
  if (nextBtn) nextBtn.addEventListener("click", () => scrollToOffset(scrub.vars.offset + spacing));
  if (prevBtn) prevBtn.addEventListener("click", () => scrollToOffset(scrub.vars.offset - spacing));

  // Glisser-déposer (Souris / Tactile)
  Draggable.create(".drag-proxy", {
    type: "x",
    trigger: ".cards",
    onPress() { this.startOffset = scrub.vars.offset; },
    onDrag() {
      scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
      scrub.invalidate().restart(); 
    },
    onDragEnd() { 
      // Aligne proprement sur la carte la plus proche quand on lâche
      scrollToOffset(snapTime(scrub.vars.offset)); 
    }
  });

  // Construction de la boucle infinie GSAP
  function buildSeamlessLoop(items, spacing, animateFunc) {
    let overlap = Math.ceil(1 / spacing), 
      startTime = items.length * spacing + 0.5, 
      loopTime = (items.length + overlap) * spacing + 1, 
      rawSequence = gsap.timeline({paused: true}), 
      seamlessLoop = gsap.timeline({ 
        paused: true,
        repeat: -1, 
        onRepeat() { this._time === this._dur && (this._tTime += this._dur - 0.01); }
      }),
      l = items.length + overlap * 2, time, i, index;

    for (i = 0; i < l; i++) {
      index = i % items.length;
      time = i * spacing;
      rawSequence.add(animateFunc(items[index]), time);
      i <= items.length && seamlessLoop.add("label" + i, time); 
    }

    rawSequence.time(startTime);
    seamlessLoop.to(rawSequence, {
      time: loopTime, duration: loopTime - startTime, ease: "none"
    }).fromTo(rawSequence, {time: overlap * spacing + 1}, {
      time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none"
    });
    return seamlessLoop;
  }
}