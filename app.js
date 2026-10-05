'use strict';

/* ---------- 1. CONFIGURATION & PAGES ---------- */
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

/* ---------- 2. ICÔNES SVG ---------- */
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

/* ---------- 3. STORE (PERSISTANCE DANS LE LOCALSTORAGE) ---------- */
const DEFAULT_SPORTS = [
  { id: 'course', name: 'Course à pied', unit: 'km', color: '#2F57F0' },
  { id: 'cyclisme', name: 'Cyclisme', unit: 'km', color: '#F59E0B' },
  { id: 'natation', name: 'Natation', unit: 'm', color: '#06B6D4' },
  { id: 'musculation', name: 'Musculation', unit: 'min', color: '#1FA971' }
];

const DEFAULT_SESSIONS = [
  { id: 's1', date: '2026-10-01', sport: 'Course à pied', status: 'done', effort: 'Fractionné', duration: 45, distance: 8.5, intensity: 8, notes: 'Séance tonique au parc.' },
  { id: 's2', date: '2026-10-03', sport: 'Cyclisme', status: 'done', effort: 'Endurance', duration: 90, distance: 35, intensity: 6, notes: 'Sortie vélo route.' },
  { id: 's3', date: '2026-10-05', sport: 'Musculation', status: 'done', effort: 'Force', duration: 50, distance: 0, intensity: 7, notes: 'Focus haut du corps.' }
];

const DEFAULT_GOALS = [
  { id: 'g1', title: 'Courir 100 km ce mois', type: 'distance', target: 100, sport: 'Course à pied', startDate: '2026-10-01', targetDate: '2026-10-31', status: 'active', progress: 0 },
  { id: 'g2', title: 'Effectuer 12 séances', type: 'sessions', target: 12, sport: '', startDate: '2026-10-01', targetDate: '2026-10-31', status: 'active', progress: 0 }
];

const ALL_CARDS = [
  { id: 'stats', label: 'Statistiques clés' },
  { id: 'goals', label: 'Objectifs en cours' },
  { id: 'sessions', label: 'Dernières séances' }
];

const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: { name: 'Béré', birth: '', sex: '', height: '', weight: '', target: '', goal: '' },
    settings: { theme: 'auto' },
    sports: DEFAULT_SPORTS,
    sessions: DEFAULT_SESSIONS,
    goals: DEFAULT_GOALS,
    cards: ['stats', 'goals', 'sessions']
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

/* ---------- 4. THÈME & TOAST ---------- */
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

/* ---------- 5. CALCULS DYNAMIQUES ---------- */
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

/* ---------- 6. MODALE CONFIGURATION DES CARTES ---------- */
function openCardSelector() {
  const currentCards = Store.get().cards || [];
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="sheet card" style="max-width: 420px; background: var(--surface); padding: 24px; border-radius: 16px;">
      <h2>Choisir les cartes à afficher</h2>
      <p class="muted" style="margin-bottom: 16px;">Sélectionnez les éléments à afficher sur votre tableau de bord.</p>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        ${ALL_CARDS.map(c => `
          <label style="display: flex; align-items: center; gap: 10px; font-weight: 500; cursor: pointer;">
            <input type="checkbox" value="${c.id}" ${currentCards.includes(c.id) ? 'checked' : ''}>${c.label}
          </label>
        `).join('')}
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-ghost" id="close-modal">Annuler</button>
        <button type="button" class="btn" id="save-cards">Enregistrer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#close-modal').onclick = () => modal.remove();
  modal.querySelector('#save-cards').onclick = () => {
    const selected = Array.from(modal.querySelectorAll('input:checked')).map(i => i.value);
    Store.update(s => { s.cards = selected; });
    modal.remove();
    Router.render();
    UI.toast('Tableau de bord mis à jour !');
  };
}

/* ---------- 7. VUES ---------- */
const Views = {};

Views.accueil = (el) => {
  const p = Store.get().profile;
  const stats = getCalculatedStats();
  const goals = Store.get().goals;
  const sessions = Store.get().sessions;
  const cards = Store.get().cards || ['stats', 'goals', 'sessions'];

  el.innerHTML = `
    <header class="page-head" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
      <div>
        <h1>Bonjour ${p.name || 'Athlète'} !</h1>
        <p>Votre tableau de bord personnel.</p>
      </div>
      <button class="btn btn-ghost" id="btn-config-cards">Organiser les cartes</button>
    </header>

    ${cards.includes('stats') ? `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
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
    ` : ''}

    ${cards.includes('goals') ? `
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
    ` : ''}

    ${cards.includes('sessions') ? `
      <section class="card">
        <h2>Dernières séances</h2>
        <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px;">
          ${sessions.slice(0, 3).map(s => `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
              <div>
                <strong>${s.sport}</strong>
                <p class="muted" style="font-size: 0.85rem;">${s.date} — ${s.duration} min ${s.distance ? `| ${s.distance} km` : ''}</p>
              </div>
              <span class="chip">${s.status === 'done' ? 'Réalisée' : 'Prévue'}</span>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;

  document.getElementById('btn-config-cards').onclick = openCardSelector;
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
  el.innerHTML = `<header class="page-head"><h1>Calendrier</h1><p>Vue calendrier de vos activités.</p></header><div class="card"><p>Vos séances enregistrées apparaissent automatiquement sur votre planning.</p></div>`;
};
Views.objectifs = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Objectifs</h1><p>Suivi de vos caps sportifs.</p></header><div class="card"><p>Vos objectifs calculent votre progression en temps réel.</p></div>`;
};
Views.statistiques = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Statistiques</h1><p>Analyse de vos volumes d'entraînement.</p></header><div class="card"><p>Graphiques calculés à partir de vos séances.</p></div>`;
};
Views.records = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Records</h1><p>Vos meilleures performances.</p></header><div class="card"><p>Détection automatique de vos records personnels.</p></div>`;
};
Views.parametres = (el) => {
  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Gestion du profil et de l'affichage.</p></header>
    <div class="card" style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
      <button class="btn" id="btn-edit-cards">Organiser les cartes du Tableau de bord</button>
      <button class="btn btn-ghost" id="btn-reset">Réinitialiser les données</button>
    </div>
  `;
  document.getElementById('btn-edit-cards').onclick = openCardSelector;
  document.getElementById('btn-reset').onclick = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données ?')) {
      localStorage.removeItem(APP.storageKey);
      location.reload();
    }
  };
};

/* ---------- 8. ROUTEUR & INITIALISATION ---------- */
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

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  UI.applyTheme();
  document.getElementById('theme-btn').onclick = () => UI.cycleTheme();
  window.addEventListener('hashchange', () => Router.render());
  Router.render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) registration.unregister();
    });
  }
});
