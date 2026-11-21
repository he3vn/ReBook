

(() => {
  "use strict";

  const QUOTES = [
    {
      text: "The one Julius relied on, the one Beatrice believed in, the one Echidna forgave, and the one you, Emilia, wished for… If that man's name is Natsuki Subaru, then…I am Natsuki Subaru",
      author: "Subaru",
    },
    {
      text: "I know. Because I'm always watching you, Subaru-kun. Even if nobody in the world believes in you, and even if you don't believe in yourself... I will believe in you.",
      author: "Rem",
    },
    {
      text: "I know you're scared out of your minds! Because I'm scared too! I have no special powers.I'm weak, I'm pathetic, and honestly, every time something goes wrong, I want to run away and cry!But even so... I'm still standing here!",
      author: "Subaru",
    },
  ];

  const COLORS = ["#e6d3b3", "#cddde6", "#e7c9c3"];

  const CSS = `
.rb-quotes{padding:8em 1.5em;background:#f2efe9}
.rb-quotes-inner{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:3em;text-align:center}
.rb-quotes-title{font-size:clamp(2.2rem,5.2vw,4.6rem);line-height:.95;margin:0;text-transform:uppercase;letter-spacing:-.02em;text-align:center}
.rb-quotes-list{position:relative;width:100%;display:flex;justify-content:center;align-items:center;min-height:26em}
.rb-quote{position:relative;flex:none;width:19em;margin-left:-5em;background:var(--c);color:#1d1d1d;border-radius:1.4em;padding:1.8em 1.5em 1.4em;box-shadow:0 1.5em 3em rgba(29,29,29,.16);will-change:transform;text-align:center}
.rb-quote:first-child{margin-left:0}
.rb-quote-text{margin:0 0 1.2em;font-size:1rem;line-height:1.5;text-align:center}
.rb-quote-by{margin:0;font-size:.85rem;line-height:1.3;text-align:center;letter-spacing:.02em}
@media(max-width:991px){.rb-quotes-list{min-height:32em}.rb-quote{width:16em;padding:1.3em 1.1em 1em}.rb-quote-text{font-size:.9rem}}
`;

  const mount = document.getElementById("rb-quotes");
  if (!mount) return;

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  mount.innerHTML =
    '<div class="rb-quotes-inner">' +
    '<h2 class="rb-quotes-title">My favorite<br>quotes</h2>' +
    '<div class="rb-quotes-list">' +
    QUOTES.map(
      (q, i) =>
        '<article class="rb-quote" style="--c:' +
        COLORS[i % COLORS.length] +
        '"><p class="rb-quote-text">' +
        q.text +
        '</p><p class="rb-quote-by">&ndash; ' +
        q.author +
        "</p></article>"
    ).join("") +
    "</div></div>";

  const list = mount.querySelector(".rb-quotes-list");
  const cards = Array.from(list.querySelectorAll(".rb-quote"));
  const gsap = window.gsap;

  const rand = (min, max) => min + Math.random() * (max - min);
  const ease = "elastic.out(1, 0.75)";

  const setCard = (card, values) => {
    if (gsap) {
      gsap.to(card, { ...values, duration: 0.9, ease });
    } else {
      const t = `translateX(${values.x || 0}px) rotate(${
        values.rotation || 0
      }deg) scale(${values.scale || 1})`;
      card.style.transform = t;
      card.style.zIndex = values.zIndex || "";
    }
  };

  const setText = (card, xPercent) => {
    const text = card.querySelector(".rb-quote-text");
    const by = card.querySelector(".rb-quote-by");
    if (gsap) {
      gsap.to([text, by], { xPercent, duration: 0.8, ease });
    } else {
      text.style.transform = by.style.transform = `translateX(${xPercent}%)`;
    }
  };

  const overlap = () => (cards[0] ? cards[0].offsetWidth * 0.36 : 0);

  cards.forEach((card, i) => {
    card.style.transform = `rotate(${rand(-4, 4)}deg)`;
    card.style.zIndex = String(i + 1);
  });

  let active = -1;

  const activate = (i) => {
    if (i === active) return;
    active = i;
    const step = overlap();
    cards.forEach((card, n) => {
      const on = n === i;
      setCard(card, {
        x: on ? 0 : n < i ? -step : step,
        rotation: on ? 0 : rand(-4, 4),
        scale: on ? 1.04 : 1,
        zIndex: on ? 5 : n + 1,
      });
      setText(card, 0);
    });
  };

  const reset = () => {
    if (active === -1) return;
    active = -1;
    cards.forEach((card, n) => {
      setCard(card, { x: 0, rotation: rand(-4, 4), scale: 1, zIndex: n + 1 });
      setText(card, 0);
    });
  };

  list.addEventListener("mousemove", (e) => {
    let hit = -1;
    cards.forEach((card, n) => {
      const box = card.getBoundingClientRect();
      if (e.clientX >= box.left && e.clientX <= box.right) hit = n;
    });
    if (hit === -1) reset();
    else activate(hit);
  });

  list.addEventListener("mouseleave", reset);

  if (gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(cards, {
      yPercent: "+=45",
      opacity: 0,
      duration: 1,
      ease,
      stagger: 0.08,
      scrollTrigger: { trigger: list, start: "top 85%", once: true },
    });
  }
})();
