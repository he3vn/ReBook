(() => {
  const S = [
    { src: "music/recollect.mp3", cover: "s.jpeg", title: "Re:Collect", artist: "Konomi Suzuki" },
    { src: "music/staypeak.mp3", cover: "stayalive.jpeg", title: "Stay Alive", artist: "Rie Takanashi" },
    { src: "music/styxhelix.mp3", cover: "styx.jpeg", title: "Styx Helix", artist: "Myth and Roid" }
  ];

  const nav = document.getElementById("nav-right");
  if (!nav || document.getElementById("music-player")) return;

  const style = document.createElement("style");
  style.textContent = `
.mp-bar,.mp-bar *{box-sizing:border-box;margin:0;padding:0}
.mp-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;color:inherit;font:inherit}
.mp-bar img{width:32px;height:32px;border-radius:4px;object-fit:cover;background:#ddd}
.mp-t{line-height:1.25;width:140px}
.mp-name,.mp-art{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp-name{font-size:13px;font-weight:500;color:#111}
.mp-art{font-size:11px;color:#888}
.mp-c{display:flex;align-items:center}
.mp-bar button{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:50%;background:none;cursor:pointer}
.mp-bar button:hover{background:#eee}
.mp-bar svg{width:16px;height:16px;fill:#111}
.mp-bar .mp-p{width:32px;height:32px;background:#111}
.mp-bar .mp-p:hover{background:#333}
.mp-p svg{fill:#fff}
.mp-bar input{width:80px;height:3px;appearance:none;-webkit-appearance:none;border-radius:2px;outline:0;cursor:pointer;background:linear-gradient(90deg,#111 var(--p,0%),#ddd var(--p,0%))}
.mp-bar input::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:50%;background:#111}
.mp-bar input::-moz-range-thumb{width:10px;height:10px;border:0;border-radius:50%;background:#111}
@media(max-width:1150px){.mp-art,.mp-bar input{display:none}.mp-t{width:100px}}
`;
  document.head.appendChild(style);

  nav.innerHTML = `
<div class="mp-bar" id="music-player">
  <img alt="">
  <div class="mp-t"><span class="mp-name"></span><span class="mp-art"></span></div>
  <div class="mp-c">
    <button class="mp-b" type="button" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12 18 18V6z"/></svg></button>
    <button class="mp-p" type="button" aria-label="Play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
    <button class="mp-n" type="button" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg></button>
  </div>
  <input type="range" value="0" min="0" max="100" step="0.1" aria-label="Seek">
  <button class="mp-m" type="button" aria-label="Mute"><svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg></button>
  <audio preload="auto" autoplay></audio>
</div>`;

  const r = document.getElementById("music-player");
  const q = (s) => r.querySelector(s);
  const a = q("audio");
  const pr = q("input");
  const PLAY = "M8 5v14l11-7z";
  const PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z";
  let n = 0;

  const bar = (v) => {
    pr.value = v;
    pr.style.setProperty("--p", v + "%");
  };

  const load = (k) => {
    n = (k + S.length) % S.length;
    const s = S[n];
    a.src = s.src;
    q("img").src = s.cover;
    q(".mp-name").textContent = s.title;
    q(".mp-art").textContent = s.artist;
    q(".mp-t").title = s.title + " - " + s.artist;
    bar(0);
  };

  const go = (k) => {
    load(k);
    a.muted = false;
    a.play().catch(() => {});
  };

  q(".mp-p").onclick = () => {
    if (a.paused) {
      a.muted = false;
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };
  q(".mp-n").onclick = () => go(n + 1);
  q(".mp-b").onclick = () => go(n - 1);
  q(".mp-m").onclick = (e) => {
    a.muted = !a.muted;
    e.currentTarget.style.opacity = a.muted ? 0.4 : 1;
  };

  a.onplay = a.onpause = () => q(".mp-p path").setAttribute("d", a.paused ? PLAY : PAUSE);
  a.ontimeupdate = () => bar((a.currentTime / a.duration) * 100 || 0);
  pr.oninput = () => {
    if (a.duration) a.currentTime = (pr.value / 100) * a.duration;
    bar(pr.value);
  };
  a.onended = () => go(n + 1);

  load(0);
  a.load();

  const events = ["click", "pointerdown", "keydown", "touchstart", "scroll", "wheel"];
  const KEY = "rb-music-started";

  const setMuteStyle = () => {
    q(".mp-m").style.opacity = a.muted ? 0.4 : 1;
  };

  const startAudio = () => {
    a.muted = false;
    setMuteStyle();
    const p = a.play();
    if (!p || !p.then) return;
    p.then(() => {
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      events.forEach((ev) => window.removeEventListener(ev, startAudio, true));
    }).catch(() => {});
  };

  const tryPlay = () => {
    if (a.paused === false) return;
    const p = a.play();
    if (!p || !p.then) return;
    p.then(() => {
      if (!a.muted) {
        try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      }
    }).catch(() => {
      a.muted = true;
      setMuteStyle();
      const m = a.play();
      if (!m || !m.then) return;
      m.then(() => {
        a.muted = false;
        setMuteStyle();
        const u = a.play();
        if (u && u.then) u.catch(() => {});
      }).catch(() => {});
    });
  };

  const autoplay = () => {
    a.muted = false;
    setMuteStyle();
    tryPlay();
    ["canplay", "loadeddata", "canplaythrough"].forEach((ev) => a.addEventListener(ev, tryPlay, { once: true }));
    setTimeout(tryPlay, 300);
    setTimeout(tryPlay, 900);
    setTimeout(tryPlay, 2000);
  };

  autoplay();
  events.forEach((ev) => window.addEventListener(ev, startAudio, { capture: true, passive: true }));
})();