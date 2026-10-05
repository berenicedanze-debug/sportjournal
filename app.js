'use strict';
/* Sport Journal : logique complète (aucune donnée en dur, stockage localStorage) */
const KEY = 'sportjournal.v1';
const TYPES = ['Course', 'Vélo', 'Natation', 'Musculation', 'Marche', 'Autre'];
const STATUS = { done: 'Réalisée', planned: 'Prévue', cancelled: 'Annulée' };
const VIEWS = { home: 'Accueil', calendar: 'Calendrier', sessions: 'Séances', goals: 'Objectifs', stats: 'Stats', settings: 'Réglages' };

let S = load();
let view = 'home';
let filter = 'all';
let cal = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

/* ---------- Utilitaires ---------- */
function load() {
  const def = { profile: null, sessions: [], goals: [], theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' };
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && typeof d === 'object') return Object.assign(def, d);
  } catch (e) { /* données illisibles : on repart de zéro */ }
  return def;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { alert("Impossible d'enregistrer les données sur cet appareil."); }
}
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const fmtD = (d) => new Date(d + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtK = (k) => (Math.round(k * 10) / 10).toString().replace('.', ',') + ' km';
const fmtT = (m) => Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0');
const byDate = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
const opt = (list, sel) => list.map((o) => `<option${o === sel ? ' selected' : ''}>${esc(o)}</option>`).join('');

function tot() {
  const d = S.sessions.filter((s) => s.status === 'done');
  return { n: d.length, km: d.reduce((a, s) => a + s.distance, 0), min: d.reduce((a, s) => a + s.duration, 0) };
}

/* ---------- Modales ---------- */
function modal(html, locked) {
  const m = $('#modal');
  m.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false;
  m.dataset.locked = locked ? '1' : '';
}
function closeModal() { $('#modal').hidden = true; }

function profileForm(p) {
  return `<form id="f-profile">
    <label>Nom ou prénom<input name="name" required maxlength="40" value="${esc(p.name)}"></label>
    <label>Poids (kg)<input type="number" name="weight" required min="20" max="400" step="0.1" value="${esc(p.weight)}"></label>
    <label>Objectif<input name="goal" required maxlength="80" placeholder="Ex. Courir 10 km sans m'arrêter" value="${esc(p.goal)}"></label>
    <button class="btn">${S.profile ? 'Enregistrer le profil' : 'Commencer'}</button></form>`;
}
function welcome() {
  modal('<h2>Bienvenue sur Sport Journal</h2><p class="muted">Quelques informations pour personnaliser votre carnet. Elles restent sur cet appareil.</p>' + profileForm({}), true);
}
function sessionForm(id, date) {
  const s = S.sessions.find((x) => x.id === id) || { date: date || iso(new Date()), type: TYPES[0], title: '', duration: '', distance: '', status: 'planned', notes: '' };
  const st = Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === s.status ? ' selected' : ''}>${v}</option>`).join('');
  modal(`<h2>${id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
    <form id="f-session" data-id="${id || ''}">
    <label>Date<input type="date" name="date" required value="${s.date}"></label>
    <label>Type<select name="type">${opt(TYPES, s.type)}</select></label>
    <label>Titre<input name="title" maxlength="60" value="${esc(s.title)}"></label>
    <div class="row"><label>Durée (min)<input type="number" name="duration" min="0" value="${esc(s.duration)}"></label>
    <label>Distance (km)<input type="number" name="distance" min="0" step="0.01" value="${esc(s.distance)}"></label></div>
    <label>Statut<select name="status">${st}</select></label>
    <label>Notes<textarea name="notes" rows="2">${esc(s.notes)}</textarea></label>
    <div class="row"><button type="button" class="btn ghost" data-act="close">Annuler</button><button class="btn">Enregistrer</button></div></form>`);
}

/* ---------- Vues ---------- */
function list(a) {
  return '<ul class="list">' + a.map((s) => `<li><div><b>${esc(s.title || s.type)}</b>
    <small>${fmtD(s.date)} — ${esc(s.type)}${s.duration ? ' — ' + s.duration + ' min' : ''}${s.distance ? ' — ' + fmtK(s.distance) : ''}</small></div>
    <span class="tag ${s.status}">${STATUS[s.status]}</span>
    ${s.status === 'planned' ? `<button class="ic" data-act="done" data-id="${s.id}" title="Marquer réalisée" aria-label="Marquer réalisée">✔</button>` : ''}
    <button class="ic" data-act="edit" data-id="${s.id}" title="Modifier" aria-label="Modifier">✎</button>
    <button class="ic" data-act="del" data-id="${s.id}" title="Supprimer" aria-label="Supprimer">🗑</button></li>`).join('') + '</ul>';
}

function vHome() {
  const t = tot(), p = S.profile || {}, today = iso(new Date());
  const next = S.sessions.filter((s) => s.status === 'planned' && s.date >= today).sort((a, b) => -byDate(a, b)).slice(0, 3);
  return `<h1>Bonjour ${esc(p.name)}</h1>
    <p class="muted">Objectif : ${esc(p.goal)} — Poids : ${esc(p.weight)} kg</p>
    <div class="stats"><div class="card"><b>${t.n}</b>séances réalisées</div>
    <div class="card"><b>${fmtK(t.km)}</b>distance totale</div>
    <div class="card"><b>${fmtT(t.min)}</b>temps cumulé</div></div>
    <h2>Prochaines séances</h2>${next.length ? list(next) : '<p class="muted">Aucune séance prévue. Planifiez la prochaine.</p>'}
    <button class="btn" data-act="add">Ajouter une séance</button>`;
}

function vCal() {
  const y = cal.getFullYear(), m = cal.getMonth(), off = (cal.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate(), td = iso(new Date());
  let c = '';
  for (let i = 0; i < off; i++) c += '<div class="day off"></div>';
  for (let d = 1; d <= n; d++) {
    const k = iso(new Date(y, m, d)), ss = S.sessions.filter((s) => s.date === k);
    c += `<div class="day${k === td ? ' today' : ''}" data-act="add" data-date="${k}"><span>${d}</span>
      ${ss.slice(0, 2).map((s) => `<i class="chip ${s.status}" data-act="edit" data-id="${s.id}">${esc(s.title || s.type)}</i>`).join('')}
      ${ss.length > 2 ? `<em>+${ss.length - 2}</em>` : ''}</div>`;
  }
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => `<b>${d}</b>`).join('');
  return `<h1>Calendrier</h1><div class="calnav"><button class="btn ghost" data-act="prev" aria-label="Mois précédent">‹</button>
    <h2>${cal.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
    <button class="btn ghost" data-act="next" aria-label="Mois suivant">›</button></div>
    <div class="cal">${days}${c}</div><p class="muted">Touchez un jour pour y ajouter une séance.</p>`;
}

function vSessions() {
  const a = S.sessions.filter((s) => filter === 'all' || s.status === filter).sort(byDate);
  const f = ['all', ...Object.keys(STATUS)].map((k) => `<option value="${k}"${k === filter ? ' selected' : ''}>${k === 'all' ? 'Tous les statuts' : STATUS[k]}</option>`).join('');
  return `<h1>Séances</h1><div class="row" style="margin:12px 0"><select id="flt" aria-label="Filtrer">${f}</select>
    <button class="btn" data-act="add" style="flex:0 0 auto">Ajouter une séance</button></div>
    ${a.length ? list(a) : '<p class="muted">Aucune séance à afficher.</p>'}`;
}

function vGoals() {
  const t = tot();
  const M = { sessions: [t.n, 'séances'], distance: [t.km, 'km'], time: [t.min / 60, 'h'] };
  const items = S.goals.map((g) => {
    const v = M[g.metric][0], p = Math.min(100, Math.round((v / g.target) * 100));
    return `<div class="card goal"><div><b>${esc(g.title)}</b><small>${Math.round(v * 10) / 10} / ${g.target} ${M[g.metric][1]} (${p} %)</small></div>
      <button class="ic" data-act="delgoal" data-id="${g.id}" aria-label="Supprimer">🗑</button>
      <div class="bar"><span style="width:${p}%"></span></div></div>`;
  }).join('');
  return `<h1>Objectifs</h1><form id="f-goal" class="card inline" style="margin-top:12px">
    <input name="title" placeholder="Ex. 50 séances cette année" required maxlength="60">
    <select name="metric"><option value="sessions">Séances</option><option value="distance">Distance (km)</option><option value="time">Temps (h)</option></select>
    <input type="number" name="target" min="0.1" step="any" placeholder="Cible" required><button class="btn">Ajouter</button></form>
    ${items || '<p class="muted">Aucun objectif pour le moment. Fixez-en un ci-dessus.</p>'}`;
}

function vStats() {
  const d = S.sessions.filter((s) => s.status === 'done'), now = new Date();
  const ms = [0, 1, 2, 3, 4, 5].map((i) => {
    const dt = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1), ss = d.filter((s) => s.date.startsWith(iso(dt).slice(0, 7)));
    return { l: dt.toLocaleDateString('fr-FR', { month: 'short' }), n: ss.length, km: ss.reduce((a, s) => a + s.distance, 0) };
  });
  const mx = Math.max(1, ...ms.map((m) => m.km));
  const bars = ms.map((m) => `<span>${m.l}</span><div class="bar"><span style="width:${(m.km / mx) * 100}%"></span></div><span>${fmtK(m.km)}</span>`).join('');
  const rows = TYPES.map((t) => {
    const ss = d.filter((s) => s.type === t);
    return `<tr><td>${t}</td><td>${ss.length}</td><td>${fmtK(ss.reduce((a, s) => a + s.distance, 0))}</td><td>${fmtT(ss.reduce((a, s) => a + s.duration, 0))}</td></tr>`;
  }).join('');
  return `<h1>Statistiques</h1><h2>Distance par mois (6 derniers mois)</h2><div class="card bars">${bars}</div>
    <h2>Par type de séance</h2><div class="card" style="overflow-x:auto"><table><tr><th>Type</th><th>Séances</th><th>Distance</th><th>Temps</th></tr>${rows}</table></div>`;
}

function vSettings() {
  return `<h1>Paramètres</h1><h2>Profil</h2><div class="card">${profileForm(S.profile || {})}</div>
    <h2>Apparence</h2><div class="card"><label>Thème<select id="theme"><option value="light"${S.theme === 'light' ? ' selected' : ''}>Clair</option><option value="dark"${S.theme === 'dark' ? ' selected' : ''}>Sombre</option></select></label></div>
    <h2>Données</h2><div class="card"><p class="muted">Efface le profil, les séances et les objectifs de cet appareil. Action irréversible.</p>
    <button class="btn danger" data-act="reset">Réinitialiser l'application</button></div>`;
}

const V = { home: vHome, calendar: vCal, sessions: vSessions, goals: vGoals, stats: vStats, settings: vSettings };

function render() {
  document.documentElement.dataset.theme = S.theme;
  $('#nav').innerHTML = Object.entries(VIEWS).map(([k, v]) => `<button data-act="nav" data-id="${k}"${k === view ? ' aria-current="page"' : ''}>${v}</button>`).join('');
  $('#view').innerHTML = V[view]();
  if (!S.profile && $('#modal').hidden) welcome();
}

/* ---------- Événements ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const a = t.dataset.act, id = t.dataset.id;
  if (a === 'nav') { view = id; render(); window.scrollTo(0, 0); }
  else if (a === 'add') sessionForm(null, t.dataset.date);
  else if (a === 'edit') sessionForm(id);
  else if (a === 'close') closeModal();
  else if (a === 'prev' || a === 'next') { cal = new Date(cal.getFullYear(), cal.getMonth() + (a === 'next' ? 1 : -1), 1); render(); }
  else if (a === 'done') { const s = S.sessions.find((x) => x.id === id); if (s) { s.status = 'done'; save(); render(); } }
  else if (a === 'del') { if (confirm('Supprimer cette séance ?')) { S.sessions = S.sessions.filter((x) => x.id !== id); save(); render(); } }
  else if (a === 'delgoal') { S.goals = S.goals.filter((x) => x.id !== id); save(); render(); }
  else if (a === 'reset') {
    if (confirm('Tout effacer définitivement ?')) { try { localStorage.removeItem(KEY); } catch (err) { /* ignoré */ } location.reload(); }
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'theme') { S.theme = e.target.value; save(); render(); }
  if (e.target.id === 'flt') { filter = e.target.value; render(); }
});

document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f));
  if (f.id === 'f-session') {
    const o = { date: d.date, type: d.type, title: d.title.trim(), duration: Math.max(0, Math.round(+d.duration || 0)), distance: Math.max(0, +d.distance || 0), status: d.status, notes: d.notes.trim() };
    const i = S.sessions.findIndex((s) => s.id === f.dataset.id);
    if (i >= 0) Object.assign(S.sessions[i], o); else S.sessions.push(Object.assign({ id: uid() }, o));
  } else if (f.id === 'f-goal') {
    S.goals.push({ id: uid(), title: d.title.trim(), metric: d.metric, target: Math.max(0.1, +d.target || 1) });
  } else if (f.id === 'f-profile') {
    S.profile = { name: d.name.trim(), weight: +d.weight, goal: d.goal.trim() };
  }
  save(); closeModal(); render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#modal').hidden && !$('#modal').dataset.locked) closeModal();
});

render();
