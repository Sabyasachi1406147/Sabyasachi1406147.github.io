// Builds the static site into ../dist. Run: node src/build.js
const fs = require('fs');
const path = require('path');
const D = require('./data.js');
const { SITE } = D;

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.cpSync(path.join(ROOT, 'static', 'assets'), path.join(OUT, 'assets'), { recursive: true });
const cvSrc = path.join(ROOT, 'static', 'cv.pdf');
if (fs.existsSync(cvSrc)) fs.copyFileSync(cvSrc, path.join(OUT, SITE.cvPdf));
const hasCv = fs.existsSync(path.join(OUT, SITE.cvPdf));

const esc = s => String(s).replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const me = s => s.replace(/S\. Biswas\*?/g, m => `<b class="me">${m}</b>`);
const linksHtml = ls => ls && ls.length ? `<span class="lk">${ls.map(([l, u]) => `<a href="${u}">${l}</a>`).join('')}</span>` : '';

const NAV = [['research.html', 'Research'], ['publications.html', 'Publications'], ['news.html', 'News'], ['teaching.html', 'Teaching and advising'], ['talks.html', 'Talks'], ['awards.html', 'Awards'], ['cv.html', 'CV'], ['personal.html', 'Me and my family']];

// ---------------------------------------------------------------- velocity ticks for hero
const VMAX = 4.5;
const vticks = [4, 2, 0, -2, -4].map(v => `<span style="top:${(50 - v / VMAX * 50).toFixed(2)}%">${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}</span>`).join('');

// ---------------------------------------------------------------- glyphs (small animated SVGs on home)
const P = ['#352a87', '#0f5cdd', '#127dd8', '#079ccf', '#15b1b4', '#59bd8c', '#a5be6b', '#e1b952', '#f9fb0e'];
const poly = pts => 'M' + pts.map(([x, y]) => x.toFixed(1) + ' ' + y.toFixed(1)).join('L');

function spectrum(f) { // synthetic spectrum used by the filter glyph and figure, 0..1
  const sig = (x, k) => 1 / (1 + Math.exp(-x * k));
  let s = 0.07 + 0.02 * Math.sin(f * 97) * Math.sin(f * 41);
  s += 0.72 * sig(f + 0.345, 120) * sig(-0.195 - f, 120);
  s += 0.9 * Math.exp(-(((f - 0.06) / 0.008) ** 2));
  const u = (f - 0.3) / 0.045;
  s += 0.58 * (u === 0 ? 1 : (Math.sin(Math.PI * u) / (Math.PI * u)) ** 2);
  return Math.min(1, s);
}

function glyphFilters() {
  const W = 240, H = 124, x = f => (f + 0.5) * W, y = v => H - 12 - v * (H - 26);
  const pts = []; for (let i = 0; i <= 200; i++) { const f = -0.5 + i / 200; pts.push([x(f), y(spectrum(f))]); }
  const area = poly(pts) + `L${W} ${H}L0 ${H}Z`;
  const F = [[-0.27, 0.15, P[4], '-38px', 1.8], [0.06, 0.04, P[8], '44px', 2.4], [0.3, 0.1, P[6], '-30px', 0.6]];
  const rects = F.map(([c, b, col, dx, s], i) => `<rect class="gf" x="${x(c - b / 2).toFixed(1)}" y="16" width="${(b * W).toFixed(1)}" height="${H - 28}" rx="2" fill="${col}" fill-opacity=".28" stroke="${col}" stroke-width="1.5" style="--dx:${dx};--s:${s};animation-delay:${-i * 1.1}s"/>`).join('');
  return `<svg class="glyph" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${area}" fill="#fff" fill-opacity=".12"/><path d="${poly(pts)}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>${rects}</svg>`;
}

const dirichlet = (u, N) => Math.abs(u) < 1e-9 ? 1 : Math.sin(Math.PI * u) / (N * Math.sin(Math.PI * u / N)); // zero-phase, u in Rayleigh units
function fftProfile(u, sep, N = 16, phi = Math.PI / 2) { // two equal echoes in quadrature
  const a = dirichlet(u + sep / 2, N), c = dirichlet(u - sep / 2, N);
  return Math.hypot(a + c * Math.cos(phi), c * Math.sin(phi)) / 2;
}
function glyphResolution() {
  const W = 240, H = 124, n = 160, sep = 0.6, x = u => W / 2 + u * 44, y = v => H - 18 - v * (H - 32);
  const A = [], B = [];
  let mx = 0; for (let i = 0; i <= n; i++) mx = Math.max(mx, fftProfile(-2.7 + 5.4 * i / n, sep));
  for (let i = 0; i <= n; i++) {
    const u = -2.7 + 5.4 * i / n;
    A.push([x(u), y(fftProfile(u, sep) / mx * 0.9)]);
    const g = Math.exp(-(((u + sep / 2) / 0.06) ** 2)) + Math.exp(-(((u - sep / 2) / 0.06) ** 2));
    B.push([x(u), y(Math.min(1, g) * 0.9 + 0.004 * Math.sin(u * 30))]);
  }
  const tri = u => `<path d="M${x(u).toFixed(1)} ${H - 13}l-4 7h8z" fill="${P[8]}"/>`;
  return `<svg class="glyph" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M0 ${y(0)}H${W}" stroke="#fff" stroke-opacity=".25"/><path fill="none" stroke="${P[4]}" stroke-width="2.2" stroke-linejoin="round" d="${poly(A)}"><animate attributeName="d" dur="6s" repeatCount="indefinite" keyTimes="0;.25;.45;.8;1" values="${poly(A)};${poly(A)};${poly(B)};${poly(B)};${poly(A)}" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"/></path>${tri(-sep / 2)}${tri(sep / 2)}</svg>`;
}

function glyphDoppler() {
  const W = 240, H = 124, mid = 104, per = 60, k = 30, v0 = 1.2;
  const line = (fn, n = 240) => { const pts = []; for (let i = 0; i <= n; i++) { const xx = i * 2 * W / n; pts.push([xx, mid - fn(xx) * k]); } return poly(pts); };
  const w = xx => 2 * Math.PI * xx / per;
  const paths = [];
  for (const [r, col, op, sw] of [[1, P[1], .55, 1.4], [0.7, P[3], .7, 1.6], [0.4, P[5], .85, 2]]) {
    for (const leg of [0, Math.PI]) paths.push(`<path d="${line(xx => v0 * (1 + 0.95 * r * Math.sin(w(xx) + leg)))}" stroke="${col}" stroke-opacity="${op}" stroke-width="${sw}"/>`);
  }
  paths.push(`<path d="${line(xx => v0 * (1 + 0.45 * Math.sin(w(xx) + Math.PI / 2)))}" stroke="${P[6]}" stroke-opacity=".6" stroke-width="1.3"/>`);
  paths.push(`<path d="${line(xx => v0 * (1 + 0.06 * Math.sin(2 * w(xx))))}" stroke="${P[8]}" stroke-width="3.2"/>`);
  return `<svg class="glyph" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M0 ${mid}H${W}" stroke="#fff" stroke-opacity=".28" stroke-dasharray="2 4"/><g class="gd" fill="none" stroke-linecap="round">${paths.join('')}</g></svg>`;
}
const GLYPH = { filters: glyphFilters(), resolution: glyphResolution(), doppler: glyphDoppler() };

// ---------------------------------------------------------------- layout
function layout({ file, title, desc, header, body, extraHead = '', bodyClass = '', navFile = file }) {
  const canonical = SITE.url + '/' + (file === 'index.html' ? '' : file);
  const nav = NAV.map(([h, l]) => `<a href="${h}"${h === navFile ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta name="theme-color" content="#16173a">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Comic+Neue:wght@700&family=Schibsted+Grotesk:wght@400;500;600;700;800;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap">
<link rel="stylesheet" href="assets/site.css">
<script>(function(){var t=null,m;try{m=/[?&]theme=(dark|light)/.exec(location.search);if(m)t=m[1]}catch(e){}if(!t){m=/sbtheme=(dark|light)/.exec(window.name||"");if(m)t=m[1]}if(!t){try{t=localStorage.getItem("sb-site-theme")}catch(e){}}if(!t){m=/(?:^|;\s*)sbtheme=(dark|light)/.exec(document.cookie||"");if(m)t=m[1]}document.documentElement.dataset.theme=t==="dark"?"dark":"light"})()</script>
${extraHead}</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="mast">
  <div class="wrap mast-in">
    <a class="wordmark" href="index.html"${file === 'index.html' ? ' aria-current="page"' : ''}>Sabyasachi Biswas</a>
    <nav aria-label="Main">${nav}</nav>
    <button class="theme-toggle" type="button" aria-label="Dark mode" aria-pressed="false" title="Switch between light and dark mode">
      <svg class="ic-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" fill="currentColor"/></svg>
      <svg class="ic-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g></svg>
    </button>
  </div>
</header>
${header}
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap foot-in">
    <div>
      <p class="foot-name">Sabyasachi Biswas</p>
      <p>${SITE.role}<br>${SITE.org}</p>
    </div>
    <div>
      <p><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p>${SITE.office.join('<br>')}</p>
    </div>
    <div>
      <ul class="foot-links">${SITE.links.map(([l, u]) => `<li><a href="${u}">${l}</a></li>`).join('')}</ul>
    </div>
  </div>
  <div class="wrap foot-base"><p>© 2026 Sabyasachi Biswas. Last updated ${SITE.updated}.</p></div>
</footer>
<script src="assets/site.js" defer></script>
</body>
</html>
`;
}

const band = (mode, title, lede) => `<header class="band">
  <canvas class="wf" data-mode="${mode}" aria-hidden="true"></canvas>
  <div class="wrap band-in"><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div>
</header>`;

const refItem = (p, tag) => {
  const [, , text, doi, extra] = p;
  const links = [];
  if (doi) links.push(['DOI', 'https://doi.org/' + doi]);
  if (extra) links.push(...extra);
  return `<li><span class="rt">${tag}</span><div class="rc">${me(text)}${linksHtml(links)}</div></li>`;
};
// CV-style numbering: J1..J7, C1..C21, P1..P2 (newest first)
const counters = { journal: 'J', conference: 'C', prep: 'P' };
const seen = { journal: 0, conference: 0, prep: 0 };
const TAG = D.PUBS.map(p => counters[p[0]] + (++seen[p[0]]));

const pages = {};

// ---------------------------------------------------------------- home
{
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Person', name: SITE.name, url: SITE.url + '/', email: 'mailto:' + SITE.email,
    image: SITE.url + '/' + SITE.photo,
    jobTitle: SITE.role, worksFor: { '@type': 'CollegeOrUniversity', name: SITE.org },
    alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'Mississippi State University' }, { '@type': 'CollegeOrUniversity', name: 'Bangladesh University of Engineering and Technology' }],
    knowsAbout: ['Radar signal processing', 'RF sensing', 'Interpretable machine learning', 'Micro-Doppler', 'Human activity recognition'],
    sameAs: SITE.links.map(l => l[1]),
  };
  const MISSION = 'On a Mission to Make the Invisible Visible — Through RF Sensing and Explainable AI';
  const header = `<header class="cover-hero">
  <img class="cover-hero-img" src="assets/img/cover-home.jpg" alt="Collage: sensors, data collection, signal processing with explainable AI, and applications in autonomous driving and fall detection" width="2400" height="557" fetchpriority="high">
  <div class="cover-hero-shade" aria-hidden="true"></div>
  <p class="typed" aria-label="${MISSION}"><span class="typed-text" aria-hidden="true">${MISSION}</span><span class="caret" aria-hidden="true"></span></p>
  <a class="scroll-cue" href="#about" aria-label="Scroll to introduction"><span></span></a>
</header>`;
  const ICON = {
    Email: '<path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 7l9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    'Google Scholar': '<path d="M12 3 1 9l11 6 9-4.9V17h2V9z" fill="currentColor"/><path d="M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8z" fill="currentColor"/>',
    GitHub: '<path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/>',
    LinkedIn: '<path fill="currentColor" d="M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM2.3 8.7h3.5V21H2.3zM9 8.7h3.3v1.7h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.2 2.4 4.2 5.4V21h-3.5v-6.3c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21H9z"/>',
    'Web of Science': '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  };
  const icon = k => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${ICON[k]}</svg>`;
  const links = [['Email', 'mailto:' + SITE.email], ...SITE.links];
  const glance = D.GLANCE.map(([n, u, t]) => `<li><span class="g-num">${n}${u}</span><p>${t}</p></li>`).join('');
  const interests = D.INTERESTS.map(([cat, items], ci) => `<div class="int-row"><h3>${cat}</h3><ul>${items.map((x, i) => `<li style="--d:${ci * 3 + i}">${x}</li>`).join('')}</ul></div>`).join('');
  const selCards = D.SELECTED.map(([i, img, alt]) => {
    const p = D.PUBS[i]; const m = p[2].match(/“(.+?),?”/); const title = m ? m[1].replace(/,$/, '') : '';
    const venue = (p[2].match(/<i>(.+?)<\/i>/) || [])[1] || '';
    const ls = [['DOI', 'https://doi.org/' + p[3]], ...(p[4] || [])];
    return `<article class="pcard"><a class="pcard-fig" href="https://doi.org/${p[3]}"><img src="assets/img/${img}" alt="${alt}" loading="lazy"></a><div class="pcard-body"><p class="pcard-venue">${venue}, ${p[1]}</p><h3><a href="https://doi.org/${p[3]}">${title}</a></h3><p class="pcard-auth">${me(p[2].split('“')[0].replace(/,\s*$/, ''))}</p>${linksHtml(ls)}</div></article>`;
  }).join('');
  const news = D.NEWS.slice(0, 4).map(([d, t]) => `<li><span class="nd">${d}</span><p>${t}</p></li>`).join('');
  const body = `
<div class="wrap home-grid" id="about">
  <aside class="side" aria-label="Profile">
    <figure class="headshot"><img src="${SITE.photo}" alt="Portrait of Sabyasachi Biswas" width="900" height="1091"></figure>
    <ul class="icon-links">${links.map(([l, u]) => `<li><a href="${u}"${u.startsWith('http') ? ' rel="me"' : ''}>${icon(l)}<span>${l === 'Email' ? SITE.email : l}</span></a></li>`).join('')}</ul>
    ${hasCv ? `<p class="about-cta"><a class="btn solid" href="${SITE.cvPdf}" target="_blank" rel="noopener">Download CV (PDF)</a></p>` : ''}
  </aside>
  <div class="main-col">
    <section class="about-text" aria-labelledby="h-name">
      <h1 id="h-name">Sabyasachi Biswas</h1>
      <p class="about-role">${SITE.role}<br><a href="https://www.gvsu.edu/engineering/">${SITE.org}</a></p>
      <p class="about-office">${SITE.office.join(', ')}</p>
      <div class="bio">${D.BIO.map(p => `<p>${p}</p>`).join('')}</div>
    </section>

    <section class="hsec" aria-labelledby="h-int">
      <h2 id="h-int">Research interests</h2>
      <div class="int-grid">${interests}</div>
    </section>

    <section class="hsec" aria-labelledby="h-edu">
      <h2 id="h-edu">Education</h2>
      <ul class="plain edu">${D.EDUCATION.map(([d, sc, y, det]) => `<li><div class="row"><h3>${d}</h3><span class="per">${y}</span></div><p class="place">${sc}</p><p>${det}</p></li>`).join('')}</ul>
    </section>

    <section class="hsec" aria-labelledby="h-exp">
      <h2 id="h-exp">Experience</h2>
      <ol class="tl"><i class="tl-fill" aria-hidden="true"></i>${D.EXPERIENCE.map(([t, place, per, det]) => `<li><div class="row"><h3>${t}</h3><span class="per">${per}</span></div><p class="place">${place}</p>${det ? `<p>${det}</p>` : ''}</li>`).join('')}</ol>
    </section>

    <section class="hsec" aria-labelledby="h-sel">
      <div class="sec-head"><h2 id="h-sel">Selected publications</h2><a class="more" href="publications.html">All publications</a></div>
      <div class="pcards">${selCards}</div>
    </section>

    <section class="hsec" aria-labelledby="h-news">
      <div class="sec-head"><h2 id="h-news">Latest news</h2><a class="more" href="news.html">All news</a></div>
      <ul class="news">${news}</ul>
    </section>
  </div>
</div>`;
  pages['index.html'] = layout({
    file: 'index.html', title: 'Sabyasachi Biswas, Radar Signal Processing and Interpretable Machine Learning',
    desc: 'Sabyasachi Biswas is an Assistant Professor of Electrical and Computer Engineering at Grand Valley State University, working on radar and RF signal processing, RF sensing, and interpretable machine learning.',
    header, body, bodyClass: 'home', extraHead: `<link rel="preload" as="image" href="assets/img/cover-home.jpg">\n<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n`,
  });
}

// ---------------------------------------------------------------- news
{
  const byYear = {};
  D.NEWS.forEach(([d, t]) => { const y = (d.match(/\d{4}/) || ['Earlier'])[0]; (byYear[y] = byYear[y] || []).push([d, t]); });
  const body = `<section class="wrap block news-page">${Object.keys(byYear).sort((a, b) => b - a).map(y => `<section class="yr"><h2>${y}</h2><ul class="news">${byYear[y].map(([d, t]) => `<li><span class="nd">${d}</span><p>${t}</p></li>`).join('')}</ul></section>`).join('')}</section>`;
  pages['news.html'] = layout({ file: 'news.html', title: 'News | Sabyasachi Biswas', desc: 'News from Sabyasachi Biswas: papers, awards, talks, students and service.', header: `<header class="wrap research-heading"><h1>News</h1></header>`, body });
}

// ---------------------------------------------------------------- research
{
  const COLLAB = [
  {
    "id": "radiometer",
    "title": "Software-Defined Radio Radiometer on a Small Drone",
    "description": "With the University of Georgia, we built a low-cost, dual-polarized L-band microwave radiometer that flies on a small unmanned aircraft and maps surface brightness temperature at field scale, a key input for soil moisture estimation in precision agriculture.",
    "details": [
      [
        "The problem",
        "Satellite L-band radiometers measure soil moisture, but at kilometer resolution, far too coarse for managing a single field. Airborne radiometers are expensive, and the protected 1400–1427 MHz band is increasingly affected by radio frequency interference (RFI)."
      ],
      [
        "Our approach",
        "The radiometer pairs horizontally and vertically polarized patch antennas with a software-defined radio receiver sampling at 30 MHz, all in a temperature-controlled enclosure under a custom octocopter. Because it records raw I/Q samples, we calibrate them to brightness temperature with internal and external references and use short-time Fourier and power spectral analysis to find and remove RFI from the instrument and from outside sources."
      ],
      [
        "What we found",
        "Flights over bare soil and a pond produced high-resolution brightness temperature maps that clearly separate land from water. Sky and blackbody measurements showed standard deviations below 1 K for both polarizations. The work appeared in IEEE JSTARS (2024), with earlier results at IGARSS 2023 and the USNC-URSI Radio Science Meeting 2022."
      ]
    ],
    "figureAfter": 1,
    "figure": [
      "assets/research/radiometer-figure.jpg",
      "The radiometer on the octocopter and maps of measured brightness temperature over a field and a pond.",
      "Figure. Left: the radiometer flying under a custom octocopter, with the dual-polarized antenna tilted 45° toward the ground. Right: measured brightness temperature along the flight path for H-pol (a) and V-pol (b); the cold blue segment is over water."
    ],
    "video": [
      "assets/research/radiometer-flight.mp4",
      "Video. The measured H-pol and V-pol flight from the paper replayed point by point: the drone follows the recorded path, each footprint is colored by its brightness temperature, and the traces below show the drop from about 290 K over soil to about 220 K over water. Values are read from the published maps.",
      "assets/research/radiometer-flight.jpg"
    ],
    "links": [
      [
        "IEEE JSTARS 2024",
        "https://doi.org/10.1109/JSTARS.2024.3394054"
      ],
      [
        "IGARSS 2023",
        "https://doi.org/10.1109/IGARSS52108.2023.10282140"
      ]
    ],
    "plain": true
  },
  {
    "id": "bearing-learnable-filters",
    "title": "Interpretable Bearing Fault Diagnosis with Learnable Filters",
    "description": "With Louisiana State University and Old Dominion University, we carried our learnable-filter idea from radar to machinery health monitoring: a CNN that diagnoses bearing faults directly from raw vibration data, with a first layer whose filters can be read as frequency bands.",
    "details": [
      [
        "The problem",
        "Bearing faults are a leading cause of failure in rotating machines. Deep networks classify them well from vibration data, but their first-layer filters are hard to interpret and the models can be heavy for on-machine monitoring."
      ],
      [
        "Our approach",
        "The first layer of the CNN is a bank of parameterized learnable filters, Sinc or Gaussian band-pass filters, that operate on the raw vibration signal. Each filter learns only a center frequency and a bandwidth, so after training we can see which frequency bands the network uses to separate a healthy bearing from ball, inner-race, outer-race, and combined faults."
      ],
      [
        "What we found",
        "The learnable-filter CNNs reached up to 99.5% accuracy with far fewer parameters than a standard CNN, and their learned bands point to the resonances that fault impacts excite. The work was published in Manufacturing Letters (2025)."
      ]
    ],
    "figureAfter": 1,
    "figure": [
      "assets/research/bearing-setup.png",
      "Motor, shaft and two bearing housings, the parts of a rolling bearing, and the five bearing conditions studied.",
      "Figure. The test rig, the parts of a rolling bearing, and the five conditions: good bearing (GB), ball fault (BF), inner-race fault (IRF), outer-race fault (ORF), and combined fault (CF)."
    ],
    "video": [
      "assets/research/bearing-filter-demo.mp4",
      "Video. How a learnable Gaussian band-pass filter exposes an outer-race fault, shown on a simulated vibration signal. Each time a ball passes the defect it strikes the race and rings a structural resonance, but the impacts are buried in shaft vibration and noise. As the filter’s center frequency and bandwidth move onto the resonance band, the impacts stand out in the filtered signal and the envelope spectrum shows the fault frequency and its harmonics. This is an illustration of the mechanism computed in Python, not the trained network.",
      "assets/research/bearing-filter-demo.jpg"
    ],
    "links": [
      [
        "Paper",
        "https://doi.org/10.1016/j.mfglet.2025.06.015"
      ]
    ],
    "plain": true,
    "figureClass": "small"
  },
  {
    "id": "bearing-hr-spectrogram",
    "title": "High-Resolution Spectrograms for Robust Bearing Fault Diagnosis",
    "description": "A second study with the same team asks whether a sharper time–frequency picture makes fault diagnosis more reliable. We adapted deep learning-based high-resolution spectrogram reconstruction, first developed for radar micro-Doppler, to vibration signals.",
    "details": [
      [
        "The problem",
        "Spectrograms trade time resolution for frequency resolution. Short windows blur closely spaced frequency components, and long windows smear the short impacts that bearing faults produce, which hurts diagnosis when operating conditions or noise levels change."
      ],
      [
        "Our approach",
        "A network learns to reconstruct a high-resolution spectrogram from a conventional one computed on the raw vibration signal, sharpening fault-related components in both time and frequency. A classifier then diagnoses the bearing condition from the reconstructed representation."
      ],
      [
        "",
        "The work was published in Manufacturing Letters (2026), with Saifur Rahman Tushar, Md Ebtidaul Karim, Dr. Abdullah Al Mamun and Dr. Mahathir Mohammad Bappy."
      ]
    ],
    "links": [
      [
        "Paper",
        "https://doi.org/10.1016/j.mfglet.2026.07.019"
      ]
    ],
    "plain": true,
    "figureAfter": 1,
    "figure": [
      "assets/research/bearing-hr-spectrogram.png",
      "Proposed network: a 1D U-Net on the raw vibration signal, a multi-resolution convolutional STFT with three branches, and a 2D U-Net that outputs a high-resolution spectrogram.",
      "Figure. The proposed method. A 1D U-Net cleans the raw vibration signal, a multi-resolution convolutional STFT computes spectrograms with three window lengths, and a 2D U-Net fuses them into one high-resolution time–frequency representation."
    ]
  }
];
  const projects = {
    "current": [
      {
        "id": "tg-plfnet",
        "status": "Manuscript under review",
        "title": "TG-PLFNet: Interpretable RF Waveform Recognition",
        "description": "TG-PLFNet recognizes radar and communication waveforms directly from raw complex I/Q samples, without first turning them into spectrogram images. Its first layer is built from time-gated filters whose settings have a physical meaning, so we can read off where in time and frequency the network is looking.",
        "details": [["The problem", "Spectrum monitoring, cognitive radio, and electronic warfare systems must identify many kinds of RF emissions, from radar pulses to digital communication bursts, often at low signal-to-noise ratio. Classifiers that work on spectrogram images discard phase and fine timing, ordinary CNN filters say little about what the network has learned, and the useful information in short radar pulses sits in a small region of time and frequency."], ["Our approach", "The network’s first layer is built from learnable filters whose few parameters have a direct physical meaning, so after training each filter can be read as a region of the time–frequency plane. A complex-valued network then classifies the filter outputs. We evaluate it on a large set of radar and communication waveforms and on over-the-air recordings from software-defined radios."]],
        "video": [
          "assets/research/tg-plfnet-lfm-explainer.mp4",
          "Video. One learnable filter at work on a real linear FM chirp from our test set (SNR 10 dB). The filter narrows in on the pulse in time and in frequency until it isolates one time–frequency cell of the chirp (white box), and the trained model then classifies the waveform. Every curve is computed in Python on the recorded signal.",
          "assets/research/tg-plfnet-lfm-explainer.jpg"
        ]
      },
      {
        "id": "beyond-fft",
        "status": "Manuscript under review",
        "title": "Beyond FFT: High-Resolution Radar Frequency Estimation",
        "description": "HarmoniNet estimates frequencies from short, noisy radar measurements where conventional FFT peaks merge. In stretch-processed radar each scatterer becomes a tone whose frequency gives its range, so sharper frequency estimates mean sharper range profiles, and better separation of targets that sit close together.",
        "details": [["The problem", "The FFT is fast, but with only a few samples its resolution is fixed by the record length. Returns closer than one frequency bin merge into a single peak, and a weak return can hide in the sidelobes of a strong one. Subspace and sparse methods can do better, but they need the number of components in advance and cost far more computation."], ["Our approach", "HarmoniNet is a deep network that works directly on raw complex I/Q samples and reconstructs a dense, high-resolution spectrum, without being told how many returns are present. In our experiments it separates returns closer than the FFT’s resolution limit, holds up at low SNR, runs fast enough for real-time use, and gives clean range tracks on measured radar data."]],
        "video": [
          "assets/research/harmoninet-aircraft.mp4",
          "Video. A simulated aircraft made of 63 point scatterers (fuselage, swept wings, engines, tail, and fin) turns 360° in front of a radar with a 300 MHz chirp and a 25 m range window, sampled with 64 samples per pulse at 10 dB SNR. Each pulse’s range profile, from a Hamming-windowed FFT (gray) or the trained HarmoniNet model (blue), is stacked into a range–angle map, and filtered back-projection turns each map into an image. With the same pulses and the same noise, the HarmoniNet profiles give tighter spots on a cleaner background. At the end, cyan circles mark the true scatterer positions and the view zooms onto the left wing. The imaging step is a demonstration made for this video and is not part of the paper.",
          "assets/research/harmoninet-aircraft.jpg"
        ]
      },
      {
        "id": "scorpion",
        "title": "Scorpion: Multimodal Sensing for Ground Robots",
        "description": "Scorpion is a U.S. Army ERDC project on multimodal ground robots for subterranean sensing. We use the Scorpion rover to study how complementary sensors can improve mapping and threat detection when visibility is limited or a single sensor gives an incomplete picture.",
        "details": [
          ["The problem", "Caves, tunnels, and other underground spaces are often too dangerous to send people into, and they are hard to sense. Light ranges from bright to complete darkness, the air can be dusty or wet, line of sight breaks around corners, and walls create multipath reflections. Chemical and biological threats also vary in size, number, and signature, so no single sensor can reliably detect them all."],
          ["Our approach", "We equip unmanned ground vehicles with complementary sensors: polarimetric and spectral cameras from ultraviolet to long-wave infrared, a 77 GHz millimeter-wave radar that records raw I/Q data for range, angle, and micro-Doppler, a multichannel acoustic array that locates sound sources, and LiDAR for mapping. Robots that mimic how biological threats move and sound let us run controlled lab experiments before field tests. We then compare what each sensor, and each combination, reveals, so we can recommend sensor suites for a given threat and power budget."],
          ["Current progress", "Our platform is a Clearpath Husky rover carrying a 64-channel Ouster LiDAR, a TI AWR2243 millimeter-wave radar, a FLIR thermal camera, an Intel RealSense RGB-D camera, and a Sorama acoustic array. All sensors except the acoustic array run through ROS for synchronized, time-stamped recording and mapping, and the acoustic hotspots are aligned with the LiDAR map afterwards. The video below shows five synchronized views from one recording. In first fusion experiments, combining radar micro-Doppler spectrograms with thermal frames at the input classified eight human and vehicle classes with about 78% accuracy using a network of only about 111,000 parameters. Both results were presented at SPIE Autonomous Systems 2026."]
        ],
        "figureAfter": 1,
        "figure": [
          "assets/research/scorpion-thrust.png",
          "Center: robots detecting threats in a cave. Around it: LiDAR mapping, radar sensing, spectral and polarimetric imaging, and acoustic-array sensing pipelines.",
          "Figure. Subterranean multimodal sensing. Ground robots carry four sensing pipelines into cave-like environments: LiDAR mapping, millimeter-wave radar with micro-Doppler processing, spectral and polarimetric imaging from UV to LWIR, and an acoustic array for locating and classifying sound sources."
        ],
        "video": [
          "assets/research/scorpion-five-views.mp4",
          "Video. Five synchronized views from the Scorpion rover: radar range–Doppler, micro-Doppler, RGB video, thermal imagery, and 3D LiDAR."
          ,"assets/research/scorpion-five-views.jpg"
        ]
      },
      {
        "id": "wifi-har",
        "title": "Wi-Fi Sensing for Low-Cost Activity Monitoring at Home",
        "description": "Wi-Fi routers are already in almost every home. We study whether the channel state information (CSI) they produce can monitor daily activities, such as falls in older adults, without cameras or dedicated radar hardware.",
        "details": [
          [
            "The problem",
            "Monitoring activity at home, for example to detect falls among older adults, should be private, inexpensive, and easy to install. Cameras raise privacy concerns and radar adds cost, while radar and Wi-Fi had not been compared under the same conditions."
          ],
          [
            "Our approach",
            "A Raspberry Pi 3B+ running Nexmon firmware captures Wi-Fi CSI while a phone generates traffic with the access point. A 77 GHz FMCW radar and a Kinect camera record the same scenes, so both sensors see identical activities. We turn both signals into micro-Doppler spectrograms, classify seven activities with CNNs, and release the datasets and code."
          ],
          [
            "What we found and next steps",
            "In matched experiments radar recognized the activities far more reliably, but Wi-Fi still detected them using hardware that costs a few dollars and is already in most homes. We also studied how robust Wi-Fi recognition is to changes in the setup. Ajaya Dahal, whose M.S. research I mentored, has since implemented the pipeline in real time on an AMD Versal FPGA. Next, we aim to close the accuracy gap with interpretable learnable filters on raw CSI, toward affordable in-home monitoring for healthy aging."
          ]
        ],
        "figureAfter": 1,
        "figure": [
          "assets/research/wifi-har-concept.jpg",
          "Concept of Wi-Fi sensing in a room and the experimental setup comparing Wi-Fi CSI and radar.",
          "Figure. Left: a Raspberry Pi captures CSI from ordinary Wi-Fi traffic in a room. Right: the matched Wi-Fi, radar and camera setup and the seven activities."
        ],
        "videoClass": "narrow",
        "video": [
          "assets/research/wifi-har-versal.mp4",
          "Video. The live room-sensing dashboard from Ajaya Dahal’s implementation of this pipeline on an AMD Versal VCK190, replaying a representative CSI feature stream: an empty room, a person walking in, sitting and breathing, a fall, and stillness. On the board, a Raspberry Pi streams CSI, the programmable logic parses the packets, and the AI Engine computes the spectrogram and the motion, breathing and fall features.",
          "assets/research/wifi-har-versal.jpg"
        ],
        "links": [
          [
            "RadarConf 2024 paper",
            "https://doi.org/10.1109/RadarConf2458775.2024.10548515"
          ],
          [
            "SPIE 2024 paper",
            "https://doi.org/10.1117/12.3014010"
          ]
        ]
      }
    ],
    "past": [
      {
        "id": "learnable-filters",
        "title": "Learnable Filters for Raw RF Signals",
        "description": "CV-SincNet and PLFNets learn frequency-selective filters directly from complex radar and RF data. The learned center frequencies and bandwidths make it possible to see which spectral regions the models use for recognition.",
        "links": [
          [
            "CV-SincNet paper",
            "https://doi.org/10.1109/TRS.2023.3310894"
          ],
          [
            "PLFNets paper",
            "https://doi.org/10.1109/TRS.2024.3486183"
          ],
          [
            "PLFNets code",
            "https://github.com/Sabyasachi1406147/PLFNets"
          ]
        ],
        "figure": [
          "assets/img/pub-plfnets.jpg",
          "PLFNets architecture with a parameterized learnable filter layer followed by complex convolutional blocks.",
          "The PLFNets architecture processes raw complex RF signals."
        ]
      },
      {
        "id": "hrspecnet",
        "title": "High-Resolution Micro-Doppler Reconstruction",
        "description": "HRSpecNet uses a denoiser, a learnable short-time Fourier transform, and a U-Net to reconstruct sharper micro-Doppler signatures from raw radar signals. The reconstructed signatures improved human activity recognition in our experiments.",
        "links": [
          [
            "Paper",
            "https://doi.org/10.1109/TRS.2024.3396172"
          ],
          [
            "Code",
            "https://github.com/Sabyasachi1406147/HRSpecNet"
          ]
        ],
        "figure": [
          "assets/img/pub-hrspecnet.jpg",
          "HRSpecNet architecture showing a denoiser, learnable STFT, and U-Net.",
          "HRSpecNet reconstructs a micro-Doppler representation from a one-dimensional complex radar signal."
        ]
      },
      {
        "id": "radar-sign-language",
        "title": "Sign Language Recognition with Radar and Video",
        "description": "Sign language carries meaning in hand shape, motion, and facial expression at once, and no single sensor captures all of it reliably. With Sultan Mohammad Manjur, I built a framework that fuses radar, RGB video, and skeletal keypoints to recognize isolated Italian Sign Language signs, and contributed to RF-ChessSIGN, a game played in real time with signs recognized by radar.",
        "details": [
          [
            "The problem",
            "Automatic sign recognition could ease communication between Deaf and hearing people, but signs differ in subtle finger, hand, and body movements. Cameras give rich appearance but suffer under poor lighting, while radar is unaffected by light and protects privacy but sees no appearance detail."
          ],
          [
            "Our approach",
            "Each modality has its own model. For radar, we generate micro-Doppler signatures directly from range–Doppler maps for each of three receive antennas and classify them with a three-branch CNN that also learns from the differences and products of the antenna features. RGB video goes through a ResNet(2+1)D network, and 27 HRNet skeletal keypoints go through a multi-stream graph network (SL-GCN). A weighted late fusion combines the three predictions."
          ],
          [
            "What we found",
            "On the 1st Multimodal Isolated Italian Sign Language Recognition Challenge (126 signs), the radar branch alone reached about 93% accuracy, and fusing all three modalities reached 99.6% on the validation set and 99.7% on the test set. The team placed 2nd runner-up in the challenge, and the work appeared in the ICCV 2025 workshops alongside RF-ChessSIGN."
          ]
        ],
        "figureAfter": 1,
        "figure": [
          "assets/research/sign-language-streams.png",
          "The three model streams: a three-branch relational CNN for radar micro-Doppler, a ResNet(2+1)D for video, and HRNet keypoints with SL-GCN for skeletons.",
          "Figure. The three streams that are fused. Top: the radar branch, which classifies micro-Doppler signatures from three antennas and their pairwise differences and products. Bottom: the ResNet(2+1)D video model and the skeleton model built on 27 HRNet keypoints and SL-GCN."
        ],
        "links": [
          [
            "ICCV 2025 workshop paper",
            "publications.html"
          ],
          [
            "RF-ChessSIGN",
            "publications.html"
          ],
          [
            "Italian Sign Language Recognition challenge",
            "https://www.kaggle.com/competitions/iccv-mslr-2025-track-2"
          ]
        ]
      },
      {
        "id": "asps",
        "title": "Angular Subspace Projection for Multi-Target Activity Recognition",
        "description": "When several people move in front of a radar at once, their micro-Doppler signatures overlap and a classifier trained on one person fails. With MIMO radar we separated the targets in the raw data itself, so each person can be classified as if they were alone.",
        "details": [
          [
            "The problem",
            "Most radar classifiers assume a single target in the field of view. With several people, conventional processing adds their micro-Doppler signatures together, and separating them by tracking after range, Doppler, or angle processing is fragile when people are close together."
          ],
          [
            "Our approach",
            "Angular subspace projection (ASPS) uses the MIMO virtual array to project the raw radar data cube onto the angular sector of each detected target, producing one data cube per target (RDC-ω). Any representation, such as range–Doppler maps or micro-Doppler spectrograms, can then be computed for each person, and a multi-view deep neural network combines the projected views."
          ],
          [
            "What we found",
            "For nine activities performed by three people at the same time, the network reached 97.8% accuracy while being trained only on single-person data. Projection also improved recognition when targets were close together, including two-handed sign language and side-by-side activities. The work was published in IET Radar, Sonar & Navigation (2023)."
          ]
        ],
        "figureAfter": 1,
        "figureClass": "wide",
        "figure": [
          "assets/research/asps-overview.png",
          "ASPS pipeline: target detection and angular projection, per-target micro-Doppler spectrograms and DNNs, and the projected spectrograms of three people moving at once.",
          "Figure. Left: targets are detected and their angles estimated, then the raw data cube is projected onto each target’s angle and classified separately. Right: three people active at once give one mixed micro-Doppler spectrogram, which ASPS separates into one spectrogram per person."
        ],
        "links": [
          [
            "Paper",
            "https://doi.org/10.1049/rsn2.12405"
          ]
        ]
      }
    ],
    "collab": COLLAB
  };
  const researchNav = (file) => `<nav class="research-nav" aria-label="Research">
    <a href="research.html"${file === 'research.html' ? ' aria-current="page"' : ''}>Current<span class="tab-long"> Research</span></a>
    <a href="past-research.html"${file === 'past-research.html' ? ' aria-current="page"' : ''}>Past<span class="tab-long"> Research</span></a>
    <a href="collaborations.html"${file === 'collaborations.html' ? ' aria-current="page"' : ''}>Collaborations</a>
  </nav>`;
  const assetExists = (asset) => fs.existsSync(path.join(OUT, asset));
  const capHtml = (text) => {
    const m = /^(Figure|Video)\.\s*/.exec(text);
    return m ? `<b>${m[1]}.</b> ${esc(text.slice(m[0].length))}` : esc(text);
  };
  const figureHtml = (figure, cls = '') => {
    if (!figure || !assetExists(figure[0])) return '';
    const [src, alt, caption] = figure;
    return `<figure class="research-media${cls ? ' ' + cls : ''}">
        <a href="${src}"><img src="${src}" alt="${esc(alt)}" loading="lazy"></a>
        <figcaption>${capHtml(caption)}</figcaption>
      </figure>`;
  };
  const videoHtml = (id, video, cls = '') => {
    if (!video || !assetExists(video[0])) return '';
    const [src, caption, poster] = video;
    const posterAttr = poster && assetExists(poster) ? ` poster="${poster}"` : '';
    return `<figure class="research-media${cls ? ' ' + cls : ''}">
        <video controls playsinline preload="metadata" data-playbtn${posterAttr} aria-describedby="${id}-video-caption">
          <source src="${src}" type="video/mp4">
          <a href="${src}">Download the video</a>
        </video>
        <figcaption id="${id}-video-caption">${capHtml(caption)}</figcaption>
      </figure>`;
  };
  const pointHtml = ([h, t]) => `<section>
      ${h ? `<h3>${esc(h)}</h3>` : ''}
      <p>${esc(t)}</p>
    </section>`;
  const renderProject = (project) => {
    const d = project.details || [];
    const at = project.figureAfter != null && d.length ? project.figureAfter + 1 : d.length;
    const inline = project.figureAfter != null && d.length;
    return `<article class="research-project${project.plain ? ' plain-points' : ''}" aria-labelledby="${project.id}">
    <h2 id="${project.id}">${esc(project.title)}</h2>
    ${project.status ? `<p class="research-status">${esc(project.status)}</p>` : ''}
    <p class="research-summary">${esc(project.description)}</p>
    ${d.length ? `<div class="research-points">${d.slice(0, at).map(pointHtml).join('')}</div>` : ''}
    ${inline ? figureHtml(project.figure, project.figureClass) : ''}
    ${d.length > at ? `<div class="research-points">${d.slice(at).map(pointHtml).join('')}</div>` : ''}
    ${linksHtml(project.links)}
    ${inline ? '' : figureHtml(project.figure, project.figureClass)}
    ${videoHtml(project.id, project.video, project.videoClass)}
  </article>`;
  };
  const current = 'research.html';
  const past = 'past-research.html';
  const researchHeader = (file) => `<header class="wrap research-heading">
    <h1>Research</h1>
  </header>
  <div class="research-tabs"><div class="wrap">${researchNav(file)}</div></div>`;
  pages[current] = layout({
    file: current, title: 'Current Research | Sabyasachi Biswas',
    desc: 'Current research on interpretable RF learning, high-resolution radar processing, and multimodal sensing.',
    header: researchHeader(current), bodyClass: 'research-page',
    body: `<div class="wrap research-projects">
      ${projects.current.map(renderProject).join('\n')}
      <section class="research-project" aria-labelledby="future-directions">
        <h2 id="future-directions">Future Directions</h2>
        <p>I want to understand how well radar models transfer across sensors, datasets, and environments. My next step is to study how differences in recording setups and radar representations affect that transfer, with the longer-term goal of building reusable models that adapt with fewer labeled examples.</p>
      </section>
    </div>`,
  });
  pages[past] = layout({
    file: past, title: 'Past Research | Sabyasachi Biswas',
    desc: 'Selected completed projects in radar signal processing, interpretable machine learning, and multimodal sensing.',
    header: researchHeader(past), bodyClass: 'research-page', navFile: current,
    body: `<div class="wrap research-projects">${projects.past.map(renderProject).join('\n')}</div>`,
  });
  pages['collaborations.html'] = layout({
    file: 'collaborations.html', title: 'Collaborations | Sabyasachi Biswas',
    desc: 'Collaborative projects on bearing fault diagnosis and drone-based microwave radiometry.',
    header: researchHeader('collaborations.html'), bodyClass: 'research-page', navFile: current,
    body: `<div class="wrap research-projects"><p class="research-summary collab-intro">Projects with colleagues in mechanical engineering and remote sensing, where the signal processing and learnable-filter ideas from my radar work carry over to new problems.</p>${projects.collab.map(renderProject).join('\n')}</div>`,
  });
}

// ---------------------------------------------------------------- publications
{
  const sections = [
    ['prep', 'Journal Manuscripts in Preparation'],
    ['journal', 'Journal Articles'],
    ['conference', 'Conference Papers'],
  ];
  const entries = D.PUBS.map((paper, index) => ({ paper, tag: TAG[index] }));
  const body = `<div class="wrap block pubs">
  ${sections.map(([type, label]) => {
    const items = entries
      .filter(({ paper }) => paper[0] === type)
      .sort((a, b) => b.paper[1] - a.paper[1]);
    return `<section class="pub-section" aria-labelledby="pub-${type}">
    <h2 id="pub-${type}">${label}</h2>
    <ol class="refs">
      ${items.map(({ paper, tag }) => refItem(paper, tag)).join('\n      ')}
    </ol>
  </section>`;
  }).join('\n  ')}
</div>`;
  pages['publications.html'] = layout({ file: 'publications.html', title: 'Publications | Sabyasachi Biswas', desc: `Journal articles and conference papers by Sabyasachi Biswas on radar signal processing, RF sensing, and interpretable deep learning.`, header: `<header class="wrap publications-title"><h1>Publications</h1></header>`, body, bodyClass: 'publications-page' });
}

// ---------------------------------------------------------------- teaching and advising
{
  const teachTables = D.TEACHING.map(([inst, role, per, rows]) => `
<section class="teach">
  <div class="teach-h"><h3>${inst}</h3><p>${role}, ${per}</p></div>
  <div class="scroll"><table>
    <thead><tr><th scope="col">Course</th><th scope="col">Role</th><th scope="col">Term</th><th scope="col" class="num">Students</th></tr></thead>
    <tbody>${rows.map(([code, name, r, term, n]) => `<tr><td>${code ? `<span class="code">${code}</span> ` : ''}${name}</td><td>${r}</td><td>${term}</td><td class="num">${n || '–'}</td></tr>`).join('')}</tbody>
  </table></div>
</section>`).join('');
  const adviseTables = D.ADVISING.map(([inst, rows]) => `
<section class="teach advise">
  <div class="teach-h"><h3>${inst}</h3></div>
  <div class="scroll"><table>
    <thead><tr><th scope="col">Student</th><th scope="col">Program</th><th scope="col">Role</th><th scope="col">Period</th></tr></thead>
    <tbody>${rows.map(([name, note, prog, role, per, papers]) => `<tr><td>${name}${note ? `<small>${note}</small>` : ''}${papers && papers.length ? `<ul class="adv-papers">${papers.map(([t, v, doi]) => `<li><a href="https://doi.org/${doi}">${t}</a>, <i>${v}</i></li>`).join('')}</ul>` : ''}</td><td>${prog}</td><td>${role}</td><td>${per}</td></tr>`).join('')}</tbody>
  </table></div>
</section>`).join('');
  const body = `
<section class="wrap block ta-sec" id="teaching" aria-labelledby="h-teaching">
  <h2 id="h-teaching">Teaching</h2>
  <p class="sec-lede">At GVSU I teach circuit analysis, electronics, and probability and signal analysis in the Padnos College of Engineering and Computing. Before that I taught Signals and Systems as an interim instructor at Mississippi State, and circuits, electronics, signals, DSP and electromagnetics as a lecturer at Daffodil International University.</p>
  ${teachTables}
</section>
<section class="wrap block ta-sec" id="advising" aria-labelledby="h-advising">
  <h2 id="h-advising">Advising and mentoring</h2>
  <p class="sec-lede">I advise graduate students at GVSU and have mentored student researchers from high school to Ph.D. level at Mississippi State and NC State.</p>
  ${adviseTables}
</section>`;
  pages['teaching.html'] = layout({ file: 'teaching.html', title: 'Teaching and Advising | Sabyasachi Biswas', desc: 'Courses taught and students advised by Sabyasachi Biswas at Grand Valley State University, Mississippi State University, NC State, and Daffodil International University.', header: `<header class="wrap research-heading"><h1>Teaching and advising</h1></header>`, body });
  // old address keeps working
  pages['group.html'] = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Teaching and Advising | Sabyasachi Biswas</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=teaching.html#advising"><link rel="canonical" href="teaching.html#advising"></head><body><p><a href="teaching.html#advising">Teaching and advising</a></p></body></html>`;
}

// ---------------------------------------------------------------- talks and posters
{
  const photos = [];
  D.TALKS.forEach(([, items]) => items.forEach(([t, v, y, fmt, img, cap]) => { if (img) photos.push([img, cap]); }));
  photos.splice(1, 0, ...D.TALK_EXTRA_PHOTOS);
  const gallery = photos.filter(([img]) => fs.existsSync(path.join(OUT, 'assets/img', img))).map(([img, cap]) => `<figure class="talk-ph">
      <a href="assets/img/${img}"><img src="assets/img/${img}" alt="${esc(cap)}" loading="lazy"></a>
      <figcaption>${esc(cap)}</figcaption>
    </figure>`).join('');
  const lists = D.TALKS.map(([g, items]) => `<h3 class="sub">${g}</h3><ul class="plain talk-list">${items.map(([t, v, y, fmt]) => `<li><div class="row"><span>“${t}”</span><span class="per">${y}</span></div><p class="place">${v}${fmt ? ` <span class="talk-fmt">${fmt}</span>` : ''}</p></li>`).join('')}</ul>`).join('');
  const body = `
<section class="wrap block" aria-labelledby="h-posters">
  <h2 id="h-posters">At the poster sessions</h2>
  <div class="talk-gallery">${gallery}</div>
</section>
<section class="wrap block" aria-labelledby="h-talklist">
  <h2 id="h-talklist">Talks, presentations and posters</h2>
  ${lists}
</section>`;
  pages['talks.html'] = layout({ file: 'talks.html', title: 'Talks | Sabyasachi Biswas', desc: 'Seminars, conference presentations, and research posters by Sabyasachi Biswas.', header: `<header class="wrap research-heading"><h1>Talks and posters</h1></header>`, body });
}

// ---------------------------------------------------------------- awards
{
  const ph = (img, cap, cls = '') => fs.existsSync(path.join(OUT, 'assets/img', img)) ? `<figure class="aw-ph ${cls}"><a href="assets/img/${img}"><img src="assets/img/${img}" alt="${esc(cap)}" loading="lazy"></a><figcaption>${esc(cap)}</figcaption></figure>` : '';
  const phd = `
<section class="wrap block phd" aria-labelledby="h-phd">
  <p class="phd-kick">The milestone I am proudest of</p>
  <h2 id="h-phd">Ph.D. in Electrical and Computer Engineering</h2>
  <p class="phd-where">Mississippi State University · defended July 2025 · conferred December 2025</p>
  <p class="phd-diss">Dissertation: <i>Complex-Valued Parameterized Learnable Filters for Time-Frequency Domain Based Classification</i></p>
  <p>Major Professor: Dr. John E. Ball. Dissertation Director: <a href="https://ece.ncsu.edu/people/acgurbuz/">Dr. Ali C. Gurbuz</a>. The dissertation brought together four years of work on neural networks that learn interpretable, physically meaningful filters directly from raw radar and RF signals: CV-SincNet, PLFNets, HRSpecNet, and the time-gated filters that became TG-PLFNet.</p>
  <div class="phd-grid">
    ${ph('phd-diploma.jpg', 'Doctor of Philosophy, James Worth Bagley College of Engineering, conferred December 2025.', 'big diploma')}
    <div class="phd-side">
      ${ph('phd-hooding-advisor.jpg', 'With my major professor, Dr. John E. Ball, at the Graduate School hooding, December 11, 2025.')}
      ${ph('phd-hooding.jpg', 'December 11, 2025: officially Dr. Biswas.')}
    </div>
  </div>
  <div class="phd-row">
    ${ph('phd-presenting.jpg', 'Presenting my dissertation research.')}
    ${ph('phd-committee.jpg', 'With my committee after the dissertation defense.')}
    ${ph('phd-library.jpg', 'Celebrating at the Mississippi State University Libraries.')}
    ${ph('phd-family-diploma.jpg', 'With my family and the diploma on graduation day.')}
  </div>
</section>`;
  const vid = (v) => v ? `<figure class="aw-ph"><video controls playsinline preload="metadata" data-playbtn poster="${v[1]}"><source src="${v[0]}" type="video/mp4"></video><figcaption>${esc(v[2])}</figcaption></figure>` : '';
  const items = D.AWARDS.map(([t, body, y, det, link, img, cap, video]) => `<li class="aw-item${img || video ? ' has-ph' : ''}">
    <div class="aw-year">${y}</div>
    <div class="aw-text">
      <h3>${t}</h3>
      <p class="aw-body">${body}</p>
      ${det ? `<p>${det}</p>` : ''}
      ${link ? `<p class="aw-link"><a href="${link}">${link.includes('kaggle') ? 'Challenge page' : link.includes('ieeexplore') ? 'Paper' : 'News story'}</a></p>` : ''}
    </div>
    ${img ? ph(img, cap) : vid(video)}
  </li>`).join('');
  const body = phd + `
<section class="wrap block" aria-labelledby="h-awards">
  <h2 id="h-awards">Honors and awards</h2>
  <ul class="aw-list">${items}</ul>
</section>`;
  pages['awards.html'] = layout({ file: 'awards.html', title: 'Awards | Sabyasachi Biswas', desc: 'Ph.D. milestone, honors, and awards of Sabyasachi Biswas.', header: `<header class="wrap research-heading"><h1>Awards</h1></header>`, body });
}

// ---------------------------------------------------------------- CV
{
  const tl = D.EXPERIENCE.map(([t, place, per, det]) => `<li><p class="per">${per}</p><h3>${t}</h3><p class="place">${place}</p>${det ? `<p>${det}</p>` : ''}</li>`).join('');
  const body = `
<section class="wrap block cv-top">
  <p class="sec-lede">The full CV, with grants and complete publication details, is ${hasCv ? `available as a <a href="${SITE.cvPdf}" target="_blank" rel="noopener">PDF</a>` : 'available on request'}. Publications are listed on <a href="publications.html">their own page</a>.</p>
  ${hasCv ? `<p><a class="btn" href="${SITE.cvPdf}" target="_blank" rel="noopener">Download CV (PDF)</a></p>` : ''}
</section>
<section class="wrap block split" aria-labelledby="h-exp">
  <h2 id="h-exp">Experience</h2>
  <ol class="tl"><i class="tl-fill" aria-hidden="true"></i>${tl}</ol>
</section>
<section class="wrap block split" aria-labelledby="h-edu">
  <h2 id="h-edu">Education</h2>
  <ul class="plain">${D.EDUCATION.map(([d, s, y, det]) => `<li><div class="row"><h3>${d}</h3><span class="per">${y}</span></div><p class="place">${s}</p><p>${det}</p></li>`).join('')}</ul>
</section>
<section class="wrap block split" aria-labelledby="h-hon">
  <h2 id="h-hon">Honors and awards</h2>
  <ul class="plain">${D.HONORS.map(([t, y]) => `<li><div class="row"><span>${t}</span><span class="per">${y}</span></div></li>`).join('')}</ul>
</section>
<section class="wrap block split" aria-labelledby="h-talks">
  <h2 id="h-talks">Talks</h2>
  <p>Talks, conference presentations and posters are listed on the <a href="talks.html">Talks page</a>.</p>
</section>
<section class="wrap block split" aria-labelledby="h-svc">
  <h2 id="h-svc">Service</h2>
  <ul class="plain">${D.SERVICE.map(([t, d, y]) => `<li><div class="row"><h3>${t}</h3><span class="per">${y}</span></div><p class="place">${d}</p></li>`).join('')}</ul>
</section>
<section class="wrap block split" aria-labelledby="h-mem">
  <h2 id="h-mem">Memberships</h2>
  <ul class="chips">${D.MEMBERSHIPS.map(m => `<li>${m}</li>`).join('')}</ul>
</section>`;
  pages['cv.html'] = layout({ file: 'cv.html', title: 'CV | Sabyasachi Biswas', desc: 'Curriculum vitae of Sabyasachi Biswas: experience, education, honors, talks, and service.', header: `<header class="wrap research-heading"><h1>Curriculum vitae</h1></header>`, body });
}

// ---------------------------------------------------------------- personal (text kept from the original site)
{
  const body = fs.readFileSync(path.join(__dirname, 'personal.html'), 'utf8');
  const header = `<header class="fam-cover">
  <img src="assets/img/cover-family.jpg" alt="" width="2400" height="557">
  <h1>Family is the heart of our story—love is the pen that writes it</h1>
</header>`;
  pages['personal.html'] = layout({ file: 'personal.html', title: 'Me and my family | Sabyasachi Biswas', desc: 'Sabyasachi Biswas on family, Formula One, football, and the people behind the work.', header, body, bodyClass: 'family' });
}

// ---------------------------------------------------------------- 404
pages['404.html'] = layout({ file: '404.html', title: 'Page not found | Sabyasachi Biswas', desc: 'Page not found.', header: `<header class="wrap research-heading"><h1>Nothing at this address</h1></header>`, body: `<section class="wrap block"><p class="sec-lede">The page may have moved when the site was rebuilt. Start from the <a href="index.html">home page</a> or go straight to <a href="publications.html">publications</a>.</p></section>` });

for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, f), html);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pages).filter(f => f !== '404.html' && f !== 'group.html').map(f => `  <url><loc>${SITE.url}/${f === 'index.html' ? '' : f}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('built', Object.keys(pages).join(', '), hasCv ? '(with CV PDF)' : '(no CV PDF)');
