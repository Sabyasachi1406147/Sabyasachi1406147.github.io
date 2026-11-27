/* Light is the first-visit default. Only the visitor's explicit choice is saved. */
(() => {
  const root = document.documentElement;
  const isPreview = location.protocol === 'file:';
  const key = 'sabyasachi-appearance-v2' + (isPreview ? ':' + new URL('.', location.href).pathname : '');
  const queryKey = 'appearance';
  let choice = null;
  let button;
  let channel;
  try { channel = new BroadcastChannel(key); } catch { /* Some browsers block broadcasts. */ }

  function parse(value) {
    const match = /^(light|dark):(\d{1,16})$/.exec(value ?? '');
    if (!match) return null;
    const changedAt = Number(match[2]);
    return Number.isSafeInteger(changedAt) && changedAt > 0
      ? { mode: match[1], changedAt, value: match[0] }
      : null;
  }

  function readStorage() {
    try { return parse(localStorage.getItem(key)); } catch { return null; }
  }

  function save(value) {
    try {
      if (localStorage.getItem(key) !== value) localStorage.setItem(key, value);
    } catch { /* The preference can still travel with local preview links. */ }
  }

  function paint() {
    const mode = choice?.mode ?? 'light';
    root.dataset.siteTheme = mode;
    root.dataset.theme = mode;
    button?.setAttribute('aria-pressed', String(mode === 'dark'));
    if (!isPreview || !choice) return;

    // Some file previews isolate storage per page. Pass the last choice through links.
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!/^[\w-]+\.html(?:[?#]|$)/.test(href)) return;
      const target = new URL(href, location.href);
      target.searchParams.delete('theme');
      target.searchParams.set(queryKey, choice.value);
      link.setAttribute('href', href.split(/[?#]/, 1)[0] + target.search + target.hash);
    });
  }

  function accept(next) {
    if (!next || (choice && next.changedAt <= choice.changedAt)) return;
    choice = next;
    save(next.value);
    paint();
  }

  function refresh() {
    accept(readStorage());
    if (isPreview) accept(parse(new URLSearchParams(location.search).get(queryKey)));
    paint();
    channel?.postMessage({ request: true });
  }

  function toggle() {
    accept(readStorage());
    const mode = choice?.mode === 'dark' ? 'light' : 'dark';
    const changedAt = Math.max(Date.now(), (choice?.changedAt ?? 0) + 1);
    accept(parse(mode + ':' + changedAt));
    channel?.postMessage({ value: choice.value });

    if (isPreview) {
      const current = new URL(location.href);
      current.searchParams.delete('theme');
      current.searchParams.set(queryKey, choice.value);
      try { history.replaceState(history.state, '', current); } catch { /* File URLs can restrict history changes. */ }
    }
  }

  channel?.addEventListener('message', ({ data }) => {
    if (data?.request && choice) channel.postMessage({ value: choice.value });
    else accept(parse(data?.value));
  });
  window.addEventListener('storage', event => {
    if (event.key === key) accept(parse(event.newValue));
  });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });

  button = document.querySelector('.theme-toggle');
  button?.addEventListener('click', toggle);
  refresh();
})();

/* Site behaviour: live spectrogram waterfalls, research figures, and CV timeline. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- parula colormap ---------- */
  const STOPS = [[53, 42, 135], [15, 92, 221], [18, 125, 216], [7, 156, 207], [21, 177, 180], [89, 189, 140], [165, 190, 107], [225, 185, 82], [249, 251, 14]];
  const LUT = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255 * (STOPS.length - 1), k = Math.min(STOPS.length - 2, Math.floor(t)), f = t - k;
    for (let c = 0; c < 3; c++) LUT[i * 3 + c] = STOPS[k][c] + (STOPS[k + 1][c] - STOPS[k][c]) * f;
  }
  const PAR = STOPS.map(([r, g, b]) => `rgb(${r},${g},${b})`);

  /* ---------- scatterer models: each returns [velocity m/s, amplitude, width] for time t ---------- */
  const VMAX = 4.5;
  const bump = (t, c, w) => Math.exp(-(((t - c) / w) ** 2));
  function walker(out, t, v0, fg, ph, gain) {
    const w = 2 * Math.PI * fg * t + ph;
    out.push([v0 * (1 + 0.07 * Math.sin(2 * w)), 1 * gain, 0.06]);            // torso
    out.push([v0 * (1 + 0.12 * Math.sin(2 * w + 0.6)), 0.35 * gain, 0.07]);    // head and shoulders
    for (const leg of [0, Math.PI]) for (let k = 1; k <= 4; k++) {
      const r = k / 4;
      out.push([v0 * (1 + 0.95 * r * Math.sin(w + leg)), (0.42 - 0.2 * r) * gain, 0.075]);
    }
    for (const arm of [Math.PI, 0]) for (let k = 1; k <= 2; k++) {
      const r = k / 2;
      out.push([v0 * (1 + 0.5 * r * Math.sin(w + arm)), 0.18 * gain, 0.08]);
    }
  }
  const clutter = (out, a = 0.32) => out.push([0, a, 0.04]);
  const MODELS = {
    walk: t => { const o = []; clutter(o); walker(o, t, 1.55 * Math.sin(2 * Math.PI * t / 19 + 0.9), 0.95, 0, 1); return o; },
    multi: t => {
      const o = []; clutter(o);
      walker(o, t, 1.45 * Math.cos(2 * Math.PI * t / 15), 0.92, 0, 0.9);
      walker(o, t, -0.85 + 0.35 * Math.sin(2 * Math.PI * t / 9), 1.08, 1.3, 0.6);
      walker(o, t, 0.75 * Math.sin(2 * Math.PI * t / 11 + 1), 0.8, 2.1, 0.45);
      return o;
    },
    chirp: t => {
      const o = [];
      const fr = x => x - Math.floor(x);
      o.push([-3.9 + 7.8 * fr(t / 2.4), 1, 0.07]);
      o.push([3.6 - 7.2 * fr(t / 3.1 + 0.4), 0.55, 0.07]);
      const hops = [-2.6, 1.3, 3.1, -0.5, 2.2, -3.4];
      o.push([hops[Math.floor(t / 0.75) % hops.length], 0.8, 0.06]);
      if (fr(t / 4.5) < 0.55) for (let k = -3; k <= 3; k++) o.push([1.9 + k * 0.17, 0.3 * (1 - Math.abs(k) / 4), 0.14]);
      o.push([-1.6, 0.25, 0.05]);
      return o;
    },
    tones: t => {
      const o = [], f0 = 0.85 + 0.2 * Math.sin(2 * Math.PI * t / 13);
      clutter(o, 0.6);
      for (let k = 1; k <= 4; k++) { const a = 0.9 / k * (0.75 + 0.25 * Math.sin(2 * Math.PI * t / (4 + k))); o.push([k * f0, a, 0.06]); o.push([-k * f0, a, 0.06]); }
      return o;
    },
  };

  /* fill one spectrogram column (rows bins, top = +VMAX) into an RGBA ImageData column */
  function column(scat, rows, data, rnd, floorDb = -42) {
    const p = new Float32Array(rows), bw = 2 * VMAX / rows;
    for (const [v, a, w] of scat) {
      const c = (VMAX - v) / bw - 0.5, span = Math.ceil(3.5 * w / bw);
      const lo = Math.max(0, Math.floor(c - span)), hi = Math.min(rows - 1, Math.ceil(c + span));
      const a2 = a * a;
      for (let r = lo; r <= hi; r++) { const d = (r - c) * bw / w; p[r] += a2 * Math.exp(-d * d); }
    }
    for (let r = 0; r < rows; r++) {
      const db = 10 * Math.log10(p[r] + 0.00009 * -Math.log(rnd() + 1e-9) + 1e-8);
      let n = (db - floorDb) / -floorDb; n = n < 0 ? 0 : n > 1 ? 1 : Math.pow(n, 1.85);
      const i = (n * 255) | 0;
      data[r * 4] = LUT[i * 3]; data[r * 4 + 1] = LUT[i * 3 + 1]; data[r * 4 + 2] = LUT[i * 3 + 2]; data[r * 4 + 3] = 255;
    }
  }
  const mkRnd = (s = 1234567) => () => (s = s * 16807 % 2147483647) / 2147483647;

  /* ---------- scrolling waterfall ---------- */
  function waterfall(canvas) {
    const model = MODELS[canvas.dataset.mode] || MODELS.walk;
    const ctx = canvas.getContext('2d');
    const off = document.createElement('canvas'), octx = off.getContext('2d');
    const rnd = mkRnd(), SCALE = 2, DT = canvas.dataset.mode === 'chirp' ? 0.05 : 0.035;
    let W = 0, H = 0, cols = 0, rows = 0, colImg = null, t = 0, last = 0, acc = 0, raf = 0, inView = true;
    const drawCol = x => { column(model(t), rows, colImg.data, rnd); octx.putImageData(colImg, x, 0); };
    const blit = () => { ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, W, H); };
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h || (w === W && h === H)) return;
      W = canvas.width = w; H = canvas.height = h;
      cols = Math.ceil(W / SCALE); rows = Math.ceil(H / SCALE);
      off.width = cols; off.height = rows; colImg = octx.createImageData(1, rows);
      const start = t; t = Math.max(0, start - cols * DT) + 40;
      for (let c = 0; c < cols; c++) { drawCol(c); t += DT; }
      blit();
    }
    function frame(now) {
      raf = 0;
      if (!inView || document.hidden) { last = 0; return; }
      if (!last) last = now;
      acc += Math.min(0.25, (now - last) / 1000); last = now;
      let n = 0;
      while (acc >= 1 / 30 && n < 4) { octx.drawImage(off, -1, 0); drawCol(cols - 1); t += DT; acc -= 1 / 30; n++; }
      if (n) blit();
      raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!reduce && !raf && inView && !document.hidden) raf = requestAnimationFrame(frame); };
    new ResizeObserver(() => { resize(); }).observe(canvas);
    resize();
    new IntersectionObserver(es => { inView = es[0].isIntersecting; kick(); }).observe(canvas);
    document.addEventListener('visibilitychange', kick);
    kick();
    return { info: (x, y) => ({ ago: (cols - 1 - x / SCALE) * DT, v: VMAX * (1 - 2 * y / H) }) };
  }

  document.querySelectorAll('canvas.wf').forEach(cv => {
    const wf = waterfall(cv);
    if (!cv.hasAttribute('data-tip')) return;
    const hero = cv.parentElement, xh = hero.querySelector('.xh');
    const xv = xh.querySelector('.xv'), xz = xh.querySelector('.xhz'), tip = xh.querySelector('.tip');
    hero.addEventListener('pointermove', e => {
      if (e.target.closest('a')) { xh.classList.remove('on'); return; }
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const { ago, v } = wf.info(x, y);
      xv.style.left = x + 'px'; xz.style.top = y + 'px';
      const dir = Math.abs(v) < 0.05 ? 'standing still' : v > 0 ? 'toward the radar' : 'away from the radar';
      tip.innerHTML = `<b>${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)} m/s</b> ${dir}<br>${Math.max(0, ago).toFixed(1)} s ago`;
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.min(x + 14, r.width - tw - 8) + 'px';
      tip.style.top = Math.max(8, y - th - 12) + 'px';
      xh.classList.add('on');
    });
    hero.addEventListener('pointerleave', () => xh.classList.remove('on'));
  });

  /* ---------- helpers for figures ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const el = (name, attrs = {}, parent) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const pathD = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  const onceVisible = (node, fn) => new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: 0.35 }).observe(node);
  const ease = x => 1 - Math.pow(1 - x, 3);

  /* ---------- figure: learnable filter bank ---------- */
  function figFilters(fig) {
    const stage = fig.querySelector('.fig-stage'), tbody = fig.querySelector('tbody'), epochRo = fig.querySelector('[data-ro=epoch]');
    const W = 640, H = 290, L = 34, R = 626, T = 14, B = 236;
    const fx = f => L + (f + 0.5) * (R - L), fy = v => B - v * (B - T);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Spectrum of an RF signal with five learnable filters' }, stage);
    const sig = (x, k) => 1 / (1 + Math.exp(-x * k));
    const spec = f => { let s = 0.07 + 0.02 * Math.sin(f * 97) * Math.sin(f * 41); s += 0.72 * sig(f + 0.345, 120) * sig(-0.195 - f, 120); s += 0.9 * Math.exp(-(((f - 0.06) / 0.008) ** 2)); const u = (f - 0.3) / 0.045; s += 0.58 * (u === 0 ? 1 : (Math.sin(Math.PI * u) / (Math.PI * u)) ** 2); return Math.min(1, s); };
    for (const f of [-0.5, -0.25, 0, 0.25, 0.5]) {
      el('line', { x1: fx(f), x2: fx(f), y1: T, y2: B, stroke: '#fff', 'stroke-opacity': f === 0 ? 0.25 : 0.1 }, svg);
      el('text', { x: fx(f), y: B + 26, fill: '#c9cbe8', 'font-size': 15, 'text-anchor': 'middle', 'font-family': 'Schibsted Grotesk, sans-serif' }, svg).textContent = (f > 0 ? '+' : f < 0 ? '−' : '') + Math.abs(f);
    }
    el('text', { x: (L + R) / 2, y: H - 4, fill: '#c9cbe8', 'font-size': 15, 'text-anchor': 'middle', 'font-family': 'Schibsted Grotesk, sans-serif' }, svg).textContent = 'Normalized frequency (cycles per sample)';
    const pts = []; for (let i = 0; i <= 400; i++) { const f = -0.5 + i / 400; pts.push([fx(f), fy(spec(f))]); }
    el('path', { d: pathD(pts) + `L${R} ${B}L${L} ${B}Z`, fill: '#fff', 'fill-opacity': 0.1 }, svg);
    el('path', { d: pathD(pts), fill: 'none', stroke: '#fff', 'stroke-opacity': 0.65, 'stroke-width': 1.3 }, svg);
    const TARGET = [[-0.305, 0.075], [-0.232, 0.075], [0.06, 0.03], [0.3, 0.095], [0.405, 0.05]];
    const COLS = [PAR[4], PAR[5], PAR[8], PAR[6], PAR[3]];
    const paths = TARGET.map((_, i) => el('path', { fill: COLS[i], 'fill-opacity': 0.26, stroke: COLS[i], 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, svg));
    tbody.innerHTML = TARGET.map((_, i) => `<tr><td><span class="sw" style="background:${COLS[i]}"></span>${i + 1}</td><td></td><td></td></tr>`).join('');
    const cells = [...tbody.rows].map(r => [r.cells[1], r.cells[2]]);
    let shape = 'sinc', init = [], seed = 7, cur = [], raf = 0;
    const fmt = v => (v < 0 ? '−' : v > 0 ? '+' : '') + Math.abs(v).toFixed(3);
    const resp = (f, c, b) => shape === 'sinc' ? 0.94 * (1 / (1 + Math.exp(-(f - c + b / 2) * 900))) * (1 / (1 + Math.exp((f - c - b / 2) * 900))) : 0.94 * Math.exp(-4 * Math.LN2 * ((f - c) / b) ** 2);
    function draw() {
      cur.forEach(([c, b], i) => {
        const p = []; const lo = Math.max(-0.5, c - b * 1.6), hi = Math.min(0.5, c + b * 1.6);
        p.push([fx(lo), fy(0)]); for (let k = 0; k <= 90; k++) { const f = lo + (hi - lo) * k / 90; p.push([fx(f), fy(resp(f, c, b))]); } p.push([fx(hi), fy(0)]);
        paths[i].setAttribute('d', pathD(p) + 'Z');
        cells[i][0].textContent = fmt(c); cells[i][1].textContent = b.toFixed(3);
      });
    }
    function randomize() { const rnd = mkRnd(seed += 101); init = TARGET.map(() => [-0.42 + 0.84 * rnd(), 0.04 + 0.16 * rnd()]); }
    function train() {
      cancelAnimationFrame(raf); randomize();
      const E = 80, dur = 3200; let t0 = 0;
      const step = now => {
        if (!t0) t0 = now;
        const e = Math.min(E, (now - t0) / dur * E);
        cur = TARGET.map(([c, b], i) => {
          const k = Math.exp(-e / 13), j = Math.exp(-e / 22) * 0.02 * Math.sin(e * 0.9 + i * 1.7);
          return [c + (init[i][0] - c) * k + j, Math.max(0.012, b + (init[i][1] - b) * k + j * 0.5)];
        });
        draw(); epochRo.textContent = `Epoch ${Math.round(e)} of ${E}`;
        if (e < E) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    function finish() { cur = TARGET.map(x => x.slice()); draw(); epochRo.textContent = 'Epoch 80 of 80'; }
    randomize(); cur = init.map(x => x.slice()); draw();
    fig.querySelectorAll('[data-shape]').forEach(b => b.addEventListener('click', () => {
      shape = b.dataset.shape; fig.querySelectorAll('[data-shape]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw();
    }));
    fig.querySelector('[data-act=train]').addEventListener('click', () => reduce ? finish() : train());
    if (reduce) finish(); else onceVisible(fig, train);
  }

  /* ---------- figure: resolution beyond the FFT ---------- */
  function figResolution(fig) {
    const stage = fig.querySelector('.fig-stage'), input = fig.querySelector('[data-in=sep]');
    const roSep = fig.querySelector('[data-ro=sep]'), roF = fig.querySelector('[data-ro=fft]'), roN = fig.querySelector('[data-ro=net]');
    const W = 640, H = 290, L = 20, R = 620, T = 16, B = 236, U = 3.2;
    const ux = u => (L + R) / 2 + u / U * (R - L) / 2, vy = v => B - v * (B - T);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Range profiles of two nearby targets: FFT and learned estimate' }, stage);
    for (let u = -3; u <= 3; u++) {
      el('line', { x1: ux(u), x2: ux(u), y1: T, y2: B, stroke: '#fff', 'stroke-opacity': 0.08 }, svg);
      el('text', { x: ux(u), y: B + 26, fill: '#c9cbe8', 'font-size': 15, 'text-anchor': 'middle', 'font-family': 'Schibsted Grotesk, sans-serif' }, svg).textContent = (u > 0 ? '+' : u < 0 ? '−' : '') + Math.abs(u);
    }
    el('text', { x: (L + R) / 2, y: H - 4, fill: '#c9cbe8', 'font-size': 15, 'text-anchor': 'middle', 'font-family': 'Schibsted Grotesk, sans-serif' }, svg).textContent = 'Range, in units of the Rayleigh resolution limit';
    el('line', { x1: L, x2: R, y1: B, y2: B, stroke: '#fff', 'stroke-opacity': 0.3 }, svg);
    const fftP = el('path', { fill: 'none', stroke: '#a9b2ff', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, svg);
    const netP = el('path', { fill: 'none', stroke: PAR[4], 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, svg);
    const m1 = el('path', { fill: PAR[8] }, svg), m2 = el('path', { fill: PAR[8] }, svg);
    // Zero-phase Dirichlet kernel for N samples; the two echoes are in quadrature, so they merge below one Rayleigh limit.
    const N = 16, phi = Math.PI / 2;
    const D = u => Math.abs(u) < 1e-9 ? 1 : Math.sin(Math.PI * u) / (N * Math.sin(Math.PI * u / N));
    const fft = (u, s) => { const a = D(u + s / 2), c = D(u - s / 2); return Math.hypot(a + c * Math.cos(phi), c * Math.sin(phi)) / 2; };
    const peaks = arr => {
      const mx = Math.max(...arr), ix = [];
      for (let i = 1; i < arr.length - 1; i++) if (arr[i] > arr[i - 1] && arr[i] >= arr[i + 1] && arr[i] > 0.55 * mx) ix.push(i);
      let n = Math.min(1, ix.length);
      for (let k = 1; k < ix.length; k++) { let lo = Infinity; for (let i = ix[k - 1]; i <= ix[k]; i++) lo = Math.min(lo, arr[i]); if (lo < 0.93 * Math.min(arr[ix[k - 1]], arr[ix[k]])) n++; }
      return n;
    };
    function draw(s) {
      const n = 420, fa = [], na = [], fp = [], np = [];
      for (let i = 0; i <= n; i++) { const u = -U + 2 * U * i / n; fa.push(fft(u, s)); na.push(Math.min(1, Math.exp(-(((u + s / 2) / 0.07) ** 2)) + Math.exp(-(((u - s / 2) / 0.07) ** 2)))); }
      const mx = Math.max(...fa);
      for (let i = 0; i <= n; i++) { const u = -U + 2 * U * i / n; fp.push([ux(u), vy(fa[i] / mx * 0.92)]); np.push([ux(u), vy(na[i] * 0.92)]); }
      fftP.setAttribute('d', pathD(fp)); netP.setAttribute('d', pathD(np));
      m1.setAttribute('d', `M${ux(-s / 2)} ${B + 1}l-5 8h10z`); m2.setAttribute('d', `M${ux(s / 2)} ${B + 1}l-5 8h10z`);
      roSep.textContent = s.toFixed(2) + '×';
      const k = peaks(fa); roF.textContent = k >= 2 ? '2 peaks, resolved' : '1 merged peak';
      roN.textContent = peaks(na) >= 2 ? '2 peaks, resolved' : '1 peak';
    }
    let raf = 0, touched = false;
    input.addEventListener('input', () => { touched = true; cancelAnimationFrame(raf); draw(+input.value); });
    draw(+input.value);
    const demo = () => {
      if (touched) return;
      const a = 2, b = 0.55, dur = 2600; let t0 = 0;
      const step = now => { if (touched) return; if (!t0) t0 = now; const x = Math.min(1, (now - t0) / dur), s = a + (b - a) * ease(x); input.value = s.toFixed(2); draw(s); if (x < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    if (reduce) { input.value = '0.55'; draw(0.55); } else onceVisible(fig, demo);
  }

  /* ---------- figure: activity signatures ---------- */
  const ACT = {
    walk: { d: 'Walking: a bright torso line at walking speed, with the legs and arms swinging above and below it twice per stride.', m: t => { const o = []; clutter(o); walker(o, t, 1.3, 0.95, 0, 1); return o; } },
    fall: { d: 'Falling: almost no motion, then one fast burst toward the radar as the body drops, then stillness again.', m: t => { const o = []; clutter(o); const b = bump(t, 2.3, 0.28), v = 3.1 * b; o.push([v + 0.04 * Math.sin(t * 5), 0.25 + 0.9 * b, 0.11]); for (let k = 1; k <= 5; k++) o.push([v * (1 + 0.28 * k * Math.sin(t * 9 + k)), 0.5 * b, 0.16]); o.push([0.05 * Math.sin(t * 2), 0.3, 0.08]); return o; } },
    sit: { d: 'Sitting down: one slow, modest movement away from the radar as the torso lowers, with the head moving a little faster.', m: t => { const o = []; clutter(o); const b = bump(t, 2.4, 0.55); o.push([-0.85 * b, 0.25 + 0.75 * b, 0.1]); o.push([-1.3 * b, 0.45 * b + 0.05, 0.12]); o.push([-0.4 * b, 0.4 * b, 0.12]); return o; } },
    wave: { d: 'Waving: the body stays still at zero velocity while the arm alone swings back and forth, symmetric around zero.', m: t => { const o = []; clutter(o, 0.55); const env = Math.min(1, Math.max(0, (t - 0.6) / 0.5)) * Math.min(1, Math.max(0, (4.4 - t) / 0.5)); o.push([0, 0.55, 0.08]); for (let k = 1; k <= 4; k++) o.push([env * 1.7 * (k / 4) * Math.sin(2 * Math.PI * 1.35 * t), 0.5 * env * (1.1 - k / 5), 0.12]); return o; } },
  };
  function figActivity(fig) {
    const cv = fig.querySelector('canvas'), ctx = cv.getContext('2d'), note = fig.querySelector('[data-ro=desc]');
    const COLS = 250, ROWS = 120, TT = 5;
    const off = document.createElement('canvas'); off.width = COLS; off.height = ROWS;
    const octx = off.getContext('2d'), img = octx.createImageData(1, ROWS);
    const btns = [...fig.querySelectorAll('[data-act]')];
    let raf = 0, cycle = 0, user = false, cur = 'walk';
    const fit = () => { cv.width = cv.clientWidth; cv.height = cv.clientHeight; };
    const blit = () => { ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, cv.width, cv.height); };
    new ResizeObserver(() => { fit(); blit(); }).observe(cv);
    fit();
    function show(key, animate) {
      cur = key; cancelAnimationFrame(raf);
      btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.act === key)));
      note.textContent = ACT[key].d;
      const rnd = mkRnd(99), cols = [];
      for (let c = 0; c < COLS; c++) { column(ACT[key].m(c / COLS * TT), ROWS, img.data, rnd); cols.push(new Uint8ClampedArray(img.data)); }
      const paint = upto => { for (let c = 0; c < upto; c++) { img.data.set(cols[c]); octx.putImageData(img, c, 0); } };
      if (!animate) { paint(COLS); blit(); return; }
      octx.fillStyle = PAR[0]; octx.fillRect(0, 0, COLS, ROWS);
      let t0 = 0, done = 0;
      const step = now => {
        if (!t0) t0 = now;
        const n = Math.min(COLS, Math.round((now - t0) / 1100 * COLS));
        for (let c = done; c < n; c++) { img.data.set(cols[c]); octx.putImageData(img, c, 0); }
        done = n;
        ctx.clearRect(0, 0, cv.width, cv.height); blit();
        if (n < COLS) { const x = n / COLS * cv.width; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x, 0, 1.5, cv.height); raf = requestAnimationFrame(step); }
      };
      raf = requestAnimationFrame(step);
    }
    btns.forEach(b => b.addEventListener('click', () => { user = true; clearInterval(cycle); show(b.dataset.act, !reduce); }));
    show('walk', false);
    if (!reduce) onceVisible(fig, () => {
      show('walk', true);
      const keys = Object.keys(ACT);
      cycle = setInterval(() => { if (user || document.hidden) return; show(keys[(keys.indexOf(cur) + 1) % keys.length], true); }, 5200);
    });
  }

  document.querySelectorAll('[data-fig]').forEach(f => ({ filters: figFilters, resolution: figResolution, activity: figActivity })[f.dataset.fig]?.(f));

  /* ---------- home glyphs: stop SMIL when motion is reduced ---------- */
  if (reduce) document.querySelectorAll('svg.glyph').forEach(s => s.pauseAnimations && s.pauseAnimations());

  /* ---------- photo reveals, cover parallax ---------- */
  const reveals = document.querySelectorAll('.fam-photo, .fam-sec h3');
  if (reveals.length && !reduce) {
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(n => io.observe(n));
  }
  const band = document.querySelector('.cover-band');
  if (band) {
    const img = band.querySelector('.cover-img'), tag = band.querySelector('.cover-tag');
    if (!reduce) {
      new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { tag.classList.add('reveal'); o.disconnect(); } }, { threshold: 0.4 }).observe(band);
      tag.style.opacity = '0';
      tag.addEventListener('animationstart', () => { tag.style.opacity = ''; });
      let pend = false;
      const par = () => { pend = false; const r = band.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; img.style.transform = `translateY(${(k * -5).toFixed(2)}%)`; };
      img.addEventListener('animationend', () => { img.style.animation = 'none'; par(); }, { once: true });
      addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(par); } }, { passive: true });
    }
  }

  /* ---------- U & U gallery: staggered reveal + lightbox ---------- */
  const uu = document.querySelector('.uu-grid');
  if (uu) {
    [...uu.children].forEach((li, i) => { li.style.setProperty('--i', i); li.style.setProperty('--r', (i % 2 ? 2 : -2) + 'deg'); });
    if (!reduce) { document.documentElement.classList.add('js'); new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { uu.classList.add('seen'); o.disconnect(); } }, { threshold: 0.15 }).observe(uu); }
    const box = document.querySelector('.uu-box'), big = box.querySelector('img');
    uu.addEventListener('click', e => { const b = e.target.closest('.uu-btn'); if (!b) return; const im = b.querySelector('img'); big.src = im.src; big.alt = im.alt; box.showModal(); });
    box.querySelector('.uu-close').addEventListener('click', () => box.close());
    box.addEventListener('click', e => { if (e.target === box) box.close(); });
  }

  /* ---------- home: typed mission line ---------- */
  /* runs even with Windows 'Animation effects' off: it is small text, not large motion */
  const typed = document.querySelector('.typed');
  if (typed) {
    const span = typed.querySelector('.typed-text'), caret = typed.querySelector('.caret');
    const text = span.textContent; span.textContent = '';
    const shown = document.createElement('span'); shown.className = 'shown';
    const rest = document.createElement('span'); rest.textContent = text; rest.style.visibility = 'hidden';
    span.append(shown); span.after(rest); span.style.visibility = 'visible'; rest.after(caret);
    let i = 0;
    const step = () => {
      i++; shown.textContent = text.slice(0, i); rest.textContent = text.slice(i);
      shown.after(caret);
      if (i < text.length) {
        const ch = text[i - 1];
        setTimeout(step, ch === '—' ? 420 : ch === ' ' ? 70 : 34 + Math.random() * 46);
      } else { caret.classList.add('done'); rest.remove(); }
    };
    setTimeout(step, 1100);
  }

  /* ---------- home: count-up numbers, interest reveal ---------- */
  const nums = document.querySelectorAll('.g-num[data-count]');
  if (nums.length && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1200 + end * 8;
      const tick = now => { const x = Math.min(1, (now - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - x, 3))); if (x < 1) requestAnimationFrame(tick); };
      el.textContent = '0'; requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    nums.forEach(n => io.observe(n));
  }
  const ig = document.querySelector('.int-grid');
  if (ig && !reduce) {
    document.documentElement.classList.add('js');
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { ig.classList.add('seen'); o.disconnect(); } }, { threshold: 0.2 }).observe(ig);
  }

  /* ---------- CV timeline ---------- */
  const tl = document.querySelector('.tl');
  if (tl) {
    const lis = [...tl.querySelectorAll('li')];
    if (reduce) { tl.style.setProperty('--p', 1); lis.forEach(li => li.classList.add('lit')); }
    else {
      let pend = false;
      const upd = () => {
        pend = false;
        const r = tl.getBoundingClientRect(), mark = innerHeight * 0.62;
        tl.style.setProperty('--p', Math.max(0, Math.min(1, (mark - r.top) / r.height)).toFixed(4));
        lis.forEach(li => li.classList.toggle('lit', li.getBoundingClientRect().top + 12 < mark));
      };
      addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(upd); } }, { passive: true });
      addEventListener('resize', upd);
      upd();
    }
  }
})();

/* research videos: play while the pointer is over them */
/* videos: a large play button so a still frame is never mistaken for a picture */
document.querySelectorAll('video[data-playbtn]').forEach(v => {
  const wrap = document.createElement('div');
  wrap.className = 'vwrap';
  v.parentNode.insertBefore(wrap, v); wrap.appendChild(v);
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'vplay'; b.setAttribute('aria-label', 'Play video');
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg><span>Play video</span>';
  wrap.appendChild(b);
  b.addEventListener('click', () => { const p = v.play(); if (p) p.catch(() => {}); });
  const sync = () => wrap.classList.toggle('playing', !v.paused && !v.ended);
  ['play', 'playing', 'pause', 'ended'].forEach(e => v.addEventListener(e, sync));
});
