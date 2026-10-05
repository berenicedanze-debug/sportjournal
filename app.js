'use strict';

/* ---------- 1. CONFIGURATION ---------- */
const APP = { storageKey: 'sportjournal:v2' };

const PAGES = [
  { id: 'accueil',     label: 'Accueil',     icon: 'home',    sub: 'Votre tableau de bord personnel.',
    empty: ['Votre tableau de bord est vide', 'Choisissez les cartes à afficher dans les paramètres.'] },
  { id: 'calendrier',  label: 'Calendrier',   icon: 'calendar', sub: 'Planifiez et revoyez vos entraînements.',
    empty: ['Rien de prévu', 'Ajoutez une séance, une compétition ou un jour de repos.'] },
  { id: 'seances',     label: 'Séances',      icon: 'run',     sub: 'Toutes vos séances, sport par sport.',
    empty: ['Aucune séance enregistrée', 'Votre première séance apparaîtra ici.'] },
  { id: 'objectifs',   label: 'Objectifs',    icon: 'target',   sub: 'Fixez un cap et suivez votre progression.',
    empty: ['Aucun objectif', 'Un marathon, 500 km, 6 kg en moins : à vous de choisir.'] },
  { id: 'statistiques',label: 'Statistiques', icon: 'chart',    sub: 'Vos chiffres, calculés automatiquement.',
    empty: ['Pas encore de données', 'Les statistiques se construisent dès la première séance.'] },
  { id: 'records',     label: 'Records',      icon: 'trophy',   sub: 'Vos meilleures performances et badges.',
    empty: ['Aucun record pour l\'instant', 'Ils sont détectés automatiquement à chaque séance.'] },
  { id: 'parametres',  label: 'Paramètres',   icon: 'gear',     sub: 'Profil, thème, sports et tableau de bord.',
    empty: ['Paramètres', 'Le profil, les sports et les sauvegardes.'] },
];

/* ---------- 2. ICÔNES ---------- */
const ICONS = {
  home:     '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  run:      '<circle cx="14" cy="4.5" r="2"/><path d="M8 21l3-6 3 2v4M11 15l-1-5 4-2 3 4h3M6 12l4-4"/>',
  target:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart:    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  trophy:   '<path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 14v4M8 21h8"/>',
  gear:     '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon:     '<path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z"/>',
  auto:     '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>',
  left:     '<path d="M15 6l-6 6 6 6"/>', 
  right:    '<path d="M9 6l6 6-6 6"/>', 
  plus:     '<path d="M12 5v14M5 12h14"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  trash:    '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- 3. STORE ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: null,
    settings: { theme: 'auto' },
    sports: [],
    sessions: [],
    goals: [],
    weights: [],
    dashboard: ['summary', 'weight', 'goals', 'last_sessions'],
  });

  const listeners = new Set();
  let timer = null;

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (err) { console.warn('Lecture impossible', err); return defaults(); }
  };
  let state = load();

  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); }
      catch (err) { UI.toast('Stockage plein : exportez vos données.'); }
    }, 150);
  };

  return {
    get: () => state,
    update(fn) { fn(state); persist(); listeners.forEach((l) => l(state)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  };
})();

/* ---------- 4. INTERFACE ---------- */
const UI = {
  THEMES: ['auto', 'light', 'dark'],
  THEME_LABELS: { auto: 'Thème : auto', light: 'Thème : clair', dark: 'Thème : sombre' },
  THEME_ICONS: { auto: 'auto', light: 'sun', dark: 'moon' },

  applyTheme() {
    const t = Store.get().settings.theme;
    document.documentElement.dataset.theme = t;
    const btn = document.getElementById('theme-btn');
    if (btn) btn.innerHTML = `${icon(this.THEME_ICONS[t])}${this.THEME_LABELS[t]}`;
  },
  cycleTheme() {
    Store.update((s) => {
      const i = this.THEMES.indexOf(s.settings.theme);
      s.settings.theme = this.THEMES[(i + 1) % this.THEMES.length];
    });
    this.applyTheme();
  },
  setTheme(t) {
    Store.update((st) => { st.settings.theme = t; });
    this.applyTheme();
  },
  toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove('show'), 2600);
  },
};

/* ---------- 5. UTILITAIRES DE TEMPS ET FORMATAGE ---------- */
const esc = (s) => String(s || '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                     .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const avatarHTML = (p) => p && p.photo ? `<img src="${p.photo}" alt="">` : esc((p && p.name || '?')[0].toUpperCase());

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const formatDuration = (totalMinutes) => {
  const mins = parseInt(totalMinutes, 10) || 0;
  if (mins === 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

const refreshView = () => {
  const id = PAGES.some((p) => p.id === Router.current()) ? Router.current() : PAGES[0].id;
  if (Views[id]) Views[id](document.getElementById('view'));
};  plus:     '<path d="M12 5v14M5 12h14"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  trash:    '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- 3. STORE ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: null,
    settings: { theme: 'auto' },
    sports: [],
    sessions: [],
    goals: [],
    weights: [],
    dashboard: ['summary', 'weight', 'goals', 'last_sessions'],
  });

  const listeners = new Set();
  let timer = null;

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (err) { console.warn('Lecture impossible', err); return defaults(); }
  };
  let state = load();

  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); }
      catch (err) { UI.toast('Stockage plein : exportez vos données.'); }
    }, 150);
  };

  return {
    get: () => state,
    update(fn) { fn(state); persist(); listeners.forEach((l) => l(state)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  };
})();

/* ---------- 4. INTERFACE ---------- */
const UI = {
  THEMES: ['auto', 'light', 'dark'],
  THEME_LABELS: { auto: 'Thème : auto', light: 'Thème : clair', dark: 'Thème : sombre' },
  THEME_ICONS: { auto: 'auto', light: 'sun', dark: 'moon' },

  applyTheme() {
    const t = Store.get().settings.theme;
    document.documentElement.dataset.theme = t;
    const btn = document.getElementById('theme-btn');
    if (btn) btn.innerHTML = `${icon(this.THEME_ICONS[t])}${this.THEME_LABELS[t]}`;
  },
  cycleTheme() {
    Store.update((s) => {
      const i = this.THEMES.indexOf(s.settings.theme);
      s.settings.theme = this.THEMES[(i + 1) % this.THEMES.length];
    });
    this.applyTheme();
  },
  setTheme(t) {
    Store.update((st) => { st.settings.theme = t; });
    this.applyTheme();
  },
  toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove('show'), 2600);
  },
};

/* ---------- 5. UTILITAIRES DE TEMPS ET FORMATAGE ---------- */
const esc = (s) => String(s || '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                     .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const avatarHTML = (p) => p && p.photo ? `<img src="${p.photo}" alt="">` : esc((p && p.name || '?')[0].toUpperCase());

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const formatDuration = (totalMinutes) => {
  const mins = parseInt(totalMinutes, 10) || 0;
  if (mins === 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

const refreshView = () => {
  const id = PAGES.some((p) => p.id === Router.current()) ? Router.current() : PAGES[0].id;
  if (Views[id]) Views[id](document.getElementById('view'));
};

/* ---------- 5b. ASSISTANT DE CONFIGURATION ---------- */
const DEFAULT_SPORTS = ['Course', 'Natation', 'Cyclisme', 'Musculation', 'Pilates',
                        'Yoga', 'Tennis', 'Marche', 'CrossFit', 'Triathlon'];
const MAIN_GOALS = ['Perdre du poids', 'Prendre de la masse', 'Améliorer mon endurance',
                    'Préparer une compétition', 'Rester en forme', 'Reprendre le sport'];

const Wizard = {
  titles: ['Qui êtes-vous ?', 'Vos mensurations', 'Quels sports pratiquez-vous ?'],
  open(edit = false, step = 0) {
    const s = Store.get();
    this.data = { name: '', photo: '', birth: '', sex: '', height: '', weight: '', target: '', goal: '', ...(s.profile || {}) };
    this.sports = s.sports.map((x) => ({ ...x }));
    this.edit = edit; this.step = step;
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const last = this.step === this.titles.length - 1;
    const back = this.step > 0 ? '<button type="button" class="btn btn-ghost" data-act="back">Retour</button>'
               : this.edit ? '<button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>' : '<span></span>';
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <div class="progress" aria-hidden="true">${this.titles.map((_, i) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</div>
        <h2>${this.step === 0 && !this.edit ? 'Bienvenue ! ' : ''}${this.titles[this.step]}</h2>
        ${[this.stepIdentity, this.stepBody, this.stepSports][this.step].call(this)}
        <div class="actions">${back}<button class="btn" type="submit">${last ? (this.edit ? 'Enregistrer' : 'Commencer') : 'Suivant'}</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.next(); });
    form.addEventListener('click', (e) => this.onClick(e));
    form.addEventListener('change', (e) => this.onChange(e));
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.name === 'newsport') { e.preventDefault(); this.addSport(); }
    });
  },

  stepIdentity() {
    const d = this.data, today = new Date().toISOString().slice(0, 10);
    return `
      <div class="photo-row">
        <div class="avatar" id="wz-avatar">${avatarHTML(d)}</div>
        <label class="btn btn-ghost">Choisir une photo<input type="file" name="photofile" accept="image/*" hidden></label>
      </div>
      <label class="field">Prénom ou nom
        <input name="name" value="${esc(d.name)}" maxlength="40" autocomplete="given-name" required></label>
      <label class="field">Date de naissance
        <input type="date" name="birth" value="${d.birth}" max="${today}"></label>
      <fieldset class="field"><legend>Sexe</legend><div class="chips">
        ${['Femme', 'Homme', 'Autre'].map((v) => `<label class="chip"><input type="radio" name="sex" value="${v}" ${d.sex === v ? 'checked' : ''}>${v}</label>`).join('')}
      </div></fieldset>`;
  },

  stepBody() {
    const d = this.data;
    const num = (name, label, v, step) => `<label class="field">${label}
      <input type="number" inputmode="decimal" name="${name}" value="${esc(v)}" min="0" step="${step}"></label>`;
    return `
      <div class="grid3">${num('height', 'Taille (cm)', d.height, 1)}${num('weight', 'Poids (kg)', d.weight, 0.1)}${num('target', 'Poids cible (kg)', d.target, 0.1)}</div>
      <fieldset class="field"><legend>Objectif principal</legend><div class="chips">
        ${MAIN_GOALS.map((g) => `<label class="chip"><input type="radio" name="goal" value="${g}" ${d.goal === g ? 'checked' : ''}>${g}</label>`).join('')}
      </div></fieldset>`;
  },

  stepSports() {
    const names = [...DEFAULT_SPORTS, ...this.sports.filter((s) => s.custom).map((s) => s.name)];
    const chips = [...new Set(names)].map((n) =>
      `<button type="button" class="chip" data-sport="${esc(n)}" aria-pressed="${this.sports.some((s) => s.name === n)}">${esc(n)}</button>`).join('');
    return `
      <div class="chips">${chips}</div>
      <div class="add-row"><input name="newsport" placeholder="Créer mon propre sport" maxlength="30">
        <button type="button" class="btn btn-ghost" data-act="addsport">Ajouter</button></div>`;
  },

  collect() {
    const f = new FormData(this.el.querySelector('form'));
    for (const k of ['name', 'birth', 'sex', 'height', 'weight', 'target', 'goal'])
      if (f.has(k)) this.data[k] = String(f.get(k)).trim();
  },

  next() {
    this.collect();
    if (this.step === 0 && !this.data.name) {
      UI.toast('Indiquez votre prénom pour continuer.');
      return this.el.querySelector('[name=name]').focus();
    }
    if (this.step < this.titles.length - 1) { this.step++; this.render(); } else this.finish();
  },

  onClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'back') { this.collect(); this.step--; this.render(); }
    else if (btn.dataset.act === 'cancel') this.close();
    else if (btn.dataset.act === 'addsport') this.addSport();
    else if (btn.dataset.sport) {
      const name = btn.dataset.sport, i = this.sports.findIndex((s) => s.name === name);
      if (i >= 0) this.sports.splice(i, 1);
      else this.sports.push({ id: slug(name), name, custom: !DEFAULT_SPORTS.includes(name) });
      btn.setAttribute('aria-pressed', String(i < 0));
    }
  },

  addSport() {
    const input = this.el.querySelector('[name=newsport]'), name = input.value.trim();
    if (!name) return;
    if (!this.sports.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      this.sports.push({ id: slug(name) || Store.uid(), name, custom: !DEFAULT_SPORTS.includes(name) });
    this.render();
  },

  onChange(e) {
    if (e.target.name !== 'photofile' || !e.target.files[0]) return;
    const img = new Image(), url = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      const side = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      this.data.photo = c.toDataURL('image/jpeg', 0.8);
      const av = document.getElementById('wz-avatar');
      if (av) av.innerHTML = avatarHTML(this.data);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  },

  finish() {
    Store.update((s) => {
      s.profile = { ...this.data, createdAt: (s.profile && s.profile.createdAt) || new Date().toISOString() };
      s.sports = this.sports;
      const kg = parseFloat(this.data.weight), last = s.weights[s.weights.length - 1];
      if (kg > 0 && (!last || last.kg !== kg)) s.weights.push({ date: new Date().toISOString().slice(0, 10), kg });
    });
    this.close();
    Router.render();
    UI.toast(this.edit ? 'Profil mis à jour.' : `Bienvenue, ${this.data.name} !`);
  },
};

/* ---------- 5c. GESTION DES OBJECTIFS ---------- */
const GoalForm = {
  open(goal) {
    this.id = goal ? goal.id : null;
    this.data = { title: '', type: 'distance', target: 100, current: 0, deadline: '', unit: 'km', ...(goal || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const types = [
      { id: 'distance', label: 'Distance totale (km)', unit: 'km' },
      { id: 'sessions', label: 'Nombre de séances', unit: 'séances' },
      { id: 'duration', label: 'Temps d\'entraînement (heures)', unit: 'heures' },
      { id: 'weight', label: 'Poids cible (kg)', unit: 'kg' }
    ];
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h2>
        <label class="field">Intitulé de l'objectif
          <input name="title" value="${esc(d.title)}" placeholder="ex: Courir 500km cette année" required></label>
        <label class="field">Type d'objectif
          <select name="type">
            ${types.map(t => `<option value="${t.id}" ${d.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </label>
        <div class="grid2">
          <label class="field">Valeur cible<input type="number" step="any" name="target" value="${d.target}" required></label>
          <label class="field">Échéance<input type="date" name="deadline" value="${d.deadline}"></label>
        </div>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
  },

  save(form) {
    const f = new FormData(form);
    const title = f.get('title').trim();
    const type = f.get('type');
    const target = parseFloat(f.get('target')) || 0;
    const deadline = f.get('deadline');
    if (!title) return UI.toast('Veuillez saisir un intitulé.');

    Store.update((s) => {
      const i = this.id ? s.goals.findIndex(g => g.id === this.id) : -1;
      const newGoal = { id: this.id || Store.uid(), title, type, target, deadline };
      if (i >= 0) s.goals[i] = { ...s.goals[i], ...newGoal };
      else s.goals.push(newGoal);
    });
    this.close();
    refreshView();
    UI.toast('Objectif enregistré.');
  }
};

const calculateGoalProgress = (goal, s) => {
  const sessions = s.sessions.filter(se => se.status === 'done');
  if (goal.type === 'distance') {
    return sessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  } else if (goal.type === 'sessions') {
    return sessions.length;
  } else if (goal.type === 'duration') {
    const totalMins = sessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
    return parseFloat((totalMins / 60).toFixed(1));
  } else if (goal.type === 'weight') {
    const lastW = s.weights[s.weights.length - 1];
    return lastW ? lastW.kg : (s.profile ? parseFloat(s.profile.weight) || 0 : 0);
  }
  return 0;
};

Views.objectifs = (el) => {
  const page = PAGES[3], s = Store.get();
  const goals = s.goals;
  
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvel objectif</button></div>
    ${goals.length ? `<div class="list">${goals.map(g => {
      const current = calculateGoalProgress(g, s);
      const pct = Math.min(100, Math.round((current / (g.target || 1)) * 100));
      const unit = g.type === 'distance' ? 'km' : g.type === 'duration' ? 'h' : g.type === 'weight' ? 'kg' : 'séances';
      return `
        <article class="item" style="--c:var(--accent)">
          <div class="item-main">
            <h3>${esc(g.title)}</h3>
            <p class="muted">Échéance : ${g.deadline ? fmtDate(g.deadline) : 'Aucune'} — Progression : <b>${current} / ${g.target} ${unit}</b> (${pct}%)</p>
            <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${pct}%"></div></div>
          </div>
          <div class="item-actions">
            <button type="button" class="btn btn-ghost" data-act="edit" data-id="${g.id}">Modifier</button>
            <button type="button" class="btn btn-ghost" data-act="del" data-id="${g.id}">Supprimer</button>
          </div>
        </article>`;
    }).join('')}</div>`
    : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;

  el.querySelector('[data-new]').onclick = () => GoalForm.open(null);
  el.querySelectorAll('[data-act=edit]').forEach(b => b.onclick = () => {
    const g = s.goals.find(x => x.id === b.dataset.id);
    if (g) GoalForm.open(g);
  });
  el.querySelectorAll('[data-act=del]').forEach(b => b.onclick = () => {
    if (confirm('Supprimer cet objectif ?')) {
      Store.update(st => { st.goals = st.goals.filter(x => x.id !== b.dataset.id); });
      refreshView();
      UI.toast('Objectif supprimé.');
    }
  });
};

/* ---------- 5d. SÉANCES ---------- */
const STATUS = {
  done:      { label: 'Réalisée', css: 'var(--done)' },
  planned:   { label: 'Prévue',   css: 'var(--planned)' },
  cancelled: { label: 'Annulée',  css: 'var(--cancelled)' },
  rest:      { label: 'Repos',    css: 'var(--rest)' },
};
const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];

const SessionForm = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    const totalMins = session ? (session.duration || 0) : 0;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    this.data = { date: day, sport: '', status: day <= todayStr() ? 'done' : 'planned',
                  effort: 'Endurance', hours, mins, distance: '', intensity: 5, notes: '', ...(session ? { ...session, hours, mins } : {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data, chosen = Store.get().sports.map((s) => s.name);
    const names = chosen.length ? chosen : DEFAULT_SPORTS;
    if (d.sport && !names.includes(d.sport)) names.push(d.sport);
    const opts = (list, cur) => list.map((n) => `<option ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('');
    
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <fieldset class="field"><legend>Statut</legend><div class="chips">
          ${Object.entries(STATUS).map(([k, v]) => `<label class="chip"><input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}>${v.label}</label>`).join('')}
        </div></fieldset>
        <div class="grid2">
          <label class="field">Sport<select name="sport">${opts(names, d.sport)}</select></label>
          <label class="field">Date<input type="date" name="date" value="${d.date}" required></label>
        </div>
        <div class="grid2">
          <label class="field">Type d'effort<select name="effort">${opts(EFFORTS, d.effort)}</select></label>
          <div class="field">Durée
            <div class="grid2" style="gap:4px;">
              <input type="number" inputmode="numeric" name="hours" min="0" placeholder="Heures" value="${d.hours || 0}">
              <input type="number" inputmode="numeric" name="mins" min="0" max="59" placeholder="Minutes" value="${d.mins || 0}">
            </div>
          </div>
        </div>
        <div class="grid2">
          <label class="field">Distance (km, facultatif)<input type="number" inputmode="decimal" name="distance" min="0" step="0.01" value="${esc(d.distance)}"></label>
          <label class="field">Intensité : <output>${d.intensity}</output> / 10
            <input class="range" type="range" name="intensity" min="1" max="10" value="${d.intensity}"></label>
        </div>
        <label class="field">Notes<textarea name="notes" rows="3" maxlength="500">${esc(d.notes)}</textarea></label>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
    form.addEventListener('input', (e) => { if (e.target.name === 'intensity') form.querySelector('output').textContent = e.target.value; });
  },

  save(form) {
    const f = new FormData(form);
    const h = parseInt(f.get('hours'), 10) || 0;
    const m = parseInt(f.get('mins'), 10) || 0;
    const totalDurationMinutes = (h * 60) + m;

    const data = {
      date: f.get('date'), sport: f.get('sport') || '', status: f.get('status'), effort: f.get('effort'),
      duration: totalDurationMinutes,
      distance: Math.max(0, parseFloat(f.get('distance')) || 0),
      intensity: parseInt(f.get('intensity'), 10), notes: String(f.get('notes')).trim(),
    };
    if (!data.date) return UI.toast('Choisissez une date.');
    Store.update((s) => {
      const i = this.id ? s.sessions.findIndex((x) => x.id === this.id) : -1;
      if (i >= 0) s.sessions[i] = { ...s.sessions[i], ...data };
      else s.sessions.push({ id: Store.uid(), createdAt: Date.now(), ...data });
    });
    const [y, mth] = data.date.split('-').map(Number);
    Object.assign(Cal, { y, m: mth - 1, sel: data.date });
    this.close();
    refreshView();
    UI.toast(this.id ? 'Séance modifiée.' : 'Séance enregistrée.');
  },
};

const sessionItem = (s, withDate) => {
  const st = STATUS[s.status] || STATUS.planned;
  const tags = [
    s.status !== 'rest' && s.effort, 
    s.duration > 0 && formatDuration(s.duration), 
    s.distance > 0 && `${s.distance} km`,
    s.status !== 'rest' && `intensité ${s.intensity}/10`
  ].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('');
  const btn = (act, label) => `<button type="button" class="btn btn-ghost" data-act="${act}" data-id="${s.id}">${label}</button>`;
  return `<article class="item" style="--c:${st.css}">
    <div class="item-main">
      <h3>${s.status === 'rest' ? 'Jour de repos' : esc(s.sport)}</h3>
      <p class="muted">${withDate ? fmtDate(s.date) + ' — ' : ''}${st.label}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ''}${s.notes ? `<p class="note">${esc(s.notes)}</p>` : ''}
    </div>
    <div class="item-actions">${btn('edit', 'Modifier')}${btn('dup', 'Dupliquer')}${btn('del', 'Supprimer')}</div>
  </article>`;
};

const bindSessionActions = (el) => el.querySelectorAll('[data-act][data-id]').forEach((b) => b.onclick = () => {
  const s = Store.get().sessions.find((x) => x.id === b.dataset.id);
  if (!s) return;
  if (b.dataset.act === 'edit') SessionForm.open(s);
  else if (b.dataset.act === 'dup') SessionForm.open({ ...s, id: undefined, status: 'planned' }, s.date);
  else if (confirm('Supprimer cette séance ?')) {
    Store.update((st) => { st.sessions = st.sessions.filter((x) => x.id !== s.id); });
    refreshView(); UI.toast('Séance supprimée.');
  }
});

Views.seances = (el) => {
  const page = PAGES[2], list = [...Store.get().sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvelle séance</button></div>
    ${list.length ? `<div class="list">${list.map((s) => sessionItem(s, true)).join('')}</div>`
      : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, todayStr());
  bindSessionActions(el);
};

/* ---------- 5e. CALENDRIER MENSUEL ---------- */
const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

Views.calendrier = (el) => {
  const sessions = Store.get().sessions, first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();
  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`, list = sessions.filter((s) => s.date === key);
    const dots = list.slice(0, 4).map((s) => `<i style="background:${(STATUS[s.status] || STATUS.planned).css}"></i>`).join('');
    cells += `<button type="button" class="day${key === todayStr() ? ' today' : ''}" data-date="${key}" aria-pressed="${key === Cal.sel}"
      aria-label="${fmtDate(key)}, ${list.length} séance(s)"><b>${d}</b><span class="dots">${dots}</span></button>`;
  }
  const dayList = sessions.filter((s) => s.date === Cal.sel);
  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>${PAGES[1].sub}</p></header>
    <div class="toolbar">
      <button class="btn btn-ghost btn-icon" data-nav="-1" aria-label="Mois précédent">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost btn-icon" data-nav="1" aria-label="Mois suivant">${icon('right')}</button>
      <button class="btn btn-ghost" data-today>Aujourd'hui</button>
    </div>
    <div class="legend">${Object.values(STATUS).map((v) => `<span><i style="background:${v.css}"></i>${v.label}</span>`).join('')}</div>
    <div class="cal">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w) => `<span class="wd">${w}</span>`).join('')}${cells}</div>
    <div class="toolbar"><h2 class="day-title">${fmtDate(Cal.sel)}</h2><button class="btn" data-new>${icon('plus')}Ajouter</button></div>
    <div class="list">${dayList.length ? dayList.map((s) => sessionItem(s, false)).join('')
      : '<p class="muted">Rien de prévu ce jour-là.</p>'}</div>`;

  el.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => {
    const d = new Date(Cal.y, Cal.m + Number(b.dataset.nav), 1);
    Cal.y = d.getFullYear(); Cal.m = d.getMonth(); Views.calendrier(el);
  });
  el.querySelector('[data-today]').onclick = () => {
    const n = new Date(); Object.assign(Cal, { y: n.getFullYear(), m: n.getMonth(), sel: todayStr() }); Views.calendrier(el);
  };
  el.querySelectorAll('.day').forEach((b) => b.onclick = () => { Cal.sel = b.dataset.date; Views.calendrier(el); });
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, Cal.sel);
  bindSessionActions(el);
};

/* ---------- 5f. STATISTIQUES (reliées à toutes les sections & Chart.js) ---------- */
Views.statistiques = (el) => {
  const page = PAGES[4], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length && !s.weights.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }

  const totalDist = doneSessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  const totalMins = doneSessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
  const totalCount = doneSessions.length;

  const sportsMap = {};
  doneSessions.forEach(se => {
    const sp = se.sport || 'Autre';
    sportsMap[sp] = (sportsMap[sp] || 0) + (parseInt(se.duration) || 1);
  });

  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="grid3" style="margin-bottom:24px;">
      <div class="card" style="padding:16px;"><h2>${totalCount}</h2><p class="muted">Séances réalisées</p></div>
      <div class="card" style="padding:16px;"><h2>${formatDuration(totalMins)}</h2><p class="muted">Temps total</p></div>
      <div class="card" style="padding:16px;"><h2>${totalDist.toFixed(1)} km</h2><p class="muted">Distance totale</p></div>
    </div>
    
    <div class="card stack" style="margin-bottom:24px;">
      <h2>Répartition du temps par sport</h2>
      <div style="position: relative; height: 260px; width: 100%;">
        <canvas id="statsChart"></canvas>
      </div>
    </div>

    ${s.weights.length ? `
    <div class="card stack">
      <h2>Évolution du poids</h2>
      <div style="position: relative; height: 240px; width: 100%;">
        <canvas id="weightChart"></canvas>
      </div>
    </div>` : ''}
  `;

  setTimeout(() => {
    if (typeof Chart === 'undefined') return;

    const sportsKeys = Object.keys(sportsMap);
    if (sportsKeys.length > 0) {
      const ctx = document.getElementById('statsChart');
      if (ctx) {
        new Chart(ctx.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: sportsKeys,
            datasets: [{
              data: Object.values(sportsMap),
              backgroundColor: ['#2F57F0', '#1FA971', '#F59E0B', '#E5484D', '#98A2B3', '#6B8CFF']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    if (s.weights.length > 0) {
      const sortedWeights = [...s.weights].sort((a, b) => a.date.localeCompare(b.date));
      const ctxWeight = document.getElementById('weightChart');
      if (ctxWeight) {
        new Chart(ctxWeight.getContext('2d'), {
          type: 'line',
          data: {
            labels: sortedWeights.map(w => w.date),
            datasets: [{
              label: 'Poids (kg)',
              data: sortedWeights.map(w => w.kg),
              borderColor: '#2F57F0',
              backgroundColor: 'rgba(47, 87, 240, 0.1)',
              fill: true,
              tension: 0.2
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  }, 50);
};

/* ---------- 5g. RECORDS ET STATISTIQUES AMUSANTES ---------- */
Views.records = (el) => {
  const page = PAGES[5], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <section class="card"><h2>Vos records</h2><p class="muted">Fonctionnalité en cours de développement.</p></section>`;
};

/* ---------- 5h. PARAMÈTRES ---------- */
Views.parametres = (el) => {
  const page = PAGES[6], s = Store.get();
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <section class="card stack">
      <h2>Profil utilisateur</h2>
      <p class="muted">${s.profile ? `Connecté en tant que <b>${esc(s.profile.name)}</b>` : 'Aucun profil configuré.'}</p>
      <button class="btn" id="edit-profile">Modifier le profil</button>
    </section>
  `;
  const btn = el.querySelector('#edit-profile');
  if (btn) btn.onclick = () => Wizard.open(true, 0);
};

/* ---------- 6. ROUTEUR ---------- */
const Router = {
  current() {
    const hash = window.location.hash.slice(1);
    return PAGES.some(p => p.id === hash) ? hash : PAGES[0].id;
  },
  render() {
    const id = this.current();
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
    refreshView();
  },
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  }
};

/* ---------- 7. INITIALISATION GLOBALE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  UI.applyTheme();
  
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.onclick = () => UI.cycleTheme();

  // Si aucun profil n'existe, on lance l'assistant au démarrage
  if (!Store.get().profile) {
    Wizard.open(false, 0);
  }

  Router.init();
});  plus:     '<path d="M12 5v14M5 12h14"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  trash:    '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- 3. STORE ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: null,
    settings: { theme: 'auto' },
    sports: [],
    sessions: [],
    goals: [],
    weights: [],
    dashboard: ['summary', 'weight', 'goals', 'last_sessions'],
  });

  const listeners = new Set();
  let timer = null;

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (err) { console.warn('Lecture impossible', err); return defaults(); }
  };
  let state = load();

  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); }
      catch (err) { UI.toast('Stockage plein : exportez vos données.'); }
    }, 150);
  };

  return {
    get: () => state,
    update(fn) { fn(state); persist(); listeners.forEach((l) => l(state)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  };
})();

/* ---------- 4. INTERFACE ---------- */
const UI = {
  THEMES: ['auto', 'light', 'dark'],
  THEME_LABELS: { auto: 'Thème : auto', light: 'Thème : clair', dark: 'Thème : sombre' },
  THEME_ICONS: { auto: 'auto', light: 'sun', dark: 'moon' },

  applyTheme() {
    const t = Store.get().settings.theme;
    document.documentElement.dataset.theme = t;
    const btn = document.getElementById('theme-btn');
    if (btn) btn.innerHTML = `${icon(this.THEME_ICONS[t])}${this.THEME_LABELS[t]}`;
  },
  cycleTheme() {
    Store.update((s) => {
      const i = this.THEMES.indexOf(s.settings.theme);
      s.settings.theme = this.THEMES[(i + 1) % this.THEMES.length];
    });
    this.applyTheme();
  },
  setTheme(t) {
    Store.update((st) => { st.settings.theme = t; });
    this.applyTheme();
  },
  toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove('show'), 2600);
  },
};

/* ---------- 5. UTILITAIRES DE TEMPS ET FORMATAGE ---------- */
const esc = (s) => String(s || '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                     .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const avatarHTML = (p) => p && p.photo ? `<img src="${p.photo}" alt="">` : esc((p && p.name || '?')[0].toUpperCase());

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const formatDuration = (totalMinutes) => {
  const mins = parseInt(totalMinutes, 10) || 0;
  if (mins === 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

const refreshView = () => {
  const id = PAGES.some((p) => p.id === Router.current()) ? Router.current() : PAGES[0].id;
  if (Views[id]) Views[id](document.getElementById('view'));
};

/* ---------- 5b. ASSISTANT DE CONFIGURATION ---------- */
const DEFAULT_SPORTS = ['Course', 'Natation', 'Cyclisme', 'Musculation', 'Pilates',
                        'Yoga', 'Tennis', 'Marche', 'CrossFit', 'Triathlon'];
const MAIN_GOALS = ['Perdre du poids', 'Prendre de la masse', 'Améliorer mon endurance',
                    'Préparer une compétition', 'Rester en forme', 'Reprendre le sport'];

const Wizard = {
  titles: ['Qui êtes-vous ?', 'Vos mensurations', 'Quels sports pratiquez-vous ?'],
  open(edit = false, step = 0) {
    const s = Store.get();
    this.data = { name: '', photo: '', birth: '', sex: '', height: '', weight: '', target: '', goal: '', ...(s.profile || {}) };
    this.sports = s.sports.map((x) => ({ ...x }));
    this.edit = edit; this.step = step;
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const last = this.step === this.titles.length - 1;
    const back = this.step > 0 ? '<button type="button" class="btn btn-ghost" data-act="back">Retour</button>'
               : this.edit ? '<button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>' : '<span></span>';
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <div class="progress" aria-hidden="true">${this.titles.map((_, i) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</div>
        <h2>${this.step === 0 && !this.edit ? 'Bienvenue ! ' : ''}${this.titles[this.step]}</h2>
        ${[this.stepIdentity, this.stepBody, this.stepSports][this.step].call(this)}
        <div class="actions">${back}<button class="btn" type="submit">${last ? (this.edit ? 'Enregistrer' : 'Commencer') : 'Suivant'}</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.next(); });
    form.addEventListener('click', (e) => this.onClick(e));
    form.addEventListener('change', (e) => this.onChange(e));
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.name === 'newsport') { e.preventDefault(); this.addSport(); }
    });
  },

  stepIdentity() {
    const d = this.data, today = new Date().toISOString().slice(0, 10);
    return `
      <div class="photo-row">
        <div class="avatar" id="wz-avatar">${avatarHTML(d)}</div>
        <label class="btn btn-ghost">Choisir une photo<input type="file" name="photofile" accept="image/*" hidden></label>
      </div>
      <label class="field">Prénom ou nom
        <input name="name" value="${esc(d.name)}" maxlength="40" autocomplete="given-name" required></label>
      <label class="field">Date de naissance
        <input type="date" name="birth" value="${d.birth}" max="${today}"></label>
      <fieldset class="field"><legend>Sexe</legend><div class="chips">
        ${['Femme', 'Homme', 'Autre'].map((v) => `<label class="chip"><input type="radio" name="sex" value="${v}" ${d.sex === v ? 'checked' : ''}>${v}</label>`).join('')}
      </div></fieldset>`;
  },

  stepBody() {
    const d = this.data;
    const num = (name, label, v, step) => `<label class="field">${label}
      <input type="number" inputmode="decimal" name="${name}" value="${esc(v)}" min="0" step="${step}"></label>`;
    return `
      <div class="grid3">${num('height', 'Taille (cm)', d.height, 1)}${num('weight', 'Poids (kg)', d.weight, 0.1)}${num('target', 'Poids cible (kg)', d.target, 0.1)}</div>
      <fieldset class="field"><legend>Objectif principal</legend><div class="chips">
        ${MAIN_GOALS.map((g) => `<label class="chip"><input type="radio" name="goal" value="${g}" ${d.goal === g ? 'checked' : ''}>${g}</label>`).join('')}
      </div></fieldset>`;
  },

  stepSports() {
    const names = [...DEFAULT_SPORTS, ...this.sports.filter((s) => s.custom).map((s) => s.name)];
    const chips = [...new Set(names)].map((n) =>
      `<button type="button" class="chip" data-sport="${esc(n)}" aria-pressed="${this.sports.some((s) => s.name === n)}">${esc(n)}</button>`).join('');
    return `
      <div class="chips">${chips}</div>
      <div class="add-row"><input name="newsport" placeholder="Créer mon propre sport" maxlength="30">
        <button type="button" class="btn btn-ghost" data-act="addsport">Ajouter</button></div>`;
  },

  collect() {
    const f = new FormData(this.el.querySelector('form'));
    for (const k of ['name', 'birth', 'sex', 'height', 'weight', 'target', 'goal'])
      if (f.has(k)) this.data[k] = String(f.get(k)).trim();
  },

  next() {
    this.collect();
    if (this.step === 0 && !this.data.name) {
      UI.toast('Indiquez votre prénom pour continuer.');
      return this.el.querySelector('[name=name]').focus();
    }
    if (this.step < this.titles.length - 1) { this.step++; this.render(); } else this.finish();
  },

  onClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'back') { this.collect(); this.step--; this.render(); }
    else if (btn.dataset.act === 'cancel') this.close();
    else if (btn.dataset.act === 'addsport') this.addSport();
    else if (btn.dataset.sport) {
      const name = btn.dataset.sport, i = this.sports.findIndex((s) => s.name === name);
      if (i >= 0) this.sports.splice(i, 1);
      else this.sports.push({ id: slug(name), name, custom: !DEFAULT_SPORTS.includes(name) });
      btn.setAttribute('aria-pressed', String(i < 0));
    }
  },

  addSport() {
    const input = this.el.querySelector('[name=newsport]'), name = input.value.trim();
    if (!name) return;
    if (!this.sports.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      this.sports.push({ id: slug(name) || Store.uid(), name, custom: !DEFAULT_SPORTS.includes(name) });
    this.render();
  },

  onChange(e) {
    if (e.target.name !== 'photofile' || !e.target.files[0]) return;
    const img = new Image(), url = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      const side = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      this.data.photo = c.toDataURL('image/jpeg', 0.8);
      const av = document.getElementById('wz-avatar');
      if (av) av.innerHTML = avatarHTML(this.data);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  },

  finish() {
    Store.update((s) => {
      s.profile = { ...this.data, createdAt: (s.profile && s.profile.createdAt) || new Date().toISOString() };
      s.sports = this.sports;
      const kg = parseFloat(this.data.weight), last = s.weights[s.weights.length - 1];
      if (kg > 0 && (!last || last.kg !== kg)) s.weights.push({ date: new Date().toISOString().slice(0, 10), kg });
    });
    this.close();
    Router.render();
    UI.toast(this.edit ? 'Profil mis à jour.' : `Bienvenue, ${this.data.name} !`);
  },
};

/* ---------- 5c. GESTION DES OBJECTIFS ---------- */
const GoalForm = {
  open(goal) {
    this.id = goal ? goal.id : null;
    this.data = { title: '', type: 'distance', target: 100, current: 0, deadline: '', unit: 'km', ...(goal || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const types = [
      { id: 'distance', label: 'Distance totale (km)', unit: 'km' },
      { id: 'sessions', label: 'Nombre de séances', unit: 'séances' },
      { id: 'duration', label: 'Temps d\'entraînement (heures)', unit: 'heures' },
      { id: 'weight', label: 'Poids cible (kg)', unit: 'kg' }
    ];
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h2>
        <label class="field">Intitulé de l'objectif
          <input name="title" value="${esc(d.title)}" placeholder="ex: Courir 500km cette année" required></label>
        <label class="field">Type d'objectif
          <select name="type">
            ${types.map(t => `<option value="${t.id}" ${d.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </label>
        <div class="grid2">
          <label class="field">Valeur cible<input type="number" step="any" name="target" value="${d.target}" required></label>
          <label class="field">Échéance<input type="date" name="deadline" value="${d.deadline}"></label>
        </div>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
  },

  save(form) {
    const f = new FormData(form);
    const title = f.get('title').trim();
    const type = f.get('type');
    const target = parseFloat(f.get('target')) || 0;
    const deadline = f.get('deadline');
    if (!title) return UI.toast('Veuillez saisir un intitulé.');

    Store.update((s) => {
      const i = this.id ? s.goals.findIndex(g => g.id === this.id) : -1;
      const newGoal = { id: this.id || Store.uid(), title, type, target, deadline };
      if (i >= 0) s.goals[i] = { ...s.goals[i], ...newGoal };
      else s.goals.push(newGoal);
    });
    this.close();
    refreshView();
    UI.toast('Objectif enregistré.');
  }
};

const calculateGoalProgress = (goal, s) => {
  const sessions = s.sessions.filter(se => se.status === 'done');
  if (goal.type === 'distance') {
    return sessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  } else if (goal.type === 'sessions') {
    return sessions.length;
  } else if (goal.type === 'duration') {
    const totalMins = sessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
    return parseFloat((totalMins / 60).toFixed(1));
  } else if (goal.type === 'weight') {
    const lastW = s.weights[s.weights.length - 1];
    return lastW ? lastW.kg : (s.profile ? parseFloat(s.profile.weight) || 0 : 0);
  }
  return 0;
};

Views.objectifs = (el) => {
  const page = PAGES[3], s = Store.get();
  const goals = s.goals;
  
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvel objectif</button></div>
    ${goals.length ? `<div class="list">${goals.map(g => {
      const current = calculateGoalProgress(g, s);
      const pct = Math.min(100, Math.round((current / (g.target || 1)) * 100));
      const unit = g.type === 'distance' ? 'km' : g.type === 'duration' ? 'h' : g.type === 'weight' ? 'kg' : 'séances';
      return `
        <article class="item" style="--c:var(--accent)">
          <div class="item-main">
            <h3>${esc(g.title)}</h3>
            <p class="muted">Échéance : ${g.deadline ? fmtDate(g.deadline) : 'Aucune'} — Progression : <b>${current} / ${g.target} ${unit}</b> (${pct}%)</p>
            <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${pct}%"></div></div>
          </div>
          <div class="item-actions">
            <button type="button" class="btn btn-ghost" data-act="edit" data-id="${g.id}">Modifier</button>
            <button type="button" class="btn btn-ghost" data-act="del" data-id="${g.id}">Supprimer</button>
          </div>
        </article>`;
    }).join('')}</div>`
    : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;

  el.querySelector('[data-new]').onclick = () => GoalForm.open(null);
  el.querySelectorAll('[data-act=edit]').forEach(b => b.onclick = () => {
    const g = s.goals.find(x => x.id === b.dataset.id);
    if (g) GoalForm.open(g);
  });
  el.querySelectorAll('[data-act=del]').forEach(b => b.onclick = () => {
    if (confirm('Supprimer cet objectif ?')) {
      Store.update(st => { st.goals = st.goals.filter(x => x.id !== b.dataset.id); });
      refreshView();
      UI.toast('Objectif supprimé.');
    }
  });
};

/* ---------- 5d. SÉANCES ---------- */
const STATUS = {
  done:      { label: 'Réalisée', css: 'var(--done)' },
  planned:   { label: 'Prévue',   css: 'var(--planned)' },
  cancelled: { label: 'Annulée',  css: 'var(--cancelled)' },
  rest:      { label: 'Repos',    css: 'var(--rest)' },
};
const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];

const SessionForm = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    const totalMins = session ? (session.duration || 0) : 0;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    this.data = { date: day, sport: '', status: day <= todayStr() ? 'done' : 'planned',
                  effort: 'Endurance', hours, mins, distance: '', intensity: 5, notes: '', ...(session ? { ...session, hours, mins } : {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data, chosen = Store.get().sports.map((s) => s.name);
    const names = chosen.length ? chosen : DEFAULT_SPORTS;
    if (d.sport && !names.includes(d.sport)) names.push(d.sport);
    const opts = (list, cur) => list.map((n) => `<option ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('');
    
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <fieldset class="field"><legend>Statut</legend><div class="chips">
          ${Object.entries(STATUS).map(([k, v]) => `<label class="chip"><input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}>${v.label}</label>`).join('')}
        </div></fieldset>
        <div class="grid2">
          <label class="field">Sport<select name="sport">${opts(names, d.sport)}</select></label>
          <label class="field">Date<input type="date" name="date" value="${d.date}" required></label>
        </div>
        <div class="grid2">
          <label class="field">Type d'effort<select name="effort">${opts(EFFORTS, d.effort)}</select></label>
          <div class="field">Durée
            <div class="grid2" style="gap:4px;">
              <input type="number" inputmode="numeric" name="hours" min="0" placeholder="Heures" value="${d.hours || 0}">
              <input type="number" inputmode="numeric" name="mins" min="0" max="59" placeholder="Minutes" value="${d.mins || 0}">
            </div>
          </div>
        </div>
        <div class="grid2">
          <label class="field">Distance (km, facultatif)<input type="number" inputmode="decimal" name="distance" min="0" step="0.01" value="${esc(d.distance)}"></label>
          <label class="field">Intensité : <output>${d.intensity}</output> / 10
            <input class="range" type="range" name="intensity" min="1" max="10" value="${d.intensity}"></label>
        </div>
        <label class="field">Notes<textarea name="notes" rows="3" maxlength="500">${esc(d.notes)}</textarea></label>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
    form.addEventListener('input', (e) => { if (e.target.name === 'intensity') form.querySelector('output').textContent = e.target.value; });
  },

  save(form) {
    const f = new FormData(form);
    const h = parseInt(f.get('hours'), 10) || 0;
    const m = parseInt(f.get('mins'), 10) || 0;
    const totalDurationMinutes = (h * 60) + m;

    const data = {
      date: f.get('date'), sport: f.get('sport') || '', status: f.get('status'), effort: f.get('effort'),
      duration: totalDurationMinutes,
      distance: Math.max(0, parseFloat(f.get('distance')) || 0),
      intensity: parseInt(f.get('intensity'), 10), notes: String(f.get('notes')).trim(),
    };
    if (!data.date) return UI.toast('Choisissez une date.');
    Store.update((s) => {
      const i = this.id ? s.sessions.findIndex((x) => x.id === this.id) : -1;
      if (i >= 0) s.sessions[i] = { ...s.sessions[i], ...data };
      else s.sessions.push({ id: Store.uid(), createdAt: Date.now(), ...data });
    });
    const [y, mth] = data.date.split('-').map(Number);
    Object.assign(Cal, { y, m: mth - 1, sel: data.date });
    this.close();
    refreshView();
    UI.toast(this.id ? 'Séance modifiée.' : 'Séance enregistrée.');
  },
};

const sessionItem = (s, withDate) => {
  const st = STATUS[s.status] || STATUS.planned;
  const tags = [
    s.status !== 'rest' && s.effort, 
    s.duration > 0 && formatDuration(s.duration), 
    s.distance > 0 && `${s.distance} km`,
    s.status !== 'rest' && `intensité ${s.intensity}/10`
  ].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('');
  const btn = (act, label) => `<button type="button" class="btn btn-ghost" data-act="${act}" data-id="${s.id}">${label}</button>`;
  return `<article class="item" style="--c:${st.css}">
    <div class="item-main">
      <h3>${s.status === 'rest' ? 'Jour de repos' : esc(s.sport)}</h3>
      <p class="muted">${withDate ? fmtDate(s.date) + ' — ' : ''}${st.label}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ''}${s.notes ? `<p class="note">${esc(s.notes)}</p>` : ''}
    </div>
    <div class="item-actions">${btn('edit', 'Modifier')}${btn('dup', 'Dupliquer')}${btn('del', 'Supprimer')}</div>
  </article>`;
};

const bindSessionActions = (el) => el.querySelectorAll('[data-act][data-id]').forEach((b) => b.onclick = () => {
  const s = Store.get().sessions.find((x) => x.id === b.dataset.id);
  if (!s) return;
  if (b.dataset.act === 'edit') SessionForm.open(s);
  else if (b.dataset.act === 'dup') SessionForm.open({ ...s, id: undefined, status: 'planned' }, s.date);
  else if (confirm('Supprimer cette séance ?')) {
    Store.update((st) => { st.sessions = st.sessions.filter((x) => x.id !== s.id); });
    refreshView(); UI.toast('Séance supprimée.');
  }
});

Views.seances = (el) => {
  const page = PAGES[2], list = [...Store.get().sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvelle séance</button></div>
    ${list.length ? `<div class="list">${list.map((s) => sessionItem(s, true)).join('')}</div>`
      : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, todayStr());
  bindSessionActions(el);
};

/* ---------- 5e. CALENDRIER MENSUEL ---------- */
const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

Views.calendrier = (el) => {
  const sessions = Store.get().sessions, first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();
  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`, list = sessions.filter((s) => s.date === key);
    const dots = list.slice(0, 4).map((s) => `<i style="background:${(STATUS[s.status] || STATUS.planned).css}"></i>`).join('');
    cells += `<button type="button" class="day${key === todayStr() ? ' today' : ''}" data-date="${key}" aria-pressed="${key === Cal.sel}"
      aria-label="${fmtDate(key)}, ${list.length} séance(s)"><b>${d}</b><span class="dots">${dots}</span></button>`;
  }
  const dayList = sessions.filter((s) => s.date === Cal.sel);
  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>${PAGES[1].sub}</p></header>
    <div class="toolbar">
      <button class="btn btn-ghost btn-icon" data-nav="-1" aria-label="Mois précédent">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost btn-icon" data-nav="1" aria-label="Mois suivant">${icon('right')}</button>
      <button class="btn btn-ghost" data-today>Aujourd'hui</button>
    </div>
    <div class="legend">${Object.values(STATUS).map((v) => `<span><i style="background:${v.css}"></i>${v.label}</span>`).join('')}</div>
    <div class="cal">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w) => `<span class="wd">${w}</span>`).join('')}${cells}</div>
    <div class="toolbar"><h2 class="day-title">${fmtDate(Cal.sel)}</h2><button class="btn" data-new>${icon('plus')}Ajouter</button></div>
    <div class="list">${dayList.length ? dayList.map((s) => sessionItem(s, false)).join('')
      : '<p class="muted">Rien de prévu ce jour-là.</p>'}</div>`;

  el.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => {
    const d = new Date(Cal.y, Cal.m + Number(b.dataset.nav), 1);
    Cal.y = d.getFullYear(); Cal.m = d.getMonth(); Views.calendrier(el);
  });
  el.querySelector('[data-today]').onclick = () => {
    const n = new Date(); Object.assign(Cal, { y: n.getFullYear(), m: n.getMonth(), sel: todayStr() }); Views.calendrier(el);
  };
  el.querySelectorAll('.day').forEach((b) => b.onclick = () => { Cal.sel = b.dataset.date; Views.calendrier(el); });
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, Cal.sel);
  bindSessionActions(el);
};

/* ---------- 5f. STATISTIQUES (reliées à toutes les sections & Chart.js) ---------- */
Views.statistiques = (el) => {
  const page = PAGES[4], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length && !s.weights.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }

  const totalDist = doneSessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  const totalMins = doneSessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
  const totalCount = doneSessions.length;

  // Répartition par sport pour le graphique doughnut
  const sportsMap = {};
  doneSessions.forEach(se => {
    const sp = se.sport || 'Autre';
    sportsMap[sp] = (sportsMap[sp] || 0) + (parseInt(se.duration) || 1);
  });

  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="grid3" style="margin-bottom:24px;">
      <div class="card" style="padding:16px;"><h2>${totalCount}</h2><p class="muted">Séances réalisées</p></div>
      <div class="card" style="padding:16px;"><h2>${formatDuration(totalMins)}</h2><p class="muted">Temps total</p></div>
      <div class="card" style="padding:16px;"><h2>${totalDist.toFixed(1)} km</h2><p class="muted">Distance totale</p></div>
    </div>
    
    <div class="card stack" style="margin-bottom:24px;">
      <h2>Répartition du temps par sport</h2>
      <div style="position: relative; height: 260px; width: 100%;">
        <canvas id="statsChart"></canvas>
      </div>
    </div>

    ${s.weights.length ? `
    <div class="card stack">
      <h2>Évolution du poids</h2>
      <div style="position: relative; height: 240px; width: 100%;">
        <canvas id="weightChart"></canvas>
      </div>
    </div>` : ''}
  `;

  setTimeout(() => {
    if (typeof Chart === 'undefined') return;

    // Initialisation du graphique principal des sports (doughnut)
    const sportsKeys = Object.keys(sportsMap);
    if (sportsKeys.length > 0) {
      const ctx = document.getElementById('statsChart');
      if (ctx) {
        new Chart(ctx.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: sportsKeys,
            datasets: [{
              data: Object.values(sportsMap),
              backgroundColor: ['#2F57F0', '#1FA971', '#F59E0B', '#E5484D', '#98A2B3', '#6B8CFF']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    // Initialisation du graphique d'évolution du poids (line)
    if (s.weights.length > 0) {
      const sortedWeights = [...s.weights].sort((a, b) => a.date.localeCompare(b.date));
      const ctxWeight = document.getElementById('weightChart');
      if (ctxWeight) {
        new Chart(ctxWeight.getContext('2d'), {
          type: 'line',
          data: {
            labels: sortedWeights.map(w => w.date),
            datasets: [{
              label: 'Poids (kg)',
              data: sortedWeights.map(w => w.kg),
              borderColor: '#2F57F0',
              backgroundColor: 'rgba(47, 87, 240, 0.1)',
              fill: true,
              tension: 0.2
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  }, 50);
};

/* ---------- 5g. RECORDS ET STATISTIQUES AMUSANTES ---------- */
Views.records = (el) => {
  const page = PAGES[5], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }
  // ... reste de votre code records ...
};  plus:     '<path d="M12 5v14M5 12h14"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  trash:    '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- 3. STORE ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: null,
    settings: { theme: 'auto' },
    sports: [],
    sessions: [],
    goals: [],
    weights: [],
    dashboard: ['summary', 'weight', 'goals', 'last_sessions'], // Cartes du dashboard par défaut
  });

  const listeners = new Set();
  let timer = null;

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (err) { console.warn('Lecture impossible', err); return defaults(); }
  };
  let state = load();

  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); }
      catch (err) { UI.toast('Stockage plein : exportez vos données.'); }
    }, 150);
  };

  return {
    get: () => state,
    update(fn) { fn(state); persist(); listeners.forEach((l) => l(state)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  };
})();

/* ---------- 4. INTERFACE ---------- */
const UI = {
  THEMES: ['auto', 'light', 'dark'],
  THEME_LABELS: { auto: 'Thème : auto', light: 'Thème : clair', dark: 'Thème : sombre' },
  THEME_ICONS: { auto: 'auto', light: 'sun', dark: 'moon' },

  applyTheme() {
    const t = Store.get().settings.theme;
    document.documentElement.dataset.theme = t;
    const btn = document.getElementById('theme-btn');
    if (btn) btn.innerHTML = `${icon(this.THEME_ICONS[t])}${this.THEME_LABELS[t]}`;
  },
  cycleTheme() {
    Store.update((s) => {
      const i = this.THEMES.indexOf(s.settings.theme);
      s.settings.theme = this.THEMES[(i + 1) % this.THEMES.length];
    });
    this.applyTheme();
  },
  setTheme(t) {
    Store.update((st) => { st.settings.theme = t; });
    this.applyTheme();
  },
  toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove('show'), 2600);
  },
};

/* ---------- 5. UTILITAIRES DE TEMPS ET FORMATAGE ---------- */
const esc = (s) => String(s || '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                     .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const avatarHTML = (p) => p && p.photo ? `<img src="${p.photo}" alt="">` : esc((p && p.name || '?')[0].toUpperCase());

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// Conversion minutes <-> Format Heures (ex: 90 min -> "1h 30min")
const formatDuration = (totalMinutes) => {
  const mins = parseInt(totalMinutes, 10) || 0;
  if (mins === 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

const refreshView = () => {
  const id = PAGES.some((p) => p.id === Router.current()) ? Router.current() : PAGES[0].id;
  if (Views[id]) Views[id](document.getElementById('view'));
};

/* ---------- 5b. ASSISTANT DE CONFIGURATION ---------- */
const DEFAULT_SPORTS = ['Course', 'Natation', 'Cyclisme', 'Musculation', 'Pilates',
                        'Yoga', 'Tennis', 'Marche', 'CrossFit', 'Triathlon'];
const MAIN_GOALS = ['Perdre du poids', 'Prendre de la masse', 'Améliorer mon endurance',
                    'Préparer une compétition', 'Rester en forme', 'Reprendre le sport'];

const Wizard = {
  titles: ['Qui êtes-vous ?', 'Vos mensurations', 'Quels sports pratiquez-vous ?'],
  open(edit = false, step = 0) {
    const s = Store.get();
    this.data = { name: '', photo: '', birth: '', sex: '', height: '', weight: '', target: '', goal: '', ...(s.profile || {}) };
    this.sports = s.sports.map((x) => ({ ...x }));
    this.edit = edit; this.step = step;
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const last = this.step === this.titles.length - 1;
    const back = this.step > 0 ? '<button type="button" class="btn btn-ghost" data-act="back">Retour</button>'
               : this.edit ? '<button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>' : '<span></span>';
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <div class="progress" aria-hidden="true">${this.titles.map((_, i) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</div>
        <h2>${this.step === 0 && !this.edit ? 'Bienvenue ! ' : ''}${this.titles[this.step]}</h2>
        ${[this.stepIdentity, this.stepBody, this.stepSports][this.step].call(this)}
        <div class="actions">${back}<button class="btn" type="submit">${last ? (this.edit ? 'Enregistrer' : 'Commencer') : 'Suivant'}</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.next(); });
    form.addEventListener('click', (e) => this.onClick(e));
    form.addEventListener('change', (e) => this.onChange(e));
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.name === 'newsport') { e.preventDefault(); this.addSport(); }
    });
  },

  stepIdentity() {
    const d = this.data, today = new Date().toISOString().slice(0, 10);
    return `
      <div class="photo-row">
        <div class="avatar" id="wz-avatar">${avatarHTML(d)}</div>
        <label class="btn btn-ghost">Choisir une photo<input type="file" name="photofile" accept="image/*" hidden></label>
      </div>
      <label class="field">Prénom ou nom
        <input name="name" value="${esc(d.name)}" maxlength="40" autocomplete="given-name" required></label>
      <label class="field">Date de naissance
        <input type="date" name="birth" value="${d.birth}" max="${today}"></label>
      <fieldset class="field"><legend>Sexe</legend><div class="chips">
        ${['Femme', 'Homme', 'Autre'].map((v) => `<label class="chip"><input type="radio" name="sex" value="${v}" ${d.sex === v ? 'checked' : ''}>${v}</label>`).join('')}
      </div></fieldset>`;
  },

  stepBody() {
    const d = this.data;
    const num = (name, label, v, step) => `<label class="field">${label}
      <input type="number" inputmode="decimal" name="${name}" value="${esc(v)}" min="0" step="${step}"></label>`;
    return `
      <div class="grid3">${num('height', 'Taille (cm)', d.height, 1)}${num('weight', 'Poids (kg)', d.weight, 0.1)}${num('target', 'Poids cible (kg)', d.target, 0.1)}</div>
      <fieldset class="field"><legend>Objectif principal</legend><div class="chips">
        ${MAIN_GOALS.map((g) => `<label class="chip"><input type="radio" name="goal" value="${g}" ${d.goal === g ? 'checked' : ''}>${g}</label>`).join('')}
      </div></fieldset>`;
  },

  stepSports() {
    const names = [...DEFAULT_SPORTS, ...this.sports.filter((s) => s.custom).map((s) => s.name)];
    const chips = [...new Set(names)].map((n) =>
      `<button type="button" class="chip" data-sport="${esc(n)}" aria-pressed="${this.sports.some((s) => s.name === n)}">${esc(n)}</button>`).join('');
    return `
      <div class="chips">${chips}</div>
      <div class="add-row"><input name="newsport" placeholder="Créer mon propre sport" maxlength="30">
        <button type="button" class="btn btn-ghost" data-act="addsport">Ajouter</button></div>`;
  },

  collect() {
    const f = new FormData(this.el.querySelector('form'));
    for (const k of ['name', 'birth', 'sex', 'height', 'weight', 'target', 'goal'])
      if (f.has(k)) this.data[k] = String(f.get(k)).trim();
  },

  next() {
    this.collect();
    if (this.step === 0 && !this.data.name) {
      UI.toast('Indiquez votre prénom pour continuer.');
      return this.el.querySelector('[name=name]').focus();
    }
    if (this.step < this.titles.length - 1) { this.step++; this.render(); } else this.finish();
  },

  onClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'back') { this.collect(); this.step--; this.render(); }
    else if (btn.dataset.act === 'cancel') this.close();
    else if (btn.dataset.act === 'addsport') this.addSport();
    else if (btn.dataset.sport) {
      const name = btn.dataset.sport, i = this.sports.findIndex((s) => s.name === name);
      if (i >= 0) this.sports.splice(i, 1);
      else this.sports.push({ id: slug(name), name, custom: !DEFAULT_SPORTS.includes(name) });
      btn.setAttribute('aria-pressed', String(i < 0));
    }
  },

  addSport() {
    const input = this.el.querySelector('[name=newsport]'), name = input.value.trim();
    if (!name) return;
    if (!this.sports.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      this.sports.push({ id: slug(name) || Store.uid(), name, custom: !DEFAULT_SPORTS.includes(name) });
    this.render();
  },

  onChange(e) {
    if (e.target.name !== 'photofile' || !e.target.files[0]) return;
    const img = new Image(), url = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      const side = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      this.data.photo = c.toDataURL('image/jpeg', 0.8);
      const av = document.getElementById('wz-avatar');
      if (av) av.innerHTML = avatarHTML(this.data);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  },

  finish() {
    Store.update((s) => {
      s.profile = { ...this.data, createdAt: (s.profile && s.profile.createdAt) || new Date().toISOString() };
      s.sports = this.sports;
      const kg = parseFloat(this.data.weight), last = s.weights[s.weights.length - 1];
      if (kg > 0 && (!last || last.kg !== kg)) s.weights.push({ date: new Date().toISOString().slice(0, 10), kg });
    });
    this.close();
    Router.render();
    UI.toast(this.edit ? 'Profil mis à jour.' : `Bienvenue, ${this.data.name} !`);
  },
};

/* ---------- 5c. GESTION DES OBJECTIFS ---------- */
const GoalForm = {
  open(goal) {
    this.id = goal ? goal.id : null;
    this.data = { title: '', type: 'distance', target: 100, current: 0, deadline: '', unit: 'km', ...(goal || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const types = [
      { id: 'distance', label: 'Distance totale (km)', unit: 'km' },
      { id: 'sessions', label: 'Nombre de séances', unit: 'séances' },
      { id: 'duration', label: 'Temps d\'entraînement (heures)', unit: 'heures' },
      { id: 'weight', label: 'Poids cible (kg)', unit: 'kg' }
    ];
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h2>
        <label class="field">Intitulé de l'objectif
          <input name="title" value="${esc(d.title)}" placeholder="ex: Courir 500km cette année" required></label>
        <label class="field">Type d'objectif
          <select name="type">
            ${types.map(t => `<option value="${t.id}" ${d.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </label>
        <div class="grid2">
          <label class="field">Valeur cible<input type="number" step="any" name="target" value="${d.target}" required></label>
          <label class="field">Échéance<input type="date" name="deadline" value="${d.deadline}"></label>
        </div>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
  },

  save(form) {
    const f = new FormData(form);
    const title = f.get('title').trim();
    const type = f.get('type');
    const target = parseFloat(f.get('target')) || 0;
    const deadline = f.get('deadline');
    if (!title) return UI.toast('Veuillez saisir un intitulé.');

    Store.update((s) => {
      const i = this.id ? s.goals.findIndex(g => g.id === this.id) : -1;
      const newGoal = { id: this.id || Store.uid(), title, type, target, deadline };
      if (i >= 0) s.goals[i] = { ...s.goals[i], ...newGoal };
      else s.goals.push(newGoal);
    });
    this.close();
    refreshView();
    UI.toast('Objectif enregistré.');
  }
};

// Calcule automatiquement la valeur actuelle d'un objectif en fonction des séances et du profil
const calculateGoalProgress = (goal, s) => {
  const sessions = s.sessions.filter(se => se.status === 'done');
  if (goal.type === 'distance') {
    return sessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  } else if (goal.type === 'sessions') {
    return sessions.length;
  } else if (goal.type === 'duration') {
    // Stocké en minutes, affiché ou calculé en heures selon le choix
    const totalMins = sessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
    return parseFloat((totalMins / 60).toFixed(1));
  } else if (goal.type === 'weight') {
    const lastW = s.weights[s.weights.length - 1];
    return lastW ? lastW.kg : (s.profile ? parseFloat(s.profile.weight) || 0 : 0);
  }
  return 0;
};

Views.objectifs = (el) => {
  const page = PAGES[3], s = Store.get();
  const goals = s.goals;
  
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvel objectif</button></div>
    ${goals.length ? `<div class="list">${goals.map(g => {
      const current = calculateGoalProgress(g, s);
      const pct = Math.min(100, Math.round((current / (g.target || 1)) * 100));
      const unit = g.type === 'distance' ? 'km' : g.type === 'duration' ? 'h' : g.type === 'weight' ? 'kg' : 'séances';
      return `
        <article class="item" style="--c:var(--accent)">
          <div class="item-main">
            <h3>${esc(g.title)}</h3>
            <p class="muted">Échéance : ${g.deadline ? fmtDate(g.deadline) : 'Aucune'} — Progression : <b>${current} / ${g.target} ${unit}</b> (${pct}%)</p>
            <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${pct}%"></div></div>
          </div>
          <div class="item-actions">
            <button type="button" class="btn btn-ghost" data-act="edit" data-id="${g.id}">Modifier</button>
            <button type="button" class="btn btn-ghost" data-act="del" data-id="${g.id}">Supprimer</button>
          </div>
        </article>`;
    }).join('')}</div>`
    : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;

  el.querySelector('[data-new]').onclick = () => GoalForm.open(null);
  el.querySelectorAll('[data-act=edit]').forEach(b => b.onclick = () => {
    const g = s.goals.find(x => x.id === b.dataset.id);
    if (g) GoalForm.open(g);
  });
  el.querySelectorAll('[data-act=del]').forEach(b => b.onclick = () => {
    if (confirm('Supprimer cet objectif ?')) {
      Store.update(st => { st.goals = st.goals.filter(x => x.id !== b.dataset.id); });
      refreshView();
      UI.toast('Objectif supprimé.');
    }
  });
};

/* ---------- 5d. SÉANCES (Durée en heures & minutes) ---------- */
const STATUS = {
  done:      { label: 'Réalisée', css: 'var(--done)' },
  planned:   { label: 'Prévue',   css: 'var(--planned)' },
  cancelled: { label: 'Annulée',  css: 'var(--cancelled)' },
  rest:      { label: 'Repos',    css: 'var(--rest)' },
};
const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];

const SessionForm = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    // Conversion minutes en heures/minutes pour le formulaire
    const totalMins = session ? (session.duration || 0) : 0;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    this.data = { date: day, sport: '', status: day <= todayStr() ? 'done' : 'planned',
                  effort: 'Endurance', hours, mins, distance: '', intensity: 5, notes: '', ...(session ? { ...session, hours, mins } : {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data, chosen = Store.get().sports.map((s) => s.name);
    const names = chosen.length ? chosen : DEFAULT_SPORTS;
    if (d.sport && !names.includes(d.sport)) names.push(d.sport);
    const opts = (list, cur) => list.map((n) => `<option ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('');
    
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <fieldset class="field"><legend>Statut</legend><div class="chips">
          ${Object.entries(STATUS).map(([k, v]) => `<label class="chip"><input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}>${v.label}</label>`).join('')}
        </div></fieldset>
        <div class="grid2">
          <label class="field">Sport<select name="sport">${opts(names, d.sport)}</select></label>
          <label class="field">Date<input type="date" name="date" value="${d.date}" required></label>
        </div>
        <div class="grid2">
          <label class="field">Type d'effort<select name="effort">${opts(EFFORTS, d.effort)}</select></label>
          <div class="field">Durée
            <div class="grid2" style="gap:4px;">
              <input type="number" inputmode="numeric" name="hours" min="0" placeholder="Heures" value="${d.hours || 0}">
              <input type="number" inputmode="numeric" name="mins" min="0" max="59" placeholder="Minutes" value="${d.mins || 0}">
            </div>
          </div>
        </div>
        <div class="grid2">
          <label class="field">Distance (km, facultatif)<input type="number" inputmode="decimal" name="distance" min="0" step="0.01" value="${esc(d.distance)}"></label>
          <label class="field">Intensité : <output>${d.intensity}</output> / 10
            <input class="range" type="range" name="intensity" min="1" max="10" value="${d.intensity}"></label>
        </div>
        <label class="field">Notes<textarea name="notes" rows="3" maxlength="500">${esc(d.notes)}</textarea></label>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
    form.addEventListener('input', (e) => { if (e.target.name === 'intensity') form.querySelector('output').textContent = e.target.value; });
  },

  save(form) {
    const f = new FormData(form);
    const h = parseInt(f.get('hours'), 10) || 0;
    const m = parseInt(f.get('mins'), 10) || 0;
    const totalDurationMinutes = (h * 60) + m;

    const data = {
      date: f.get('date'), sport: f.get('sport') || '', status: f.get('status'), effort: f.get('effort'),
      duration: totalDurationMinutes,
      distance: Math.max(0, parseFloat(f.get('distance')) || 0),
      intensity: parseInt(f.get('intensity'), 10), notes: String(f.get('notes')).trim(),
    };
    if (!data.date) return UI.toast('Choisissez une date.');
    Store.update((s) => {
      const i = this.id ? s.sessions.findIndex((x) => x.id === this.id) : -1;
      if (i >= 0) s.sessions[i] = { ...s.sessions[i], ...data };
      else s.sessions.push({ id: Store.uid(), createdAt: Date.now(), ...data });
    });
    const [y, mth] = data.date.split('-').map(Number);
    Object.assign(Cal, { y, m: mth - 1, sel: data.date });
    this.close();
    refreshView();
    UI.toast(this.id ? 'Séance modifiée.' : 'Séance enregistrée.');
  },
};

const sessionItem = (s, withDate) => {
  const st = STATUS[s.status] || STATUS.planned;
  const tags = [
    s.status !== 'rest' && s.effort, 
    s.duration > 0 && formatDuration(s.duration), 
    s.distance > 0 && `${s.distance} km`,
    s.status !== 'rest' && `intensité ${s.intensity}/10`
  ].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('');
  const btn = (act, label) => `<button type="button" class="btn btn-ghost" data-act="${act}" data-id="${s.id}">${label}</button>`;
  return `<article class="item" style="--c:${st.css}">
    <div class="item-main">
      <h3>${s.status === 'rest' ? 'Jour de repos' : esc(s.sport)}</h3>
      <p class="muted">${withDate ? fmtDate(s.date) + ' — ' : ''}${st.label}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ''}${s.notes ? `<p class="note">${esc(s.notes)}</p>` : ''}
    </div>
    <div class="item-actions">${btn('edit', 'Modifier')}${btn('dup', 'Dupliquer')}${btn('del', 'Supprimer')}</div>
  </article>`;
};

const bindSessionActions = (el) => el.querySelectorAll('[data-act][data-id]').forEach((b) => b.onclick = () => {
  const s = Store.get().sessions.find((x) => x.id === b.dataset.id);
  if (!s) return;
  if (b.dataset.act === 'edit') SessionForm.open(s);
  else if (b.dataset.act === 'dup') SessionForm.open({ ...s, id: undefined, status: 'planned' }, s.date);
  else if (confirm('Supprimer cette séance ?')) {
    Store.update((st) => { st.sessions = st.sessions.filter((x) => x.id !== s.id); });
    refreshView(); UI.toast('Séance supprimée.');
  }
});

Views.seances = (el) => {
  const page = PAGES[2], list = [...Store.get().sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvelle séance</button></div>
    ${list.length ? `<div class="list">${list.map((s) => sessionItem(s, true)).join('')}</div>`
      : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, todayStr());
  bindSessionActions(el);
};

/* ---------- 5e. CALENDRIER MENSUEL ---------- */
const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

Views.calendrier = (el) => {
  const sessions = Store.get().sessions, first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();
  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`, list = sessions.filter((s) => s.date === key);
    const dots = list.slice(0, 4).map((s) => `<i style="background:${(STATUS[s.status] || STATUS.planned).css}"></i>`).join('');
    cells += `<button type="button" class="day${key === todayStr() ? ' today' : ''}" data-date="${key}" aria-pressed="${key === Cal.sel}"
      aria-label="${fmtDate(key)}, ${list.length} séance(s)"><b>${d}</b><span class="dots">${dots}</span></button>`;
  }
  const dayList = sessions.filter((s) => s.date === Cal.sel);
  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>${PAGES[1].sub}</p></header>
    <div class="toolbar">
      <button class="btn btn-ghost btn-icon" data-nav="-1" aria-label="Mois précédent">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost btn-icon" data-nav="1" aria-label="Mois suivant">${icon('right')}</button>
      <button class="btn btn-ghost" data-today>Aujourd'hui</button>
    </div>
    <div class="legend">${Object.values(STATUS).map((v) => `<span><i style="background:${v.css}"></i>${v.label}</span>`).join('')}</div>
    <div class="cal">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w) => `<span class="wd">${w}</span>`).join('')}${cells}</div>
    <div class="toolbar"><h2 class="day-title">${fmtDate(Cal.sel)}</h2><button class="btn" data-new>${icon('plus')}Ajouter</button></div>
    <div class="list">${dayList.length ? dayList.map((s) => sessionItem(s, false)).join('')
      : '<p class="muted">Rien de prévu ce jour-là.</p>'}</div>`;

  el.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => {
    const d = new Date(Cal.y, Cal.m + Number(b.dataset.nav), 1);
    Cal.y = d.getFullYear(); Cal.m = d.getMonth(); Views.calendrier(el);
  });
  el.querySelector('[data-today]').onclick = () => {
    const n = new Date(); Object.assign(Cal, { y: n.getFullYear(), m: n.getMonth(), sel: todayStr() }); Views.calendrier(el);
  };
  el.querySelectorAll('.day').forEach((b) => b.onclick = () => { Cal.sel = b.dataset.date; Views.calendrier(el); });
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, Cal.sel);
  bindSessionActions(el);
};

/* ---------- 5f. STATISTIQUES (reliées à toutes les sections) ---------- */
Views.statistiques = (el) => {
  const page = PAGES[4], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }

  const totalDist = doneSessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  const totalMins = doneSessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
  const totalCount = doneSessions.length;

  // Répartition par sport pour le graphique
  const sportsMap = {};
  doneSessions.forEach(se => {
    const sp = se.sport || 'Autre';
    sportsMap[sp] = (sportsMap[sp] || 0) + (parseFloat(se.distance) || parseInt(se.duration) || 1);
  });

  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="grid3" style="margin-bottom:24px;">
      <div class="card" style="padding:16px;"><h2>${totalCount}</h2><p class="muted">Séances réalisées</p></div>
      <div class="card" style="padding:16px;"><h2>${formatDuration(totalMins)}</h2><p class="muted">Temps total</p></div>
      <div class="card" style="padding:16px;"><h2>${totalDist.toFixed(1)} km</h2><p class="muted">Distance totale</p></div>
    </div>
    <div class="card stack">
      <h2>Répartition de l'activité</h2>
      <div style="position: relative; height: 260px; width: 100%;">
        <canvas id="stats-chart"></canvas>
      </div>
    </div>`;

  setTimeout(() => {
    const canvas = document.getElementById('stats-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(sportsMap),
        datasets: [{
          data: Object.values(sportsMap),
          backgroundColor: ['#2F57F0', '#1FA971', '#F59E0B', '#E5484D', '#98A2B3', '#6B8CFF']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }, 50);
};

/* ---------- 5g. RECORDS ET STATISTIQUES AMUSANTES ---------- */
Views.records = (el) => {
  const page = PAGES[5], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }

  const totalDist = doneSessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  // Paris - Marseille ~ 775 km
  const parisMarseilleRatio = (totalDist / 775).toFixed(2);
  const earthCircumferenceRatio = (totalDist / 40075).toFixed(3);

  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="grid2" style="margin-bottom:24px;">
      <div class="card stack">
        <h2>🏆 Distance Paris - Marseille</h2>
        <p style="font-size:1.5rem; font-weight:700; color:var(--accent);">${totalDist.toFixed(1)} km parcourus</p>
        <p class="muted">Soit <b>${parisMarseilleRatio}</b> fois le trajet Paris-Marseille (775 km) !</p>
      </div>
      <div class="card stack">
        <h2>🌍 Tour du Monde</h2>
        <p style="font-size:1.5rem; font-weight:700; color:var(--accent);">${earthCircumferenceRatio}x</p>
        <p class="muted">De la circonférence de la Terre accomplie à la force de vos mollets.</p>
      </div>
    </div>
    <div class="card stack">
      <h2>Badges et Performances</h2>
      <p class="muted">Continuez à enregistrer vos séances pour débloquer davantage de badges et records automatiques.</p>
    </div>`;
};

/* ---------- 5h. ACCUEIL / TABLEAU DE BORD DYNAMIQUE ---------- */
Views.accueil = (el) => {
  const s = Store.get(), p = s.profile;
  const cardsConfig = s.dashboard || ['summary', 'weight', 'goals', 'last_sessions'];

  const renderCardContent = (cardId) => {
    if (cardId === 'summary') {
      const done = s.sessions.filter(se => se.status === 'done');
      const dist = done.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
      const mins = done.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
      return `
        <div class="card stack">
          <h2>📊 Résumé Global</h2>
          <div class="grid3">
            <div><b>${done.length}</b><br><span class="muted">Séances</span></div>
            <div><b>${formatDuration(mins)}</b><br><span class="muted">Temps</span></div>
            <div><b>${dist.toFixed(1)} km</b><br><span class="muted">Distance</span></div>
          </div>
        </div>`;
    }
    if (cardId === 'weight') {
      const lastW = s.weights[s.weights.length - 1];
      const targetW = p && p.target ? p.target : '--';
      return `
        <div class="card stack">
          <h2>⚖️ Suivi du Poids</h2>
          <p style="font-size:1.2rem; font-weight:600;">Actuel : ${lastW ? lastW.kg + ' kg' : (p && p.weight ? p.weight + ' kg' : 'Non renseigné')} — Cible : ${targetW} kg</p>
        </div>`;
    }
    if (cardId === 'goals') {
      return `
        <div class="card stack">
          <h2>🎯 Aperçu des Objectifs</h2>
          ${s.goals.length ? s.goals.slice(0, 2).map(g => `<div><b>${esc(g.title)}</b> — Cible :${g.target}</div>`).join('') : '<p class="muted">Aucun objectif configuré.</p>'}
        </div>`;
    }
    if (cardId === 'last_sessions') {
      const recent = [...s.sessions].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 3);
      return `
        <div class="card stack">
          <h2>🏃 Dernières Séances</h2>
          ${recent.length ? recent.map(se => `<p>• <b>${esc(se.sport)}</b> (${fmtDate(se.date)})</p>`).join('') : '<p class="muted">Aucune séance récente.</p>'}
        </div>`;
    }
    return '';
  };

  el.innerHTML = `
    <header class="page-head"><h1>Bonjour ${esc(p ? p.name : 'Sportif')} !</h1><p>Voici votre tableau de bord personnalisé.</p></header>
    <div class="stack">
      ${cardsConfig.map(id => renderCardContent(id)).join('')}
    </div>`;
};

/* ---------- 5i. PARAMÈTRES & CONFIGURATION DU TABLEAU DE BORD ---------- */
Views.parametres = (el) => {
  const s = Store.get(), p = s.profile || {}, th = s.settings.theme;
  const sports = s.sports.length ? s.sports.map((x) => esc(x.name)).join(', ') : 'Aucun sport choisi';
  const currentDash = s.dashboard || [];

  const availableCards = [
    { id: 'summary', label: 'Résumé Global' },
    { id: 'weight', label: 'Suivi du Poids' },
    { id: 'goals', label: 'Aperçu des Objectifs' },
    { id: 'last_sessions', label: 'Dernières Séances' }
  ];

  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Profil, thème, sports et tableau de bord.</p></header>
    <section class="card stack">
      <div class="photo-row"><div class="avatar">${avatarHTML(p)}</div>
        <div><h2>${esc(p.name || 'Profil non configuré')}</h2><p class="muted">${sports}</p></div></div>
      <div class="row"><button class="btn" data-act="profile">Modifier le profil</button>
        <button class="btn btn-ghost" data-act="sports">Modifier mes sports</button></div>
    </section>
    <section class="card stack">
      <h2>Cartes du Tableau de bord</h2>
      <p class="muted">Choisissez les cartes à afficher sur votre page d'accueil :</p>
      <div class="chips">
        ${availableCards.map(c => `
          <label class="chip">
            <input type="checkbox" name="dashcard" value="${c.id}" ${currentDash.includes(c.id) ? 'checked' : ''}>${c.label}
          </label>`).join('')}
      </div>
      <button class="btn" id="save-dash">Enregistrer la disposition</button>
    </section>
    <section class="card stack"><h2>Thème</h2><div class="chips">
      ${[['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, l]) =>
        `<button type="button" class="chip" data-theme="${v}" aria-pressed="${th === v}">${l}</button>`).join('')}
    </div></section>`;

  el.querySelector('[data-act=profile]').onclick = () => Wizard.open(true, 0);
  el.querySelector('[data-act=sports]').onclick = () => Wizard.open(true, 2);
  el.querySelectorAll('[data-theme]').forEach((b) => b.onclick = () => { UI.setTheme(b.dataset.theme); Views.parametres(el); });
  
  el.querySelector('#save-dash').onclick = () => {
    const checked = Array.from(el.querySelectorAll('input[name=dashcard]:checked')).map(i => i.value);
    Store.update(st => { st.dashboard = checked; });
    UI.toast('Tableau de bord mis à jour.');
  };
};

/* ---------- 6. ROUTEUR ---------- */
const Router = {
  current: () => (location.hash.replace('#/', '') || PAGES[0].id),
  render() {
    const id = PAGES.some((p) => p.id === this.current()) ? this.current() : PAGES[0].id;
    const view = document.getElementById('view');
    if (Views[id]) Views[id](view);
    if (view) {
      view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
      view.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
    document.querySelectorAll('[data-page]').forEach((a) => {
      if (a.dataset.page === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const pageObj = PAGES.find((p) => p.id === id);
    if (pageObj) document.title = `${pageObj.label} · Sport Journal`;
  },
};

function buildNavigation() {
  const link = (p) => `<a href="#/${p.id}" data-page="${p.id}">${icon(p.icon)}<span>${p.label}</span></a>`;
  const sSide = document.getElementById('nav-side');
  const sTab = document.getElementById('nav-tab');
  if (sSide) sSide.innerHTML = PAGES.map(link).join('');
  if (sTab) sTab.innerHTML = PAGES.map(link).join('');
}

/* ---------- 7. DÉMARRAGE ---------- */
function init() {
  buildNavigation();
  UI.applyTheme();
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', () => UI.cycleTheme());
  window.addEventListener('hashchange', () => Router.render());
  Router.render();
  if (!Store.get().profile) Wizard.open(false);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch((e) => console.warn('SW', e));
  }
}
document.addEventListener('DOMContentLoaded', init);  chart:    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  trophy:   '<path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 14v4M8 21h8"/>',
  gear:     '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon:     '<path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z"/>',
  auto:     '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>',
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------- 3. STORE : toute la donnée vit dans le LocalStorage ---------- */
const Store = (() => {
  // Structure d'une application vierge. Chaque étape suivante remplira ses propres tableaux.
  const defaults = () => ({
    version: 1,
    profile: null,                 // rempli par l'assistant de configuration
    settings: { theme: 'auto' },   // 'auto' | 'light' | 'dark'
    sports: [],                    // sports choisis + sports personnalisés
    sessions: [],                  // séances (réalisées, prévues, annulées, repos)
    goals: [],                     // objectifs
    weights: [],                   // historique de poids
    dashboard: [],                 // cartes affichées et leur ordre
  });

  const listeners = new Set();
  let timer = null;

  // Lecture : on fusionne avec les valeurs par défaut pour survivre aux futures versions.
  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (err) { console.warn('Lecture impossible', err); return defaults(); }
  };
  let state = load();

  // Écriture différée (150 ms) : plusieurs modifications rapprochées = une seule sauvegarde.
  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); }
      catch (err) { UI.toast('Stockage plein : exportez vos données.'); }
    }, 150);
  };

  return {
    get: () => state,
    // Modifier : Store.update(s => s.goals.push(...)) → sauvegarde + notifie les vues.
    update(fn) { fn(state); persist(); listeners.forEach((l) => l(state)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  };
})();

/* ---------- 4. INTERFACE : thème et notifications ---------- */
const UI = {
  THEMES: ['auto', 'light', 'dark'],
  THEME_LABELS: { auto: 'Thème : auto', light: 'Thème : clair', dark: 'Thème : sombre' },
  THEME_ICONS: { auto: 'auto', light: 'sun', dark: 'moon' },

  applyTheme() {
    const t = Store.get().settings.theme;
    document.documentElement.dataset.theme = t;
    const btn = document.getElementById('theme-btn');
    btn.innerHTML = `${icon(this.THEME_ICONS[t])}${this.THEME_LABELS[t]}`;
  },
  cycleTheme() {
    Store.update((s) => {
      const i = this.THEMES.indexOf(s.settings.theme);
      s.settings.theme = this.THEMES[(i + 1) % this.THEMES.length];
    });
    this.applyTheme();
  },

  setTheme(t) {
    Store.update((st) => { st.settings.theme = t; });
    this.applyTheme();
  },

  toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove('show'), 2600);
  },
};

/* ---------- 5. VUES : une fonction par page ---------- */
// Vue par défaut : en-tête + état vide. Les étapes suivantes remplaceront ces vues
// en écrivant par exemple : Views.seances = (el) => { ... }
const defaultView = (page) => (el) => {
  const [title, text] = page.empty;
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <section class="card empty">${icon(page.icon)}<h2>${title}</h2><p>${text}</p></section>`;
};
const Views = Object.fromEntries(PAGES.map((p) => [p.id, defaultView(p)]));

/* ---------- 5b. ASSISTANT DE CONFIGURATION (profil + sports) ----------
   S'ouvre automatiquement au premier lancement (aucun profil enregistré).
   Il sert aussi à modifier le profil depuis Paramètres (mode « edit »).    */
const DEFAULT_SPORTS = ['Course', 'Natation', 'Cyclisme', 'Musculation', 'Pilates',
                        'Yoga', 'Tennis', 'Marche', 'CrossFit', 'Triathlon'];
const MAIN_GOALS = ['Perdre du poids', 'Prendre de la masse', 'Améliorer mon endurance',
                    'Préparer une compétition', 'Rester en forme', 'Reprendre le sport'];

// Échappe le texte saisi par l'utilisateur avant de l'injecter dans le HTML (sécurité).
const esc = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                     .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Pastille de profil : photo si elle existe, sinon la première lettre du nom.
const avatarHTML = (p) => p && p.photo ? `<img src="${p.photo}" alt="">` : esc((p && p.name || '?')[0].toUpperCase());

const Wizard = {
  titles: ['Qui êtes-vous ?', 'Vos mensurations', 'Quels sports pratiquez-vous ?'],

  // edit = true : modification depuis Paramètres ; step = étape de départ
  open(edit = false, step = 0) {
    const s = Store.get();
    this.data = { name: '', photo: '', birth: '', sex: '', height: '', weight: '', target: '', goal: '', ...(s.profile || {}) };
    this.sports = s.sports.map((x) => ({ ...x }));
    this.edit = edit; this.step = step;
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { this.el.remove(); },

  render() {
    const last = this.step === this.titles.length - 1;
    const back = this.step > 0 ? '<button type="button" class="btn btn-ghost" data-act="back">Retour</button>'
               : this.edit ? '<button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>' : '<span></span>';
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <div class="progress" aria-hidden="true">${this.titles.map((_, i) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</div>
        <h2>${this.step === 0 && !this.edit ? 'Bienvenue ! ' : ''}${this.titles[this.step]}</h2>
        ${[this.stepIdentity, this.stepBody, this.stepSports][this.step].call(this)}
        <div class="actions">${back}<button class="btn" type="submit">${last ? (this.edit ? 'Enregistrer' : 'Commencer') : 'Suivant'}</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.next(); });
    form.addEventListener('click', (e) => this.onClick(e));
    form.addEventListener('change', (e) => this.onChange(e));
    // Entrée dans le champ « nouveau sport » ajoute le sport au lieu de valider le formulaire.
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.name === 'newsport') { e.preventDefault(); this.addSport(); }
    });
  },

  // Étape 1 : identité
  stepIdentity() {
    const d = this.data, today = new Date().toISOString().slice(0, 10);
    return `
      <div class="photo-row">
        <div class="avatar" id="wz-avatar">${avatarHTML(d)}</div>
        <label class="btn btn-ghost">Choisir une photo<input type="file" name="photofile" accept="image/*" hidden></label>
      </div>
      <label class="field">Prénom ou nom
        <input name="name" value="${esc(d.name)}" maxlength="40" autocomplete="given-name" required></label>
      <label class="field">Date de naissance
        <input type="date" name="birth" value="${d.birth}" max="${today}"></label>
      <fieldset class="field"><legend>Sexe</legend><div class="chips">
        ${['Femme', 'Homme', 'Autre'].map((v) => `<label class="chip"><input type="radio" name="sex" value="${v}" ${d.sex === v ? 'checked' : ''}>${v}</label>`).join('')}
      </div></fieldset>`;
  },

  // Étape 2 : mensurations et objectif principal
  stepBody() {
    const d = this.data;
    const num = (name, label, v, step) => `<label class="field">${label}
      <input type="number" inputmode="decimal" name="${name}" value="${esc(v)}" min="0" step="${step}"></label>`;
    return `
      <div class="grid3">${num('height', 'Taille (cm)', d.height, 1)}${num('weight', 'Poids (kg)', d.weight, 0.1)}${num('target', 'Poids cible (kg)', d.target, 0.1)}</div>
      <fieldset class="field"><legend>Objectif principal</legend><div class="chips">
        ${MAIN_GOALS.map((g) => `<label class="chip"><input type="radio" name="goal" value="${g}" ${d.goal === g ? 'checked' : ''}>${g}</label>`).join('')}
      </div></fieldset>`;
  },

  // Étape 3 : choix des sports (+ sports personnalisés)
  stepSports() {
    const names = [...DEFAULT_SPORTS, ...this.sports.filter((s) => s.custom).map((s) => s.name)];
    const chips = [...new Set(names)].map((n) =>
      `<button type="button" class="chip" data-sport="${esc(n)}" aria-pressed="${this.sports.some((s) => s.name === n)}">${esc(n)}</button>`).join('');
    return `
      <div class="chips">${chips}</div>
      <div class="add-row"><input name="newsport" placeholder="Créer mon propre sport" maxlength="30">
        <button type="button" class="btn btn-ghost" data-act="addsport">Ajouter</button></div>`;
  },

  // Lit les champs de l'étape affichée et les mémorise.
  collect() {
    const f = new FormData(this.el.querySelector('form'));
    for (const k of ['name', 'birth', 'sex', 'height', 'weight', 'target', 'goal'])
      if (f.has(k)) this.data[k] = String(f.get(k)).trim();
  },

  next() {
    this.collect();
    if (this.step === 0 && !this.data.name) {                 // seul le nom est obligatoire
      UI.toast('Indiquez votre prénom pour continuer.');
      return this.el.querySelector('[name=name]').focus();
    }
    if (this.step < this.titles.length - 1) { this.step++; this.render(); } else this.finish();
  },

  onClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'back') { this.collect(); this.step--; this.render(); }
    else if (btn.dataset.act === 'cancel') this.close();
    else if (btn.dataset.act === 'addsport') this.addSport();
    else if (btn.dataset.sport) {                              // cocher / décocher un sport
      const name = btn.dataset.sport, i = this.sports.findIndex((s) => s.name === name);
      if (i >= 0) this.sports.splice(i, 1);
      else this.sports.push({ id: slug(name), name, custom: !DEFAULT_SPORTS.includes(name) });
      btn.setAttribute('aria-pressed', String(i < 0));
    }
  },

  addSport() {
    const input = this.el.querySelector('[name=newsport]'), name = input.value.trim();
    if (!name) return;
    if (!this.sports.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      this.sports.push({ id: slug(name) || Store.uid(), name, custom: !DEFAULT_SPORTS.includes(name) });
    this.render();
  },

  // Photo : recadrée en carré 256 px puis compressée, pour ne pas saturer le LocalStorage.
  onChange(e) {
    if (e.target.name !== 'photofile' || !e.target.files[0]) return;
    const img = new Image(), url = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      const side = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      this.data.photo = c.toDataURL('image/jpeg', 0.8);
      document.getElementById('wz-avatar').innerHTML = avatarHTML(this.data);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  },

  // Enregistrement final : profil, sports et premier point de la courbe de poids.
  finish() {
    Store.update((s) => {
      s.profile = { ...this.data, createdAt: (s.profile && s.profile.createdAt) || new Date().toISOString() };
      s.sports = this.sports;
      const kg = parseFloat(this.data.weight), last = s.weights[s.weights.length - 1];
      if (kg > 0 && (!last || last.kg !== kg)) s.weights.push({ date: new Date().toISOString().slice(0, 10), kg });
    });
    this.close();
    Router.render();
    UI.toast(this.edit ? 'Profil mis à jour.' : `Bienvenue, ${this.data.name} !`);
  },
};

/* ---------- 5c. VUES ACCUEIL ET PARAMÈTRES (remplacent les vues par défaut) ---------- */
Views.accueil = (el) => {
  const p = Store.get().profile, page = PAGES[0];
  defaultView({ ...page, label: p ? `Bonjour ${esc(p.name)}` : page.label })(el);
};

Views.parametres = (el) => {
  const s = Store.get(), p = s.profile || {}, th = s.settings.theme;
  const sports = s.sports.length ? s.sports.map((x) => esc(x.name)).join(', ') : 'Aucun sport choisi';
  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Profil, thème et sports.</p></header>
    <section class="card stack">
      <div class="photo-row"><div class="avatar">${avatarHTML(p)}</div>
        <div><h2>${esc(p.name || 'Profil non configuré')}</h2><p class="muted">${sports}</p></div></div>
      <div class="row"><button class="btn" data-act="profile">Modifier le profil</button>
        <button class="btn btn-ghost" data-act="sports">Modifier mes sports</button></div>
    </section>
    <section class="card stack"><h2>Thème</h2><div class="chips">
      ${[['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, l]) =>
        `<button type="button" class="chip" data-theme="${v}" aria-pressed="${th === v}">${l}</button>`).join('')}
    </div></section>`;
  el.querySelector('[data-act=profile]').onclick = () => Wizard.open(true, 0);
  el.querySelector('[data-act=sports]').onclick = () => Wizard.open(true, 2);
  el.querySelectorAll('[data-theme]').forEach((b) => b.onclick = () => { UI.setTheme(b.dataset.theme); Views.parametres(el); });
};

/* ---------- 5d. SÉANCES : modèle, formulaire, liste ----------
   Une séance = { id, date 'AAAA-MM-JJ', sport, status, effort, duration (min),
                  distance (km), intensity (1-10), notes }.
   Elles sont stockées dans Store.get().sessions, donc dans le LocalStorage.   */
Object.assign(ICONS, {
  left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>', plus: '<path d="M12 5v14M5 12h14"/>',
});

// Statuts et couleurs imposés : vert = réalisée, orange = prévue, rouge = annulée, gris = repos.
const STATUS = {
  done:      { label: 'Réalisée', css: 'var(--done)' },
  planned:   { label: 'Prévue',   css: 'var(--planned)' },
  cancelled: { label: 'Annulée',  css: 'var(--cancelled)' },
  rest:      { label: 'Repos',    css: 'var(--rest)' },
};
const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];

// Outils de dates (heure locale, jamais UTC, pour éviter les décalages d'un jour).
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

// Redessine la page courante sans animation (utilisé après chaque modification).
const refreshView = () => {
  const id = PAGES.some((p) => p.id === Router.current()) ? Router.current() : PAGES[0].id;
  Views[id](document.getElementById('view'));
};

// État du calendrier : mois affiché et jour sélectionné.
const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

const SessionForm = {
  // session = séance à modifier (ou modèle à dupliquer) ; date = jour proposé pour une nouvelle séance
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;           // pas d'id = nouvelle séance
    this.data = { date: day, sport: '', status: day <= todayStr() ? 'done' : 'planned',
                  effort: 'Endurance', duration: '', distance: '', intensity: 5, notes: '', ...(session || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
    this.el.querySelector('[name=duration]').focus();
  },
  close() { this.el.remove(); },

  render() {
    const d = this.data, chosen = Store.get().sports.map((s) => s.name);
    const names = chosen.length ? chosen : DEFAULT_SPORTS;          // sports du profil, sinon liste par défaut
    if (d.sport && !names.includes(d.sport)) names.push(d.sport);
    const opts = (list, cur) => list.map((n) => `<option ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('');
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <fieldset class="field"><legend>Statut</legend><div class="chips">
          ${Object.entries(STATUS).map(([k, v]) => `<label class="chip"><input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}>${v.label}</label>`).join('')}
        </div></fieldset>
        <div class="grid2">
          <label class="field">Sport<select name="sport">${opts(names, d.sport)}</select></label>
          <label class="field">Date<input type="date" name="date" value="${d.date}" required></label>
        </div>
        <div class="grid2">
          <label class="field">Type d'effort<select name="effort">${opts(EFFORTS, d.effort)}</select></label>
          <label class="field">Durée (min)<input type="number" inputmode="numeric" name="duration" min="0" value="${esc(d.duration)}"></label>
        </div>
        <div class="grid2">
          <label class="field">Distance (km, facultatif)<input type="number" inputmode="decimal" name="distance" min="0" step="0.01" value="${esc(d.distance)}"></label>
          <label class="field">Intensité : <output>${d.intensity}</output> / 10
            <input class="range" type="range" name="intensity" min="1" max="10" value="${d.intensity}"></label>
        </div>
        <label class="field">Notes<textarea name="notes" rows="3" maxlength="500">${esc(d.notes)}</textarea></label>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
    form.addEventListener('input', (e) => { if (e.target.name === 'intensity') form.querySelector('output').textContent = e.target.value; });
  },

  // Validation puis écriture dans le Store (→ LocalStorage).
  save(form) {
    const f = new FormData(form);
    const data = {
      date: f.get('date'), sport: f.get('sport') || '', status: f.get('status'), effort: f.get('effort'),
      duration: Math.max(0, parseInt(f.get('duration'), 10) || 0),
      distance: Math.max(0, parseFloat(f.get('distance')) || 0),
      intensity: parseInt(f.get('intensity'), 10), notes: String(f.get('notes')).trim(),
    };
    if (!data.date) return UI.toast('Choisissez une date.');
    Store.update((s) => {
      const i = this.id ? s.sessions.findIndex((x) => x.id === this.id) : -1;
      if (i >= 0) s.sessions[i] = { ...s.sessions[i], ...data };       // modification (ou déplacement si la date change)
      else s.sessions.push({ id: Store.uid(), createdAt: Date.now(), ...data });
    });
    // Le calendrier se place sur le jour enregistré pour que la séance soit visible tout de suite.
    const [y, m] = data.date.split('-').map(Number);
    Object.assign(Cal, { y, m: m - 1, sel: data.date });
    this.close();
    refreshView();
    UI.toast(this.id ? 'Séance modifiée.' : 'Séance enregistrée.');
  },
};

// Carte d'une séance (utilisée par le calendrier et par la page Séances).
const sessionItem = (s, withDate) => {
  const st = STATUS[s.status] || STATUS.planned;
  const tags = [s.status !== 'rest' && s.effort, s.duration && `${s.duration} min`, s.distance && `${s.distance} km`,
                s.status !== 'rest' && `intensité ${s.intensity}/10`].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('');
  const btn = (act, label) => `<button type="button" class="btn btn-ghost" data-act="${act}" data-id="${s.id}">${label}</button>`;
  return `<article class="item" style="--c:${st.css}">
    <div class="item-main">
      <h3>${s.status === 'rest' ? 'Jour de repos' : esc(s.sport)}</h3>
      <p class="muted">${withDate ? fmtDate(s.date) + ', ' : ''}${st.label}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ''}${s.notes ? `<p class="note">${esc(s.notes)}</p>` : ''}
    </div>
    <div class="item-actions">${btn('edit', 'Modifier')}${btn('dup', 'Dupliquer')}${btn('del', 'Supprimer')}</div>
  </article>`;
};

// Branche les boutons Modifier / Dupliquer / Supprimer d'une zone de la page.
const bindSessionActions = (el) => el.querySelectorAll('[data-act][data-id]').forEach((b) => b.onclick = () => {
  const s = Store.get().sessions.find((x) => x.id === b.dataset.id);
  if (!s) return;
  if (b.dataset.act === 'edit') SessionForm.open(s);
  else if (b.dataset.act === 'dup') SessionForm.open({ ...s, id: undefined, status: 'planned' }, s.date);  // copie à ajuster
  else if (confirm('Supprimer cette séance ?')) {
    Store.update((st) => { st.sessions = st.sessions.filter((x) => x.id !== s.id); });
    refreshView(); UI.toast('Séance supprimée.');
  }
});

// Page « Séances » : toutes les séances, de la plus récente à la plus ancienne.
Views.seances = (el) => {
  const page = PAGES[2], list = [...Store.get().sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvelle séance</button></div>
    ${list.length ? `<div class="list">${list.map((s) => sessionItem(s, true)).join('')}</div>`
      : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, todayStr());
  bindSessionActions(el);
};

/* ---------- 5e. CALENDRIER MENSUEL ---------- */
Views.calendrier = (el) => {
  const sessions = Store.get().sessions, first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;                          // la semaine commence le lundi
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();
  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`, list = sessions.filter((s) => s.date === key);
    const dots = list.slice(0, 4).map((s) => `<i style="background:${(STATUS[s.status] || STATUS.planned).css}"></i>`).join('');
    cells += `<button type="button" class="day${key === todayStr() ? ' today' : ''}" data-date="${key}" aria-pressed="${key === Cal.sel}"
      aria-label="${fmtDate(key)}, ${list.length} séance(s)"><b>${d}</b><span class="dots">${dots}</span></button>`;
  }
  const dayList = sessions.filter((s) => s.date === Cal.sel);
  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>${PAGES[1].sub}</p></header>
    <div class="toolbar">
      <button class="btn btn-ghost btn-icon" data-nav="-1" aria-label="Mois précédent">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost btn-icon" data-nav="1" aria-label="Mois suivant">${icon('right')}</button>
      <button class="btn btn-ghost" data-today>Aujourd'hui</button>
    </div>
    <div class="legend">${Object.values(STATUS).map((v) => `<span><i style="background:${v.css}"></i>${v.label}</span>`).join('')}</div>
    <div class="cal">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w) => `<span class="wd">${w}</span>`).join('')}${cells}</div>
    <div class="toolbar"><h2 class="day-title">${fmtDate(Cal.sel)}</h2><button class="btn" data-new>${icon('plus')}Ajouter</button></div>
    <div class="list">${dayList.length ? dayList.map((s) => sessionItem(s, false)).join('')
      : '<p class="muted">Rien de prévu ce jour-là.</p>'}</div>`;

  el.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => {
    const d = new Date(Cal.y, Cal.m + Number(b.dataset.nav), 1);
    Cal.y = d.getFullYear(); Cal.m = d.getMonth(); Views.calendrier(el);
  });
  el.querySelector('[data-today]').onclick = () => {
    const n = new Date(); Object.assign(Cal, { y: n.getFullYear(), m: n.getMonth(), sel: todayStr() }); Views.calendrier(el);
  };
  el.querySelectorAll('.day').forEach((b) => b.onclick = () => { Cal.sel = b.dataset.date; Views.calendrier(el); });
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, Cal.sel);
  bindSessionActions(el);
};

/* ---------- 6. ROUTEUR (hash : #/seances) ---------- */
const Router = {
  current: () => (location.hash.replace('#/', '') || PAGES[0].id),

  render() {
    const id = PAGES.some((p) => p.id === this.current()) ? this.current() : PAGES[0].id;
    const view = document.getElementById('view');
    Views[id](view);
    // Rejoue l'animation d'entrée, puis place le focus sur le contenu (accessibilité).
    view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    // Marque le lien actif dans les deux menus.
    document.querySelectorAll('[data-page]').forEach((a) => {
      if (a.dataset.page === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = `${PAGES.find((p) => p.id === id).label} · Sport Journal`;
  },
};

// Construit les deux menus (latéral + mobile) à partir de PAGES : une seule source de vérité.
function buildNavigation() {
  const link = (p) => `<a href="#/${p.id}" data-page="${p.id}">${icon(p.icon)}<span>${p.label}</span></a>`;
  document.getElementById('nav-side').innerHTML = PAGES.map(link).join('');
  document.getElementById('nav-tab').innerHTML = PAGES.map(link).join('');
}

/* ---------- 7. DÉMARRAGE ---------- */
function init() {
  buildNavigation();
  UI.applyTheme();
  document.getElementById('theme-btn').addEventListener('click', () => UI.cycleTheme());
  window.addEventListener('hashchange', () => Router.render());
  Router.render();
  if (!Store.get().profile) Wizard.open(false);   // premier lancement

  // Mode hors ligne : enregistrement du service worker (nécessite HTTPS, fourni par Netlify).
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch((e) => console.warn('SW', e));
  }
}
document.addEventListener('DOMContentLoaded', init);
/* ---------- 5b. ASSISTANT DE CONFIGURATION ---------- */
const DEFAULT_SPORTS = ['Course', 'Natation', 'Cyclisme', 'Musculation', 'Pilates',
                        'Yoga', 'Tennis', 'Marche', 'CrossFit', 'Triathlon'];
const MAIN_GOALS = ['Perdre du poids', 'Prendre de la masse', 'Améliorer mon endurance',
                    'Préparer une compétition', 'Rester en forme', 'Reprendre le sport'];

const Wizard = {
  titles: ['Qui êtes-vous ?', 'Vos mensurations', 'Quels sports pratiquez-vous ?'],
  open(edit = false, step = 0) {
    const s = Store.get();
    this.data = { name: '', photo: '', birth: '', sex: '', height: '', weight: '', target: '', goal: '', ...(s.profile || {}) };
    this.sports = s.sports.map((x) => ({ ...x }));
    this.edit = edit; this.step = step;
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const last = this.step === this.titles.length - 1;
    const back = this.step > 0 ? '<button type="button" class="btn btn-ghost" data-act="back">Retour</button>'
               : this.edit ? '<button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>' : '<span></span>';
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <div class="progress" aria-hidden="true">${this.titles.map((_, i) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</div>
        <h2>${this.step === 0 && !this.edit ? 'Bienvenue ! ' : ''}${this.titles[this.step]}</h2>
        ${[this.stepIdentity, this.stepBody, this.stepSports][this.step].call(this)}
        <div class="actions">${back}<button class="btn" type="submit">${last ? (this.edit ? 'Enregistrer' : 'Commencer') : 'Suivant'}</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.next(); });
    form.addEventListener('click', (e) => this.onClick(e));
    form.addEventListener('change', (e) => this.onChange(e));
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.name === 'newsport') { e.preventDefault(); this.addSport(); }
    });
  },

  stepIdentity() {
    const d = this.data, today = new Date().toISOString().slice(0, 10);
    return `
      <div class="photo-row">
        <div class="avatar" id="wz-avatar">${avatarHTML(d)}</div>
        <label class="btn btn-ghost">Choisir une photo<input type="file" name="photofile" accept="image/*" hidden></label>
      </div>
      <label class="field">Prénom ou nom
        <input name="name" value="${esc(d.name)}" maxlength="40" autocomplete="given-name" required></label>
      <label class="field">Date de naissance
        <input type="date" name="birth" value="${d.birth}" max="${today}"></label>
      <fieldset class="field"><legend>Sexe</legend><div class="chips">
        ${['Femme', 'Homme', 'Autre'].map((v) => `<label class="chip"><input type="radio" name="sex" value="${v}" ${d.sex === v ? 'checked' : ''}>${v}</label>`).join('')}
      </div></fieldset>`;
  },

  stepBody() {
    const d = this.data;
    const num = (name, label, v, step) => `<label class="field">${label}
      <input type="number" inputmode="decimal" name="${name}" value="${esc(v)}" min="0" step="${step}"></label>`;
    return `
      <div class="grid3">${num('height', 'Taille (cm)', d.height, 1)}${num('weight', 'Poids (kg)', d.weight, 0.1)}${num('target', 'Poids cible (kg)', d.target, 0.1)}</div>
      <fieldset class="field"><legend>Objectif principal</legend><div class="chips">
        ${MAIN_GOALS.map((g) => `<label class="chip"><input type="radio" name="goal" value="${g}" ${d.goal === g ? 'checked' : ''}>${g}</label>`).join('')}
      </div></fieldset>`;
  },

  stepSports() {
    const names = [...DEFAULT_SPORTS, ...this.sports.filter((s) => s.custom).map((s) => s.name)];
    const chips = [...new Set(names)].map((n) =>
      `<button type="button" class="chip" data-sport="${esc(n)}" aria-pressed="${this.sports.some((s) => s.name === n)}">${esc(n)}</button>`).join('');
    return `
      <div class="chips">${chips}</div>
      <div class="add-row"><input name="newsport" placeholder="Créer mon propre sport" maxlength="30">
        <button type="button" class="btn btn-ghost" data-act="addsport">Ajouter</button></div>`;
  },

  collect() {
    const f = new FormData(this.el.querySelector('form'));
    for (const k of ['name', 'birth', 'sex', 'height', 'weight', 'target', 'goal'])
      if (f.has(k)) this.data[k] = String(f.get(k)).trim();
  },

  next() {
    this.collect();
    if (this.step === 0 && !this.data.name) {
      UI.toast('Indiquez votre prénom pour continuer.');
      return this.el.querySelector('[name=name]').focus();
    }
    if (this.step < this.titles.length - 1) { this.step++; this.render(); } else this.finish();
  },

  onClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'back') { this.collect(); this.step--; this.render(); }
    else if (btn.dataset.act === 'cancel') this.close();
    else if (btn.dataset.act === 'addsport') this.addSport();
    else if (btn.dataset.sport) {
      const name = btn.dataset.sport, i = this.sports.findIndex((s) => s.name === name);
      if (i >= 0) this.sports.splice(i, 1);
      else this.sports.push({ id: slug(name), name, custom: !DEFAULT_SPORTS.includes(name) });
      btn.setAttribute('aria-pressed', String(i < 0));
    }
  },

  addSport() {
    const input = this.el.querySelector('[name=newsport]'), name = input.value.trim();
    if (!name) return;
    if (!this.sports.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      this.sports.push({ id: slug(name) || Store.uid(), name, custom: !DEFAULT_SPORTS.includes(name) });
    this.render();
  },

  onChange(e) {
    if (e.target.name !== 'photofile' || !e.target.files[0]) return;
    const img = new Image(), url = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      const side = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      this.data.photo = c.toDataURL('image/jpeg', 0.8);
      const av = document.getElementById('wz-avatar');
      if (av) av.innerHTML = avatarHTML(this.data);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  },

  finish() {
    Store.update((s) => {
      s.profile = { ...this.data, createdAt: (s.profile && s.profile.createdAt) || new Date().toISOString() };
      s.sports = this.sports;
      const kg = parseFloat(this.data.weight), last = s.weights[s.weights.length - 1];
      if (kg > 0 && (!last || last.kg !== kg)) s.weights.push({ date: new Date().toISOString().slice(0, 10), kg });
    });
    this.close();
    Router.render();
    UI.toast(this.edit ? 'Profil mis à jour.' : `Bienvenue, ${this.data.name} !`);
  },
};

/* ---------- 5c. GESTION DES OBJECTIFS ---------- */
const GoalForm = {
  open(goal) {
    this.id = goal ? goal.id : null;
    this.data = { title: '', type: 'distance', target: 100, current: 0, deadline: '', unit: 'km', ...(goal || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const types = [
      { id: 'distance', label: 'Distance totale (km)', unit: 'km' },
      { id: 'sessions', label: 'Nombre de séances', unit: 'séances' },
      { id: 'duration', label: 'Temps d\'entraînement (heures)', unit: 'heures' },
      { id: 'weight', label: 'Poids cible (kg)', unit: 'kg' }
    ];
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h2>
        <label class="field">Intitulé de l'objectif
          <input name="title" value="${esc(d.title)}" placeholder="ex: Courir 500km cette année" required></label>
        <label class="field">Type d'objectif
          <select name="type">
            ${types.map(t => `<option value="${t.id}" ${d.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </label>
        <div class="grid2">
          <label class="field">Valeur cible<input type="number" step="any" name="target" value="${d.target}" required></label>
          <label class="field">Échéance<input type="date" name="deadline" value="${d.deadline}"></label>
        </div>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
  },

  save(form) {
    const f = new FormData(form);
    const title = f.get('title').trim();
    const type = f.get('type');
    const target = parseFloat(f.get('target')) || 0;
    const deadline = f.get('deadline');
    if (!title) return UI.toast('Veuillez saisir un intitulé.');

    Store.update((s) => {
      const i = this.id ? s.goals.findIndex(g => g.id === this.id) : -1;
      const newGoal = { id: this.id || Store.uid(), title, type, target, deadline };
      if (i >= 0) s.goals[i] = { ...s.goals[i], ...newGoal };
      else s.goals.push(newGoal);
    });
    this.close();
    refreshView();
    UI.toast('Objectif enregistré.');
  }
};

const calculateGoalProgress = (goal, s) => {
  const sessions = s.sessions.filter(se => se.status === 'done');
  if (goal.type === 'distance') {
    return sessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  } else if (goal.type === 'sessions') {
    return sessions.length;
  } else if (goal.type === 'duration') {
    const totalMins = sessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
    return parseFloat((totalMins / 60).toFixed(1));
  } else if (goal.type === 'weight') {
    const lastW = s.weights[s.weights.length - 1];
    return lastW ? lastW.kg : (s.profile ? parseFloat(s.profile.weight) || 0 : 0);
  }
  return 0;
};

Views.objectifs = (el) => {
  const page = PAGES[3], s = Store.get();
  const goals = s.goals;
  
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvel objectif</button></div>
    ${goals.length ? `<div class="list">${goals.map(g => {
      const current = calculateGoalProgress(g, s);
      const pct = Math.min(100, Math.round((current / (g.target || 1)) * 100));
      const unit = g.type === 'distance' ? 'km' : g.type === 'duration' ? 'h' : g.type === 'weight' ? 'kg' : 'séances';
      return `
        <article class="item" style="--c:var(--accent)">
          <div class="item-main">
            <h3>${esc(g.title)}</h3>
            <p class="muted">Échéance : ${g.deadline ? fmtDate(g.deadline) : 'Aucune'} — Progression : <b>${current} / ${g.target} ${unit}</b> (${pct}%)</p>
            <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${pct}%"></div></div>
          </div>
          <div class="item-actions">
            <button type="button" class="btn btn-ghost" data-act="edit" data-id="${g.id}">Modifier</button>
            <button type="button" class="btn btn-ghost" data-act="del" data-id="${g.id}">Supprimer</button>
          </div>
        </article>`;
    }).join('')}</div>`
    : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;

  el.querySelector('[data-new]').onclick = () => GoalForm.open(null);
  el.querySelectorAll('[data-act=edit]').forEach(b => b.onclick = () => {
    const g = s.goals.find(x => x.id === b.dataset.id);
    if (g) GoalForm.open(g);
  });
  el.querySelectorAll('[data-act=del]').forEach(b => b.onclick = () => {
    if (confirm('Supprimer cet objectif ?')) {
      Store.update(st => { st.goals = st.goals.filter(x => x.id !== b.dataset.id); });
      refreshView();
      UI.toast('Objectif supprimé.');
    }
  });
};

/* ---------- 5d. SÉANCES ---------- */
const STATUS = {
  done:      { label: 'Réalisée', css: 'var(--done)' },
  planned:   { label: 'Prévue',   css: 'var(--planned)' },
  cancelled: { label: 'Annulée',  css: 'var(--cancelled)' },
  rest:      { label: 'Repos',    css: 'var(--rest)' },
};
const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];

const SessionForm = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    const totalMins = session ? (session.duration || 0) : 0;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    this.data = { date: day, sport: '', status: day <= todayStr() ? 'done' : 'planned',
                  effort: 'Endurance', hours, mins, distance: '', intensity: 5, notes: '', ...(session ? { ...session, hours, mins } : {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data, chosen = Store.get().sports.map((s) => s.name);
    const names = chosen.length ? chosen : DEFAULT_SPORTS;
    if (d.sport && !names.includes(d.sport)) names.push(d.sport);
    const opts = (list, cur) => list.map((n) => `<option ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('');
    
    this.el.innerHTML = `
      <form class="sheet card" novalidate>
        <h2>${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <fieldset class="field"><legend>Statut</legend><div class="chips">
          ${Object.entries(STATUS).map(([k, v]) => `<label class="chip"><input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}>${v.label}</label>`).join('')}
        </div></fieldset>
        <div class="grid2">
          <label class="field">Sport<select name="sport">${opts(names, d.sport)}</select></label>
          <label class="field">Date<input type="date" name="date" value="${d.date}" required></label>
        </div>
        <div class="grid2">
          <label class="field">Type d'effort<select name="effort">${opts(EFFORTS, d.effort)}</select></label>
          <div class="field">Durée
            <div class="grid2" style="gap:4px;">
              <input type="number" inputmode="numeric" name="hours" min="0" placeholder="Heures" value="${d.hours || 0}">
              <input type="number" inputmode="numeric" name="mins" min="0" max="59" placeholder="Minutes" value="${d.mins || 0}">
            </div>
          </div>
        </div>
        <div class="grid2">
          <label class="field">Distance (km, facultatif)<input type="number" inputmode="decimal" name="distance" min="0" step="0.01" value="${esc(d.distance)}"></label>
          <label class="field">Intensité : <output>${d.intensity}</output> / 10
            <input class="range" type="range" name="intensity" min="1" max="10" value="${d.intensity}"></label>
        </div>
        <label class="field">Notes<textarea name="notes" rows="3" maxlength="500">${esc(d.notes)}</textarea></label>
        <div class="actions"><button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>
          <button class="btn" type="submit">Enregistrer</button></div>
      </form>`;
    const form = this.el.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); this.save(form); });
    form.addEventListener('click', (e) => { if (e.target.dataset.act === 'cancel') this.close(); });
    form.addEventListener('input', (e) => { if (e.target.name === 'intensity') form.querySelector('output').textContent = e.target.value; });
  },

  save(form) {
    const f = new FormData(form);
    const h = parseInt(f.get('hours'), 10) || 0;
    const m = parseInt(f.get('mins'), 10) || 0;
    const totalDurationMinutes = (h * 60) + m;

    const data = {
      date: f.get('date'), sport: f.get('sport') || '', status: f.get('status'), effort: f.get('effort'),
      duration: totalDurationMinutes,
      distance: Math.max(0, parseFloat(f.get('distance')) || 0),
      intensity: parseInt(f.get('intensity'), 10), notes: String(f.get('notes')).trim(),
    };
    if (!data.date) return UI.toast('Choisissez une date.');
    Store.update((s) => {
      const i = this.id ? s.sessions.findIndex((x) => x.id === this.id) : -1;
      if (i >= 0) s.sessions[i] = { ...s.sessions[i], ...data };
      else s.sessions.push({ id: Store.uid(), createdAt: Date.now(), ...data });
    });
    const [y, mth] = data.date.split('-').map(Number);
    Object.assign(Cal, { y, m: mth - 1, sel: data.date });
    this.close();
    refreshView();
    UI.toast(this.id ? 'Séance modifiée.' : 'Séance enregistrée.');
  },
};

const sessionItem = (s, withDate) => {
  const st = STATUS[s.status] || STATUS.planned;
  const tags = [
    s.status !== 'rest' && s.effort, 
    s.duration > 0 && formatDuration(s.duration), 
    s.distance > 0 && `${s.distance} km`,
    s.status !== 'rest' && `intensité ${s.intensity}/10`
  ].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('');
  const btn = (act, label) => `<button type="button" class="btn btn-ghost" data-act="${act}" data-id="${s.id}">${label}</button>`;
  return `<article class="item" style="--c:${st.css}">
    <div class="item-main">
      <h3>${s.status === 'rest' ? 'Jour de repos' : esc(s.sport)}</h3>
      <p class="muted">${withDate ? fmtDate(s.date) + ' — ' : ''}${st.label}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ''}${s.notes ? `<p class="note">${esc(s.notes)}</p>` : ''}
    </div>
    <div class="item-actions">${btn('edit', 'Modifier')}${btn('dup', 'Dupliquer')}${btn('del', 'Supprimer')}</div>
  </article>`;
};

const bindSessionActions = (el) => el.querySelectorAll('[data-act][data-id]').forEach((b) => b.onclick = () => {
  const s = Store.get().sessions.find((x) => x.id === b.dataset.id);
  if (!s) return;
  if (b.dataset.act === 'edit') SessionForm.open(s);
  else if (b.dataset.act === 'dup') SessionForm.open({ ...s, id: undefined, status: 'planned' }, s.date);
  else if (confirm('Supprimer cette séance ?')) {
    Store.update((st) => { st.sessions = st.sessions.filter((x) => x.id !== s.id); });
    refreshView(); UI.toast('Séance supprimée.');
  }
});

Views.seances = (el) => {
  const page = PAGES[2], list = [...Store.get().sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="toolbar"><button class="btn" data-new>${icon('plus')}Nouvelle séance</button></div>
    ${list.length ? `<div class="list">${list.map((s) => sessionItem(s, true)).join('')}</div>`
      : `<section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`}`;
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, todayStr());
  bindSessionActions(el);
};

/* ---------- 5e. CALENDRIER MENSUEL ---------- */
const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

Views.calendrier = (el) => {
  const sessions = Store.get().sessions, first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();
  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`, list = sessions.filter((s) => s.date === key);
    const dots = list.slice(0, 4).map((s) => `<i style="background:${(STATUS[s.status] || STATUS.planned).css}"></i>`).join('');
    cells += `<button type="button" class="day${key === todayStr() ? ' today' : ''}" data-date="${key}" aria-pressed="${key === Cal.sel}"
      aria-label="${fmtDate(key)}, ${list.length} séance(s)"><b>${d}</b><span class="dots">${dots}</span></button>`;
  }
  const dayList = sessions.filter((s) => s.date === Cal.sel);
  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>${PAGES[1].sub}</p></header>
    <div class="toolbar">
      <button class="btn btn-ghost btn-icon" data-nav="-1" aria-label="Mois précédent">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost btn-icon" data-nav="1" aria-label="Mois suivant">${icon('right')}</button>
      <button class="btn btn-ghost" data-today>Aujourd'hui</button>
    </div>
    <div class="legend">${Object.values(STATUS).map((v) => `<span><i style="background:${v.css}"></i>${v.label}</span>`).join('')}</div>
    <div class="cal">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w) => `<span class="wd">${w}</span>`).join('')}${cells}</div>
    <div class="toolbar"><h2 class="day-title">${fmtDate(Cal.sel)}</h2><button class="btn" data-new>${icon('plus')}Ajouter</button></div>
    <div class="list">${dayList.length ? dayList.map((s) => sessionItem(s, false)).join('')
      : '<p class="muted">Rien de prévu ce jour-là.</p>'}</div>`;

  el.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => {
    const d = new Date(Cal.y, Cal.m + Number(b.dataset.nav), 1);
    Cal.y = d.getFullYear(); Cal.m = d.getMonth(); Views.calendrier(el);
  });
  el.querySelector('[data-today]').onclick = () => {
    const n = new Date(); Object.assign(Cal, { y: n.getFullYear(), m: n.getMonth(), sel: todayStr() }); Views.calendrier(el);
  };
  el.querySelectorAll('.day').forEach((b) => b.onclick = () => { Cal.sel = b.dataset.date; Views.calendrier(el); });
  el.querySelector('[data-new]').onclick = () => SessionForm.open(null, Cal.sel);
  bindSessionActions(el);
};

/* ---------- 5f. STATISTIQUES ---------- */
Views.statistiques = (el) => {
  const page = PAGES[4], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length && !s.weights.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }

  const totalDist = doneSessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  const totalMins = doneSessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
  const totalCount = doneSessions.length;

  const sportsMap = {};
  doneSessions.forEach(se => {
    const sp = se.sport || 'Autre';
    sportsMap[sp] = (sportsMap[sp] || 0) + (parseInt(se.duration) || 1);
  });

  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="grid3" style="margin-bottom:24px;">
      <div class="card" style="padding:16px;"><h2>${totalCount}</h2><p class="muted">Séances réalisées</p></div>
      <div class="card" style="padding:16px;"><h2>${formatDuration(totalMins)}</h2><p class="muted">Temps total</p></div>
      <div class="card" style="padding:16px;"><h2>${totalDist.toFixed(1)} km</h2><p class="muted">Distance totale</p></div>
    </div>
    
    <div class="card stack" style="margin-bottom:24px;">
      <h2>Répartition du temps par sport</h2>
      <div style="position: relative; height: 260px; width: 100%;">
        <canvas id="statsChart"></canvas>
      </div>
    </div>

    ${s.weights.length ? `
    <div class="card stack">
      <h2>Évolution du poids</h2>
      <div style="position: relative; height: 240px; width: 100%;">
        <canvas id="weightChart"></canvas>
      </div>
    </div>` : ''}
  `;

  setTimeout(() => {
    if (typeof Chart === 'undefined') return;

    const sportsKeys = Object.keys(sportsMap);
    if (sportsKeys.length > 0) {
      const ctx = document.getElementById('statsChart');
      if (ctx) {
        new Chart(ctx.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: sportsKeys,
            datasets: [{
              data: Object.values(sportsMap),
              backgroundColor: ['#2F57F0', '#1FA971', '#F59E0B', '#E5484D', '#98A2B3', '#6B8CFF']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    if (s.weights.length > 0) {
      const sortedWeights = [...s.weights].sort((a, b) => a.date.localeCompare(b.date));
      const ctxWeight = document.getElementById('weightChart');
      if (ctxWeight) {
        new Chart(ctxWeight.getContext('2d'), {
          type: 'line',
          data: {
            labels: sortedWeights.map(w => w.date),
            datasets: [{
              label: 'Poids (kg)',
              data: sortedWeights.map(w => w.kg),
              borderColor: '#2F57F0',
              backgroundColor: 'rgba(47, 87, 240, 0.1)',
              fill: true,
              tension: 0.2
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  }, 50);
};

/* ---------- 5g. RECORDS ET STATISTIQUES AMUSANTES ---------- */
Views.records = (el) => {
  const page = PAGES[5], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  
  if (!doneSessions.length) {
    el.innerHTML = `
      <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
      <section class="card empty">${icon(page.icon)}<h2>${page.empty[0]}</h2><p>${page.empty[1]}</p></section>`;
    return;
  }
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <section class="card"><h2>Vos records</h2><p class="muted">Fonctionnalité en cours de développement.</p></section>`;
};

/* ---------- 5h. PARAMÈTRES ---------- */
Views.parametres = (el) => {
  const page = PAGES[6], s = Store.get();
  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <section class="card stack">
      <h2>Profil utilisateur</h2>
      <p class="muted">${s.profile ? `Connecté en tant que <b>${esc(s.profile.name)}</b>` : 'Aucun profil configuré.'}</p>
      <button class="btn" id="edit-profile">Modifier le profil</button>
    </section>
  `;
  const btn = el.querySelector('#edit-profile');
  if (btn) btn.onclick = () => Wizard.open(true, 0);
};

/* ---------- 6. ROUTEUR ---------- */
const Router = {
  current() {
    const hash = window.location.hash.slice(1);
    return PAGES.some(p => p.id === hash) ? hash : PAGES[0].id;
  },
  render() {
    const id = this.current();
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
    refreshView();
  },
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  }
};

/* ---------- 7. INITIALISATION GLOBALE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  UI.applyTheme();
  
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.onclick = () => UI.cycleTheme();

  if (!Store.get().profile) {
    Wizard.open(false, 0);
  }

  Router.init();
});
