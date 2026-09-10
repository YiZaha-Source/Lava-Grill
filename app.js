(function () {
  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtns = document.querySelectorAll('[data-theme-toggle]');
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function paintThemeIcon(btn) {
    btn.innerHTML =
      theme === 'dark'
        ? '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }
  themeBtns.forEach(paintThemeIcon);
  themeBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      themeBtns.forEach(paintThemeIcon);
    })
  );

  /* ---------- Header scroll behavior ---------- */
  const header = document.querySelector('.header');
  let lastY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      header.classList.toggle('header--scrolled', y > 8);
      if (y > lastY && y > 140) header.classList.add('header--hidden');
      else header.classList.remove('header--hidden');
      lastY = y;
    },
    { passive: true }
  );

  /* ---------- Mobile nav ---------- */
  const mobileNav = document.querySelector('.mobile-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileClose = document.querySelector('.mobile-nav-close');
  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileClose.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobileNav));

  /* ---------- Menu rendering ---------- */
  const tabsEl = document.getElementById('menuTabs');
  const panelEl = document.getElementById('menuPanel');
  const searchInput = document.getElementById('menuSearch');
  const emptyEl = document.getElementById('menuEmpty');

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderTabs() {
    const allTab = `<button class="menu-tab is-active" data-cat="all">All</button>`;
    const tabs = MENU.map((cat) => `<button class="menu-tab" data-cat="${cat.id}">${escapeHtml(cat.label)}</button>`).join('');
    tabsEl.innerHTML = allTab + tabs;
  }

  function renderMenu(query) {
    const q = (query || '').trim().toLowerCase();
    let visibleCount = 0;
    const html = MENU.map((cat) => {
      const items = cat.items.filter((it) => !q || it.name.toLowerCase().includes(q) || (it.desc && it.desc.toLowerCase().includes(q)));
      if (!items.length) return '';
      visibleCount += items.length;
      const noteHtml = cat.note ? `<span class="menu-category-note">${escapeHtml(cat.note)}</span>` : '';
      const itemsHtml = items
        .map(
          (it) => `
        <div class="menu-item">
          <div>
            <div class="menu-item-name">${escapeHtml(it.name)}</div>
            ${it.desc ? `<div class="menu-item-desc">${escapeHtml(it.desc)}</div>` : ''}
          </div>
          <div class="menu-item-price">${escapeHtml(it.price)}</div>
        </div>`
        )
        .join('');
      return `
      <div class="menu-category" data-cat="${cat.id}" id="cat-${cat.id}">
        <div class="menu-category-head">
          <h3>${escapeHtml(cat.label)}</h3>
          ${noteHtml}
        </div>
        <div class="menu-items">${itemsHtml}</div>
      </div>`;
    }).join('');
    panelEl.innerHTML = html;
    emptyEl.classList.toggle('is-visible', visibleCount === 0);
  }

  renderTabs();
  renderMenu('');

  let activeCat = 'all';
  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-tab');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    tabsEl.querySelectorAll('.menu-tab').forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.menu-category').forEach((el) => {
      el.style.display = activeCat === 'all' || el.dataset.cat === activeCat ? '' : 'none';
    });
  });

  searchInput.addEventListener('input', (e) => {
    renderMenu(e.target.value);
    // reset tab filter visual state to "All" while searching
    if (e.target.value.trim()) {
      tabsEl.querySelectorAll('.menu-tab').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === 'all'));
      activeCat = 'all';
    }
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
