(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const key = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const store = {
    get(k, d) { try { const v = localStorage.getItem('al_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('al_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EX = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
  const ORDER = [1, 2, 3, 4, 5, 6, 0];
  const DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const view = $('#view'), ov = $('#overlay'), sheet = $('#sheet');
  let tab = 'today', sub = null, S = null, back = null, exq = '', exg = 'All', deferred = null;

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
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

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
  const settings = () => Object.assign({ on: false, time: '08:00', nudgeOn: true, nudge: '19:30' }, store.get('settings', {}));
  const imgOf = id => images()[id] || EX[id].image || '';
  const listOf = id => EX[id].videos || (EX[id].video ? [EX[id].video] : []);
  const vidOf = id => videos()[id] || listOf(id)[0] || '';
  const vidCount = id => listOf(id).length + (videos()[id] && !listOf(id).includes(videos()[id]) ? 1 : 0);
  const isFile = u => /\.(mp4|webm|mov)(\?.*)?$/i.test(u || '');
  const embed = u => { const m = (u || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m ? 'https://www.youtube.com/embed/' + m[1] : ''; };
  const fmt = s => Math.floor(s / 60) + ':' + pad(s % 60);
  const target = it => it.secs ? (it.secs >= 120 ? Math.round(it.secs / 60) + ' min' : it.secs + ' s') : it.reps + ' reps';
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

  /* ---------- art ---------- */
  function fig(p) {
    const L = (a, b) => p[a] && p[b] ? `<line x1="${p[a][0]}" y1="${p[a][1]}" x2="${p[b][0]}" y2="${p[b][1]}"/>` : '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><line class="fl" x1="2" y1="91" x2="98" y2="91"/><g class="st">${L('h', 'n')}${L('n', 'p')}${L('p', 'k')}${L('k', 'f')}${L('p', 'k2')}${L('k2', 'f2')}${L('n', 'e')}${L('e', 'w')}</g><circle class="hd" cx="${p.h[0]}" cy="${p.h[1]}" r="7"/></svg>`;
  }
  const thumb = ex => imgOf(ex.id) ? `<img src="${esc(imgOf(ex.id))}" alt="" loading="lazy">` : fig(ex.b);
  const bigArt = ex => `<div class="big-art">${imgOf(ex.id) ? `<img src="${esc(imgOf(ex.id))}" alt="${esc(ex.name)}">` : `<div class="pair">${fig(ex.a)}<em>→</em>${fig(ex.b)}</div>`}</div>`;
  function ring(p, sz, st, inner, id) {
    const r = (sz - st) / 2, c = 2 * Math.PI * r, h = sz / 2;
    return `<div class="ring" style="width:${sz}px;height:${sz}px"><svg viewBox="0 0 ${sz} ${sz}"><circle class="trk" cx="${h}" cy="${h}" r="${r}" stroke-width="${st}"/><circle class="val" ${id ? `id="${id}"` : ''} cx="${h}" cy="${h}" r="${r}" stroke-width="${st}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.max(0, Math.min(1, p)))}" transform="rotate(-90 ${h} ${h})"/></svg><div class="in">${inner || ''}</div></div>`;
  }
  const xcard = (e, sub2) => `<button class="xc" data-act="ex" data-id="${e.id}"><div class="art">${thumb(e)}${vidCount(e.id) ? `<span class="badge">${icon('video')}${vidCount(e.id)}</span>` : ''}</div><b>${esc(e.name)}</b><small>${esc(sub2 || e.area)}</small></button>`;

  /* ---------- video box ---------- */
  function videoBox(id) {
    const u = vidOf(id), e = embed(u), ex = EX[id];
    const skip = videos()[id] ? 0 : 1;
    const more = listOf(id).slice(skip).map((x, i) => `<details><summary>${icon('video')} More video ${i + 1}</summary>${isFile(x) ? `<video controls playsinline preload="metadata" src="${esc(x)}"></video>` : `<a class="btn soft" href="${esc(x)}" target="_blank" rel="noopener">Open video</a>`}</details>`).join('');
    const main = isFile(u) ? `<video controls playsinline preload="metadata" src="${esc(u)}"></video>` : e ? `<iframe src="${e}" allowfullscreen loading="lazy"></iframe>` : u ? `<a class="btn soft" href="${esc(u)}" target="_blank" rel="noopener">${icon('play', 'fill')} Open video</a>` : '<p class="muted">No video yet. Search one, then paste its link below.</p>';
    return `<div class="vid">${main}${more}<a class="btn ghost" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.search)}">${icon('search')} Search a video on YouTube</a>
      <div class="row" style="margin-top:10px"><input type="url" id="vurl" placeholder="Paste a video link" value="${esc(videos()[id] || '')}"><button class="btn sm" data-act="savevid" data-id="${id}">Save</button></div></div>`;
  }
  function imageBox(id) {
    const own = !!images()[id];
    return `<div class="row"><label class="btn soft" style="cursor:pointer">${icon('image')} ${imgOf(id) ? 'Change image' : 'Add your image'}<input type="file" accept="image/*" data-img="${id}" hidden></label>${own ? `<button class="btn ghost" data-act="rmimg" data-id="${id}">Remove</button>` : ''}</div><p class="muted" style="margin:8px 0 0">Your image replaces the drawing. It stays on this device.</p>`;
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
        ${bigArt(ex)}${imageBox(ex.id)}
        <div class="card rise"><div class="kv">${icon('target')}<h3>How to do it</h3></div><ul class="cues">${ex.cues.map(c => `<li>${icon('check')}<span>${esc(c)}</span></li>`).join('')}</ul></div>
        <div class="card rise"><div class="kv">${icon('video')}<h3>Video</h3></div>${videoBox(ex.id)}</div>`;
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
      <div class="card rise"><div class="kv">${icon('chart')}<h3>Sessions per week</h3></div><div class="bars">${wk.map(w => `<div class="${w.cur ? 'cur' : ''}"><b>${w.c || ''}</b><i style="height:${Math.round(w.c / mx * 82) + 6}px"></i><small>${w.l}</small></div>`).join('')}</div></div>
      <div class="card rise"><div class="kv">${icon('calendar')}<h3>Last 4 weeks</h3></div><div class="heat-l">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}</div><div class="heat" style="direction:ltr">${heat}</div></div>
      <div class="sec"><h2>Badges</h2></div><div class="badges rise">${B.map(b => `<div class="bd${b[2] ? ' on' : ''}"><div class="bi">${icon(b[3])}</div><b>${b[0]}</b><small>${b[1]}</small></div>`).join('')}</div>`;
  }
  function vSettings() {
    const s = settings(), perm = 'Notification' in window ? Notification.permission : 'unsupported', cur = store.get('theme', 'sage');
    return `<div class="sec" style="margin-top:6px"><h2 style="font-size:1.4rem">Settings</h2></div>
      <div class="card rise"><div class="kv">${icon('palette')}<h3>Theme</h3></div><div class="themes">${THEMES.map(t => `<button class="theme${t.id === cur ? ' on' : ''}" data-act="theme" data-t="${t.id}"><div class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join('')}</div>${t.name}</button>`).join('')}</div></div>
      <div class="card rise"><div class="kv">${icon('phone')}<h3>Install the app</h3></div>${standalone() ? `<p class="muted" style="margin:0">${icon('check')} Aligned is installed on this device.</p>` : `<p class="muted" style="margin:0 0 12px">Add Aligned to your home screen. It opens full screen and works offline.</p><button class="btn" data-act="install">${icon('download')} Install Aligned</button>`}</div>
      <div class="card rise"><div class="kv">${icon('bell')}<h3>Reminders</h3></div>
        <label class="set"><span>Daily reminder</span><input class="sw" type="checkbox" data-set="on" ${s.on ? 'checked' : ''}></label>
        <label class="set"><span>Time</span><input type="time" data-set="time" value="${s.time}"></label>
        <label class="set"><span>Evening nudge if not done</span><input class="sw" type="checkbox" data-set="nudgeOn" ${s.nudgeOn ? 'checked' : ''}></label>
        <label class="set"><span>Nudge time</span><input type="time" data-set="nudge" value="${s.nudge}"></label>
        <p class="muted">Notifications: <b>${perm}</b>. Reminders fire on weekdays while the app is open or running in the background. Reliable background reminders need a small server, planned for a later version.</p>
        <div class="row"><button class="btn soft" data-act="perm">Allow notifications</button><button class="btn ghost" data-act="test">Send a test</button></div></div>
      <div class="card warn rise"><h3>${icon('shield')} Safety</h3><p style="margin:8px 0 0">General guidance, not medical advice. Stop if you feel pain and see a professional for persistent issues or injuries.</p></div>
      <div class="card rise"><div class="kv">${icon('trash')}<h3>Data</h3></div><button class="btn ghost" data-act="reset">Reset my progress</button></div>`;
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
  function startSession(d, mode) {
    S = { d, mode, items: session(d, mode), i: 0, set: 1, phase: 'work', t: 0, tot: 0, running: false, iv: null, finished: false, tab: 'guide' };
    ov.hidden = false; document.body.style.overflow = 'hidden'; player();
  }
  function closePlayer() { if (S) clearInterval(S.iv); S = null; ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = ''; render(true); }
  function endRest() { S.phase = 'work'; S.t = 0; player(); }
  function completeSet() {
    clearInterval(S.iv); S.running = false; S.t = 0;
    const it = S.items[S.i];
    if (S.set < it.sets) {
      S.set++;
      if (it.rest > 0) { S.phase = 'rest'; S.t = it.rest; S.tot = it.rest; tick(endRest); }
    } else { nextEx(1); return; }
    player();
  }
  function nextEx(dir) {
    clearInterval(S.iv); S.running = false; S.t = 0; S.phase = 'work'; S.set = 1; S.i += dir; S.tab = 'guide';
    if (S.i < 0) S.i = 0;
    if (S.i >= S.items.length) {
      const dn = done(); dn[key()] = { mode: S.mode, min: minutes(S.items), at: Date.now() }; store.set('done', dn); S.finished = true;
    }
    player();
  }
  function player() {
    if (!S) return;
    if (S.finished) {
      ov.innerHTML = `<div><div class="card hero celebrate">${ring(1, 120, 10, icon('check'))}<h2 style="font-size:1.6rem">Session complete</h2><p>${S.items.length} exercises · ~${minutes(S.items)} min</p><div class="stats"><div class="stat" style="background:rgba(255,255,255,.16);border:0;box-shadow:none;color:#fff">${icon('flame')}<b>${streakInfo().cur}</b><span style="color:#fff">day streak</span></div><div class="stat" style="background:rgba(255,255,255,.16);border:0;box-shadow:none;color:#fff">${icon('check')}<b>${weekCount()}</b><span style="color:#fff">this week</span></div><div class="stat" style="background:rgba(255,255,255,.16);border:0;box-shadow:none;color:#fff">${icon('clock')}<b>${totalMin()}</b><span style="color:#fff">total min</span></div></div><button class="btn" style="margin-top:18px" data-act="close">Done</button></div></div>`;
      return;
    }
    const it = S.items[S.i], ex = it.ex, total = S.items.length;
    const head = `<div class="ptop"><button class="x" data-act="close" aria-label="Close">${icon('x')}</button><span class="pill">${it.block}</span><span class="cnt">${S.i + 1}/${total}</span></div><div class="segs">${S.items.map((_, i) => `<i class="${i < S.i ? 'on' : i === S.i ? 'cur' : ''}"></i>`).join('')}</div>`;
    if (S.phase === 'rest') {
      ov.innerHTML = `<div>${head}<div class="card" style="text-align:center"><h2>Rest</h2><div class="timer">${ring(S.t / S.tot, 200, 12, `<b id="tm">${fmt(Math.max(0, S.t))}</b>`, 'rv')}</div><p class="muted">Next: set ${S.set} of ${it.sets} · ${esc(ex.name)}</p><button class="btn soft" data-act="skiprest">Skip rest</button></div></div>`;
      return;
    }
    const hasVid = vidCount(ex.id) > 0;
    const dots = `<div class="setdots">${Array.from({ length: it.sets }, (_, i) => `<i class="${i < S.set - 1 ? 'on' : i === S.set - 1 ? 'cur' : ''}"></i>`).join('')}<span class="muted" style="margin-left:6px">Set ${S.set} of ${it.sets}</span></div>`;
    let ctl;
    if (it.secs) {
      const sec = S.t > 0 ? S.t : it.secs; S.tot = it.secs;
      ctl = `<div class="timer">${ring(sec / it.secs, 200, 12, `<b id="tm">${fmt(sec)}</b>`, 'rv')}</div>` + (S.running ? `<button class="btn soft" data-act="tpause">${icon('pause')} Pause</button>` : `<button class="btn" data-act="tstart">${icon('play', 'fill')} ${S.t > 0 && S.t < it.secs ? 'Resume' : 'Start'}</button>`) + `<button class="btn ghost" data-act="setdone">${icon('check')} Set done</button>`;
    } else ctl = `<div class="reps">${ring(1, 170, 10, `<b>${it.reps}</b><small>reps</small>`)}</div><button class="btn" data-act="setdone">${icon('check')} Set done</button>`;
    const media = S.tab === 'video' ? `<div class="card">${videoBox(ex.id)}</div>` : `${bigArt(ex)}<ul class="cues">${ex.cues.map(c => `<li>${icon('check')}<span>${esc(c)}</span></li>`).join('')}</ul>`;
    ov.innerHTML = `<div>${head}<h2 class="ptitle">${esc(ex.name)}</h2><span class="muted">${esc(ex.area)}</span>${dots}
      <div class="tabs"><button class="${S.tab === 'guide' ? 'on' : ''}" data-act="ptab" data-t="guide">${icon('figure')} Guide</button><button class="${S.tab === 'video' ? 'on' : ''}" data-act="ptab" data-t="video">${icon('video')} Video${hasVid ? ' (' + vidCount(ex.id) + ')' : ''}</button></div>
      ${media}<div style="margin-top:12px">${ctl}</div>
      <div class="row" style="margin-top:10px"><button class="btn ghost" data-act="prev">${icon('prev')} Previous</button><button class="btn ghost" data-act="skip">Skip ${icon('skip')}</button></div></div>`;
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
    else if (a === 'start') startSession(+b.dataset.d, b.dataset.m);
    else if (a === 'close') closePlayer();
    else if (a === 'ptab') { S.tab = b.dataset.t; player(); }
    else if (a === 'setdone') completeSet();
    else if (a === 'tstart') { if (S.t <= 0) S.t = S.items[S.i].secs; S.tot = S.items[S.i].secs; S.running = true; tick(completeSet); player(); }
    else if (a === 'tpause') { clearInterval(S.iv); S.running = false; player(); }
    else if (a === 'skiprest') { clearInterval(S.iv); endRest(); }
    else if (a === 'skip') nextEx(1);
    else if (a === 'prev') nextEx(-1);
    else if (a === 'savevid') { const v = videos(); const u = ($('#vurl').value || '').trim(); if (u) v[b.dataset.id] = u; else delete v[b.dataset.id]; store.set('videos', v); S ? player() : render(true); }
    else if (a === 'rmimg') { const m = images(); delete m[b.dataset.id]; store.set('images', m); render(true); }
    else if (a === 'perm') { if ('Notification' in window) Notification.requestPermission().then(() => render(true)); }
    else if (a === 'test') notify('Aligned', 'Notifications are working.');
    else if (a === 'reset') { if (confirm('Delete all progress on this device?')) { store.set('done', {}); store.set('sent', {}); render(true); } }
  });
  document.addEventListener('input', e => { if (e.target.id === 'q') { exq = e.target.value; const g = $('#exgrid'); if (g) g.innerHTML = exGrid(); } });
  document.addEventListener('change', e => {
    if (e.target.dataset.img) { const f = e.target.files && e.target.files[0]; if (f) saveImage(e.target.dataset.img, f); return; }
    const k = e.target.dataset.set; if (!k) return;
    const s = settings(); s[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; store.set('settings', s);
  });

  applyTheme();
  render();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
