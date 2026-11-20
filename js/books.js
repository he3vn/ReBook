// re-book — the Aardvark book slider: the draggable row of book cards, the
// handwritten note reveal and the contrast check that puts black or white
// type on each card background.

(() => {
  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(SplitText, CustomEase);
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  gsap.defaults({ ease: "osmo", duration: 0.6 });

  const nextPage = document;
  const rafs = [];

  // ---------------------------------------------------------------------
  // ParallaxSlider — Aardvark's books slider
  // ---------------------------------------------------------------------
  class ParallaxSlider extends Smooothy {
    constructor(wrapper, config = {}) {
      super(wrapper, config);

      this.wrapper = wrapper;
      this.itemsEls = [...wrapper.querySelectorAll("[data-books-slider-item]")];
      this.createInterface(
        wrapper.parentNode.parentNode.querySelector(
          "[data-books-slider-controls]",
        ),
      );

      this.itemSettings = this.itemsEls.map((el, index) => {
        const direction = index % 2 === 0 ? -1 : 1;

        const rotation = gsap.utils.random(1.5, 3, 0.1) * direction;
        // Aardvark drifts the cards up and down as the row scrolls. We keep
        // the tilt but drop the vertical drift so every card stays on one
        // horizontal line.
        const yOffset = 0;

        el.style.setProperty("--book-slider-item-rotate", `${-rotation}deg`);
        el.style.willChange = "transform";

        return { el, rotation, yOffset };
      });

      this.#handleLinks();
    }

    createInterface(int) {
      if (!int) return;
      const arrows = [...int.children];

      this.prevBtn = arrows[0];
      this.nextBtn = arrows[1];

      if (this.prevBtn) this.prevBtn.onclick = () => this.goToPrev();
      if (this.nextBtn) this.nextBtn.onclick = () => this.goToNext();

      this.updateArrowState();
    }

    updateArrowState() {
      if (!this.prevBtn || !this.nextBtn) return;

      const currentSlide = this.currentSlide ?? 0;
      const progress = gsap.utils.clamp(0, 1, this.progress ?? 0);

      this.prevBtn.classList.toggle("is--disabled", currentSlide <= 0);
      this.nextBtn.classList.toggle("is--disabled", progress >= 0.95);
    }

    #handleLinks() {
      const links = [...this.wrapper.querySelectorAll("a")];

      links.forEach((link) => {
        let startX = 0;
        let startY = 0;
        let pointerDown = false;
        let dragged = false;

        link.addEventListener("pointerdown", (e) => {
          startX = e.clientX;
          startY = e.clientY;
          pointerDown = true;
          dragged = false;
        });

        window.addEventListener("pointermove", (e) => {
          if (!pointerDown) return;

          const deltaX = Math.abs(e.clientX - startX);
          const deltaY = Math.abs(e.clientY - startY);

          if (deltaX > 5 || deltaY > 5) {
            dragged = true;
          }
        });

        window.addEventListener("pointerup", () => {
          pointerDown = false;
        });

        link.addEventListener(
          "click",
          (e) => {
            if (dragged) {
              e.preventDefault();
              e.stopPropagation();
            }

            dragged = false;
          },
          true,
        );
      });
    }

    onUpdate = () => {
      this.updateArrowState();

      const wrapRect = this.wrapper.getBoundingClientRect();
      const wrapCenter = wrapRect.left + wrapRect.width / 2;
      const maxDistance = wrapRect.width / 2;

      this.itemSettings.forEach(({ el, rotation, yOffset }) => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.left + rect.width / 2;

        const norm = (elCenter - wrapCenter) / maxDistance;

        const clamped = gsap.utils.clamp(-2, 2, norm);
        const strength = Math.sin(clamped * 1.2);

        const moveY = strength * yOffset;
        // No parallax tilt either — the cards stay on one horizontal line.
        const rotate = 0;

        el.style.transform = `translateY(${moveY}%) rotate(${rotate}deg)`;
      });
    };

    destroy() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      this.itemsEls.forEach((el) => {
        el.style.willChange = "";
        el.style.transform = "";
        el.style.removeProperty("--book-slider-item-rotate");
      });

      if (super.destroy) {
        super.destroy();
      }
    }
  }

  const booksSliderMM = gsap.matchMedia();

  function initBooksSlider() {
    booksSliderMM.add("(min-width: 992px)", () => {
      const elements = nextPage.querySelectorAll("[data-books-slider]");
      const instances = [];

      elements.forEach((element) => {
        const sliderWrapper = element.querySelector(
          "[data-books-slider-wrapper]",
        );
        if (!sliderWrapper) return;

        const slider = new ParallaxSlider(sliderWrapper, {
          infinite: false,
          snap: false,
          dragSensitivity: 0.008,
          lerpFactor: 0.225,
          scrollSensitivity: 1,
          bounceLimit: 0.5,
          setOffset: ({ itemWidth, wrapperWidth }) => {
            return wrapperWidth - 32;
          },
        });


        const step = () => {
          const width =
            sliderWrapper.parentNode.getBoundingClientRect().width || 800;
          return Math.round(width * 0.8);
        };

        if (slider.prevBtn) {
          slider.prevBtn.onclick = () => {
            slider.target = Math.min(
              0,
              Math.round((slider.current ?? 0) + step()),
            );
          };
        }

        if (slider.nextBtn) {
          slider.nextBtn.onclick = () => {
            slider.target = Math.max(
              slider.maxScroll ?? 0,
              Math.round((slider.current ?? 0) - step()),
            );
          };
        }

        const rafFn = () => slider.update();
        rafs.push(rafFn);

        instances.push({ slider, rafFn });
      });

      return () => {
        instances.forEach(({ slider, rafFn }) => {
          const index = rafs.indexOf(rafFn);
          if (index !== -1) rafs.splice(index, 1);

          if (typeof slider.destroy === "function") {
            slider.destroy();
          }

          if (typeof slider.cleanup === "function") {
            slider.cleanup();
          }
        });
      };
    });
  }


  function initHandwrittenTextInview() {
    const elements = nextPage.querySelectorAll("[data-handwritten-text-inview]");

    elements.forEach((element) => {
      let mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top 95%",
          },
        });

        const textSplit = new SplitText(element, {
          type: "words, chars",
          tag: "span",
          charsClass: "split-char",
          wordsClass: "split-word",
        });

        gsap.set(textSplit.words, { display: "inline-block" });
        gsap.set(textSplit.chars, {
          display: "inline-block",
          opacity: 0,
          rotate: 22,
          x: "-0.25em",
          y: "0.5em",
        });

        tl.to(textSplit.chars, {
          opacity: 1,
          rotate: 0,
          x: "0em",
          y: "0em",
          ease: "elastic.out(1, 0.75)",
          duration: 0.75,
          stagger: 0.016,
        });
      });
    });
  }


  function initCheckContrast() {
    nextPage.querySelectorAll("[data-check-contrast]").forEach((wrapper) => {
      const bg = wrapper.querySelector("[data-check-contrast-bg]");
      const texts = wrapper.querySelectorAll("[data-check-contrast-text]");

      if (!bg || !texts.length) return;

      const bgColor = getComputedStyle(bg).backgroundColor;
      const rgb = bgColor.match(/\d+/g)?.map(Number);

      if (!rgb || rgb.length < 3) return;

      const [r, g, b] = rgb;

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      const textColor = luminance > 0.5 ? "#000" : "#fff";

      texts.forEach((text) => {
        text.style.color = textColor;
      });
    });
  }


  function initAnimate() {
    rafs.forEach((raf) => raf());
    requestAnimationFrame(initAnimate);
  }


  function boot() {
    initBooksSlider();
    initHandwrittenTextInview();
    initCheckContrast();
    initAnimate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
