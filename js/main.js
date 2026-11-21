
(() => {
  "use strict";

  const hasGsap = typeof gsap !== "undefined";
  if (hasGsap) {
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);
    if (typeof CustomEase !== "undefined") {
      gsap.registerPlugin(CustomEase);
      try {
        CustomEase.create("osmo", "0.625, 0.05, 0, 1");
      } catch (e) {
        
      }
      gsap.defaults({ ease: "osmo", duration: 0.7 });
    }
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  


  const getLenis = () => {
    try {
      return typeof lenis !== "undefined" && lenis ? lenis : null;
    } catch (e) {
      return null;
    }
  };

  const scrollToY = (y) => {
    const l = getLenis();
    if (l) {
      l.scrollTo(y, { duration: 1.1 });
      return;
    }
    window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  };

  
  if (typeof Lenis !== "undefined" && !getLenis() && !reduced) {
    try {
      window.lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
      });
    } catch (e) {
      
    }
  }

  (() => {
    const l = getLenis();
    if (!l || !hasGsap || reduced) return;

    l.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => l.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  })();

  
  
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    if (!id) return;

    link.addEventListener("click", (e) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      if (id === "top") {
        scrollToY(0);
        return;
      }
      if (id === "bottom") {
        scrollToY(document.documentElement.scrollHeight);
        return;
      }
      const y = target.getBoundingClientRect().top + window.scrollY - 40;
      scrollToY(Math.max(0, y));
    });
  });

  


  (() => {
    const button = document.querySelector(".nav_menu-button");
    const menus = document.querySelectorAll(".rb-nav-menu");
    if (!button || !menus.length) return;

    const close = () => {
      menus.forEach((m) => m.classList.remove("rb-nav-open"));
      button.setAttribute("aria-expanded", "false");
    };

    button.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !menus[0].classList.contains("rb-nav-open");
      menus.forEach((m) => m.classList.toggle("rb-nav-open", open));
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  })();

  


  (() => {
    const root = document.querySelector(".section_home-banner .swiper");
    if (!root) return;

    const slides = Array.from(root.querySelectorAll(".swiper-slide"));
    if (slides.length < 2) return;

    const pagination = root.querySelector(".swiper-pagination");
    const DELAY = 3000;
    let index = 0;
    let timer = null;

    const bgOf = (slide) => slide.querySelector("[data-bg]");

    const loadBg = (slide) => {
      const el = bgOf(slide);
      if (!el) return;
      const src = el.dataset.bg;
      if (!src || el.dataset.loaded) return;
      el.dataset.loaded = "1";
      const img = new Image();
      img.onload = () => {
        el.style.backgroundImage = "url('" + src + "')";
      };
      img.src = src;
    };

    slides.forEach((slide, i) => {
      slide.classList.toggle("swiper-slide-active", i === 0);
      slide.setAttribute("aria-hidden", i === 0 ? "false" : "true");
    });

    loadBg(slides[0]);
    loadBg(slides[1]);

    const bullets = [];
    if (pagination) {
      pagination.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "swiper-pagination-bullet";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", () => {
          go(i);
          restart();
        });
        pagination.appendChild(b);
        bullets.push(b);
      });
    }

    const go = (next) => {
      index = (next + slides.length) % slides.length;
      loadBg(slides[index]);
      loadBg(slides[(index + 1) % slides.length]);
      slides.forEach((s, i) => {
        s.classList.toggle("swiper-slide-active", i === index);
        s.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      bullets.forEach((b, i) =>
        b.classList.toggle("swiper-pagination-bullet-active", i === index)
      );
    };

    const start = () => {
      timer = setInterval(() => go(index + 1), DELAY);
    };
    const stop = () => timer && clearInterval(timer);
    const restart = () => {
      stop();
      start();
    };

    
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) =>
          entries[0].isIntersecting ? restart() : stop(),
        { threshold: 0.2 }
      ).observe(root);
    } else {
      start();
    }

    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    idle(() => slides.forEach(loadBg));
  })();

  


  (() => {
    const block = document.querySelector(".nav_search-block");
    if (!block) return;

    const open = () => block.classList.add("is-open");
    const close = () => block.classList.remove("is-open");

    document.querySelectorAll(".is-search-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        block.classList.contains("is-open") ? close() : open();
      });
    });

    document.querySelectorAll(".close-search").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        close();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    
    const form = document.querySelector("#reboot-search-form");
    if (form) {
      form.setAttribute("onsubmit", "return false");

      const success = form.parentElement.querySelector(
        ".form_message-success-wrapper",
      );

      const showComingSoon = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        if (success) {
          success.style.setProperty("display", "block", "important");
          const inner = success.querySelector(".form_message-success");
          if (inner) inner.style.setProperty("display", "block", "important");
        }
        return false;
      };

      form.addEventListener("submit", showComingSoon, true);
      form.addEventListener("keydown", (e) => {
        if (e.key === "Enter") showComingSoon(e);
      });
      form.querySelectorAll('input[type="submit"]').forEach((btn) => {
        btn.addEventListener("click", showComingSoon, true);
      });
    }
  })();

  


  (() => {
    const names = [...document.querySelectorAll(".author_name")];
    const logos = [...document.querySelectorAll(".authors_background-item")];
    if (!names.length || !logos.length) return;

    let index = 0;
    let pinned = -1;
    let timer = null;

    const show = (i) => {
      logos.forEach((el, k) => el.classList.toggle("is-active", k === i));
      names.forEach((el, k) => el.classList.toggle("is-active", k === i));
    };

    const rotate = () => {
      if (pinned >= 0) return;
      index = (index + 1) % logos.length;
      show(index);
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(rotate, 4000);
    };

    names.forEach((name, i) => {
      const pick = () => {
        pinned = i;
        index = i;
        show(i);
      };

      name.addEventListener("mouseenter", pick);
      name.addEventListener("focus", pick);
    });

    const band = document.querySelector(".authors_home-wrapper");
    if (band) {
      band.addEventListener("mouseleave", () => {
        pinned = -1;
      });
    }

    
    
    
    const column = document.querySelector(".authors_list-wrapper");
    const syncLenisPrevent = () => {
      if (!column) return;
      if (column.scrollHeight > column.clientHeight + 1) {
        column.setAttribute("data-lenis-prevent", "");
      } else {
        column.removeAttribute("data-lenis-prevent");
      }
    };

    syncLenisPrevent();
    window.addEventListener("resize", syncLenisPrevent);
    window.addEventListener("load", syncLenisPrevent);

    
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const i = names.findIndex((n) => n.closest(".author_item") === entry.target);
            if (i < 0 || pinned >= 0) return;
            index = i;
            show(i);
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );

      names.forEach((name) => observer.observe(name.closest(".author_item") || name));
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(timer);
        timer = null;
      } else {
        start();
      }
    });

    show(0);
    start();
  })();

  


  if (hasGsap && !reduced) {
    const reveal = (selector, opts = {}) => {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;

      gsap.fromTo(
        els,
        { opacity: 0, y: opts.y ?? 28 },
        {
          opacity: 1,
          y: 0,
          duration: opts.duration ?? 0.9,
          stagger: opts.stagger ?? 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: opts.trigger ?? els[0],
            start: opts.start ?? "top 88%",
            once: true,
          },
        },
      );
    };

    
    (() => {
      const slider = document.querySelector(".rb-slider-wrap .books-slider");
      if (!slider) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is--in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );

      observer.observe(slider);
    })();

    
    reveal(".section_intro .intro_wrapper > *", {
      trigger: ".section_intro",
      y: 40,
      stagger: 0.12,
    });

    
    
    reveal(".section_home-authors .home_authors-header > *", {
      trigger: ".section_home-authors",
      y: 24,
    });
    reveal(".section_home-featured .home-featured_left > *", {
      trigger: ".section_home-featured",
      y: 24,
    });

    
    reveal(".featured_card .image_featured", {
      trigger: ".section_home-featured",
      y: 40,
      duration: 1.1,
    });
    reveal(".featured_card .featured_text > *", {
      trigger: ".featured_card",
      y: 24,
      stagger: 0.1,
    });

    
    reveal(".authors_home-wrapper .author_item", {
      trigger: ".authors_home-wrapper",
      y: 20,
      stagger: 0.07,
    });

    
    reveal(".rb-starring__item", {
      trigger: ".rb-starring",
      y: 30,
      stagger: 0.03,
      start: "top 92%",
    });
  } else {
    
    document
      .querySelectorAll(".rb-slider-wrap .books-slider")
      .forEach((el) => el.classList.add("is--in"));
  }

  


  (() => {
    const track = document.querySelector(".rb-starring__track");
    if (!track) return;

    let down = false,
      startX = 0,
      startScroll = 0,
      moved = 0;

    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
    });

    const end = () => {
      down = false;
      track.classList.remove("is-dragging");
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("pointerleave", end);

    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.abs(dx);
      track.scrollLeft = startScroll - dx;
    });

    
    track.addEventListener(
      "click",
      (e) => {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
          moved = 0;
        }
      },
      true,
    );

    track.setAttribute("tabindex", "0");
    track.addEventListener("keydown", (e) => {
      const step = track.clientWidth * 0.8;
      if (e.key === "ArrowRight") {
        track.scrollBy({ left: step, behavior: "smooth" });
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        track.scrollBy({ left: -step, behavior: "smooth" });
        e.preventDefault();
      }
    });
  })();
})();
