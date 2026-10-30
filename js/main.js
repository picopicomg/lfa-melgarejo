(() => {
  document.documentElement.classList.remove('no-js');

  // ---------- Menú móvil ----------
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-menu');
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));

  // ---------- Submenús ----------
  const dropdowns = [...document.querySelectorAll('.has-dropdown')];
  const closeAll = (except) => dropdowns.forEach((d) => {
    if (d === except) return;
    d.classList.remove('open');
    d.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
  });
  dropdowns.forEach((dd) => {
    const btn = dd.querySelector('button');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains('open');
      closeAll(dd);
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-dropdown')) closeAll(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openDd = dropdowns.find((d) => d.classList.contains('open'));
    if (openDd) { closeAll(); openDd.querySelector('button').focus(); return; }
    if (menu?.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });

  // Cerrar menú al navegar a un ancla
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { closeAll(); setMenu(false); }));

  // ---------- Revelado al hacer scroll ----------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 40}ms`; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // ---------- Botón "volver arriba" ----------
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    const onScroll = () => toTop.classList.toggle('show', window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  }

  // ---------- Submenú del libro: sección activa ----------
  const subLinks = [...document.querySelectorAll('.book-subnav a[href^="#"]')];
  if (subLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(subLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        subLinks.forEach((a) => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
        const link = map.get(en.target.id);
        if (link) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'true');
          link.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // ---------- Formularios (sin backend todavía) ----------
  document.querySelectorAll('form[data-validate]').forEach((form) => {
    const status = form.querySelector('.form-status');
    const validate = (field) => {
      const input = field.querySelector('input, textarea, select');
      const err = field.querySelector('.err');
      if (!input || !err) return true;
      let msg = '';
      if (input.required && !input.value.trim()) msg = 'Este campo es obligatorio.';
      else if (input.type === 'email' && input.value && !input.checkValidity()) msg = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
      err.textContent = msg;
      if (msg) { field.setAttribute('data-invalid', ''); input.setAttribute('aria-invalid', 'true'); }
      else { field.removeAttribute('data-invalid'); input.removeAttribute('aria-invalid'); }
      return !msg;
    };
    form.querySelectorAll('.field').forEach((f) => {
      f.querySelector('input, textarea, select')?.addEventListener('blur', () => validate(f));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('.field')];
      const bad = fields.filter((f) => !validate(f));
      if (bad.length) { bad[0].querySelector('input, textarea, select').focus(); return; }
      if (status) status.textContent = 'Gracias. Tu mensaje está listo para enviarse en cuanto se conecte el formulario.';
      form.reset();
    });
  });

  // Año del footer
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
