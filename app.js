(function () {
  'use strict';
  const VERSION = '1.5';
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const key = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  /* ------------------------------------------------------------------
     STORAGE – every read/write goes through this one object.
     Today it uses the device (localStorage). To move to Firebase later,
     only this object needs to change (read from the cloud, write to it).
  ------------------------------------------------------------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('al_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('al_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EX = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
  const ORDER = [1, 2, 3, 4, 5, 6, 0];
  const DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const view = $('#view'), ov = $('#overlay'), sheet = $('#sheet');
  let tab = 'today', sub = null, S = null, back = null, exq = '', exg = 'All', deferred = null, pex = null, histN = 8;
  const vsel = {}; // chosen video per exercise (in memory)

  /* ---------- icons ---------- */
  const IC = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    figure: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M12 11l-4 3M12 11l4 3M12 15l-3 6M12 15l3 6"/>',
    chart: '<path d="M4 20V11M10 20V4M16 20v-7M21 20H3"/>',
    settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    skip: '<path d="M5 5l9 7-9 7zM19 5v14"/>',
    prev: '<path d="M19 5l-9 7 9 7zM5 5v14"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L7 21l5-3 5 3-1.5-6.5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M12 8v5M12 16v.5"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    zap: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="3"/><path d="M11 18h2"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4M6 12v7h12v-7"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'
  };
  const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

  /* ---------- themes ---------- */
  const THEMES = [
    { id: 'auto', name: 'Auto', sw: ['#eef3f0', '#2f8a73', '#0a101c'] },
    { id: 'sage', name: 'Sage', sw: ['#eef3f0', '#2f8a73', '#dff0ea'] },
    { id: 'ocean', name: 'Ocean', sw: ['#edf3fa', '#2f72d6', '#dce9fb'] },
    { id: 'sunset', name: 'Sunset', sw: ['#fbf1ea', '#e2692f', '#fde5d6'] },
    { id: 'lavender', name: 'Lavender', sw: ['#f3effa', '#7c5cd6', '#e9e1fa'] },
    { id: 'midnight', name: 'Midnight', sw: ['#0a101c', '#3fd0b4', '#173340'] },
    { id: 'graphite', name: 'Graphite', sw: ['#121212', '#f2b24c', '#2d2511'] }
  ];
  function applyTheme() {
    let t = store.get('theme', 'sage');
    if (t === 'auto') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'sage';
    document.documentElement.dataset.theme = t;
    const m = document.querySelector('meta[name=theme-color]');
    if (m) m.content = getComputedStyle(document.documentElement).getPropertyValue('--bar').trim() || '#ffffff';
  }
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) {}

  /* ---------- data helpers ---------- */
  const done = () => store.get('done', {});
  const videos = () => store.get('videos', {});
  const images = () => store.get('images', {});
  const logs = () => store.get('logs', []);
  const checkins = () => store.get('checkins', []);
  const settings = () => Object.assign({ on: false, time: '08:00', nudgeOn: true, nudge: '19:30' }, store.get('settings', {}));
  const imgOf = id => images()[id] || EX[id].image || '';
  const listOf = id => EX[id].videos || (EX[id].video ? [EX[id].video] : []);
  const allVids = id => { const u = videos()[id]; return [...new Set([u, ...listOf(id)].filter(Boolean))]; };
  const vidCount = id => allVids(id).length;
  const isFile = u => /\.(mp4|webm|mov)(\?.*)?$/i.test(u || '');
  const embed = u => { const m = (u || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m ? 'https://www.youtube.com/embed/' + m[1] : ''; };
  const vname = u => ((u || '').match(/([^\/]+)\.(?:mp4|webm|mov)/i) || [])[1] || '';
  const posterOf = u => (isFile(u) && /^videos\//.test(u)) ? 'thumbs/' + vname(u) + '.jpg' : '';
  const fmt = s => Math.floor(s / 60) + ':' + pad(Math.round(s) % 60);
  const durOf = u => { const s = (window.VMETA || {})[vname(u)]; return s ? fmt(s) : ''; };
  const target = it => it.secs ? (it.secs >= 120 ? Math.round(it.secs / 60) + ' min' : it.secs + ' s') : it.reps + ' reps';
  const dateLabel = k => { const d = new Date(k + 'T12:00:00'); return DAY3[d.getDay()] + ' ' + d.getDate() + ' ' + MON3[d.getMonth()]; };
  function session(d, mode) {
    return PLAN[d].items.filter(i => mode !== 'express' || i.express).map(i => Object.assign({}, i, { ex: EX[i.ex], sets: mode === 'express' ? Math.max(1, Math.ceil(i.sets / 2)) : i.sets }));
  }
  function minutes(items) {
    let s = 0;
    items.forEach(it => { s += it.sets * (it.secs || it.reps * 4) + (it.sets - 1) * (it.rest || 0) + 15; });
    return Math.max(1, Math.round(s / 60));
  }
  const uniq = items => { const seen = new Set(); return items.filter(i => !seen.has(i.ex.id) && seen.add(i.ex.id)); };
  const group = e => /neck|breath/i.test(e.area) ? 'Neck' : /pelvis|hips|legs|feet/i.test(e.area) ? 'Pelvis & legs' : /shoulder|chest/i.test(e.area) ? 'Shoulders & chest' : 'Back & core';
  function streakInfo() {
    const dn = done(), ks = Object.keys(dn).sort(); if (!ks.length) return { cur: 0, best: 0 };
    const d = new Date(ks[0] + 'T12:00:00'), today = key(); let n = 0, best = 0, cur = 0;
    for (let i = 0; i < 900; i++) {
      const k = key(d), wk = d.getDay() === 0 || d.getDay() === 6;
      if (dn[k]) { n++; best = Math.max(best, n); } else if (!wk && k < today) n = 0;
      if (k === today) { cur = n; break; }
      d.setDate(d.getDate() + 1);
    }
    return { cur, best };
  }
  const monday = (d = new Date()) => { const m = new Date(d); m.setHours(12, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; };
  function weekDays() { const m = monday(), out = []; for (let i = 0; i < 7; i++) { const d = new Date(m); d.setDate(m.getDate() + i); out.push(d); } return out; }
  const weekCount = () => weekDays().filter(d => done()[key(d)]).length;
  const totalMin = () => Object.values(done()).reduce((a, v) => a + ((v && v.min) || 0), 0);
  const TIPS = [
    'Set a timer to stand up and reset your posture every 30–45 minutes.',
    'Keep your screen at eye level so your neck stays long.',
    'Breathe into your lower ribs: slow nose breaths relax the neck and shoulders.',
    'Short, regular sessions beat one long session. Consistency is the goal.',
    'Feet flat, hips back in the chair, and let the chair carry your back.',
    'Move often: your best posture is your next posture.',
    'Stop if something hurts. Gentle and pain-free is the rule.'
  ];

  /* ---------- art: video thumbnails first, drawings as fallback ---------- */
  function fig(p) {
    const L = (a, b) => p[a] && p[b] ? `<line x1="${p[a][0]}" y1="${p[a][1]}" x2="${p[b][0]}" y2="${p[b][1]}"/>` : '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><line class="fl" x1="2" y1="91" x2="98" y2="91"/><g class="st">${L('h', 'n')}${L('n', 'p')}${L('p', 'k')}${L('k', 'f')}${L('p', 'k2')}${L('k2', 'f2')}${L('n', 'e')}${L('e', 'w')}</g><circle class="hd" cx="${p.h[0]}" cy="${p.h[1]}" r="7"/></svg>`;
  }
  const thumbSrc = ex => imgOf(ex.id) || posterOf(allVids(ex.id)[0]);
  const thumb = ex => { const s = thumbSrc(ex); return s ? `<img src="${esc(s)}" alt="" loading="lazy" data-fb="${ex.id}">` : fig(ex.b); };
  const bigArt = ex => `<div class="big-art">${imgOf(ex.id) ? `<img src="${esc(imgOf(ex.id))}" alt="${esc(ex.name)}">` : `<div class="pair">${fig(ex.a)}<em>→</em>${fig(ex.b)}</div>`}</div>`;
  document.addEventListener('error', e => {
    const t = e.target; if (!t || t.tagName !== 'IMG') return;
    if (t.dataset.fb && EX[t.dataset.fb]) t.outerHTML = fig(EX[t.dataset.fb].b);
    else if (t.dataset.vfb) t.remove();
  }, true);
  function ring(p, sz, st, inner, id) {
    const r = (sz - st) / 2, c = 2 * Math.PI * r, h = sz / 2;
    return `<div class="ring" style="width:${sz}px;height:${sz}px"><svg viewBox="0 0 ${sz} ${sz}"><circle class="trk" cx="${h}" cy="${h}" r="${r}" stroke-width="${st}"/><circle class="val" ${id ? `id="${id}"` : ''} cx="${h}" cy="${h}" r="${r}" stroke-width="${st}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.max(0, Math.min(1, p)))}" transform="rotate(-90 ${h} ${h})"/></svg><div class="in">${inner || ''}</div></div>`;
  }
  const xcard = (e, sub2) => `<button class="xc" data-act="ex" data-id="${e.id}"><div class="art">${thumb(e)}${vidCount(e.id) ? `<span class="mp">${icon('play', 'fill')}</span><span class="badge">${icon('video')}${vidCount(e.id)}</span>` : ''}</div><b>${esc(e.name)}</b><small>${esc(sub2 || e.area)}</small></button>`;

  /* ---------- video: tap-to-play tiles with a clear error message ---------- */
  async function probe(src) {
    try {
      const c = new AbortController();
      const r = await fetch(src, { headers: { Range: 'bytes=0-1' }, cache: 'no-store', signal: c.signal });
      const out = { status: r.status, ct: r.headers.get('content-type') || '' };
      c.abort(); return out;
    } catch (e) { return { status: 0, ct: '' }; }
  }
  const probeOk = p => p.status >= 200 && p.status < 300 && /video|octet-stream/i.test(p.ct);
  function whyText(src, p) {
    if (!p.status) return 'The server could not be reached. Check your internet connection.';
    if (p.status === 404 || (p.status < 300 && /html/i.test(p.ct))) return 'The file ' + src + ' is not on the website. Upload the videos folder to GitHub, next to index.html.';
    if (p.status === 401 || p.status === 403) return 'The server refused the file (error ' + p.status + '). Check the Vercel deployment protection settings.';
    if (probeOk(p)) return 'The file is there, but this browser could not play it. Try opening it directly.';
    return 'Unexpected answer from the server (error ' + p.status + ').';
  }
  async function vidFail(t, src) {
    t.classList.remove('live'); t.classList.add('bad');
    t.innerHTML = `<div class="vbad">${icon('video')}<b>This video can’t be loaded</b><span class="muted" data-why>Checking the file…</span><a class="btn sm soft" href="${esc(src)}" target="_blank" rel="noopener">Open the file directly</a></div>`;
    const p = await probe(src), el = t.querySelector('[data-why]'); if (el) el.textContent = whyText(src, p);
  }
  function playTile(t) {
    const src = t.dataset.src; if (!src) return;
    const v = document.createElement('video');
    v.controls = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.poster = posterOf(src);
    v.addEventListener('error', () => vidFail(t, src));
    v.src = src;
    t.classList.add('live'); t.removeAttribute('data-act'); t.innerHTML = ''; t.appendChild(v);
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  }
  const tile = src => `<div class="vt" data-act="playvid" data-src="${esc(src)}" role="button" tabindex="0" aria-label="Play video">${posterOf(src) ? `<img src="${esc(posterOf(src))}" alt="" data-vfb="1">` : ''}<span class="pl">${icon('play', 'fill')}</span>${durOf(src) ? `<span class="dur">${durOf(src)}</span>` : ''}</div>`;
  function videoBox(id, cp) {
    const list = allVids(id), ex = EX[id];
    const cur = vsel[id] && list.includes(vsel[id]) ? vsel[id] : list[0] || '';
    const e = embed(cur);
    const main = isFile(cur) ? tile(cur) : e ? `<iframe src="${e}" allowfullscreen loading="lazy"></iframe>` : cur ? `<a class="btn soft" href="${esc(cur)}" target="_blank" rel="noopener">${icon('play', 'fill')} Open video</a>` : '<p class="muted">No video yet. Search one, then paste its link below.</p>';
    const strip = list.length > 1 ? `<div class="vlist">${list.map((x, i) => `<button class="vm${x === cur ? ' on' : ''}" data-act="pickvid" data-id="${id}" data-src="${esc(x)}" aria-label="Video ${i + 1}">${posterOf(x) ? `<img src="${esc(posterOf(x))}" alt="" loading="lazy" data-vfb="1">` : icon('video')}<span>${durOf(x) || i + 1}</span></button>`).join('')}</div>` : '';
    return `<div class="vbox${cp ? ' cp' : ''}" data-id="${id}" data-cp="${cp ? 1 : 0}">${main}${strip}
      ${cp ? '' : `<details class="vadd"><summary>${icon('plus')} Add your own video link</summary>
        <a class="btn ghost" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.search)}">${icon('search')} Search a video on YouTube</a>
        <div class="row" style="margin-top:10px"><input type="url" id="vurl" placeholder="Paste a video link" value="${esc(videos()[id] || '')}"><button class="btn sm" data-act="savevid" data-id="${id}">Save</button></div></details>`}</div>`;
  }
  function imageBox(id) {
    const own = !!images()[id];
    return `<div class="row"><label class="btn soft" style="cursor:pointer">${icon('image')} ${imgOf(id) ? 'Change image' : 'Add your image'}<input type="file" accept="image/*" data-img="${id}" hidden></label>${own ? `<button class="btn ghost" data-act="rmimg" data-id="${id}">Remove</button>` : ''}</div><p class="muted" style="margin:8px 0 0">Your image replaces the picture on the cards. It stays on this device.</p>`;
  }
  function saveImage(id, file) {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const sc = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        const m = images(); m[id] = c.toDataURL('image/jpeg', 0.8); store.set('images', m); render(true);
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }
  async function checkVideos() {
    const out = $('#vcheck'); if (!out) return;
    const files = [...new Set(EXERCISES.flatMap(e => listOf(e.id)).filter(isFile))];
    out.innerHTML = `<p class="muted">Checking ${files.length} videos…</p>`;
    const bad = []; let ok = 0;
    for (let i = 0; i < files.length; i += 6) {
      const res = await Promise.all(files.slice(i, i + 6).map(async f => [f, await probe(f)]));
      res.forEach(([f, p]) => { if (probeOk(p)) ok++; else bad.push([f, p]); });
    }
    const th = await probe('thumbs/' + vname(files[0]) + '.jpg');
    const thOk = th.status >= 200 && th.status < 300 && /image/i.test(th.ct);
    let h = `<p style="margin:0 0 8px"><b>${ok} of ${files.length}</b> videos found.${thOk ? ' Thumbnails found.' : ' <b>Thumbnails folder not found</b> (thumbs).'}</p>`;
    if (bad.length) {
      const all = bad.length === files.length, shown = bad.slice(0, 6);
      h += all ? `<p class="muted" style="margin:0 0 6px"><b>None</b> of the videos can be reached.</p>` : `<p class="muted" style="margin:0 0 6px">Missing or unreadable:</p><div class="miss">${shown.map(([f, p]) => `<code>${esc(f)} · ${p.status || 'offline'}</code>`).join('')}${bad.length > shown.length ? `<code>and ${bad.length - shown.length} more</code>` : ''}</div>`;
      h += `<p class="muted">${esc(whyText(bad[0][0], bad[0][1]))} Test one link yourself: <a href="${esc(bad[0][0])}" target="_blank" rel="noopener">${esc(location.origin)}/${esc(bad[0][0])}</a></p>`;
    }
    else if (thOk) h += `<p class="muted" style="margin:0">${icon('check')} Everything is in place.</p>`;
    out.innerHTML = h;
  }

  /* ---------- install ---------- */
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function openSheet(html) { sheet.innerHTML = `<div class="scrim" data-act="sheetx"></div><div class="panel">${html}</div>`; sheet.hidden = false; }
  function closeSheet() { sheet.hidden = true; sheet.innerHTML = ''; }
  function installHelp() {
    const steps = isIOS()
      ? [`Tap the <b>Share</b> button ${icon('share')} in Safari`, 'Scroll and tap <b>Add to Home Screen</b>', 'Tap <b>Add</b>. Aligned appears on your home screen']
      : /android/i.test(navigator.userAgent)
        ? ['Open the browser menu <b>⋮</b>', 'Tap <b>Install app</b> (or <b>Add to Home screen</b>)', 'Confirm. Aligned appears on your home screen']
        : ['Look for the <b>install icon</b> at the right end of the address bar (Chrome or Edge)', 'Or open the browser menu and choose <b>Install Aligned</b>', 'Confirm. It opens in its own window'];
    return `<div class="kv"><div class="logo">${icon('download')}</div><h3 style="font-size:1.2rem">Install Aligned</h3></div><p class="muted" style="margin:0">Works offline, opens full screen, and lives on your home screen like a native app.</p><ol>${steps.map((s, i) => `<li><span class="n">${i + 1}</span><span>${s}</span></li>`).join('')}</ol><button class="btn" data-act="sheetx">Got it</button>`;
  }
  async function doInstall() {
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; render(true); return; }
    openSheet(installHelp());
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (!S) render(true); });
  window.addEventListener('appinstalled', () => { deferred = null; store.set('installed', true); closeSheet(); render(true); });
  const showInstall = () => !standalone() && !store.get('installed', false);

  /* ---------- performance data ---------- */
  const EFFORT = { easy: 'Easy', ok: 'Moderate', hard: 'Hard' };
  const PAIN = { none: 'None', mild: 'Mild', high: 'Notable' };
  const FELT = { easy: 'Easy', right: 'Just right', hard: 'Hard' };
  const AREAS = [['neck', 'Neck'], ['shoulders', 'Shoulders'], ['back', 'Back'], ['hips', 'Pelvis & hips']];
  function perfData() {
    const m = {};
    logs().forEach(l => {
      const per = {};
      (l.entries || []).forEach(en => {
        if (!en.sets || !en.sets.length || !EX[en.ex]) return;
        const p = per[en.ex] || (per[en.ex] = { ex: en.ex, date: l.date, at: l.at, unit: en.unit, total: 0, sets: 0, best: 0, all: [], felt: null });
        en.sets.forEach(v => { p.total += v; p.sets++; p.best = Math.max(p.best, v); p.all.push(v); });
        if (en.felt) p.felt = en.felt;
      });
      Object.values(per).forEach(p => (m[p.ex] = m[p.ex] || []).push(p));
    });
    Object.values(m).forEach(a => a.sort((x, y) => x.at - y.at));
    return m;
  }
  const uLabel = (u, n) => u === 's' ? n + ' s' : n + ' reps';
  function spark(vals, w, h, o = {}) {
    if (!vals.length) return '';
    const mn = Math.min(...vals), mx = Math.max(...vals), pd = o.pad || 10, rng = (mx - mn) || 1, top = o.labels ? 16 : 0;
    const X = i => vals.length === 1 ? w / 2 : pd + i * (w - 2 * pd) / (vals.length - 1);
    const Y = v => (mx === mn) ? (h + top) / 2 : h - pd - ((v - mn) / rng) * (h - 2 * pd - top);
    const pts = vals.map((v, i) => [X(i), Y(v)]);
    const line = pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const area = pts[0][0].toFixed(1) + ',' + h + ' ' + line + ' ' + pts[pts.length - 1][0].toFixed(1) + ',' + h;
    const dots = pts.map((p, i) => `<circle class="spd${i === pts.length - 1 ? ' last' : ''}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${o.r || 3.5}"/>`).join('');
    const lab = o.labels ? pts.map((p, i) => (i === 0 || i === pts.length - 1 || vals[i] === mx) ? `<text class="spt" x="${p[0].toFixed(1)}" y="${(p[1] - 7).toFixed(1)}" text-anchor="middle">${vals[i]}</text>` : '').join('') : '';
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Trend">${vals.length > 1 ? `<polygon class="spa" points="${area}"/><polyline class="spl" points="${line}"/>` : ''}${dots}${lab}</svg>`;
  }
  function delta(d, goodUp) {
    if (!d) return `<span class="dl flat">${icon('minus')}same</span>`;
    const good = goodUp ? d > 0 : d < 0;
    return `<span class="dl ${good ? 'up' : 'dn'}">${icon(d > 0 ? 'up' : 'down')}${Math.abs(d)}</span>`;
  }
  function perfCard() {
    const P = perfData(), ids = Object.keys(P).sort((a, b) => P[b][P[b].length - 1].at - P[a][P[a].length - 1].at);
    if (!ids.length) return `<div class="card rise"><div class="kv">${icon('target')}<h3>Performance</h3></div><p class="muted" style="margin:0">Finish a session and your reps and hold times appear here, exercise by exercise, so you can see yourself getting stronger.</p></div>`;
    if (!pex || !P[pex]) pex = ids[0];
    const arr = P[pex], last = arr[arr.length - 1], prev = arr[arr.length - 2], best = arr.reduce((m, x) => x.total > m.total ? x : m, arr[0]);
    const recent = arr.slice(-12), u = last.unit;
    return `<div class="card rise"><div class="kv">${icon('target')}<h3>Performance</h3></div>
      <div class="chips" style="padding-top:2px">${ids.map(id => `<button class="chip${id === pex ? ' on' : ''}" data-act="pex" data-id="${id}">${esc(EX[id].name)}</button>`).join('')}</div>
      <div class="mini3"><div><small>Last session</small><b>${uLabel(u, last.total)}</b></div><div><small>Best</small><b>${uLabel(u, best.total)}</b></div><div><small>vs previous</small><b>${prev ? delta(last.total - prev.total, true) : '<span class="muted">first log</span>'}</b></div></div>
      ${recent.length > 1 ? `<div class="sparkbox">${spark(recent.map(x => x.total), 320, 110, { labels: true })}<div class="spx"><span>${dateLabel(recent[0].date)}</span><span>${dateLabel(recent[recent.length - 1].date)}</span></div></div>` : '<p class="muted" style="margin:4px 0 0;text-align:center">Do this exercise in another session to see your trend.</p>'}
      <p class="muted" style="margin:10px 0 0">Total ${u === 's' ? 'seconds held' : 'reps'} per session. Last sets: <b>${last.all.join(' · ')}</b>${last.felt ? ' · felt ' + FELT[last.felt].toLowerCase() : ''}</p></div>`;
  }
  function checkCard() {
    const C = checkins().slice().sort((a, b) => a.at - b.at), last = C[C.length - 1], todayDone = last && last.date === key();
    let rows = '';
    if (last) {
      const row = (k, l, goodUp) => {
        const vals = C.map(c => c[k]).filter(v => v != null).slice(-8); if (!vals.length) return '';
        const d = vals.length > 1 ? vals[vals.length - 1] - vals[vals.length - 2] : 0;
        return `<div class="ci"><span>${l}</span>${spark(vals, 90, 30, { r: 2.5, pad: 5 })}<b>${vals[vals.length - 1]}<small>/10</small></b>${vals.length > 1 ? delta(d, goodUp) : '<span class="dl"></span>'}</div>`;
      };
      rows = AREAS.map(a => row(a[0], a[1], false)).join('') + row('posture', 'Posture', true);
    }
    return `<div class="card rise"><div class="kv">${icon('heart')}<h3>Body check-in</h3></div>
      ${last ? `<p class="muted" style="margin:0 0 6px">Tightness or pain from 0 to 10 (lower is better). Last check-in: ${dateLabel(last.date)}.</p>${rows}` : '<p class="muted" style="margin:0 0 10px">Rate how tight or sore each area feels, and your posture, every few days. The trend shows what the training is doing for you.</p>'}
      <button class="btn ${last ? 'soft' : ''}" style="margin-top:12px" data-act="ciopen">${icon('plus')} ${todayDone ? 'Update today’s check-in' : 'Log a check-in'}</button></div>`;
  }
  function histCard() {
    const L = logs().slice().sort((a, b) => b.at - a.at);
    if (!L.length) return '';
    const items = L.slice(0, histN).map(l => {
      const lines = (l.entries || []).map(en => `<li><span>${esc(EX[en.ex] ? EX[en.ex].name : en.ex)}${en.felt ? ` <em>· ${FELT[en.felt].toLowerCase()}</em>` : ''}</span><b>${en.sets.join(' · ')}${en.unit === 's' ? ' s' : ''}</b></li>`).join('');
      const tags = [l.mode === 'express' ? 'Express' : '', l.partial ? 'Partial' : '', l.effort ? EFFORT[l.effort] : '', l.pain && l.pain !== 'none' ? 'Pain: ' + PAIN[l.pain].toLowerCase() : ''].filter(Boolean);
      return `<details class="hist"><summary><div><b>${esc(l.title)}</b><span class="muted">${dateLabel(l.date)} · ${l.actualMin} min${tags.length ? ' · ' + tags.join(' · ') : ''}</span></div>${icon('chevron')}</summary><ul>${lines || '<li class="muted">No sets recorded.</li>'}</ul>${l.note ? `<p class="hnote">“${esc(l.note)}”</p>` : ''}</details>`;
    }).join('');
    return `<div class="sec"><h2>History</h2><span class="muted">${L.length} logged</span></div><div class="card rise" style="padding:6px 16px">${items}</div>${L.length > histN ? `<button class="btn ghost" data-act="morehist">Show more</button>` : ''}`;
  }
  function exProgress(id) {
    const arr = perfData()[id]; if (!arr) return '';
    const last = arr[arr.length - 1], prev = arr[arr.length - 2], best = arr.reduce((m, x) => x.total > m.total ? x : m, arr[0]);
    return `<div class="card rise"><div class="kv">${icon('chart')}<h3>Your progress</h3></div><div class="mini3"><div><small>Last</small><b>${uLabel(last.unit, last.total)}</b></div><div><small>Best</small><b>${uLabel(last.unit, best.total)}</b></div><div><small>Sessions</small><b>${arr.length}</b></div></div>${arr.length > 1 ? `<div class="sparkbox">${spark(arr.slice(-12).map(x => x.total), 320, 90, { labels: true })}</div>` : ''}${prev ? '' : '<p class="muted" style="margin:8px 0 0">Do it again to start seeing a trend.</p>'}</div>`;
  }
  function ciSheet() {
    const last = checkins().slice(-1)[0] || {};
    const sl = (k, l, mn, v) => `<label class="slr"><div><b>${l}</b></div><output id="o_${k}">${v}</output><input type="range" min="${mn}" max="10" step="1" value="${v}" data-ci="${k}"></label>`;
    openSheet(`<div class="kv">${icon('heart')}<h3 style="font-size:1.2rem">Body check-in</h3></div><p class="muted" style="margin:0 0 6px">How tight or sore does each area feel right now? 0 is nothing, 10 is severe.</p>
      ${AREAS.map(a => sl(a[0], a[1], 0, last[a[0]] != null ? last[a[0]] : 3)).join('')}
      <p class="muted" style="margin:12px 0 0">Overall, how good does your posture feel? 1 is poor, 10 is great.</p>${sl('posture', 'Posture', 1, last.posture != null ? last.posture : 5)}
      <textarea id="cinote" rows="2" placeholder="Note (optional)"></textarea>
      <button class="btn" data-act="cisave">Save check-in</button><button class="btn ghost" data-act="sheetx">Cancel</button>`);
  }
  function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('al_') === 0 && k !== 'al_sent') { try { data[k.slice(3)] = JSON.parse(localStorage.getItem(k)); } catch (e) {} } }
    const blob = new Blob([JSON.stringify({ app: 'aligned', version: VERSION, exported: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'aligned-backup-' + key() + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  function importData(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result); if (!j || j.app !== 'aligned' || !j.data) throw 0;
        if (!confirm('Replace the data on this device with this backup?')) return;
        Object.keys(j.data).forEach(k => store.set(k, j.data[k])); applyTheme(); render(true); alert('Backup restored.');
      } catch (e) { alert('This file is not an Aligned backup.'); }
    };
    r.readAsText(file);
  }

  /* ---------- views ---------- */
  function sessionButtons(d) {
    return `<button class="btn" data-act="start" data-d="${d}" data-m="full">${icon('play', 'fill')} Start session · ~${minutes(session(d, 'full'))} min</button>
      <button class="btn glass soft" data-act="start" data-d="${d}" data-m="express">${icon('zap')} Express version · ~${minutes(session(d, 'express'))} min</button>`;
  }
  function vToday() {
    const now = new Date(), d = now.getDay(), p = PLAN[d], items = session(d, 'full'), dn = done()[key()], si = streakInfo(), wc = weekCount();
    const h = now.getHours(), greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const strip = weekDays().map(x => `<div class="day-pill${done()[key(x)] ? ' on' : ''}${key(x) === key() ? ' now' : ''}">${DAY3[x.getDay()]}<span class="dot">${icon('check')}</span><b>${x.getDate()}</b></div>`).join('');
    const disc = store.get('ack', false) ? '' : `<div class="card warn rise"><h3>${icon('shield')} Before you start</h3><p style="margin:8px 0 14px">These exercises are general guidance, not medical advice. Stop if you feel pain, and see a professional for persistent issues or an injury.</p><button class="btn" data-act="ack">Got it</button></div>`;
    const inst = showInstall() && !store.get('hideInstall', false) ? `<div class="card install rise"><div class="bub">${icon('download')}</div><div class="t"><b>Install Aligned</b><span class="muted">Add it to your home screen</span></div><button class="btn sm" data-act="install">Install</button><button class="x" data-act="hideinstall" aria-label="Dismiss">${icon('x')}</button></div>` : '';
    return `${disc}
      <div class="rise" style="padding:6px 4px 2px"><span class="muted">${DAYN[d]}, ${now.getDate()} ${now.toLocaleString('en', { month: 'long' })}</span><h2 style="font-size:1.6rem">${greet}</h2></div>
      <section class="card hero rise"><div class="hero-top"><div><span class="pill light">${esc(p.title)}</span><h2>${esc(p.focus)}</h2><p>Warm-up, main work and cool-down</p></div>${ring(Math.min(1, wc / 5), 66, 7, `<b>${wc}</b><small>/5</small>`)}</div>
        <div class="meta"><span>${icon('clock')} ~${minutes(items)} min</span><span>${icon('figure')} ${items.length} exercises</span></div>
        ${dn ? `<div class="donebanner">${icon('check')} Done for today. Nice work!</div>` : ''}${sessionButtons(d)}</section>
      ${inst}
      <div class="stats rise"><div class="stat flame">${icon('flame')}<b>${si.cur}</b><span>day streak</span></div><div class="stat">${icon('award')}<b>${si.best}</b><span>best streak</span></div><div class="stat">${icon('clock')}<b>${totalMin()}</b><span>total min</span></div></div>
      <div class="card rise"><div class="strip">${strip}</div></div>
      <div class="sec"><h2>Today's exercises</h2><button data-act="goweek" data-d="${d}">See all</button></div>
      <div class="hscroll rise">${uniq(items).map(i => xcard(i.ex, i.sets + ' × ' + target(i))).join('')}</div>
      <div class="card tip rise"><div class="bub">${icon('bulb')}</div><div><b>Posture tip</b><p>${TIPS[Math.floor(now / 864e5) % TIPS.length]}</p></div></div>`;
  }
  function vWeek() {
    if (sub && sub.day !== undefined) {
      const d = sub.day, p = PLAN[d], items = session(d, 'full');
      let h = `<button class="btn ghost sm" data-act="back" style="margin:6px 0 4px">${icon('prev')} Week</button>
        <section class="card hero rise"><span class="pill light">${DAYN[d]}</span><h2>${esc(p.title)}</h2><p>${esc(p.focus)}</p><div class="meta"><span>${icon('clock')} ~${minutes(items)} min</span><span>${icon('figure')} ${items.length} exercises</span></div>${sessionButtons(d)}</section>`;
      let n = 0;
      ['warm-up', 'main', 'cool-down'].forEach(b => {
        const l = items.filter(i => i.block === b); if (!l.length) return;
        h += `<div class="blk">${b}</div><div class="card timeline rise" style="padding:4px 14px">` + l.map(i => `<div class="step" data-act="ex" data-id="${i.ex.id}"><span class="n">${++n}</span><div class="th">${thumb(i.ex)}</div><div class="t"><b>${esc(i.ex.name)}</b><span class="muted">${i.sets} × ${target(i)}${vidCount(i.ex.id) ? ' · ' + vidCount(i.ex.id) + ' video' + (vidCount(i.ex.id) > 1 ? 's' : '') : ''}</span></div>${icon('chevron')}</div>`).join('') + '</div>';
      });
      return h;
    }
    const today = new Date().getDay();
    return '<div class="sec" style="margin-top:6px"><h2 style="font-size:1.4rem">Your week</h2></div>' + ORDER.map(d => {
      const items = session(d, 'full'), first = items[Math.min(2, items.length - 1)].ex;
      return `<button class="daycard rise${d === today ? ' today' : ''}" data-act="day" data-d="${d}"><div class="bub">${thumb(first)}</div><div class="t"><b>${DAYN[d]}</b><span class="muted">${esc(PLAN[d].title)} · ~${minutes(items)} min</span></div><span class="st">${done()[key(weekDays().find(x => x.getDay() === d))] ? icon('check') : icon('chevron')}</span></button>`;
    }).join('');
  }
  function exGrid() {
    const q = exq.trim().toLowerCase();
    const l = EXERCISES.filter(e => (exg === 'All' || group(e) === exg) && (!q || (e.name + ' ' + e.area).toLowerCase().includes(q)));
    return l.length ? l.map(e => xcard(e)).join('') : '<p class="muted" style="grid-column:1/-1;text-align:center;padding:30px 0">No exercise found.</p>';
  }
  function vEx() {
    if (sub && sub.ex) {
      const ex = EX[sub.ex];
      return `<button class="btn ghost sm" data-act="back" style="margin:6px 0 4px">${icon('prev')} Back</button>
        <div class="rise"><span class="pill">${esc(ex.area)} · ${esc(ex.level)}</span><h2 style="font-size:1.5rem;margin:8px 0 0">${esc(ex.name)}</h2></div>
        <div class="card rise"><div class="kv">${icon('video')}<h3>Video${vidCount(ex.id) > 1 ? 's (' + vidCount(ex.id) + ')' : ''}</h3></div>${videoBox(ex.id, false)}</div>
        <div class="card rise"><div class="kv">${icon('target')}<h3>How to do it</h3></div><ul class="cues">${ex.cues.map(c => `<li>${icon('check')}<span>${esc(c)}</span></li>`).join('')}</ul></div>
        ${exProgress(ex.id)}
        <details class="card rise more"><summary>${icon('image')} Drawing and your own picture</summary>${bigArt(ex)}${imageBox(ex.id)}</details>`;
    }
    const groups = ['All', 'Pelvis & legs', 'Shoulders & chest', 'Neck', 'Back & core'];
    return `<div class="sec" style="margin-top:6px"><h2 style="font-size:1.4rem">Exercises</h2><span class="muted">${EXERCISES.length} total</span></div>
      <label class="search">${icon('search')}<input id="q" type="search" placeholder="Search exercises" value="${esc(exq)}" autocomplete="off"></label>
      <div class="chips">${groups.map(g => `<button class="chip${g === exg ? ' on' : ''}" data-act="grp" data-g="${g}">${g}</button>`).join('')}</div>
      <div class="grid2" id="exgrid">${exGrid()}</div>`;
  }
  function vProgress() {
    const dn = done(), total = Object.keys(dn).length, si = streakInfo();
    const wk = []; for (let i = 7; i >= 0; i--) { const m = monday(); m.setDate(m.getDate() - 7 * i); let c = 0; for (let j = 0; j < 7; j++) { const x = new Date(m); x.setDate(m.getDate() + j); if (dn[key(x)]) c++; } wk.push({ c, l: pad(m.getDate()) + '/' + pad(m.getMonth() + 1), cur: i === 0 }); }
    const mx = Math.max(5, ...wk.map(w => w.c));
    const t = monday(); t.setDate(t.getDate() - 21); let heat = '';
    for (let i = 0; i < 28; i++) { heat += `<i class="${dn[key(t)] ? 'on' : ''}"></i>`; t.setDate(t.getDate() + 1); }
    const B = [['First step', 'first session', total >= 1, 'play'], ['5 sessions', 'getting going', total >= 5, 'target'], ['10 sessions', 'building habit', total >= 10, 'award'], ['25 sessions', 'committed', total >= 25, 'award'], ['3-day streak', 'on a roll', si.best >= 3, 'flame'], ['7-day streak', 'a full week', si.best >= 7, 'flame']];
    return `<div class="sec" style="margin-top:6px"><h2 style="font-size:1.4rem">Progress</h2></div>
      <div class="stats rise"><div class="stat flame">${icon('flame')}<b>${si.cur}</b><span>day streak</span></div><div class="stat">${icon('check')}<b>${total}</b><span>sessions</span></div><div class="stat">${icon('clock')}<b>${totalMin()}</b><span>minutes</span></div></div>
      ${perfCard()}${checkCard()}
      <div class="card rise"><div class="kv">${icon('chart')}<h3>Sessions per week</h3></div><div class="bars">${wk.map(w => `<div class="${w.cur ? 'cur' : ''}"><b>${w.c || ''}</b><i style="height:${Math.round(w.c / mx * 82) + 6}px"></i><small>${w.l}</small></div>`).join('')}</div></div>
      <div class="card rise"><div class="kv">${icon('calendar')}<h3>Last 4 weeks</h3></div><div class="heat-l">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}</div><div class="heat" style="direction:ltr">${heat}</div></div>
      ${histCard()}
      <div class="sec"><h2>Badges</h2></div><div class="badges rise">${B.map(b => `<div class="bd${b[2] ? ' on' : ''}"><div class="bi">${icon(b[3])}</div><b>${b[0]}</b><small>${b[1]}</small></div>`).join('')}</div>`;
  }
  function vSettings() {
    const s = settings(), perm = 'Notification' in window ? Notification.permission : 'unsupported', cur = store.get('theme', 'sage');
    return `<div class="sec" style="margin-top:6px"><h2 style="font-size:1.4rem">Settings</h2></div>
      <div class="card rise"><div class="kv">${icon('palette')}<h3>Theme</h3></div><div class="themes">${THEMES.map(t => `<button class="theme${t.id === cur ? ' on' : ''}" data-act="theme" data-t="${t.id}"><div class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join('')}</div>${t.name}</button>`).join('')}</div></div>
      <div class="card rise"><div class="kv">${icon('phone')}<h3>Install the app</h3></div>${standalone() ? `<p class="muted" style="margin:0">${icon('check')} Aligned is installed on this device.</p>` : `<p class="muted" style="margin:0 0 12px">Add Aligned to your home screen. It opens full screen and works offline.</p><button class="btn" data-act="install">${icon('download')} Install Aligned</button>`}</div>
      <div class="card rise"><div class="kv">${icon('video')}<h3>Check videos</h3></div><p class="muted" style="margin:0 0 12px">Tests that every video and thumbnail is really on your website.</p><div id="vcheck"></div><button class="btn soft" data-act="vcheck">${icon('search')} Run the check</button></div>
      <div class="card rise"><div class="kv">${icon('bell')}<h3>Reminders</h3></div>
        <label class="set"><span>Daily reminder</span><input class="sw" type="checkbox" data-set="on" ${s.on ? 'checked' : ''}></label>
        <label class="set"><span>Time</span><input type="time" data-set="time" value="${s.time}"></label>
        <label class="set"><span>Evening nudge if not done</span><input class="sw" type="checkbox" data-set="nudgeOn" ${s.nudgeOn ? 'checked' : ''}></label>
        <label class="set"><span>Nudge time</span><input type="time" data-set="nudge" value="${s.nudge}"></label>
        <p class="muted">Notifications: <b>${perm}</b>. Reminders fire on weekdays while the app is open or running in the background. Reliable background reminders need a small server, planned for a later version.</p>
        <div class="row"><button class="btn soft" data-act="perm">Allow notifications</button><button class="btn ghost" data-act="test">Send a test</button></div></div>
      <div class="card warn rise"><h3>${icon('shield')} Safety</h3><p style="margin:8px 0 0">General guidance, not medical advice. Stop if you feel pain and see a professional for persistent issues or injuries.</p></div>
      <div class="card rise"><div class="kv">${icon('download')}<h3>Your data</h3></div><p class="muted" style="margin:0 0 12px">Everything is saved on this device only. Download a backup to keep it safe or to move it to another phone.</p>
        <div class="row"><button class="btn soft" data-act="export">${icon('download')} Backup</button><label class="btn soft" style="cursor:pointer">${icon('upload')} Restore<input type="file" accept="application/json,.json" data-import="1" hidden></label></div>
        <button class="btn ghost" data-act="reset">${icon('trash')} Reset my progress</button></div>
      <p class="muted" style="text-align:center;margin:18px 0 0">Aligned v${VERSION}</p>`;
  }
  const NAV = [['today', 'home', 'Today'], ['week', 'calendar', 'Week'], ['ex', 'figure', 'Exercises'], ['progress', 'chart', 'Progress'], ['settings', 'settings', 'Settings']];
  function render(keep) {
    const y = window.scrollY;
    const V = { today: vToday, week: vWeek, ex: vEx, progress: vProgress, settings: vSettings };
    view.innerHTML = V[tab]();
    $('#nav').innerHTML = NAV.map(n => `<button data-tab="${n[0]}" class="${n[0] === tab ? 'on' : ''}">${icon(n[1])}${n[2]}</button>`).join('');
    window.scrollTo(0, keep ? y : 0);
  }

  /* ---------- session player ---------- */
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(200); } catch (e) {} try { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; const c = new A(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = .08; o.start(); setTimeout(() => { o.stop(); c.close(); }, 180); } catch (e) {} };
  function paint() {
    const el = $('#tm'); if (el) el.textContent = fmt(Math.max(0, S.t));
    const rv = $('#rv'); if (rv && S.tot) { const c = +rv.getAttribute('stroke-dasharray'); rv.style.strokeDashoffset = c * (1 - Math.max(0, S.t) / S.tot); }
  }
  function tick(end) {
    clearInterval(S.iv);
    S.iv = setInterval(() => { S.t--; paint(); if (S.t <= 0) { clearInterval(S.iv); S.running = false; buzz(); end(); } }, 1000);
  }
  const defTab = ex => allVids(ex.id).length ? 'video' : 'guide';
  function startSession(d, mode) {
    const items = session(d, mode);
    S = { d, mode, items, i: 0, set: 1, phase: 'work', t: 0, tot: 0, running: false, iv: null, finished: false, tab: defTab(items[0].ex), start: Date.now(), entries: {}, actual: items[0].reps || 0, mk: null, effort: null, pain: null, note: '', logId: null };
    ov.hidden = false; document.body.style.overflow = 'hidden'; player();
  }
  function saveLog(partial) {
    const entries = Object.keys(S.entries).map(Number).sort((a, b) => a - b).map(k => S.entries[k]).filter(e => e.sets.length);
    if (!entries.length && partial) return;
    const rec = { id: Date.now(), date: key(), at: Date.now(), d: S.d, title: PLAN[S.d].title, mode: S.mode, partial: !!partial, plannedMin: minutes(S.items), actualMin: Math.max(1, Math.round((Date.now() - S.start) / 60000)), entries, effort: null, pain: null, note: '' };
    const l = logs(); l.push(rec); store.set('logs', l); S.logId = rec.id;
  }
  function updateLog() {
    if (!S || !S.logId) return;
    const l = logs(), r = l.find(x => x.id === S.logId); if (!r) return;
    r.effort = S.effort; r.pain = S.pain; r.note = (S.note || '').trim(); store.set('logs', l);
  }
  function closePlayer() {
    if (S) {
      clearInterval(S.iv);
      if (S.finished) updateLog();
      else if (Object.values(S.entries).some(e => e.sets.length) && confirm('Save the sets you completed so far to your history?')) saveLog(true);
    }
    S = null; ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = ''; render(true);
  }
  function recordSet(v) {
    const it = S.items[S.i];
    const en = S.entries[S.i] || (S.entries[S.i] = { ex: it.ex.id, block: it.block, unit: it.secs ? 's' : 'reps', target: it.secs || it.reps, plannedSets: it.sets, sets: [], felt: null });
    en.sets.push(v);
  }
  function endRest() { S.phase = 'work'; S.t = 0; player(); }
  function completeSet(auto) {
    clearInterval(S.iv); S.running = false;
    const it = S.items[S.i];
    let v;
    if (it.secs) { const el = it.secs - S.t; v = (!auto && S.t > 0 && S.t < it.secs && el >= 5) ? el : it.secs; } else v = S.actual || it.reps;
    recordSet(v); S.t = 0; S.actual = it.reps || 0;
    if (S.set < it.sets) {
      S.set++;
      if (it.rest > 0) { S.phase = 'rest'; S.t = it.rest; S.tot = it.rest; tick(endRest); }
    } else { nextEx(1); return; }
    player();
  }
  function nextEx(dir) {
    clearInterval(S.iv); S.running = false; S.t = 0; S.phase = 'work'; S.set = 1; S.i += dir;
    if (S.i < 0) S.i = 0;
    if (dir < 0) delete S.entries[S.i];
    if (S.i >= S.items.length) {
      const dn = done(); dn[key()] = { mode: S.mode, min: minutes(S.items), at: Date.now() }; store.set('done', dn);
      saveLog(false); S.finished = true; player(); return;
    }
    const it = S.items[S.i]; S.tab = defTab(it.ex); S.actual = it.reps || 0; S.mk = null; player();
  }
  function player() {
    if (!S) return;
    if (S.finished) {
      const sets = Object.values(S.entries).reduce((a, e) => a + e.sets.length, 0);
      const st = 'background:rgba(255,255,255,.16);border:0;box-shadow:none;color:#fff';
      const chips = (obj, cur, act) => Object.keys(obj).map(k => `<button class="chip${cur === k ? ' on' : ''}" data-act="${act}" data-v="${k}">${obj[k]}</button>`).join('');
      ov.innerHTML = `<div><div class="card hero celebrate">${ring(1, 110, 10, icon('check'))}<h2 style="font-size:1.6rem">Session complete</h2><p>${S.items.length} exercises · ${sets} sets logged · ~${minutes(S.items)} min</p><div class="stats"><div class="stat" style="${st}">${icon('flame')}<b>${streakInfo().cur}</b><span style="color:#fff">day streak</span></div><div class="stat" style="${st}">${icon('check')}<b>${weekCount()}</b><span style="color:#fff">this week</span></div><div class="stat" style="${st}">${icon('clock')}<b>${totalMin()}</b><span style="color:#fff">total min</span></div></div></div>
        <div class="card"><div class="kv">${icon('chart')}<h3>How did it feel?</h3></div>
          <p class="muted" style="margin:6px 0 6px">Effort</p><div class="fg">${chips(EFFORT, S.effort, 'effort')}</div>
          <p class="muted" style="margin:12px 0 6px">Pain or discomfort</p><div class="fg">${chips(PAIN, S.pain, 'pain')}</div>
          <textarea id="note" rows="3" placeholder="Notes (optional): what felt tight, what to change next time">${esc(S.note)}</textarea></div>
        <button class="btn" data-act="close">Save and close</button></div>`;
      return;
    }
    const it = S.items[S.i], ex = it.ex, total = S.items.length;
    const head = `<div class="ptop"><button class="x" data-act="close" aria-label="Close">${icon('x')}</button><span class="pill">${it.block}</span><span class="cnt">${S.i + 1}/${total}</span></div><div class="segs">${S.items.map((_, i) => `<i class="${i < S.i ? 'on' : i === S.i ? 'cur' : ''}"></i>`).join('')}</div>`;
    if (S.phase === 'rest') {
      S.mk = null;
      ov.innerHTML = `<div>${head}<div class="card" style="text-align:center"><h2>Rest</h2><div class="timer">${ring(S.t / S.tot, 200, 12, `<b id="tm">${fmt(Math.max(0, S.t))}</b>`, 'rv')}</div><p class="muted">Next: set ${S.set} of ${it.sets} · ${esc(ex.name)}</p><button class="btn soft" data-act="skiprest">Skip rest</button></div></div>`;
      return;
    }
    const hasVid = vidCount(ex.id) > 0;
    const dots = `<div class="setdots">${Array.from({ length: it.sets }, (_, i) => `<i class="${i < S.set - 1 ? 'on' : i === S.set - 1 ? 'cur' : ''}"></i>`).join('')}<span class="muted" style="margin-left:6px">Set ${S.set} of ${it.sets}</span></div>`;
    let ctl;
    if (it.secs) {
      const sec = S.t > 0 ? S.t : it.secs; S.tot = it.secs;
      ctl = `<div class="timer sm">${ring(sec / it.secs, 150, 11, `<b id="tm">${fmt(sec)}</b>`, 'rv')}</div>` + (S.running ? `<button class="btn soft" data-act="tpause">${icon('pause')} Pause</button>` : `<button class="btn" data-act="tstart">${icon('play', 'fill')} ${S.t > 0 && S.t < it.secs ? 'Resume' : 'Start'}</button>`) + `<button class="btn ghost" data-act="setdone">${icon('check')} Set done</button>`;
    } else ctl = `<div class="repsrow"><button class="rb" data-act="repdn" aria-label="Fewer reps">${icon('minus')}</button>${ring(1, 140, 10, `<b id="reps-n">${S.actual}</b><small class="rl">reps done</small>`)}<button class="rb" data-act="repup" aria-label="More reps">${icon('plus')}</button></div><p class="muted" style="text-align:center;margin:0 0 10px">Target ${it.reps}. Adjust if you did more or fewer.</p><button class="btn" data-act="setdone">${icon('check')} Set done</button>`;
    const en = S.entries[S.i], felt = en && en.felt;
    const mk = S.i + ':' + S.tab;
    let held = null; if (S.mk === mk) { held = $('#pmedia'); if (held) held.remove(); }
    const media = S.tab === 'video' ? `<div class="card" style="padding:12px">${videoBox(ex.id, true)}</div>` : `${bigArt(ex)}<ul class="cues">${ex.cues.map(c => `<li>${icon('check')}<span>${esc(c)}</span></li>`).join('')}</ul>`;
    ov.innerHTML = `<div>${head}<h2 class="ptitle">${esc(ex.name)}</h2><span class="muted">${esc(ex.area)} · target ${it.sets} × ${target(it)}</span>${dots}
      <div class="tabs"><button class="${S.tab === 'guide' ? 'on' : ''}" data-act="ptab" data-t="guide">${icon('figure')} Guide</button><button class="${S.tab === 'video' ? 'on' : ''}" data-act="ptab" data-t="video">${icon('video')} Video${hasVid ? ' (' + vidCount(ex.id) + ')' : ''}</button></div>
      ${held ? '<div id="pmslot"></div>' : `<div id="pmedia">${media}</div>`}<div style="margin-top:12px">${ctl}</div>
      <p class="muted" style="margin:14px 0 6px">How did this exercise feel?</p><div class="fg">${Object.keys(FELT).map(k => `<button class="chip${felt === k ? ' on' : ''}" data-act="felt" data-v="${k}">${FELT[k]}</button>`).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn ghost" data-act="prev">${icon('prev')} Previous</button><button class="btn ghost" data-act="skip">Skip ${icon('skip')}</button></div></div>`;
    if (held) $('#pmslot').replaceWith(held);
    S.mk = mk;
  }

  /* ---------- reminders ---------- */
  async function notify(title, body) {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg) reg.showNotification(title, { body, icon: 'icon-192.png', tag: 'aligned' }); else new Notification(title, { body });
    } catch (e) {}
  }
  function check() {
    const s = settings(); if (!s.on) return;
    const now = new Date(), dow = now.getDay(); if (dow === 0 || dow === 6) return;
    const hm = pad(now.getHours()) + ':' + pad(now.getMinutes()), k = key(), sent = store.get('sent', {});
    if (done()[k]) return;
    if (hm >= s.time && !sent[k + 'a']) { sent[k + 'a'] = 1; store.set('sent', sent); notify("Time for today's session", PLAN[dow].title + ' – ' + minutes(session(dow, 'full')) + ' min (or the express version).'); }
    else if (s.nudgeOn && hm >= s.nudge && !sent[k + 'b']) { sent[k + 'b'] = 1; store.set('sent', sent); notify("You haven't done today's session", 'Even the express version keeps your streak going.'); }
  }
  setInterval(check, 30000); setTimeout(check, 2000);

  /* ---------- events ---------- */
  function refreshVbox(id) {
    const old = document.querySelector('.vbox[data-id="' + id + '"]'); if (!old) return false;
    old.outerHTML = videoBox(id, old.dataset.cp === '1');
    const t = document.querySelector('.vbox[data-id="' + id + '"] .vt'); if (t) playTile(t);
    return true;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act],[data-tab]'); if (!b) return;
    if (b.dataset.tab) { tab = b.dataset.tab; sub = null; back = null; render(); return; }
    const a = b.dataset.act;
    if (a === 'ack') { store.set('ack', true); render(true); }
    else if (a === 'day') { sub = { day: +b.dataset.d }; render(); }
    else if (a === 'goweek') { tab = 'week'; sub = { day: +b.dataset.d }; render(); }
    else if (a === 'ex') { back = { tab, sub }; tab = 'ex'; sub = { ex: b.dataset.id }; render(); }
    else if (a === 'back') { if (back) { tab = back.tab; sub = back.sub; back = null; } else sub = null; render(); }
    else if (a === 'grp') { exg = b.dataset.g; render(true); }
    else if (a === 'theme') { store.set('theme', b.dataset.t); applyTheme(); render(true); }
    else if (a === 'install') doInstall();
    else if (a === 'hideinstall') { store.set('hideInstall', true); render(true); }
    else if (a === 'sheetx') closeSheet();
    else if (a === 'playvid') playTile(b);
    else if (a === 'pickvid') { vsel[b.dataset.id] = b.dataset.src; refreshVbox(b.dataset.id); }
    else if (a === 'vcheck') checkVideos();
    else if (a === 'start') startSession(+b.dataset.d, b.dataset.m);
    else if (a === 'close') closePlayer();
    else if (a === 'ptab') { S.tab = b.dataset.t; player(); }
    else if (a === 'setdone') completeSet(false);
    else if (a === 'repdn') { S.actual = Math.max(0, S.actual - 1); const n = $('#reps-n'); if (n) n.textContent = S.actual; }
    else if (a === 'repup') { S.actual = Math.min(999, S.actual + 1); const n = $('#reps-n'); if (n) n.textContent = S.actual; }
    else if (a === 'felt') { const en = S.entries[S.i] || (S.entries[S.i] = { ex: S.items[S.i].ex.id, block: S.items[S.i].block, unit: S.items[S.i].secs ? 's' : 'reps', target: S.items[S.i].secs || S.items[S.i].reps, plannedSets: S.items[S.i].sets, sets: [], felt: null }); en.felt = en.felt === b.dataset.v ? null : b.dataset.v; player(); }
    else if (a === 'effort') { S.effort = S.effort === b.dataset.v ? null : b.dataset.v; player(); }
    else if (a === 'pain') { S.pain = S.pain === b.dataset.v ? null : b.dataset.v; player(); }
    else if (a === 'tstart') { if (S.t <= 0) S.t = S.items[S.i].secs; S.tot = S.items[S.i].secs; S.running = true; tick(() => completeSet(true)); player(); }
    else if (a === 'tpause') { clearInterval(S.iv); S.running = false; player(); }
    else if (a === 'skiprest') { clearInterval(S.iv); endRest(); }
    else if (a === 'skip') nextEx(1);
    else if (a === 'prev') nextEx(-1);
    else if (a === 'savevid') { const v = videos(); const u = ($('#vurl').value || '').trim(); if (u) v[b.dataset.id] = u; else delete v[b.dataset.id]; store.set('videos', v); delete vsel[b.dataset.id]; S ? player() : render(true); }
    else if (a === 'rmimg') { const m = images(); delete m[b.dataset.id]; store.set('images', m); render(true); }
    else if (a === 'pex') { pex = b.dataset.id; render(true); }
    else if (a === 'morehist') { histN += 10; render(true); }
    else if (a === 'ciopen') ciSheet();
    else if (a === 'cisave') {
      const rec = { date: key(), at: Date.now(), note: (($('#cinote') || {}).value || '').trim() };
      document.querySelectorAll('[data-ci]').forEach(i => { rec[i.dataset.ci] = +i.value; });
      const c = checkins().filter(x => x.date !== key()); c.push(rec); store.set('checkins', c); closeSheet(); render(true);
    }
    else if (a === 'export') exportData();
    else if (a === 'perm') { if ('Notification' in window) Notification.requestPermission().then(() => render(true)); }
    else if (a === 'test') notify('Aligned', 'Notifications are working.');
    else if (a === 'reset') { if (confirm('Delete all progress, history and check-ins on this device?')) { ['done', 'sent', 'logs', 'checkins'].forEach(k => store.set(k, k === 'done' || k === 'sent' ? {} : [])); render(true); } }
  });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('vt') && e.target.dataset.act === 'playvid') { e.preventDefault(); playTile(e.target); } });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q') { exq = t.value; const g = $('#exgrid'); if (g) g.innerHTML = exGrid(); }
    else if (t.id === 'note' && S) S.note = t.value;
    else if (t.dataset && t.dataset.ci) { const o = $('#o_' + t.dataset.ci); if (o) o.textContent = t.value; }
  });
  document.addEventListener('change', e => {
    if (e.target.dataset.img) { const f = e.target.files && e.target.files[0]; if (f) saveImage(e.target.dataset.img, f); return; }
    if (e.target.dataset.import) { const f = e.target.files && e.target.files[0]; if (f) importData(f); e.target.value = ''; return; }
    const k = e.target.dataset.set; if (!k) return;
    const s = settings(); s[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; store.set('settings', s);
  });

  applyTheme();
  render();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.ALIGNED_VERSION = VERSION;
})();
