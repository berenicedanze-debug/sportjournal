'use strict';

/* ---------- CONFIGURATION & PAGES ---------- */
const APP = { storageKey: 'sportjournal:v2' };

const PAGES = [
  { id: 'accueil',     label: 'Accueil',      icon: 'home',     sub: 'Votre tableau de bord personnel.' },
  { id: 'calendrier',  label: 'Calendrier',   icon: 'calendar', sub: 'Planifiez et revoyez vos entraînements.' },
  { id: 'seances',     label: 'Séances',      icon: 'run',      sub: 'Toutes vos séances, sport par sport.' },
  { id: 'objectifs',   label: 'Objectifs',    icon: 'target',   sub: 'Fixez un cap et suivez votre progression.' },
  { id: 'statistiques',label: 'Statistiques', icon: 'chart',    sub: 'Vos chiffres calculés automatiquement.' },
  { id: 'records',     label: 'Records',      icon: 'trophy',   sub: 'Vos meilleures performances.' },
  { id: 'parametres',  label: 'Paramètres',   icon: 'gear',     sub: 'Profil, sports et configuration.' }
];

/* ---------- ICÔNES SVG ---------- */
const ICONS = {
  home:     '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  run:      '<circle cx="14" cy="4.5" r="2"/><path d="M8 21l3-6 3 2v4M11 15l-1-5 4-2 3 4h3M6 12l4-4"/>',
  target:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart:    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  trophy:   '<path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 14v4M8 21h8"/>',
  gear:     '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  left:     '<path d="M15 6l-6 6 6 6"/>',
  right:    '<path d="M9 6l6 6-6 6"/>',
  sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon:     '<path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z"/>',
  auto:     '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>'
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- DONNÉES PAR DÉFAUT (Profil Alexandre) ---------- */
const DEFAULT_SPORTS = [
  { id: 'course', name: 'Course à pied', unit: 'km', color: '#2F57F0' },
  { id: 'cyclisme', name: 'Cyclisme', unit: 'km', color: '#F59E0B' },
  { id: 'natation', name: 'Natation', unit: 'm', color: '#06B6D4' },
  { id: 'musculation', name: 'Musculation', unit: 'min', color: '#1FA971' }
];

const DEFAULT_SESSIONS = [
  { id: 's1', date: '2026-10-01', sport: 'Course à pied', status: 'done', effort: 'Fractionné', duration: 45, distance: 8.5, intensity: 8, notes: 'Séance tonique au parc.' },
  { id: 's2', date: '2026-10-03', sport: 'Cyclisme', status: 'done', effort: 'Endurance', duration: 90, distance: 35, intensity: 6, notes: 'Sortie vélo route.' },
  { id: 's3', date: '2026-10-05', sport: 'Musculation', status: 'done', effort: 'Force', duration: 50, distance: 0, intensity: 7, notes: 'Focus haut du corps.' },
  { id: 's4', date: '2026-10-07', sport: 'Course à pied', status: 'planned', effort: 'Endurance', duration: 60, distance: 10, intensity: 5, notes: 'Footing de récupération.' }
];

const DEFAULT_GOALS = [
  { id: 'g1', title: 'Courir 100 km ce mois', type: 'distance', target: 100, sport: 'Course à pied', startDate: '2026-10-01', targetDate: '2026-10-31', status: 'active', progress: 0 },
  { id: 'g2', title: 'Effectuer 12 séances', type: 'sessions', target: 12, sport: '', startDate: '2026-10-01', targetDate: '2026-10-31', status: 'active', progress: 0 }
];

/* ---------- STORE (LocalStorage) ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: { name: 'Alexandre', birth: '1995-06-15', sex: 'Homme', height: 178, weight: 72, target: 70, goal: 'Améliorer mon endurance' },
    settings: { theme: 'auto' },
    sports: DEFAULT_SPORTS,
    sessions: DEFAULT_SESSIONS,
    goals: DEFAULT_GOALS,
    cards: ['stats', 'upcoming', 'goals', 'records']
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (e) { return defaults(); }
  };

  let state = load();

  const save = () => {
    try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); } catch (e) {}
  };

  return {
    get: () => state,
    update(fn) { fn(state); save(); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

/* ---------- INTERFACE & THEME ---------- */
const UI = {
  applyTheme() {
    const t = Store.get().settings.theme;
    document.documentElement.dataset.theme = t;
    const btn = document.getElementById('theme-btn');
    if (btn) btn.innerHTML = `${icon(t === 'dark' ? 'moon' : t === 'light' ? 'sun' : 'auto')} Mode ${t}`;
  },
  cycleTheme() {
    const themes = ['auto', 'light', 'dark'];
    Store.update(s => {
      const i = themes.indexOf(s.settings.theme);
      s.settings.theme = themes[(i + 1) % themes.length];
    });
    this.applyTheme();
  },
  toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
};

/* ---------- CALCULS & INTERCONNEXION ---------- */
function getCalculatedStats() {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const totalKm = sessions.reduce((sum, s) => sum + (s.distance || 0), 0);
  const totalMin = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  return {
    count: sessions.length,
    distance: Math.round(totalKm * 10) / 10,
    hours: Math.round((totalMin / 60) * 10) / 10
  };
}

function calculateGoalProgress(g) {
  if (g.type === 'manual') return Math.min(100, g.progress || 0);
  const doneSessions = Store.get().sessions.filter(s => s.status === 'done' && s.date >= g.startDate && (!g.sport || s.sport === g.sport));
  if (g.type === 'sessions') return Math.min(100, Math.round((doneSessions.length / g.target) * 100));
  if (g.type === 'distance') {
    const dist = doneSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
    return Math.min(100, Math.round((dist / g.target) * 100));
  }
  return 0;
}

/* ---------- VUES ---------- */
const Views = {};

Views.accueil = (el) => {
  const p = Store.get().profile;
  const stats = getCalculatedStats();
  const goals = Store.get().goals;
  
  el.innerHTML = `
    <header class="page-head">
      <h1>Bonjour ${p.name || 'Athlète'} !</h1>
      <p>Voici un aperçu de vos performances et de votre activité.</p>
    </header>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card">
        <p class="muted">Séances réalisées</p>
        <h2 style="font-size: 2rem; margin-top: 8px;">${stats.count}</h2>
      </div>
      <div class="card">
        <p class="muted">Distance totale</p>
        <h2 style="font-size: 2rem; margin-top: 8px;">${stats.distance} km</h2>
      </div>
      <div class="card">
        <p class="muted">Temps de sport</p>
        <h2 style="font-size: 2rem; margin-top: 8px;">${stats.hours} h</h2>
      </div>
    </div>

    <section class="card" style="margin-bottom: 24px;">
      <h2>Objectifs en cours</h2>
      <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
        ${goals.map(g => {
          const pct = calculateGoalProgress(g);
          return `
            <div>
              <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px;">
                <span>${g.title}</span>
                <span>${pct}%</span>
              </div>
              <div style="height: 8px; background: var(--hover); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${pct}%; background: var(--accent); transition: width 0.3s;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
};

Views.seances = (el) => {
  const sessions = Store.get().sessions;
  el.innerHTML = `
    <header class="page-head">
      <h1>Vos Séances</h1>
      <p>Consultez et ajoutez vos entraînements.</p>
    </header>
    <div style="margin-bottom: 16px;">
      <button class="btn" id="btn-add-session">${icon('plus')} Nouvelle séance</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${sessions.map(s => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>${s.sport}</h3>
            <p class="muted">${s.date} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''}</p>
            ${s.notes ? `<p style="margin-top: 4px; font-size: 0.9rem;">${s.notes}</p>` : ''}
          </div>
          <span class="chip">${s.status === 'done' ? 'Réalisée' : 'Prévue'}</span>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('btn-add-session').onclick = () => {
    const sport = prompt('Nom du sport :', 'Course à pied');
    const dist = parseFloat(prompt('Distance (km) :', '5')) || 0;
    const dur = parseInt(prompt('Durée (minutes) :', '30'), 10) || 0;
    if (sport) {
      Store.update(s => {
        s.sessions.unshift({
          id: Store.uid(),
          date: new Date().toISOString().slice(0, 10),
          sport,
          distance: dist,
          duration: dur,
          status: 'done'
        });
      });
      Views.seances(el);
      UI.toast('Séance enregistrée !');
    }
  };
};

Views.calendrier = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Calendrier</h1><p>Vue calendrier de vos activités.</p></header><div class="card"><p>Vos séances sont synchronisées avec votre calendrier.</p></div>`;
};
Views.objectifs = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Objectifs</h1><p>Suivi de vos caps sportifs.</p></header><div class="card"><p>Vos objectifs se mettent à jour à chaque séance.</p></div>`;
};
Views.statistiques = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Statistiques</h1><p>Analyse de vos volumes d'entraînement.</p></header><div class="card"><p>Statistiques calculées en fonction de vos données.</p></div>`;
};
Views.records = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Records</h1><p>Vos meilleures performances.</p></header><div class="card"><p>Détection automatique des PRs.</p></div>`;
};
Views.parametres = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Paramètres</h1><p>Gestion du profil.</p></header><div class="card"><button class="btn" id="btn-reset">Réinitialiser les données</button></div>`;
  document.getElementById('btn-reset').onclick = () => {
    localStorage.removeItem(APP.storageKey);
    location.reload();
  };
};

/* ---------- ROUTEUR & NAVIGATION ---------- */
const Router = {
  current: () => location.hash.replace('#/', '') || 'accueil',
  render() {
    const id = PAGES.some(p => p.id === this.current()) ? this.current() : 'accueil';
    const view = document.getElementById('view');
    if (Views[id]) Views[id](view);
    document.querySelectorAll('[data-page]').forEach(a => {
      if (a.dataset.page === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
};

function buildNav() {
  const html = PAGES.map(p => `<a href="#/${p.id}" data-page="${p.id}">${icon(p.icon)}<span>${p.label}</span></a>`).join('');
  document.getElementById('nav-side').innerHTML = html;
  document.getElementById('nav-tab').innerHTML = html;
}

/* ---------- DÉMARRAGE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  UI.applyTheme();
  document.getElementById('theme-btn').onclick = () => UI.cycleTheme();
  window.addEventListener('hashchange', () => Router.render());
  Router.render();

  // Déconstitution du cache ServiceWorker pour appliquer les mises à jour
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) registration.unregister();
    });
  }
});  chart:    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
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
