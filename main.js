(function () {
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('efmods-theme', theme);

    try { updateNavPill(); } catch (e) { /* ignore */ }

    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const themeIcon = themeToggle.querySelector('i');
    if (!themeIcon) return;

    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
      themeToggle.setAttribute('title', '切换到浅色主题');
    } else {
      themeIcon.className = 'fas fa-moon';
      themeToggle.setAttribute('title', '切换到深色主题');
    }
  }

  function setFxMode(mode) {
    const root = document.documentElement;
    const m = mode === 'off' ? 'off' : 'on';

    if (m === 'off') root.setAttribute('data-fx', 'off');
    else root.removeAttribute('data-fx');

    localStorage.setItem('efmods-fx', m);
    syncSettingsUI();
  }

  function setShowTime(enabled) {
    const root = document.documentElement;
    const on = !!enabled;
    root.setAttribute('data-show-time', on ? '1' : '0');
    localStorage.setItem('efmods-show-time', on ? '1' : '0');
    syncSettingsUI();
  }

  function setSpotlight(enabled) {
    const root = document.documentElement;
    const on = !!enabled;
    root.setAttribute('data-spotlight', on ? '1' : '0');
    localStorage.setItem('efmods-spotlight', on ? '1' : '0');
    syncSettingsUI();
  }

  function setPerfMode(mode) {
    const root = document.documentElement;
    const m = mode === 'low' ? 'low' : 'high';

    if (m === 'low') {
      root.setAttribute('data-perf', 'low');
      setFxMode('off');
    } else {
      root.removeAttribute('data-perf');
      setFxMode('on');
    }

    localStorage.setItem('efmods-perf', m);

    const btn = document.getElementById('perf-toggle');
    if (!btn) return;

    const isLow = m === 'low';
    btn.setAttribute('aria-pressed', isLow ? 'true' : 'false');
    btn.textContent = isLow ? '性能：开' : '性能';
    btn.setAttribute('title', isLow ? '关闭性能模式（恢复特效）' : '开启性能模式（关闭特效）');
  }

  function syncSettingsUI() {
    const root = document.documentElement;

    const showTime = root.getAttribute('data-show-time') !== '0';
    const spotlight = root.getAttribute('data-spotlight') !== '0';
    const theme = root.getAttribute('data-theme') || 'light';
    const fx = root.getAttribute('data-fx') === 'off' ? 'off' : 'on';

    const cbTime = document.getElementById('setting-show-time');
    if (cbTime) cbTime.checked = !!showTime;

    const cbSpot = document.getElementById('setting-spotlight');
    if (cbSpot) cbSpot.checked = !!spotlight;

    const btnLight = document.getElementById('setting-theme-light');
    const btnDark = document.getElementById('setting-theme-dark');
    if (btnLight) btnLight.classList.toggle('active', theme !== 'dark');
    if (btnDark) btnDark.classList.toggle('active', theme === 'dark');

    const btnVisual = document.getElementById('setting-fx-visual');
    const btnPerf = document.getElementById('setting-fx-perf');
    if (btnVisual) btnVisual.classList.toggle('active', fx === 'on');
    if (btnPerf) btnPerf.classList.toggle('active', fx === 'off');

    const range = document.getElementById('setting-time-hour');
    const label = document.getElementById('setting-time-hour-label');
    if (range && label) {
      const forced = root.getAttribute('data-time-override');
      if (forced !== null && forced !== '') {
        range.value = String(forced);
        label.textContent = `模拟：${String(forced).padStart(2, '0')}:00`;
      } else {
        const nowH = new Date().getHours();
        range.value = String(nowH);
        label.textContent = '自动';
      }
    }
  }

  function setupReveal(scopeEl) {
    if (!scopeEl) return;

    const revealEls = Array.from(scopeEl.querySelectorAll('.section, details.log-block'));

    let logIndex = 0;
    revealEls.forEach(el => {
      el.classList.add('reveal');

      if (el.matches('details.log-block')) {
        const delay = Math.min(logIndex, 18) * 70;
        el.style.setProperty('--reveal-delay', `${delay}ms`);
        logIndex += 1;
      } else {
        el.style.setProperty('--reveal-delay', '0ms');
      }
    });

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('in-view'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, { root: null, threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(el => io.observe(el));
  }

  function openMobileNav() {
    const overlay = document.getElementById('mobile-nav-overlay');
    const toggle = document.getElementById('nav-toggle');
    if (!overlay || !toggle) return;

    document.body.classList.add('mobile-nav-open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    const overlay = document.getElementById('mobile-nav-overlay');
    const toggle = document.getElementById('nav-toggle');
    if (!overlay || !toggle) return;

    document.body.classList.remove('mobile-nav-open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function updateNavPill() {
    const menu = document.querySelector('.nav-menu.desktop-nav');
    if (!menu) return;

    const active = menu.querySelector('.nav-item.active');
    if (!active) return;

    const menuRect = menu.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();

    const left = Math.max(6, aRect.left - menuRect.left);
    const width = Math.max(0, aRect.width);

    menu.classList.add('has-pill');
    menu.style.setProperty('--pill-left', `${left}px`);
    menu.style.setProperty('--pill-width', `${width}px`);
  }

  function showPage(pageId, anchorId) {
    const navItems = document.querySelectorAll('.nav-item[data-page]');

    const targetPage = document.querySelector(pageId);
    if (!targetPage) return;

    const currentPage = document.querySelector('.page.active-page');

    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll(`.nav-item[data-page][href="${pageId}"]`).forEach(el => el.classList.add('active'));
    updateNavPill();

    if (currentPage === targetPage) {
      if (anchorId) {
        const anchorEl = document.querySelector(anchorId);
        if (anchorEl) anchorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentPage) {
      currentPage.classList.add('page-exit');
      setTimeout(() => {
        currentPage.classList.remove('active-page');
        currentPage.classList.remove('page-exit');
      }, 520);
    }

    setTimeout(() => {
      targetPage.classList.add('active-page');
      setupReveal(targetPage);

      setTimeout(() => {
        targetPage.querySelectorAll('.reveal:not(.in-view)').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('in-view');
          }
        });
      }, 100);

      if (anchorId) {
        const anchorEl = document.querySelector(anchorId);
        if (anchorEl) {
          anchorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 30);
  }

  function showFromHash(hash) {
    const safeHash = hash || '#home';

    const pageEl = document.querySelector(safeHash);
    if (pageEl && pageEl.classList.contains('page')) {
      showPage(safeHash);
      return;
    }

    const anchorEl = document.querySelector(safeHash);
    if (anchorEl) {
      const parentPage = anchorEl.closest('.page');
      if (parentPage && parentPage.id) {
        showPage(`#${parentPage.id}`, safeHash);
        return;
      }
    }

    showPage('#home');
  }

  async function copyText(text) {
    const value = String(text || '').trim();
    if (!value) return false;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }

  function setupCopyButtons() {
    const btns = Array.from(document.querySelectorAll('[data-copy]'));
    btns.forEach(btn => {
      btn.addEventListener('click', async function (e) {
        e.preventDefault();
        const text = this.getAttribute('data-copy') || '';

        try {
          const ok = await copyText(text);
          if (!ok) return;

          const old = this.textContent;
          this.textContent = '已复制';
          this.classList.add('copied');
          setTimeout(() => {
            this.textContent = old || '一键复制';
            this.classList.remove('copied');
          }, 1100);
        } catch (err) {
          // ignore
        }
      });
    });
  }

  function setupHeroSubtitleRotator() {
    const el = document.getElementById('hero-subtitle');
    if (!el) return;
    el.textContent = (el.textContent || '').trim();
  }

  function setupHeroVideoFallback() {
    const video = document.getElementById('hero-video');
    const fallback = document.getElementById('hero-video-fallback');
    if (!video || !fallback) return;

    let switched = false;

    function switchToFallback() {
      if (switched) return;
      switched = true;

      try {
        video.pause();
      } catch (e) {
        // ignore
      }

      video.hidden = true;
      fallback.hidden = false;
    }

    video.addEventListener('error', switchToFallback, { once: true });

    window.setTimeout(() => {
      const ok = (video.readyState >= 2) || (video.currentTime > 0);
      if (!ok) switchToFallback();
    }, 3000);
  }

  function setupWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;

    const STORAGE_KEY = 'efmods-welcome-refresh-count-v1';
    const EVERY = 5;

    function open() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    modal.addEventListener('click', function (e) {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest('[data-welcome-close="1"]')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });

    let n = 0;
    try { n = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0; } catch (e) { n = 0; }
    n += 1;

    const shouldShow = (n % EVERY) === 0;
    try { localStorage.setItem(STORAGE_KEY, String(n)); } catch (e) { /* ignore */ }

    if (!shouldShow) return;

    window.setTimeout(open, 420);
  }

  function setupNavDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
    if (!dropdowns.length) return;

    function closeAll() {
      dropdowns.forEach(dd => {
        dd.classList.remove('is-open');
        const btn = dd.querySelector('.nav-dropdown-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    dropdowns.forEach(dd => {
      const btn = dd.querySelector('.nav-dropdown-toggle');
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const open = dd.classList.contains('is-open');
        closeAll();
        if (!open) {
          dd.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      const original = dd.querySelector('.nav-dropdown-item[data-page]');
      if (original) {
        original.addEventListener('click', function (e) {
          e.preventDefault();
          const pageKey = this.getAttribute('data-page');
          if (!pageKey) return;
          closeAll();
          const pageId = `#${pageKey}`;
          showPage(pageId);
          window.history.pushState(null, '', pageId);
        });
      }
    });

    document.addEventListener('click', function (e) {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest('.nav-dropdown')) return;
      closeAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  function setupMaterialRipple() {
    document.addEventListener('pointerdown', function (e) {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const el = target.closest('.btn, .chip, .nav-item, .theme-toggle, .nav-toggle, .mobile-nav-close');
      if (!el) return;

      if (typeof e.button === 'number' && e.button !== 0) return;

      const rect = el.getBoundingClientRect();
      const size = Math.ceil(Math.max(rect.width, rect.height) * 1.8);
      const x = (e.clientX - rect.left) - size / 2;
      const y = (e.clientY - rect.top) - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'md-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      const old = el.querySelector('.md-ripple');
      if (old) old.remove();

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }, { passive: true });
  }

  function setupReadingProgress() {
    const bar = document.getElementById('reading-progress-bar');
    if (!bar) return;

    let ticking = false;

    function update() {
      ticking = false;
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
      const max = Math.max(0, doc.scrollHeight - doc.clientHeight);
      const p = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
      bar.style.transform = `scaleX(${p})`;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    requestUpdate();
  }

  function setupHomeClock() {
    const el = document.getElementById('current-time');
    if (!el) return;

    function pad2(n) {
      return String(n).padStart(2, '0');
    }

    function render() {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = pad2(d.getMonth() + 1);
      const dd = pad2(d.getDate());
      const hh = pad2(d.getHours());
      const mi = pad2(d.getMinutes());
      const ss = pad2(d.getSeconds());
      el.textContent = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    render();
    window.setInterval(render, 1000);
  }

  function setupOnlineTimeStatus() {
    const badge = document.getElementById('online-status');
    if (!badge) return;

    const KEY_OVERRIDE = 'efmods-time-override-hour';

    const timeEl = document.getElementById('online-time') || document.querySelector('.online-time');
    const startRaw = (timeEl && timeEl.getAttribute('data-start')) || '09:00';
    const endRaw = (timeEl && timeEl.getAttribute('data-end')) || '23:00';

    const NEAR_MINUTES = 30;

    function parseHm(s) {
      const m = String(s || '').match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;
      const hh = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
      return hh * 60 + mm;
    }

    function getOverrideHour() {
      const raw = localStorage.getItem(KEY_OVERRIDE);
      if (raw === null || raw === '') return null;
      const n = parseInt(raw, 10);
      if (Number.isNaN(n)) return null;
      if (n < 0 || n > 23) return null;
      return n;
    }

    const startMin = parseHm(startRaw) ?? (9 * 60);
    const endMin = parseHm(endRaw) ?? (23 * 60);

    let lastKey = '';

    function setBadge(text, cls) {
      const nextKey = `${text}|${cls}`;
      if (nextKey === lastKey) return;
      lastKey = nextKey;

      badge.classList.add('online-status-switch-out');
      window.setTimeout(() => {
        badge.textContent = text;
        badge.classList.remove('online-status--muted', 'online-status--on', 'online-status--off', 'online-status--near');
        badge.classList.add(cls);

        badge.classList.remove('online-status-switch-out');
        badge.classList.add('online-status-switch-in');
        window.setTimeout(() => badge.classList.remove('online-status-switch-in'), 380);
      }, 210);
    }

    function computeState(nowMin) {
      const isOn = nowMin >= startMin && nowMin < endMin;

      if (isOn) {
        if ((endMin - nowMin) <= NEAR_MINUTES) return { text: '快下班了', cls: 'online-status--near' };
        return { text: '上班了', cls: 'online-status--on' };
      }

      if (nowMin < startMin) {
        if ((startMin - nowMin) <= NEAR_MINUTES) return { text: '快上班了', cls: 'online-status--near' };
        return { text: '下班了', cls: 'online-status--off' };
      }

      return { text: '下班了', cls: 'online-status--off' };
    }

    function tick() {
      const d = new Date();
      const nowMin = d.getHours() * 60 + d.getMinutes();
      const s = computeState(nowMin);
      setBadge(s.text, s.cls);
    }

    tick();
    window.setInterval(tick, 6 * 1000);
  }

  function setupNewsTimeLabels() {
    const timeEls = Array.from(document.querySelectorAll('[data-news-published]'));
    if (!timeEls.length) return;

    function pad2(n) {
      return String(n).padStart(2, '0');
    }

    function formatAbsolute(d) {
      const yyyy = d.getFullYear();
      const mm = pad2(d.getMonth() + 1);
      const dd = pad2(d.getDate());
      const hh = pad2(d.getHours());
      const mi = pad2(d.getMinutes());
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }

    function renderOne(timeEl) {
      const raw = timeEl.getAttribute('data-news-published') || timeEl.getAttribute('datetime') || '';

      let published = null;
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
        const parts = raw.split('T');
        const ymd = parts[0].split('-').map(n => parseInt(n, 10));
        const hm = parts[1].split(':').map(n => parseInt(n, 10));
        if (ymd.length >= 3 && hm.length >= 2) {
          published = new Date(ymd[0], ymd[1] - 1, ymd[2], hm[0], hm[1], 0, 0);
        }
      }

      if (!published || Number.isNaN(published.getTime())) return;

      const now = new Date();
      const diffMs = now.getTime() - published.getTime();

      const card = timeEl.closest('.news-card');
      const badge = card ? (card.querySelector('[data-news-badge]') || card.querySelector('.news-badge')) : null;

      timeEl.textContent = formatAbsolute(published);

      if (badge) {
        badge.hidden = true;
      }

      if (diffMs < 0) {
        const sec = Math.ceil(Math.abs(diffMs) / 1000);
        if (sec <= 60) {
          timeEl.textContent = `将于 ${formatAbsolute(published)} 发布（即将）`;
          return;
        }

        const min = Math.ceil(sec / 60);
        if (min < 60) {
          timeEl.textContent = `将于 ${formatAbsolute(published)} 发布（${min} 分钟后）`;
          return;
        }

        const hour = Math.ceil(min / 60);
        timeEl.textContent = `将于 ${formatAbsolute(published)} 发布（约 ${hour} 小时后）`;
        return;
      }

      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
      const showNew = diffMs >= 0 && diffMs <= THREE_DAYS;

      if (badge) {
        badge.hidden = !showNew;
        if (showNew) badge.textContent = 'NEW';
      }

      if (diffMs < 60 * 1000) {
        timeEl.textContent = `${formatAbsolute(published)}（刚刚）`;
        return;
      }

      if (diffMs < 60 * 60 * 1000) {
        const m = Math.max(1, Math.floor(diffMs / (60 * 1000)));
        timeEl.textContent = `${formatAbsolute(published)}（${m} 分钟前）`;
        return;
      }

      if (diffMs < 24 * 60 * 60 * 1000) {
        const h = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
        timeEl.textContent = `${formatAbsolute(published)}（${h} 小时前）`;
        return;
      }

      const d = Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
      timeEl.textContent = `${formatAbsolute(published)}（${d} 天前）`;
    }

    function renderAll() {
      timeEls.forEach(renderOne);
    }

    renderAll();
    window.setInterval(renderAll, 30 * 1000);
  }

  function setupGlobalSpotlight() {
    let rafId = 0;
    let lastX = 0;
    let lastY = 0;

    function enabled() {
      const root = document.documentElement;
      if (root.getAttribute('data-fx') === 'off') return false;
      if (root.getAttribute('data-spotlight') === '0') return false;
      if (window.matchMedia && window.matchMedia('(hover: none)').matches) return false;
      return true;
    }

    function schedule() {
      if (!enabled()) return;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!enabled()) return;
        const x = window.innerWidth ? (lastX / window.innerWidth) * 100 : 50;
        const y = window.innerHeight ? (lastY / window.innerHeight) * 100 : 50;
        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
      });
    }

    function onMove(e) {
      if (!enabled()) return;
      lastX = e.clientX;
      lastY = e.clientY;
      schedule();
    }

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerenter', onMove, { passive: true });
  }

  function setupAnnouncementBar() {
    const bar = document.getElementById('announcement-bar');
    const closeBtn = document.getElementById('announcement-close');
    const peekBtn = document.getElementById('announcement-peek');

    if (!bar || !closeBtn || !peekBtn) return;

    const KEY = 'efmods-announcement-collapsed';

    function applyCollapsed(collapsed) {
      if (collapsed) document.body.classList.add('announcement-collapsed');
      else document.body.classList.remove('announcement-collapsed');

      peekBtn.hidden = !collapsed;
      localStorage.setItem(KEY, collapsed ? '1' : '0');

      if (!collapsed) {
        localStorage.setItem('efmods-announcement-glow', '0');
      }
    }

    const collapsed = localStorage.getItem(KEY) !== '0';
    applyCollapsed(collapsed);

    const glowKey = 'efmods-announcement-glow';
    if (collapsed) {
      const lastGlow = localStorage.getItem(glowKey);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (!lastGlow || now - parseInt(lastGlow) > oneDay) {
        if (Math.random() < 0.3) {
          document.body.classList.add('announcement-glow');
          localStorage.setItem(glowKey, now.toString());
        }
      }
    }

    closeBtn.addEventListener('click', function () {
      applyCollapsed(true);
    });

    peekBtn.addEventListener('click', function () {
      applyCollapsed(false);
    });
  }

  function setupAnnouncementRotator() {
    const textEl = document.getElementById('announcement-text');
    const linkEl = document.getElementById('announcement-link');
    if (!textEl || !linkEl) return;

    const items = [
      {
        text: '重磅声明：本站模组全部迁移至增强版专区，传承版不再更新！',
        href: '#news',
        label: '查看公告'
      },
      {
        text: '警察模组已更名为 TACTFR（原 EF Police Mod）',
        href: '#police-mod',
        label: '查看详情'
      },
      {
        text: '模组有问题不会解决？加入100+人的大家庭吧 QQ群1079691553',
        href: '#',
        label: '一键复制'
      }
    ];

    let idx = 0;

    function render(i) {
      const it = items[i] || items[0];
      textEl.textContent = it.text;
      linkEl.textContent = it.label;
      linkEl.setAttribute('href', it.href);
    }

    render(0);

    window.setInterval(() => {
      idx = (idx + 1) % items.length;
      render(idx);
    }, 6000);
  }

  function setupTimeMood() {
    const root = document.documentElement;

    const KEY_OVERRIDE = 'efmods-time-override-hour';

    function fxEnabled() {
      return root.getAttribute('data-fx') !== 'off';
    }

    function getOverrideHour() {
      const raw = localStorage.getItem(KEY_OVERRIDE);
      if (raw === null || raw === '') return null;
      const n = parseInt(raw, 10);
      if (Number.isNaN(n)) return null;
      if (n < 0 || n > 23) return null;
      return n;
    }

    function getEffectiveHour() {
      const forced = getOverrideHour();
      if (typeof forced === 'number') return forced;
      return new Date().getHours();
    }

    function ensureLayers() {
      if (document.getElementById('time-mood-layer-a')) return;

      const a = document.createElement('div');
      a.id = 'time-mood-layer-a';
      a.className = 'time-mood-layer';
      a.setAttribute('data-mood', 'day');
      a.style.opacity = '1';

      const b = document.createElement('div');
      b.id = 'time-mood-layer-b';
      b.className = 'time-mood-layer';
      b.setAttribute('data-mood', 'day');
      b.style.opacity = '0';

      document.body.appendChild(a);
      document.body.appendChild(b);

      const toast = document.createElement('div');
      toast.id = 'late-night-reminder';
      toast.className = 'late-night-reminder';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.textContent = '谢谢你这么晚还来看我，早点睡吧~';
      document.body.appendChild(toast);
    }

    function getMoodByHour(h) {
      if (h >= 22 || h <= 4) return 'late';
      if (h >= 5 && h <= 8) return 'sunrise';
      if (h >= 9 && h <= 16) return 'day';
      if (h >= 17 && h <= 19) return 'sunset';
      if (h >= 20 && h <= 21) return 'night';
      return 'day';
    }

    function setToastVisible(visible) {
      const toast = document.getElementById('late-night-reminder');
      if (!toast) return;
      toast.classList.toggle('show', !!visible);
    }

    function crossFadeTo(mood) {
      const a = document.getElementById('time-mood-layer-a');
      const b = document.getElementById('time-mood-layer-b');
      if (!a || !b) return;

      const activeKey = root.getAttribute('data-time-mood-active-layer') || 'a';
      const active = activeKey === 'b' ? b : a;
      const inactive = activeKey === 'b' ? a : b;

      if (active.getAttribute('data-mood') === mood) return;

      inactive.setAttribute('data-mood', mood);
      inactive.style.opacity = '1';
      active.style.opacity = '0';

      root.setAttribute('data-time-mood-active-layer', activeKey === 'b' ? 'a' : 'b');
    }

    function apply() {
      const h = getEffectiveHour();
      const mood = getMoodByHour(h);

      const forced = getOverrideHour();
      if (typeof forced === 'number') {
        root.setAttribute('data-time-override', String(forced));
      } else {
        root.removeAttribute('data-time-override');
      }

      root.setAttribute('data-time-mood', mood);

      if (!fxEnabled()) {
        const a = document.getElementById('time-mood-layer-a');
        const b = document.getElementById('time-mood-layer-b');
        if (a) a.style.opacity = '0';
        if (b) b.style.opacity = '0';
        setToastVisible(false);
        return;
      }

      ensureLayers();
      crossFadeTo(mood);
      setToastVisible(mood === 'late');
    }

    window.__efmodsApplyTimeMood = apply;

    ensureLayers();
    apply();
    window.setInterval(apply, 60 * 1000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const savedTheme = localStorage.getItem('efmods-theme') || 'light';
    setTheme(savedTheme);

    const savedShowTime = localStorage.getItem('efmods-show-time');
    setShowTime(savedShowTime !== '0');

    const savedSpotlight = localStorage.getItem('efmods-spotlight');
    setSpotlight(savedSpotlight !== '0');

    const savedFx = localStorage.getItem('efmods-fx');
    if (savedFx === 'off') {
      setPerfMode('low');
    } else if (savedFx === 'on') {
      setPerfMode('high');
    } else {
      const savedPerf = localStorage.getItem('efmods-perf') || 'high';
      setPerfMode(savedPerf);
    }

    setupCopyButtons();
    setupHeroSubtitleRotator();
    setupHeroVideoFallback();
    setupHomeClock();
    setupOnlineTimeStatus();
    setupNewsTimeLabels();
    setupReadingProgress();
    setupAnnouncementBar();
    setupAnnouncementRotator();
    setupGlobalSpotlight();

    const settingsToggle = document.getElementById('settings-toggle');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');

    function openSettings() {
      if (!settingsOverlay) return;
      document.body.classList.add('settings-open');
      settingsOverlay.setAttribute('aria-hidden', 'false');
    }

    function closeSettings() {
      if (!settingsOverlay) return;
      document.body.classList.remove('settings-open');
      settingsOverlay.setAttribute('aria-hidden', 'true');
    }

    if (settingsToggle) {
      settingsToggle.addEventListener('click', function () {
        const opened = document.body.classList.contains('settings-open');
        if (opened) closeSettings();
        else openSettings();
      });
    }

    if (settingsClose) {
      settingsClose.addEventListener('click', function () {
        closeSettings();
      });
    }

    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', function (e) {
        if (e.target === settingsOverlay) closeSettings();
      });
    }

    const cbTime = document.getElementById('setting-show-time');
    if (cbTime) {
      cbTime.addEventListener('change', function () {
        setShowTime(this.checked);
      });
    }

    const cbSpot = document.getElementById('setting-spotlight');
    if (cbSpot) {
      cbSpot.addEventListener('change', function () {
        setSpotlight(this.checked);
      });
    }

    const btnLight = document.getElementById('setting-theme-light');
    if (btnLight) btnLight.addEventListener('click', () => { setTheme('light'); syncSettingsUI(); });

    const btnDark = document.getElementById('setting-theme-dark');
    if (btnDark) btnDark.addEventListener('click', () => { setTheme('dark'); syncSettingsUI(); });

    const btnVisual = document.getElementById('setting-fx-visual');
    if (btnVisual) btnVisual.addEventListener('click', () => setPerfMode('high'));

    const btnPerf = document.getElementById('setting-fx-perf');
    if (btnPerf) btnPerf.addEventListener('click', () => setPerfMode('low'));

    const timeRange = document.getElementById('setting-time-hour');
    const timeReset = document.getElementById('setting-time-reset');
    if (timeRange) {
      timeRange.addEventListener('input', function () {
        const v = parseInt(String(this.value), 10);
        if (!Number.isNaN(v)) {
          localStorage.setItem('efmods-time-override-hour', String(v));
        }
        if (typeof window.__efmodsApplyTimeMood === 'function') window.__efmodsApplyTimeMood();
        syncSettingsUI();
      });
    }

    if (timeReset) {
      timeReset.addEventListener('click', function () {
        localStorage.removeItem('efmods-time-override-hour');
        if (typeof window.__efmodsApplyTimeMood === 'function') window.__efmodsApplyTimeMood();
        syncSettingsUI();
      });
    }

    syncSettingsUI();

    const perfToggle = document.getElementById('perf-toggle');
    if (perfToggle) {
      perfToggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-perf') === 'low' ? 'low' : 'high';
        const next = current === 'low' ? 'high' : 'low';
        setPerfMode(next);

        perfToggle.style.transform = 'scale(0.96)';
        setTimeout(() => {
          perfToggle.style.transform = 'translateY(-1px)';
          setTimeout(() => (perfToggle.style.transform = ''), 120);
        }, 120);
      });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
          themeToggle.style.transform = 'translateY(-1px)';
          setTimeout(() => (themeToggle.style.transform = ''), 120);
        }, 120);
      });
    }

    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('mobile-nav-close');
    const navOverlay = document.getElementById('mobile-nav-overlay');

    if (navToggle) {
      navToggle.addEventListener('click', function () {
        const opened = document.body.classList.contains('mobile-nav-open');
        if (opened) closeMobileNav();
        else openMobileNav();
      });
    }

    if (navClose) {
      navClose.addEventListener('click', function () {
        closeMobileNav();
      });
    }

    if (navOverlay) {
      navOverlay.addEventListener('click', function (e) {
        if (e.target === navOverlay) closeMobileNav();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });

    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
      item.addEventListener('click', function (e) {
        if (this.closest('.nav-dropdown')) return;

        e.preventDefault();

        const pageKey = this.getAttribute('data-page');
        if (!pageKey) return;

        const pageId = `#${pageKey}`;
        const anchorId = this.getAttribute('data-anchor');

        closeMobileNav();
        showPage(pageId, anchorId);
        window.history.pushState(null, '', anchorId || pageId);
      });
    });

    showFromHash(window.location.hash || '#home');
    window.addEventListener('popstate', function () {
      showFromHash(window.location.hash || '#home');
    });

    window.addEventListener('hashchange', function () {
      showFromHash(window.location.hash || '#home');
    });

    window.addEventListener('resize', function () {
      updateNavPill();
    });

    setupWelcomeModal();
    setupNavDropdowns();
  });

})();
