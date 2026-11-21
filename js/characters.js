(() => {
  const mount = document.getElementById("ch-list");
  if (!mount) return;

  const style = document.createElement("style");
  style.textContent = `
    #ch-list .chd-hero {
      margin-bottom: 48px;
    }
    #ch-list .chd-panel {
      padding-top: 24px;
      padding-bottom: 96px;
    }
    #ch-list .chd-panel__title {
      margin-bottom: 16px;
    }
  `;
  document.head.appendChild(style);

  mount.innerHTML = CHARACTERS.map((c) => `
    <section class="chd-hero">
      <img class="chd-hero__img" src="${c.image}" alt="${c.name}" loading="lazy" />
      <div class="chd-hero__body">
        <h2 class="chd-title">${c.name}</h2>
        <p class="chd-role">${c.role}</p>
      </div>
    </section>
    ${c.panels.map((p) => `
      <section class="chd-panel">
        <h3 class="chd-panel__title">${p.title}</h3>
        <p class="chd-panel__text">${p.text}</p>
      </section>
    `).join("")}
  `).join("");
})();