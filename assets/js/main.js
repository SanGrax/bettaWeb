

(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Servicio: Popup carrusel multimedia mejorado (sin indicadores)
   */
  window.addEventListener("load", () => {
    const popup = select("#popup-carousel");
    const popupContent = select(".carousel");
    const closeBtn = select(".close-btn");
    const prevBtn = select(".prev-btn");
    const nextBtn = select(".next-btn");

    let currentIndex = 0;
    let currentMedia = [];
    let isTransitioning = false;

    function showMedia(direction = "next") {
      if (isTransitioning) return;
      isTransitioning = true;
      // Remove old media
      popupContent.querySelectorAll(".carousel-img, video").forEach(el => el.remove());
      // Create new media
      const src = currentMedia[currentIndex];
      const isVideo = src.endsWith(".mp4");
      const el = isVideo
        ? Object.assign(document.createElement("video"), { src, controls: true, autoplay: true, muted: false, loop: true, className: "carousel-img" })
        : Object.assign(document.createElement("img"), { src, alt: "Imagen del servicio", className: "carousel-img" });
      el.style.opacity = 0;
      el.style.transition = "opacity 0.3s";
      popupContent.insertBefore(el, nextBtn);
      setTimeout(() => { el.style.opacity = 1; }, 50);
      setTimeout(() => { isTransitioning = false; }, 300);
    }

    function closePopup() {
      const video = popupContent.querySelector("video");
      if (video) { video.pause(); video.currentTime = 0; }
      popupContent.querySelectorAll(".carousel-img, video").forEach(el => el.remove());
      popup.style.opacity = "0";
      popup.style.visibility = "hidden";
      setTimeout(() => popup.classList.add("hidden"), 300);
    }

    function navigatePrev() {
      if (isTransitioning) return;
      currentIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length;
      showMedia("prev");
    }

    function navigateNext() {
      if (isTransitioning) return;
      currentIndex = (currentIndex + 1) % currentMedia.length;
      showMedia("next");
    }

    // Event listeners
    on("click", ".icon-box a", function (e) {
      const data = this.getAttribute("data-images");
      if (!data) return;
      e.preventDefault();
      try {
        currentMedia = JSON.parse(data);
        if (!Array.isArray(currentMedia) || currentMedia.length === 0) return;
        currentIndex = 0;
        showMedia();
        popup.classList.remove("hidden");
        popup.style.opacity = "1";
        popup.style.visibility = "visible";
      } catch (err) {
        console.error("Error leyendo data-images:", err);
      }
    }, true);

    on("click", ".close-btn", closePopup);
    on("click", ".prev-btn", navigatePrev);
    on("click", ".next-btn", navigateNext);

    // Teclado
    document.addEventListener("keydown", (e) => {
      if (!popup.classList.contains("hidden")) {
        if (e.key === "ArrowLeft") { e.preventDefault(); navigatePrev(); }
        if (e.key === "ArrowRight") { e.preventDefault(); navigateNext(); }
        if (e.key === "Escape") { e.preventDefault(); closePopup(); }
      }
    });

    // Swipe para móviles
    let startX = 0;
    popup.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    popup.addEventListener("touchend", (e) => {
      let endX = e.changedTouches[0].clientX;
      if (Math.abs(startX - endX) > 50) {
        if (startX > endX) navigateNext();
        else navigatePrev();
      }
    }, { passive: true });
  });

  

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });

      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });portfolio-lightbox


  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()