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
  const SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const view = $('#view'), ov = $('#overlay');
  let tab = 'today', sub = null, S = null;

  const done = () => store.get('done', {});
  const videos = () => store.get('videos', {});
  const settings = () => Object.assign({ on: false, time: '08:00', nudgeOn: true, nudge: '19:30' }, store.get('settings', {}));
  const vidOf = id => videos()[id] || EX[id].video || '';
  const embed = u => { const m = (u || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m ? 'https://www.youtube.com/embed/' + m[1] : ''; };
  const fmt = s => Math.floor(s / 60) + ':' + pad(s % 60);
  const target = it => it.secs ? it.secs + ' s' : it.reps + ' reps';

  function session(d, mode) {
    return PLAN[d].items.filter(i => mode !== 'express' || i.express).map(i => Object.assign({}, i, { ex: EX[i.ex], sets: mode === 'express' ? Math.max(1, Math.ceil(i.sets / 2)) : i.sets }));
  }
  function minutes(items) {
    let s = 0;
    items.forEach(it => { s += it.sets * (it.secs || it.reps * 4) + (it.sets - 1) * (it.rest || 0) + 15; });
    return Math.max(1, Math.round(s / 60));
  }
  function streak() {
    const dn = done(); let n = 0; const d = new Date();
    for (let i = 0; i < 400; i++) {
      const k = key(d), wk = d.getDay() === 0 || d.getDay() === 6;
      if (dn[k]) n++; else if (wk || i === 0) { /* skip */ } else break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  /* ---------- illustrations ---------- */
  function fig(p) {
    const L = (a, b) => p[a] && p[b] ? `<line x1="${p[a][0]}" y1="${p[a][1]}" x2="${p[b][0]}" y2="${p[b][1]}"/>` : '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><line class="fl" x1="2" y1="91" x2="98" y2="91"/><g class="st">${L('h', 'n')}${L('n', 'p')}${L('p', 'k')}${L('k', 'f')}${L('p', 'k2')}${L('k2', 'f2')}${L('n', 'e')}${L('e', 'w')}</g><circle class="hd" cx="${p.h[0]}" cy="${p.h[1]}" r="7"/></svg>`;
  }
  const pair = ex => `<div class="pair">${fig(ex.a)}<em>→</em>${fig(ex.b)}</div>`;

  function videoBox(id) {
    const u = vidOf(id), e = embed(u), ex = EX[id];
    return `<div class="vid">${e ? `<iframe src="${e}" allowfullscreen loading="lazy"></iframe>` : (u ? `<a class="btn alt" href="${esc(u)}" target="_blank" rel="noopener">Open video</a>` : '<p class="muted">No video yet. Find one, then paste its link below.</p>')}
      <a class="btn ghost" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.search)}">🔎 Search a video on YouTube</a>
      <div class="row"><input type="url" id="vurl" placeholder="Paste video link" value="${esc(u)}"><button class="btn" style="flex:none;width:auto" data-act="savevid" data-id="${id}">Save</button></div></div>`;
  }

  /* ---------- views ---------- */
  function sessionButtons(d) {
    const f = minutes(session(d, 'full')), x = minutes(session(d, 'express'));
    return `<button class="btn" data-act="start" data-d="${d}" data-m="full">Start session · ~${f} min</button>
      <button class="btn alt" data-act="start" data-d="${d}" data-m="express">Express version · ~${x} min</button>`;
  }
  function weekDots() {
    const dn = done(), now = new Date(), mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    let h = '<div class="dots">';
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      h += `<div class="dot${dn[key(d)] ? ' on' : ''}${key(d) === key(now) ? ' now' : ''}"><i></i>${SHORT[d.getDay()]}</div>`;
    }
    return h + '</div>';
  }
  function vToday() {
    const d = new Date().getDay(), p = PLAN[d], dn = done()[key()];
    const disc = store.get('ack', false) ? '' : `<div class="card warn"><h3>Before you start</h3><p style="margin:6px 0 12px">These exercises are general guidance, not medical advice. Stop if you feel pain, and see a professional for persistent issues or if you have an injury.</p><button class="btn" data-act="ack">Got it</button></div>`;
    return `${disc}<div class="card hero"><div class="sub">${DAYN[d]}</div><h2 style="margin:2px 0 4px;font-size:1.4rem">${p.title}</h2><div class="sub" style="margin-bottom:14px">${p.focus}</div>${dn ? '<p style="margin:0 0 12px">✅ Done for today. Nice work!</p>' : ''}${sessionButtons(d)}</div>
      <div class="card"><div class="row"><div><h3>🔥 ${streak()}-day streak</h3><div class="muted">Weekends don't break it</div></div></div>${weekDots()}</div>`;
  }
  function vWeek() {
    if (sub && sub.day !== undefined) {
      const d = sub.day, p = PLAN[d], items = session(d, 'full');
      let h = `<button class="btn ghost" data-act="back">← Week</button><div class="card"><h2 style="margin:0">${DAYN[d]} · ${p.title}</h2><p class="muted">${p.focus}</p>${sessionButtons(d)}</div>`;
      ['warm-up', 'main', 'cool-down'].forEach(b => {
        const l = items.filter(i => i.block === b); if (!l.length) return;
        h += `<h2>${b[0].toUpperCase() + b.slice(1)}</h2><div class="card" style="padding:4px 16px">` + l.map(i => `<div class="item" data-act="ex" data-id="${i.ex.id}"><div class="th">${fig(i.ex.b)}</div><div class="t"><b>${esc(i.ex.name)}</b><span class="muted">${i.sets} × ${target(i)}</span></div></div>`).join('') + '</div>';
      });
      return h;
    }
    const today = new Date().getDay();
    return '<h2 style="margin-top:6px">Your week</h2>' + ORDER.map(d => `<button class="day${d === today ? ' today' : ''}" data-act="day" data-d="${d}"><span><b>${DAYN[d]}</b><br><span class="muted">${PLAN[d].title}</span></span><span>${done()[key(lastDate(d))] ? '✅' : '›'}</span></button>`).join('');
  }
  function lastDate(dow) { const n = new Date(), d = new Date(n); d.setDate(n.getDate() - ((n.getDay() + 6) % 7) + ((dow + 6) % 7)); return d; }
  function vEx() {
    if (sub && sub.ex) {
      const ex = EX[sub.ex];
      return `<button class="btn ghost" data-act="back">← Back</button><div class="card"><span class="chip">${ex.area} · ${ex.level}</span><h2 style="margin:8px 0 0">${esc(ex.name)}</h2>${pair(ex)}<ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div><div class="card"><h3>Video</h3>${videoBox(ex.id)}</div>`;
    }
    return '<h2 style="margin-top:6px">Exercises</h2><p class="muted">Tap an exercise to see the illustration and add your own video link.</p><div class="card" style="padding:4px 16px">' + EXERCISES.map(e => `<div class="item" data-act="ex" data-id="${e.id}"><div class="th">${fig(e.b)}</div><div class="t"><b>${esc(e.name)}</b><span class="muted">${e.area}${vidOf(e.id) ? ' · 🎬' : ''}</span></div></div>`).join('') + '</div>';
  }
  function vProgress() {
    const dn = done(), total = Object.keys(dn).length; let g = '<div class="grid28">';
    const t = new Date(); t.setDate(t.getDate() - 27);
    for (let i = 0; i < 28; i++) { g += `<i class="${dn[key(t)] ? 'on' : ''}"></i>`; t.setDate(t.getDate() + 1); }
    return `<h2 style="margin-top:6px">Progress</h2><div class="stats"><div class="stat"><b>${streak()}</b>day streak</div><div class="stat"><b>${total}</b>sessions done</div></div><div class="card"><h3 style="margin-bottom:10px">Last 4 weeks</h3>${g}</div>`;
  }
  function vSettings() {
    const s = settings(), perm = 'Notification' in window ? Notification.permission : 'unsupported';
    return `<h2 style="margin-top:6px">Reminders</h2><div class="card">
      <label class="set"><span>Daily reminder</span><input type="checkbox" data-set="on" ${s.on ? 'checked' : ''}></label>
      <label class="set"><span>Time</span><input type="time" data-set="time" value="${s.time}"></label>
      <label class="set"><span>Evening nudge if not done</span><input type="checkbox" data-set="nudgeOn" ${s.nudgeOn ? 'checked' : ''}></label>
      <label class="set"><span>Nudge time</span><input type="time" data-set="nudge" value="${s.nudge}"></label>
      <p class="muted">Notifications: <b>${perm}</b>. Reminders only fire on weekdays, and only while the installed app is open or running in the background. Reliable background reminders need a small server – planned for a later version.</p>
      <button class="btn alt" data-act="perm">Allow notifications</button><button class="btn ghost" data-act="test">Send a test</button></div>
      <h2>Install</h2><div class="card muted">Open this page in your phone browser, then <b>Add to Home Screen</b> (iPhone: Share → Add to Home Screen) for the full-screen app and offline use.</div>
      <h2>Safety</h2><div class="card warn"><p style="margin:0">General guidance, not medical advice. Stop if you feel pain and see a professional for persistent issues or injuries.</p></div>
      <h2>Data</h2><div class="card"><button class="btn ghost" data-act="reset">Reset my progress</button></div>`;
  }
  function render() {
    const V = { today: vToday, week: vWeek, ex: vEx, progress: vProgress, settings: vSettings };
    view.innerHTML = V[tab]();
    document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    window.scrollTo(0, 0);
  }

  /* ---------- session player ---------- */
  function tick(end) {
    clearInterval(S.iv);
    S.iv = setInterval(() => {
      S.t--; const el = document.getElementById('tm'); if (el) el.textContent = fmt(Math.max(0, S.t));
      if (S.t <= 0) { clearInterval(S.iv); S.running = false; buzz(); end(); }
    }, 1000);
  }
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(200); } catch (e) {} };
  function startSession(d, mode) {
    S = { d, mode, items: session(d, mode), i: 0, set: 1, phase: 'work', t: 0, running: false, iv: null, finished: false };
    ov.hidden = false; document.body.style.overflow = 'hidden'; player();
  }
  function closePlayer() { if (S) clearInterval(S.iv); S = null; ov.hidden = true; ov.innerHTML = ''; document.body.style.overflow = ''; render(); }
  function endRest() { S.phase = 'work'; player(); }
  function completeSet() {
    clearInterval(S.iv); S.running = false; S.t = 0;
    const it = S.items[S.i];
    if (S.set < it.sets) {
      S.set++;
      if (it.rest > 0) { S.phase = 'rest'; S.t = it.rest; tick(endRest); }
    } else { nextEx(1); return; }
    player();
  }
  function nextEx(dir) {
    clearInterval(S.iv); S.running = false; S.t = 0; S.phase = 'work'; S.set = 1; S.i += dir;
    if (S.i < 0) S.i = 0;
    if (S.i >= S.items.length) {
      const dn = done(); dn[key()] = { mode: S.mode, min: minutes(S.items), at: Date.now() }; store.set('done', dn); S.finished = true;
    }
    player();
  }
  function player() {
    if (!S) return;
    if (S.finished) {
      ov.innerHTML = `<div><div class="card hero" style="margin-top:40px;text-align:center"><div style="font-size:3rem">🎉</div><h2 style="font-size:1.5rem">Session complete</h2><p class="sub">🔥 ${streak()}-day streak</p><button class="btn" data-act="close">Done</button></div></div>`;
      return;
    }
    const it = S.items[S.i], ex = it.ex, total = S.items.length;
    const head = `<div class="top"><span class="chip">${it.block} · ${S.i + 1}/${total}</span><button class="x" data-act="close" aria-label="Close">✕</button></div><div class="bar"><i style="width:${Math.round(S.i / total * 100)}%"></i></div>`;
    if (S.phase === 'rest') {
      ov.innerHTML = `<div>${head}<div class="card" style="text-align:center"><h2 style="margin-top:0">Rest</h2><div class="big" id="tm">${fmt(Math.max(0, S.t))}</div><p class="muted">Next: set ${S.set} of ${it.sets} – ${esc(ex.name)}</p><button class="btn alt" data-act="skiprest">Skip rest</button></div></div>`;
      return;
    }
    let ctl;
    if (it.secs) {
      const sec = S.t > 0 ? S.t : it.secs;
      ctl = `<div class="big" id="tm">${fmt(sec)}</div>` + (S.running ? '<button class="btn alt" data-act="tpause">Pause</button>' : `<button class="btn" data-act="tstart">${S.t > 0 && S.t < it.secs ? 'Resume' : 'Start'}</button>`) + '<button class="btn ghost" data-act="setdone">Set done</button>';
    } else ctl = `<div class="big">${it.reps} reps</div><button class="btn" data-act="setdone">Set done</button>`;
    ov.innerHTML = `<div>${head}<h2 style="margin:0">${esc(ex.name)}</h2><p class="muted" style="margin:2px 0">Set ${S.set} of ${it.sets} · ${target(it)}</p>${pair(ex)}<ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul><div style="margin-top:14px">${ctl}</div>
      <div class="row" style="margin-top:10px"><button class="btn ghost" data-act="prev">← Previous</button><button class="btn ghost" data-act="skip">Skip →</button></div>
      <details ${vidOf(ex.id) ? 'open' : ''}><summary>🎬 Video</summary>${videoBox(ex.id)}</details></div>`;
  }

  /* ---------- reminders ---------- */
  async function notify(title, body) {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg) reg.showNotification(title, { body, icon: 'icon.svg', tag: 'aligned' }); else new Notification(title, { body });
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
    if (b.dataset.tab) { tab = b.dataset.tab; sub = null; render(); return; }
    const a = b.dataset.act;
    if (a === 'ack') { store.set('ack', true); render(); }
    else if (a === 'day') { sub = { day: +b.dataset.d }; render(); }
    else if (a === 'ex') { sub = { ex: b.dataset.id, from: tab }; if (tab === 'week') { tab = 'ex'; } render(); }
    else if (a === 'back') { if (tab === 'ex' && sub && sub.from === 'week') tab = 'week'; sub = null; render(); }
    else if (a === 'start') startSession(+b.dataset.d, b.dataset.m);
    else if (a === 'close') closePlayer();
    else if (a === 'setdone') completeSet();
    else if (a === 'tstart') { if (S.t <= 0) S.t = S.items[S.i].secs; S.running = true; tick(completeSet); player(); }
    else if (a === 'tpause') { clearInterval(S.iv); S.running = false; player(); }
    else if (a === 'skiprest') { clearInterval(S.iv); endRest(); }
    else if (a === 'skip') nextEx(1);
    else if (a === 'prev') nextEx(-1);
    else if (a === 'savevid') { const v = videos(); const u = ($('#vurl').value || '').trim(); if (u) v[b.dataset.id] = u; else delete v[b.dataset.id]; store.set('videos', v); S ? player() : render(); }
    else if (a === 'perm') { if ('Notification' in window) Notification.requestPermission().then(render); }
    else if (a === 'test') notify('Aligned', 'Notifications are working.');
    else if (a === 'reset') { if (confirm('Delete all progress on this device?')) { store.set('done', {}); store.set('sent', {}); render(); } }
  });
  document.addEventListener('change', e => {
    const k = e.target.dataset.set; if (!k) return;
    const s = settings(); s[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; store.set('settings', s);
  });

  render();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
