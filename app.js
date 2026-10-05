'use strict';

/* ==========================================================
   SPORT JOURNAL – app.js (Version propre, sans données par défaut)
   ========================================================== */

const APP = { storageKey: 'sportjournal:v6' };

const PAGES = [
  { id: 'accueil',     label: 'Accueil',      icon: 'home',     sub: 'Votre tableau de bord personnel.' },
  { id: 'calendrier',  label: 'Calendrier',   icon: 'calendar', sub: 'Planifiez et revoyez vos entraînements.' },
  { id: 'seances',     label: 'Séances',      icon: 'run',      sub: 'Toutes vos séances, sport par sport.' },
  { id: 'objectifs',   label: 'Objectifs',    icon: 'target',   sub: 'Fixez un cap et suivez votre progression.' },
  { id: 'statistiques',label: 'Statistiques', icon: 'chart',    sub: 'Vos chiffres calculés automatiquement.' },
  { id: 'records',     label: 'Records',      icon: 'trophy',   sub: 'Vos meilleures performances.' },
  { id: 'parametres',  label: 'Paramètres',   icon: 'gear',     sub: 'Profil, sports et configuration.' }
];

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

const STATUS = {
  done:      { label: 'Réalisée', css: '#1FA971' },
  planned:   { label: 'Prévue',   css: '#F59E0B' },
  cancelled: { label: 'Annulée',  css: '#E5484D' },
  rest:      { label: 'Repos',    css: '#98A2B3' }
};

const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];
const DEFAULT_SPORTS = ['Course à pied', 'Cyclisme', 'Natation', 'Musculation', 'Pilates', 'Yoga', 'Tennis', 'Marche'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

/* ---------- STORE (VIERGE) ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 6,
    profile: { name: '', weight: '', goal: '' },
    settings: { theme: 'auto' },
    sports: DEFAULT_SPORTS.map(name => ({ id: name.toLowerCase(), name })),
    sessions: [],
    goals: [],
    cards: ['stats', 'goals', 'sessions']
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (e) { return defaults(); }
  };

  let state = load();
  const save = () => { try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); } catch (e) {} };

  return {
    get: () => state,
    update(fn) { fn(state); save(); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

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

const refreshView = () => Router.render();

/* ---------- MODALE DE CONFIGURATION INITIALE ---------- */
const WelcomeModal = {
  showIfNeeded() {
    const p = Store.get().profile;
    if (p.name && p.name.trim() !== '') return;

    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000;';

    overlay.innerHTML = `
      <div class="card" style="width:100%; max-width:440px; background:var(--surface); padding:30px; border-radius:16px; box-shadow: 0 15px 35px rgba(0,0,0,0.3);">
        <h2 style="margin-bottom:8px;">Bienvenue sur Sport Journal !</h2>
        <p class="muted" style="margin-bottom:20px;">Veuillez renseigner vos informations pour personnaliser votre espace.</p>
        <form id="welcome-form" style="display:flex; flex-direction:column; gap:14px;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Votre Prénom ou Nom *
            <input type="text" name="name" required placeholder="Ex. Julie" style="width:100%; padding:9px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
          </label>
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Poids actuel (kg)
            <input type="number" step="0.1" name="weight" placeholder="Ex. 65" style="width:100%; padding:9px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
          </label>
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Objectif principal
            <input type="text" name="goal" placeholder="Ex. Préparer un semi-marathon" style="width:100%; padding:9px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
          </label>
          <button type="submit" class="btn" style="width:100%; margin-top:10px; padding:10px;">Commencer mon journal</button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('#welcome-form').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      Store.update(s => {
        s.profile.name = f.get('name').trim();
        s.profile.weight = f.get('weight') ? parseFloat(f.get('weight')) : '';
        s.profile.goal = f.get('goal').trim();
      });
      overlay.remove();
      UI.toast(`Bienvenue ${Store.get().profile.name} !`);
      refreshView();
    };
  }
};

/* ---------- MODALE DE SÉANCE ---------- */
const SessionModal = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    const d = { date: day, sport: 'Course à pied', status: 'done', effort: 'Endurance', duration: 30, distance: 0, intensity: 5, notes: '', ...(session || {}) };
    const sports = Store.get().sports.map(s => s.name);

    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;';
    
    overlay.innerHTML = `
      <div class="card" style="width:100%; max-width:480px; background:var(--surface); padding:24px; border-radius:16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <h2 style="margin-bottom:16px;">${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <form id="s-form" style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Statut</label>
            <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;">
              ${Object.entries(STATUS).map(([k, v]) => `
                <label style="display:flex; align-items:center; gap:4px; font-size:0.9rem; cursor:pointer;">
                  <input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}> ${v.label}
                </label>
              `).join('')}
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Sport
              <select name="sport" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${sports.map(s => `<option ${s === d.sport ? 'selected' : ''}>${s}</option>`).join('')}</select>
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Date
              <input type="date" name="date" value="${d.date}" required style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Effort
              <select name="effort" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${EFFORTS.map(e => `<option ${e === d.effort ? 'selected' : ''}>${e}</option>`).join('')}</select>
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Durée (min)
              <input type="number" name="duration" value="${d.duration}" min="0" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Distance (km)
              <input type="number" step="0.1" name="distance" value="${d.distance}" min="0" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Intensité (1-10)
              <input type="number" name="intensity" value="${d.intensity}" min="1" max="10" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Notes
            <textarea name="notes" rows="2" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${d.notes || ''}</textarea>
          </label>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
            <button type="button" class="btn btn-ghost" id="s-cancel">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('#s-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#s-form').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        date: f.get('date'),
        sport: f.get('sport'),
        status: f.get('status'),
        effort: f.get('effort'),
        duration: parseFloat(f.get('duration')) || 0,
        distance: parseFloat(f.get('distance')) || 0,
        intensity: parseInt(f.get('intensity'), 10) || 5,
        notes: f.get('notes').trim()
      };
      Store.update(s => {
        if (this.id) {
          const idx = s.sessions.findIndex(x => x.id === this.id);
          if (idx >= 0) s.sessions[idx] = { ...s.sessions[idx], ...data };
        } else {
          s.sessions.unshift({ id: Store.uid(), ...data });
        }
      });
      overlay.remove();
      refreshView();
      UI.toast('Séance enregistrée avec succès !');
    };
  }
};

/* ---------- VUES ---------- */
const Views = {};

Views.accueil = (el) => {
  const p = Store.get().profile;
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const totalKm = sessions.reduce((s, x) => s + (x.distance || 0), 0);
  const totalMin = sessions.reduce((s, x) => s + (x.duration || 0), 0);

  el.innerHTML = `
    <header class="page-head">
      <h1>${p.name ? `Bonjour ${p.name}` : 'Bienvenue'} !</h1>
      <p>${p.goal ? `Objectif : ${p.goal}` : 'Votre tableau de bord personnel.'}</p>
    </header>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card"><p class="muted">Séances réalisées</p><h2 style="font-size: 2rem; margin-top: 8px;">${sessions.length}</h2></div>
      <div class="card"><p class="muted">Distance totale</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round(totalKm * 10) / 10} km</h2></div>
      <div class="card"><p class="muted">Temps cumulé</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round((totalMin / 60) * 10) / 10} h</h2></div>
    </div>
    <section class="card">
      <h2>Dernières activités</h2>
      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
        ${sessions.length ? sessions.slice(0, 3).map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
            <div><strong>${s.sport}</strong><p class="muted" style="font-size: 0.85rem;">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''}</p></div>
            <span class="chip">${STATUS[s.status]?.label || 'Réalisée'}</span>
          </div>
        `).join('') : '<p class="muted">Aucune séance enregistrée. Rendez-vous dans l\'onglet Séances pour commencer.</p>'}
      </div>
    </section>
  `;
};

Views.seances = (el) => {
  const list = Store.get().sessions;
  el.innerHTML = `
    <header class="page-head"><h1>Vos Séances</h1><p>Toutes vos séances enregistrées.</p></header>
    <div style="margin-bottom: 16px;"><button class="btn" id="btn-new-s">${icon('plus')} Nouvelle séance</button></div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${list.length ? list.map(s => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>${s.sport}</h3>
            <p class="muted">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''} | Effort : ${s.effort \vert{}\vert{} 'N/A'}</p>${s.notes ? `<p style="margin-top: 4px; font-size: 0.9rem;">${s.notes}</p>` : ''}
          </div>
          <button class="btn btn-ghost" data-edit="${s.id}">Modifier</button>
        </div>
      `).join('') : '<div class="card"><p class="muted">Votre journal est vierge. Cliquez sur "Nouvelle séance" pour ajouter votre premier entraînement.</p></div>'}
    </div>
  `;

  el.querySelector('#btn-new-s').onclick = () => SessionModal.open(null);
  el.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => SessionModal.open(Store.get().sessions.find(x => x.id === b.dataset.edit));
  });
};

Views.calendrier = (el) => {
  const sessions = Store.get().sessions;
  const first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();

  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`;
    const list = sessions.filter(s => s.date === key);
    const dots = list.map(s => `<i style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${STATUS[s.status]?.css || '#333'}; margin:1px;"></i>`).join('');
    cells += `<button class="day" data-date="${key}" style="aspect-ratio:1; padding:4px; border:1px solid var(--line); border-radius:8px; background:var(--surface);"><b>${d}</b><div>${dots}</div></button>`;
  }

  const dayList = sessions.filter(s => s.date === Cal.sel);

  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>Vue mensuelle de vos séances.</p></header>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <button class="btn btn-ghost" id="cal-prev">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost" id="cal-next">${icon('right')}</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; margin-bottom:24px;">${cells}</div>
    <div class="card">
      <h3>Séances du ${fmtDate(Cal.sel)}</h3>
      <div style="margin-top:12px;">
        ${dayList.length ? dayList.map(s => `<p style="margin-bottom:6px;"><strong>${s.sport}</strong> — ${s.duration} min (${STATUS[s.status]?.label})</p>`).join('') : '<p class="muted">Aucune séance prévue ce jour.</p>'}
      </div>
      <button class="btn" id="cal-add" style="margin-top:12px;">${icon('plus')} Ajouter une séance</button>
    </div>`;

  el.querySelector('#cal-prev').onclick = () => { Cal.m--; if (Cal.m < 0) { Cal.m = 11; Cal.y--; } refreshView(); };
  el.querySelector('#cal-next').onclick = () => { Cal.m++; if (Cal.m > 11) { Cal.m = 0; Cal.y++; } refreshView(); };
  el.querySelectorAll('.day').forEach(b => b.onclick = () => { Cal.sel = b.dataset.date; refreshView(); });
  el.querySelector('#cal-add').onclick = () => SessionModal.open(null, Cal.sel);
};

Views.objectifs = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Objectifs</h1><p>Suivi de vos caps sportifs.</p></header><div class="card"><p class="muted">Aucun objectif défini.</p></div>`;
};

Views.statistiques = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  el.innerHTML = `
    <header class="page-head"><h1>Statistiques</h1><p>Analyse de vos données d'entraînement.</p></header>
    <div class="card">
      <h3>Résumé Global</h3>
      <p style="margin-top:12px;">Total de séances : <strong>${sessions.length}</strong></p>
      <p>Distance globale : <strong>${sessions.reduce((a, b) => a + (b.distance || 0), 0)} km</strong></p>
    </div>`;
};

Views.records = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Records</h1><p>Vos meilleures performances.</p></header><div class="card"><p class="muted">Aucun record enregistré pour l'instant.</p></div>`;
};

Views.parametres = (el) => {
  const p = Store.get().profile;
  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Configuration du profil.</p></header>
    <div class="card" style="margin-bottom:16px; max-width:400px;">
      <h2>Mon Profil</h2>
      <form id="p-form" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Prénom / Nom
          <input type="text" name="name" value="${p.name || ''}" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
        </label>
        <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Poids (kg)
          <input type="number" step="0.1" name="weight" value="${p.weight || ''}" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
        </label>
        <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Objectif principal
          <input type="text" name="goal" value="${p.goal || ''}" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
        </label>
        <button type="submit" class="btn" style="align-self:flex-start; margin-top:6px;">Mettre à jour</button>
      </form>
    </div>
    <div class="card" style="max-width:400px;"><button class="btn btn-ghost" id="btn-reset">Réinitialiser l'application</button></div>`;

  el.querySelector('#p-form').onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    Store.update(s => {
      s.profile.name = f.get('name').trim();
      s.profile.weight = f.get('weight') ? parseFloat(f.get('weight')) : '';
      s.profile.goal = f.get('goal').trim();
    });
    UI.toast('Profil mis à jour !');
    refreshView();
  };
  el.querySelector('#btn-reset').onclick = () => {
    if (confirm('Voulez-vous tout réinitialiser ?')) {
      localStorage.removeItem(APP.storageKey);
      location.reload();
    }
  };
};

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
  WelcomeModal.showIfNeeded();
});  left:     '<path d="M15 6l-6 6 6 6"/>',
  right:    '<path d="M9 6l6 6-6 6"/>',
  sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon:     '<path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z"/>',
  auto:     '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>'
};
const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

const STATUS = {
  done:      { label: 'Réalisée', css: '#1FA971' },
  planned:   { label: 'Prévue',   css: '#F59E0B' },
  cancelled: { label: 'Annulée',  css: '#E5484D' },
  rest:      { label: 'Repos',    css: '#98A2B3' }
};

const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];
const DEFAULT_SPORTS = ['Course à pied', 'Cyclisme', 'Natation', 'Musculation', 'Pilates', 'Yoga', 'Tennis', 'Marche'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

/* ---------- STORE ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 4,
    profile: { name: '', weight: '', goal: '' },
    settings: { theme: 'auto' },
    sports: DEFAULT_SPORTS.map(name => ({ id: name.toLowerCase(), name })),
    sessions: [],
    goals: [],
    cards: ['stats', 'goals', 'sessions']
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (e) { return defaults(); }
  };

  let state = load();
  const save = () => { try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); } catch (e) {} };

  return {
    get: () => state,
    update(fn) { fn(state); save(); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

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

const refreshView = () => Router.render();

/* ---------- MODALE DE CONFIGURATION INITIALE (BIENVENUE) ---------- */
const WelcomeModal = {
  showIfNeeded() {
    const p = Store.get().profile;
    if (p.name && p.name.trim() !== '') return; // Déjà configuré

    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000;';

    overlay.innerHTML = `
      <div class="card" style="width:100%; max-width:440px; background:var(--surface); padding:30px; border-radius:16px; box-shadow: 0 15px 35px rgba(0,0,0,0.3);">
        <h2 style="margin-bottom:8px;">Bienvenue sur Sport Journal !</h2>
        <p class="muted" style="margin-bottom:20px;">Veuillez renseigner vos informations pour personnaliser votre espace.</p>
        <form id="welcome-form" style="display:flex; flex-direction:column; gap:14px;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Votre Prénom ou Nom *
            <input type="text" name="name" required placeholder="Ex. Julie" style="width:100%; padding:9px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
          </label>
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Poids actuel (kg)
            <input type="number" step="0.1" name="weight" placeholder="Ex. 65" style="width:100%; padding:9px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
          </label>
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Objectif principal
            <input type="text" name="goal" placeholder="Ex. Préparer un semi-marathon" style="width:100%; padding:9px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
          </label>
          <button type="submit" class="btn" style="width:100%; margin-top:10px; padding:10px;">Commencer mon journal</button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('#welcome-form').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      Store.update(s => {
        s.profile.name = f.get('name').trim();
        s.profile.weight = f.get('weight') ? parseFloat(f.get('weight')) : '';
        s.profile.goal = f.get('goal').trim();
      });
      overlay.remove();
      UI.toast(`Bienvenue ${Store.get().profile.name} !`);
      refreshView();
    };
  }
};

/* ---------- MODALE DE SÉANCE ---------- */
const SessionModal = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    const d = { date: day, sport: 'Course à pied', status: 'done', effort: 'Endurance', duration: 30, distance: 0, intensity: 5, notes: '', ...(session || {}) };
    const sports = Store.get().sports.map(s => s.name);

    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;';
    
    overlay.innerHTML = `
      <div class="card" style="width:100%; max-width:480px; background:var(--surface); padding:24px; border-radius:16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <h2 style="margin-bottom:16px;">${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <form id="s-form" style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Statut</label>
            <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;">
              ${Object.entries(STATUS).map(([k, v]) => `
                <label style="display:flex; align-items:center; gap:4px; font-size:0.9rem; cursor:pointer;">
                  <input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}> ${v.label}
                </label>
              `).join('')}
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Sport
              <select name="sport" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${sports.map(s => `<option ${s === d.sport ? 'selected' : ''}>${s}</option>`).join('')}</select>
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Date
              <input type="date" name="date" value="${d.date}" required style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Effort
              <select name="effort" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${EFFORTS.map(e => `<option ${e === d.effort ? 'selected' : ''}>${e}</option>`).join('')}</select>
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Durée (min)
              <input type="number" name="duration" value="${d.duration}" min="0" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Distance (km)
              <input type="number" step="0.1" name="distance" value="${d.distance}" min="0" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Intensité (1-10)
              <input type="number" name="intensity" value="${d.intensity}" min="1" max="10" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Notes
            <textarea name="notes" rows="2" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${d.notes || ''}</textarea>
          </label>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
            <button type="button" class="btn btn-ghost" id="s-cancel">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('#s-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#s-form').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        date: f.get('date'),
        sport: f.get('sport'),
        status: f.get('status'),
        effort: f.get('effort'),
        duration: parseFloat(f.get('duration')) || 0,
        distance: parseFloat(f.get('distance')) || 0,
        intensity: parseInt(f.get('intensity'), 10) || 5,
        notes: f.get('notes').trim()
      };
      Store.update(s => {
        if (this.id) {
          const idx = s.sessions.findIndex(x => x.id === this.id);
          if (idx >= 0) s.sessions[idx] = { ...s.sessions[idx], ...data };
        } else {
          s.sessions.unshift({ id: Store.uid(), ...data });
        }
      });
      overlay.remove();
      refreshView();
      UI.toast('Séance enregistrée avec succès !');
    };
  }
};

/* ---------- VUES ---------- */
const Views = {};

Views.accueil = (el) => {
  const p = Store.get().profile;
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const totalKm = sessions.reduce((s, x) => s + (x.distance || 0), 0);
  const totalMin = sessions.reduce((s, x) => s + (x.duration || 0), 0);

  el.innerHTML = `
    <header class="page-head">
      <h1>${p.name ? `Bonjour ${p.name}` : 'Bienvenue'} !</h1>
      <p>${p.goal ? `Objectif : ${p.goal}` : 'Votre tableau de bord personnel.'}</p>
    </header>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card"><p class="muted">Séances réalisées</p><h2 style="font-size: 2rem; margin-top: 8px;">${sessions.length}</h2></div>
      <div class="card"><p class="muted">Distance totale</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round(totalKm * 10) / 10} km</h2></div>
      <div class="card"><p class="muted">Temps cumulé</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round((totalMin / 60) * 10) / 10} h</h2></div>
    </div>
    <section class="card">
      <h2>Dernières activités</h2>
      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
        ${sessions.length ? sessions.slice(0, 3).map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
            <div><strong>${s.sport}</strong><p class="muted" style="font-size: 0.85rem;">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''}</p></div>
            <span class="chip">${STATUS[s.status]?.label || 'Réalisée'}</span>
          </div>
        `).join('') : '<p class="muted">Aucune séance enregistrée. Rendez-vous dans l\'onglet Séances pour commencer.</p>'}
      </div>
    </section>
  `;
};

Views.seances = (el) => {
  const list = Store.get().sessions;
  el.innerHTML = `
    <header class="page-head"><h1>Vos Séances</h1><p>Toutes vos séances enregistrées.</p></header>
    <div style="margin-bottom: 16px;"><button class="btn" id="btn-new-s">${icon('plus')} Nouvelle séance</button></div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${list.length ? list.map(s => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>${s.sport}</h3>
            <p class="muted">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''} | Effort : ${s.effort \vert{}\vert{} 'N/A'}</p>${s.notes ? `<p style="margin-top: 4px; font-size: 0.9rem;">${s.notes}</p>` : ''}
          </div>
          <button class="btn btn-ghost" data-edit="${s.id}">Modifier</button>
        </div>
      `).join('') : '<div class="card"><p class="muted">Votre journal est vierge. Cliquez sur "Nouvelle séance" pour ajouter votre premier entraînement.</p></div>'}
    </div>
  `;

  el.querySelector('#btn-new-s').onclick = () => SessionModal.open(null);
  el.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => SessionModal.open(Store.get().sessions.find(x => x.id === b.dataset.edit));
  });
};

Views.calendrier = (el) => {
  const sessions = Store.get().sessions;
  const first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();

  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`;
    const list = sessions.filter(s => s.date === key);
    const dots = list.map(s => `<i style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${STATUS[s.status]?.css || '#333'}; margin:1px;"></i>`).join('');
    cells += `<button class="day" data-date="${key}" style="aspect-ratio:1; padding:4px; border:1px solid var(--line); border-radius:8px; background:var(--surface);"><b>${d}</b><div>${dots}</div></button>`;
  }

  const dayList = sessions.filter(s => s.date === Cal.sel);

  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>Vue mensuelle de vos séances.</p></header>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <button class="btn btn-ghost" id="cal-prev">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost" id="cal-next">${icon('right')}</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; margin-bottom:24px;">${cells}</div>
    <div class="card">
      <h3>Séances du ${fmtDate(Cal.sel)}</h3>
      <div style="margin-top:12px;">
        ${dayList.length ? dayList.map(s => `<p style="margin-bottom:6px;"><strong>${s.sport}</strong> — ${s.duration} min (${STATUS[s.status]?.label})</p>`).join('') : '<p class="muted">Aucune séance prévue ce jour.</p>'}
      </div>
      <button class="btn" id="cal-add" style="margin-top:12px;">${icon('plus')} Ajouter une séance</button>
    </div>`;

  el.querySelector('#cal-prev').onclick = () => { Cal.m--; if (Cal.m < 0) { Cal.m = 11; Cal.y--; } refreshView(); };
  el.querySelector('#cal-next').onclick = () => { Cal.m++; if (Cal.m > 11) { Cal.m = 0; Cal.y++; } refreshView(); };
  el.querySelectorAll('.day').forEach(b => b.onclick = () => { Cal.sel = b.dataset.date; refreshView(); });
  el.querySelector('#cal-add').onclick = () => SessionModal.open(null, Cal.sel);
};

Views.objectifs = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Objectifs</h1><p>Suivi de vos caps sportifs.</p></header><div class="card"><p class="muted">Aucun objectif défini.</p></div>`;
};

Views.statistiques = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  el.innerHTML = `
    <header class="page-head"><h1>Statistiques</h1><p>Analyse de vos données d'entraînement.</p></header>
    <div class="card">
      <h3>Résumé Global</h3>
      <p style="margin-top:12px;">Total de séances : <strong>${sessions.length}</strong></p>
      <p>Distance globale : <strong>${sessions.reduce((a, b) => a + (b.distance || 0), 0)} km</strong></p>
    </div>`;
};

Views.records = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Records</h1><p>Vos meilleures performances.</p></header><div class="card"><p class="muted">Aucun record enregistré pour l'instant.</p></div>`;
};

Views.parametres = (el) => {
  const p = Store.get().profile;
  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Configuration du profil.</p></header>
    <div class="card" style="margin-bottom:16px; max-width:400px;">
      <h2>Mon Profil</h2>
      <form id="p-form" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Prénom / Nom
          <input type="text" name="name" value="${p.name || ''}" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
        </label>
        <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Poids (kg)
          <input type="number" step="0.1" name="weight" value="${p.weight || ''}" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
        </label>
        <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Objectif principal
          <input type="text" name="goal" value="${p.goal || ''}" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
        </label>
        <button type="submit" class="btn" style="align-self:flex-start; margin-top:6px;">Mettre à jour</button>
      </form>
    </div>
    <div class="card" style="max-width:400px;"><button class="btn btn-ghost" id="btn-reset">Réinitialiser l'application</button></div>`;

  el.querySelector('#p-form').onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    Store.update(s => {
      s.profile.name = f.get('name').trim();
      s.profile.weight = f.get('weight') ? parseFloat(f.get('weight')) : '';
      s.profile.goal = f.get('goal').trim();
    });
    UI.toast('Profil mis à jour !');
    refreshView();
  };
  el.querySelector('#btn-reset').onclick = () => {
    if (confirm('Voulez-vous tout réinitialiser ?')) {
      localStorage.removeItem(APP.storageKey);
      location.reload();
    }
  };
};

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
  WelcomeModal.showIfNeeded();
});  done:      { label: 'Réalisée', css: '#1FA971' },
  planned:   { label: 'Prévue',   css: '#F59E0B' },
  cancelled: { label: 'Annulée',  css: '#E5484D' },
  rest:      { label: 'Repos',    css: '#98A2B3' }
};

const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];
const DEFAULT_SPORTS = ['Course à pied', 'Cyclisme', 'Natation', 'Musculation', 'Pilates', 'Yoga', 'Tennis', 'Marche'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

/* ---------- STORE (VIERGE PAR DÉFAUT) ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 3,
    profile: { name: '', birth: '', sex: '', height: '', weight: '', target: '', goal: '' },
    settings: { theme: 'auto' },
    sports: DEFAULT_SPORTS.map(name => ({ id: name.toLowerCase(), name })),
    sessions: [],
    goals: [],
    cards: ['stats', 'goals', 'sessions']
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (e) { return defaults(); }
  };

  let state = load();
  const save = () => { try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); } catch (e) {} };

  return {
    get: () => state,
    update(fn) { fn(state); save(); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

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

const refreshView = () => Router.render();

/* ---------- MODALE PROPRE DE CRÉATION DE SÉANCE ---------- */
const SessionModal = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    const d = { date: day, sport: 'Course à pied', status: 'done', effort: 'Endurance', duration: 30, distance: 0, intensity: 5, notes: '', ...(session || {}) };
    const sports = Store.get().sports.map(s => s.name);

    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;';
    
    overlay.innerHTML = `
      <div class="card" style="width:100%; max-width:480px; background:var(--surface); padding:24px; border-radius:16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <h2 style="margin-bottom:16px;">${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <form id="s-form" style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Statut</label>
            <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;">
              ${Object.entries(STATUS).map(([k, v]) => `
                <label style="display:flex; align-items:center; gap:4px; font-size:0.9rem; cursor:pointer;">
                  <input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}> ${v.label}
                </label>
              `).join('')}
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Sport
              <select name="sport" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${sports.map(s => `<option ${s === d.sport ? 'selected' : ''}>${s}</option>`).join('')}</select>
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Date
              <input type="date" name="date" value="${d.date}" required style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Effort
              <select name="effort" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${EFFORTS.map(e => `<option ${e === d.effort ? 'selected' : ''}>${e}</option>`).join('')}</select>
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Durée (min)
              <input type="number" name="duration" value="${d.duration}" min="0" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Distance (km)
              <input type="number" step="0.1" name="distance" value="${d.distance}" min="0" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
            <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Intensité (1-10)
              <input type="number" name="intensity" value="${d.intensity}" min="1" max="10" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">
            </label>
          </div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Notes
            <textarea name="notes" rows="2" style="width:100%; padding:8px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);">${d.notes || ''}</textarea>
          </label>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
            <button type="button" class="btn btn-ghost" id="s-cancel">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('#s-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#s-form').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = {
        date: f.get('date'),
        sport: f.get('sport'),
        status: f.get('status'),
        effort: f.get('effort'),
        duration: parseFloat(f.get('duration')) || 0,
        distance: parseFloat(f.get('distance')) || 0,
        intensity: parseInt(f.get('intensity'), 10) || 5,
        notes: f.get('notes').trim()
      };
      Store.update(s => {
        if (this.id) {
          const idx = s.sessions.findIndex(x => x.id === this.id);
          if (idx >= 0) s.sessions[idx] = { ...s.sessions[idx], ...data };
        } else {
          s.sessions.unshift({ id: Store.uid(), ...data });
        }
      });
      overlay.remove();
      refreshView();
      UI.toast('Séance enregistrée avec succès !');
    };
  }
};

/* ---------- VUES DE L'APPLICATION ---------- */
const Views = {};

Views.accueil = (el) => {
  const p = Store.get().profile;
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const totalKm = sessions.reduce((s, x) => s + (x.distance || 0), 0);
  const totalMin = sessions.reduce((s, x) => s + (x.duration || 0), 0);

  el.innerHTML = `
    <header class="page-head">
      <h1>${p.name ? `Bonjour ${p.name}` : 'Bienvenue'} !</h1>
      <p>Votre tableau de bord personnel.</p>
    </header>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card"><p class="muted">Séances réalisées</p><h2 style="font-size: 2rem; margin-top: 8px;">${sessions.length}</h2></div>
      <div class="card"><p class="muted">Distance totale</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round(totalKm * 10) / 10} km</h2></div>
      <div class="card"><p class="muted">Temps cumulé</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round((totalMin / 60) * 10) / 10} h</h2></div>
    </div>
    <section class="card">
      <h2>Dernières activités</h2>
      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
        ${sessions.length ? sessions.slice(0, 3).map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
            <div><strong>${s.sport}</strong><p class="muted" style="font-size: 0.85rem;">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''}</p></div>
            <span class="chip">${STATUS[s.status]?.label || 'Réalisée'}</span>
          </div>
        `).join('') : '<p class="muted">Aucune séance enregistrée. Rendez-vous dans l\'onglet Séances pour commencer.</p>'}
      </div>
    </section>
  `;
};

Views.seances = (el) => {
  const list = Store.get().sessions;
  el.innerHTML = `
    <header class="page-head"><h1>Vos Séances</h1><p>Toutes vos séances enregistrées.</p></header>
    <div style="margin-bottom: 16px;"><button class="btn" id="btn-new-s">${icon('plus')} Nouvelle séance</button></div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${list.length ? list.map(s => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>${s.sport}</h3>
            <p class="muted">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''} | Effort : ${s.effort \vert{}\vert{} 'N/A'}</p>${s.notes ? `<p style="margin-top: 4px; font-size: 0.9rem;">${s.notes}</p>` : ''}
          </div>
          <button class="btn btn-ghost" data-edit="${s.id}">Modifier</button>
        </div>
      `).join('') : '<div class="card"><p class="muted">Votre journal est vierge. Cliquez sur "Nouvelle séance" pour ajouter votre premier entraînement.</p></div>'}
    </div>
  `;

  el.querySelector('#btn-new-s').onclick = () => SessionModal.open(null);
  el.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => SessionModal.open(Store.get().sessions.find(x => x.id === b.dataset.edit));
  });
};

Views.calendrier = (el) => {
  const sessions = Store.get().sessions;
  const first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();

  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`;
    const list = sessions.filter(s => s.date === key);
    const dots = list.map(s => `<i style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${STATUS[s.status]?.css || '#333'}; margin:1px;"></i>`).join('');
    cells += `<button class="day" data-date="${key}" style="aspect-ratio:1; padding:4px; border:1px solid var(--line); border-radius:8px; background:var(--surface);"><b>${d}</b><div>${dots}</div></button>`;
  }

  const dayList = sessions.filter(s => s.date === Cal.sel);

  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>Vue mensuelle de vos séances.</p></header>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <button class="btn btn-ghost" id="cal-prev">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost" id="cal-next">${icon('right')}</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; margin-bottom:24px;">${cells}</div>
    <div class="card">
      <h3>Séances du ${fmtDate(Cal.sel)}</h3>
      <div style="margin-top:12px;">
        ${dayList.length ? dayList.map(s => `<p style="margin-bottom:6px;"><strong>${s.sport}</strong> — ${s.duration} min (${STATUS[s.status]?.label})</p>`).join('') : '<p class="muted">Aucune séance prévue ce jour.</p>'}
      </div>
      <button class="btn" id="cal-add" style="margin-top:12px;">${icon('plus')} Ajouter une séance</button>
    </div>`;

  el.querySelector('#cal-prev').onclick = () => { Cal.m--; if (Cal.m < 0) { Cal.m = 11; Cal.y--; } refreshView(); };
  el.querySelector('#cal-next').onclick = () => { Cal.m++; if (Cal.m > 11) { Cal.m = 0; Cal.y++; } refreshView(); };
  el.querySelectorAll('.day').forEach(b => b.onclick = () => { Cal.sel = b.dataset.date; refreshView(); });
  el.querySelector('#cal-add').onclick = () => SessionModal.open(null, Cal.sel);
};

Views.objectifs = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Objectifs</h1><p>Suivi de vos caps sportifs.</p></header><div class="card"><p class="muted">Aucun objectif défini.</p></div>`;
};

Views.statistiques = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  el.innerHTML = `
    <header class="page-head"><h1>Statistiques</h1><p>Analyse de vos données d'entraînement.</p></header>
    <div class="card">
      <h3>Résumé Global</h3>
      <p style="margin-top:12px;">Total de séances : <strong>${sessions.length}</strong></p>
      <p>Distance globale : <strong>${sessions.reduce((a, b) => a + (b.distance || 0), 0)} km</strong></p>
    </div>`;
};

Views.records = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Records</h1><p>Vos meilleures performances.</p></header><div class="card"><p class="muted">Aucun record enregistré pour l'instant.</p></div>`;
};

Views.parametres = (el) => {
  const p = Store.get().profile;
  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Configuration du profil.</p></header>
    <div class="card" style="margin-bottom:16px; max-width:400px;">
      <h2>Profil</h2>
      <form id="p-form" style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--muted);">Prénom<input type="text" name="name" value="${p.name || ''}" style="width:100%; padding:7px; margin-top:4px; border-radius:8px; border:1px solid var(--line); background:var(--bg); color:var(--text);"></label>
        <button type="submit" class="btn" style="align-self:flex-start;">Enregistrer</button>
      </form>
    </div>
    <div class="card" style="max-width:400px;"><button class="btn btn-ghost" id="btn-reset">Réinitialiser l'application</button></div>`;

  el.querySelector('#p-form').onsubmit = (e) => {
    e.preventDefault();
    const val = new FormData(e.target).get('name').trim();
    Store.update(s => { s.profile.name = val; });
    UI.toast('Profil mis à jour !');
    refreshView();
  };
  el.querySelector('#btn-reset').onclick = () => {
    if (confirm('Voulez-vous tout réinitialiser ?')) {
      localStorage.removeItem(APP.storageKey);
      location.reload();
    }
  };
};

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
});
/* ---------- 3. CONSTANTES & UTILS ---------- */
const STATUS = {
  done:      { label: 'Réalisée', css: '#1FA971' },
  planned:   { label: 'Prévue',   css: '#F59E0B' },
  cancelled: { label: 'Annulée',  css: '#E5484D' },
  rest:      { label: 'Repos',    css: '#98A2B3' }
};

const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];
const DEFAULT_SPORTS = ['Course à pied', 'Cyclisme', 'Natation', 'Musculation', 'Pilates', 'Yoga', 'Tennis', 'Marche'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

/* ---------- 4. STORE (ETAT PAR DEFAUT VIERGE) ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: { name: '', birth: '', sex: '', height: '', weight: '', target: '', goal: '' },
    settings: { theme: 'auto' },
    sports: DEFAULT_SPORTS.map(name => ({ id: name.toLowerCase(), name })),
    sessions: [], // Vierge par défaut
    goals: [],    // Vierge par défaut
    cards: ['stats', 'goals', 'sessions']
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (e) { return defaults(); }
  };

  let state = load();
  const save = () => { try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); } catch (e) {} };

  return {
    get: () => state,
    update(fn) { fn(state); save(); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

/* ---------- 5. UI & GESTION DE THÈME ---------- */
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

const refreshView = () => Router.render();

/* ---------- 6. FORMULAIRE DE SÉANCE ---------- */
const SessionForm = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    this.data = { date: day, sport: 'Course à pied', status: 'done', effort: 'Endurance', duration: 30, distance: 0, intensity: 5, notes: '', ...(session || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const sports = Store.get().sports.map(s => s.name);
    const opts = (list, cur) => list.map(n => `<option ${n === cur ? 'selected' : ''}>${n}</option>`).join('');

    this.el.innerHTML = `
      <form class="sheet card" style="max-width: 500px; padding: 24px; background: var(--surface); border-radius: 16px;">
        <h2>${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <div class="field" style="margin-bottom: 12px;">
          <label>Statut</label>
          <div style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
            ${Object.entries(STATUS).map(([k, v]) => `
              <label class="chip"><input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}> ${v.label}</label>
            `).join('')}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Sport<select name="sport">${opts(sports, d.sport)}</select></label>
          <label class="field">Date<input type="date" name="date" value="${d.date}" required></label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Type d'effort<select name="effort">${opts(EFFORTS, d.effort)}</select></label>
          <label class="field">Durée (min)<input type="number" name="duration" value="${d.duration}" min="0"></label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Distance (km)<input type="number" step="0.1" name="distance" value="${d.distance}" min="0"></label>
          <label class="field">Intensité (1-10)<input type="number" name="intensity" value="${d.intensity}" min="1" max="10"></label>
        </div>
        <label class="field" style="margin-bottom: 16px;">Notes<textarea name="notes" rows="2">${d.notes || ''}</textarea></label>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-ghost" id="cancel-session">Annuler</button>
          <button type="submit" class="btn">Enregistrer</button>
        </div>
      </form>`;

    const form = this.el.querySelector('form');
    form.querySelector('#cancel-session').onclick = () => this.close();
    form.onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const data = {
        date: f.get('date'),
        sport: f.get('sport'),
        status: f.get('status'),
        effort: f.get('effort'),
        duration: parseFloat(f.get('duration')) || 0,
        distance: parseFloat(f.get('distance')) || 0,
        intensity: parseInt(f.get('intensity'), 10) || 5,
        notes: f.get('notes').trim()
      };
      Store.update(s => {
        if (this.id) {
          const idx = s.sessions.findIndex(x => x.id === this.id);
          if (idx >= 0) s.sessions[idx] = { ...s.sessions[idx], ...data };
        } else {
          s.sessions.unshift({ id: Store.uid(), ...data });
        }
      });
      this.close();
      refreshView();
      UI.toast('Séance sauvegardée !');
    };
  }
};

/* ---------- 7. FORMULAIRE D'OBJECTIFS ---------- */
const GoalForm = {
  open(goal) {
    this.id = goal ? goal.id : null;
    this.data = { title: '', type: 'distance', target: 50, sport: 'Course à pied', startDate: todayStr(), targetDate: '', progress: 0, ...(goal || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const sports = Store.get().sports.map(s => s.name);
    this.el.innerHTML = `
      <form class="sheet card" style="max-width: 450px; padding: 24px; background: var(--surface); border-radius: 16px;">
        <h2>${this.id ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h2>
        <label class="field" style="margin-bottom: 12px;">Titre de l'objectif<input name="title" value="${d.title}" required placeholder="Ex. Courir 100km"></label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Type de mesure<select name="type">
            <option value="distance" ${d.type === 'distance' ? 'selected' : ''}>Distance cumulée (km)</option>
            <option value="sessions" ${d.type === 'sessions' ? 'selected' : ''}>Nombre de séances</option>
            <option value="manual" ${d.type === 'manual' ? 'selected' : ''}>Manuel (%)</option>
          </select></label>
          <label class="field">Cible<input type="number" name="target" value="${d.target}"></label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <label class="field">Sport<select name="sport"><option value="">Tous les sports</option>${sports.map(s => `<option ${s === d.sport ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          <label class="field">Date cible<input type="date" name="targetDate" value="${d.targetDate}"></label>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-ghost" id="cancel-goal">Annuler</button>
          <button type="submit" class="btn">Enregistrer</button>
        </div>
      </form>`;

    const form = this.el.querySelector('form');
    form.querySelector('#cancel-goal').onclick = () => this.close();
    form.onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const data = {
        title: f.get('title').trim(),
        type: f.get('type'),
        target: parseFloat(f.get('target')) || 0,
        sport: f.get('sport'),
        targetDate: f.get('targetDate'),
        startDate: d.startDate || todayStr(),
        status: 'active'
      };
      Store.update(s => {
        if (this.id) {
          const idx = s.goals.findIndex(x => x.id === this.id);
          if (idx >= 0) s.goals[idx] = { ...s.goals[idx], ...data };
        } else {
          s.goals.unshift({ id: Store.uid(), progress: 0, ...data });
        }
      });
      this.close();
      refreshView();
      UI.toast('Objectif enregistré !');
    };
  }
};

/* ---------- 8. CALCULS DES OBJECTIFS ---------- */
function getGoalProgress(g) {
  if (g.type === 'manual') return { pct: g.progress || 0, text: `${g.progress || 0}%` };
  const done = Store.get().sessions.filter(s => s.status === 'done' && (!g.sport || s.sport === g.sport));
  if (g.type === 'sessions') {
    const cur = done.length;
    const pct = Math.min(100, Math.round((cur / g.target) * 100));
    return { pct, text: `${cur} / ${g.target} séances` };
  }
  if (g.type === 'distance') {
    const cur = done.reduce((sum, s) => sum + (s.distance || 0), 0);
    const pct = Math.min(100, Math.round((cur / g.target) * 100));
    return { pct, text: `${Math.round(cur * 10) / 10} / ${g.target} km` };
  }
  return { pct: 0, text: '0%' };
}

/* ---------- 9. VUES DE L'APPLICATION ---------- */
const Views = {};

// --- ACCUEIL ---
Views.accueil = (el) => {
  const name = Store.get().profile.name;
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const totalKm = sessions.reduce((s, x) => s + (x.distance || 0), 0);
  const totalMin = sessions.reduce((s, x) => s + (x.duration || 0), 0);

  el.innerHTML = `
    <header class="page-head">
      <h1>${name ? `Bonjour ${name} !` : 'Bienvenue !'}</h1>
      <p>Votre tableau de bord personnel.</p>
    </header>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card"><p class="muted">Séances réalisées</p><h2 style="font-size: 2rem; margin-top: 8px;">${sessions.length}</h2></div>
      <div class="card"><p class="muted">Distance totale</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round(totalKm * 10) / 10} km</h2></div>
      <div class="card"><p class="muted">Temps cumulé</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round((totalMin / 60) * 10) / 10} h</h2></div>
    </div>
    <section class="card">
      <h2>Dernières activités</h2>
      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
        ${sessions.length ? sessions.slice(0, 3).map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
            <div><strong>${s.sport}</strong><p class="muted" style="font-size: 0.85rem;">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''}</p></div>
            <span class="chip">${STATUS[s.status]?.label || 'Réalisée'}</span>
          </div>
        `).join('') : '<p class="muted">Aucune séance enregistrée pour le moment. Cliquez sur "Séances" pour ajouter votre première activité !</p>'}
      </div>
    </section>`;
};

// --- SÉANCES ---
Views.seances = (el) => {
  const list = Store.get().sessions;
  el.innerHTML = `
    <header class="page-head"><h1>Vos Séances</h1><p>Toutes vos séances enregistrées.</p></header>
    <div style="margin-bottom: 16px;"><button class="btn" id="btn-new-s">${icon('plus')} Nouvelle séance</button></div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${list.length ? list.map(s => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>${s.sport}</h3>
            <p class="muted">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''} | Effort : ${s.effort \vert{}\vert{} 'N/A'}</p>${s.notes ? `<p style="margin-top: 4px; font-size: 0.9rem;">${s.notes}</p>` : ''}
          </div>
          <button class="btn btn-ghost" data-edit="${s.id}">Modifier</button>
        </div>
      `).join('') : '<div class="card"><p class="muted">Aucune séance enregistrée. Cliquez sur "Nouvelle séance" pour commencer.</p></div>'}
    </div>`;

  el.querySelector('#btn-new-s').onclick = () => SessionForm.open(null);
  el.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => SessionForm.open(Store.get().sessions.find(x => x.id === b.dataset.edit));
  });
};

// --- CALENDRIER ---
Views.calendrier = (el) => {
  const sessions = Store.get().sessions;
  const first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();

  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`;
    const list = sessions.filter(s => s.date === key);
    const dots = list.map(s => `<i style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${STATUS[s.status]?.css || '#333'}; margin:1px;"></i>`).join('');
    cells += `<button class="day" data-date="${key}" style="aspect-ratio:1; padding:4px; border:1px solid var(--line); border-radius:8px; background:var(--surface);"><b>${d}</b><div>${dots}</div></button>`;
  }

  const dayList = sessions.filter(s => s.date === Cal.sel);

  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>Vue mensuelle de vos séances.</p></header>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <button class="btn btn-ghost" id="cal-prev">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost" id="cal-next">${icon('right')}</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; margin-bottom:24px;">${cells}</div>
    <div class="card">
      <h3>Séances du ${fmtDate(Cal.sel)}</h3>
      <div style="margin-top:12px;">
        ${dayList.length ? dayList.map(s => `<p style="margin-bottom:6px;"><strong>${s.sport}</strong> — ${s.duration} min (${STATUS[s.status]?.label})</p>`).join('') : '<p class="muted">Aucune séance prévue ce jour.</p>'}
      </div>
      <button class="btn" id="cal-add" style="margin-top:12px;">${icon('plus')} Ajouter une séance</button>
    </div>`;

  el.querySelector('#cal-prev').onclick = () => { Cal.m--; if (Cal.m < 0) { Cal.m = 11; Cal.y--; } refreshView(); };
  el.querySelector('#cal-next').onclick = () => { Cal.m++; if (Cal.m > 11) { Cal.m = 0; Cal.y++; } refreshView(); };
  el.querySelectorAll('.day').forEach(b => b.onclick = () => { Cal.sel = b.dataset.date; refreshView(); });
  el.querySelector('#cal-add').onclick = () => SessionForm.open(null, Cal.sel);
};

// --- OBJECTIFS ---
Views.objectifs = (el) => {
  const goals = Store.get().goals;
  el.innerHTML = `
    <header class="page-head"><h1>Objectifs</h1><p>Suivez votre progression.</p></header>
    <div style="margin-bottom:16px;"><button class="btn" id="btn-new-goal">${icon('plus')} Nouvel objectif</button></div>
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${goals.length ? goals.map(g => {
        const prog = getGoalProgress(g);
        return `
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3>${g.title}</h3>
              <strong>${prog.pct}%</strong>
            </div>
            <p class="muted" style="margin-bottom:8px;">${prog.text}${g.sport ? `(${g.sport})` : ''}</p>
            <div style="height:8px; background:var(--hover); border-radius:4px; overflow:hidden;">
              <div style="height:100%; width:${prog.pct}%; background:var(--accent);"></div>
            </div>
          </div>`;
      }).join('') : '<div class="card"><p class="muted">Aucun objectif défini. Cliquez sur "Nouvel objectif" pour en fixer un.</p></div>'}
    </div>`;

  el.querySelector('#btn-new-goal').onclick = () => GoalForm.open(null);
};

// --- STATISTIQUES ---
Views.statistiques = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const sportsMap = {};
  sessions.forEach(s => {
    sportsMap[s.sport] = (sportsMap[s.sport] || 0) + (s.distance || s.duration || 1);
  });

  el.innerHTML = `
    <header class="page-head"><h1>Statistiques</h1><p>Analyse de vos données d'entraînement.</p></header>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:16px;">
      <div class="card">
        <h3>Volume par Sport</h3>
        ${Object.keys(sportsMap).length ? `
          <ul style="margin-top:12px; padding-left:20px;">
            ${Object.entries(sportsMap).map(([k, v]) => `<li><strong>${k}</strong> : ${Math.round(v * 10) / 10}</li>`).join('')}
          </ul>
        ` : '<p class="muted" style="margin-top:12px;">Enregistrez votre première séance pour voir la répartition.</p>'}
      </div>
      <div class="card">
        <h3>Résumé Global</h3>
        <p style="margin-top:12px;">Total de séances : <strong>${sessions.length}</strong></p>
        <p>Distance globale : <strong>${sessions.reduce((a, b) => a + (b.distance || 0), 0)} km</strong></p>
      </div>
    </div>`;
};

// --- RECORDS ---
Views.records = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const sports = [...new Set(sessions.map(s => s.sport))];

  el.innerHTML = `
    <header class="page-head"><h1>Records & Performances</h1><p>Vos meilleures performances calculées par discipline.</p></header>
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${sports.length ? sports.map(sp => {
        const list = sessions.filter(s => s.sport === sp);
        const maxDist = Math.max(...list.map(s => s.distance || 0));
        const maxDur = Math.max(...list.map(s => s.duration || 0));
        return `
          <div class="card">
            <h2>${sp}</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
              <div><p class="muted">Plus longue distance</p><strong>${maxDist > 0 ? maxDist + ' km' : 'N/A'}</strong></div>
              <div><p class="muted">Plus longue durée</p><strong>${maxDur > 0 ? maxDur + ' min' : 'N/A'}</strong></div>
            </div>
          </div>`;
      }).join('') : '<div class="card"><p class="muted">Aucun record enregistré. Vos meilleures performances seront calculées automatiquement dès vos premières séances.</p></div>'}
    </div>`;
};

// --- PARAMÈTRES ---
Views.parametres = (el) => {
  const p = Store.get().profile;
  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Gestion du profil et de l'application.</p></header>
    <div class="card" style="margin-bottom: 16px; max-width: 500px;">
      <h2>Mon Profil</h2>
      <form id="profile-form" style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
        <label class="field">Prénom / Nom<input name="name" value="${p.name || ''}" placeholder="Votre prénom"></label>
        <button type="submit" class="btn" style="align-self: flex-start;">Enregistrer mon prénom</button>
      </form>
    </div>
    <div class="card" style="max-width: 500px;">
      <h2>Réinitialisation</h2>
      <p class="muted" style="margin-bottom: 12px;">Effacer toutes les séances et repartir à zéro.</p>
      <button class="btn btn-ghost" id="btn-reset">Réinitialiser l'application</button>
    </div>`;

  el.querySelector('#profile-form').onsubmit = (e) => {
    e.preventDefault();
    const val = e.target.elements.name.value.trim();
    Store.update(s => { s.profile.name = val; });
    UI.toast('Profil mis à jour !');
    refreshView();
  };

  el.querySelector('#btn-reset').onclick = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données ?')) {
      localStorage.removeItem(APP.storageKey);
      location.reload();
    }
  };
};

/* ---------- 10. INITIALISATION & ROUTEUR ---------- */
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
    navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()));
  }
});  planned:   { label: 'Prévue',   css: '#F59E0B' },
  cancelled: { label: 'Annulée',  css: '#E5484D' },
  rest:      { label: 'Repos',    css: '#98A2B3' }
};

const EFFORTS = ['Endurance', 'Fractionné', 'Force', 'Récupération', 'Technique', 'Compétition'];
const DEFAULT_SPORTS = ['Course à pied', 'Cyclisme', 'Natation', 'Musculation', 'Pilates', 'Yoga', 'Tennis', 'Marche'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const fmtDate = (str) => new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const Cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayStr() };

/* ---------- 4. STORE ---------- */
const Store = (() => {
  const defaults = () => ({
    version: 2,
    profile: { name: 'Béré', birth: '', sex: '', height: '', weight: '', target: '', goal: '' },
    settings: { theme: 'auto' },
    sports: DEFAULT_SPORTS.map(name => ({ id: name.toLowerCase(), name })),
    sessions: [
      { id: 's1', date: todayStr(), sport: 'Course à pied', status: 'done', effort: 'Fractionné', duration: 45, distance: 8.5, intensity: 8, notes: 'Bonne séance au parc.' },
      { id: 's2', date: '2026-10-02', sport: 'Cyclisme', status: 'done', effort: 'Endurance', duration: 90, distance: 35, intensity: 6, notes: 'Sortie vélo.' }
    ],
    goals: [
      { id: 'g1', title: 'Courir 100 km ce mois', type: 'distance', target: 100, sport: 'Course à pied', startDate: '2026-10-01', targetDate: '2026-10-31', status: 'active', progress: 0 },
      { id: 'g2', title: 'Faire 10 séances', type: 'sessions', target: 10, sport: '', startDate: '2026-10-01', targetDate: '2026-10-31', status: 'active', progress: 0 }
    ],
    cards: ['stats', 'goals', 'sessions']
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (e) { return defaults(); }
  };

  let state = load();
  const save = () => { try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); } catch (e) {} };

  return {
    get: () => state,
    update(fn) { fn(state); save(); },
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

/* ---------- 5. UI & ROUTEUR ---------- */
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

const refreshView = () => Router.render();

/* ---------- 6. FORMULAIRE DE SÉANCE ---------- */
const SessionForm = {
  open(session, date) {
    const day = (session && session.date) || date || todayStr();
    this.id = session ? session.id : null;
    this.data = { date: day, sport: 'Course à pied', status: 'done', effort: 'Endurance', duration: 30, distance: 0, intensity: 5, notes: '', ...(session || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const sports = Store.get().sports.map(s => s.name);
    const opts = (list, cur) => list.map(n => `<option ${n === cur ? 'selected' : ''}>${n}</option>`).join('');

    this.el.innerHTML = `
      <form class="sheet card" style="max-width: 500px; padding: 24px; background: var(--surface); border-radius: 16px;">
        <h2>${this.id ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <div class="field" style="margin-bottom: 12px;">
          <label>Statut</label>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${Object.entries(STATUS).map(([k, v]) => `
              <label class="chip"><input type="radio" name="status" value="${k}" ${d.status === k ? 'checked' : ''}> ${v.label}</label>
            `).join('')}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Sport<select name="sport">${opts(sports, d.sport)}</select></label>
          <label class="field">Date<input type="date" name="date" value="${d.date}" required></label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Effort<select name="effort">${opts(EFFORTS, d.effort)}</select></label>
          <label class="field">Durée (min)<input type="number" name="duration" value="${d.duration}" min="0"></label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Distance (km)<input type="number" step="0.1" name="distance" value="${d.distance}" min="0"></label>
          <label class="field">Intensité (1-10)<input type="number" name="intensity" value="${d.intensity}" min="1" max="10"></label>
        </div>
        <label class="field" style="margin-bottom: 16px;">Notes<textarea name="notes" rows="2">${d.notes || ''}</textarea></label>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-ghost" id="cancel-session">Annuler</button>
          <button type="submit" class="btn">Enregistrer</button>
        </div>
      </form>`;

    const form = this.el.querySelector('form');
    form.querySelector('#cancel-session').onclick = () => this.close();
    form.onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const data = {
        date: f.get('date'),
        sport: f.get('sport'),
        status: f.get('status'),
        effort: f.get('effort'),
        duration: parseFloat(f.get('duration')) || 0,
        distance: parseFloat(f.get('distance')) || 0,
        intensity: parseInt(f.get('intensity'), 10) || 5,
        notes: f.get('notes').trim()
      };
      Store.update(s => {
        if (this.id) {
          const idx = s.sessions.findIndex(x => x.id === this.id);
          if (idx >= 0) s.sessions[idx] = { ...s.sessions[idx], ...data };
        } else {
          s.sessions.unshift({ id: Store.uid(), ...data });
        }
      });
      this.close();
      refreshView();
      UI.toast('Séance sauvegardée !');
    };
  }
};

/* ---------- 7. FORMULAIRE D'OBJECTIFS ---------- */
const GoalForm = {
  open(goal) {
    this.id = goal ? goal.id : null;
    this.data = { title: '', type: 'distance', target: 50, sport: 'Course à pied', startDate: todayStr(), targetDate: '', progress: 0, ...(goal || {}) };
    this.el = document.createElement('div');
    this.el.className = 'modal';
    document.body.appendChild(this.el);
    this.render();
  },
  close() { if (this.el) this.el.remove(); },

  render() {
    const d = this.data;
    const sports = Store.get().sports.map(s => s.name);
    this.el.innerHTML = `
      <form class="sheet card" style="max-width: 450px; padding: 24px; background: var(--surface); border-radius: 16px;">
        <h2>${this.id ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h2>
        <label class="field" style="margin-bottom: 12px;">Titre de l'objectif<input name="title" value="${d.title}" required placeholder="Ex. Courir 100km"></label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <label class="field">Type<select name="type">
            <option value="distance" ${d.type === 'distance' ? 'selected' : ''}>Distance (km)</option>
            <option value="sessions" ${d.type === 'sessions' ? 'selected' : ''}>Nombre de séances</option>
            <option value="manual" ${d.type === 'manual' ? 'selected' : ''}>Manuel (%)</option>
          </select></label>
          <label class="field">Cible<input type="number" name="target" value="${d.target}"></label>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <label class="field">Sport<select name="sport"><option value="">Tous les sports</option>${sports.map(s => `<option ${s === d.sport ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          <label class="field">Date cible<input type="date" name="targetDate" value="${d.targetDate}"></label>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-ghost" id="cancel-goal">Annuler</button>
          <button type="submit" class="btn">Enregistrer</button>
        </div>
      </form>`;

    const form = this.el.querySelector('form');
    form.querySelector('#cancel-goal').onclick = () => this.close();
    form.onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const data = {
        title: f.get('title').trim(),
        type: f.get('type'),
        target: parseFloat(f.get('target')) || 0,
        sport: f.get('sport'),
        targetDate: f.get('targetDate'),
        startDate: d.startDate || todayStr(),
        status: 'active'
      };
      Store.update(s => {
        if (this.id) {
          const idx = s.goals.findIndex(x => x.id === this.id);
          if (idx >= 0) s.goals[idx] = { ...s.goals[idx], ...data };
        } else {
          s.goals.unshift({ id: Store.uid(), progress: 0, ...data });
        }
      });
      this.close();
      refreshView();
      UI.toast('Objectif enregistré !');
    };
  }
};

/* ---------- 8. CALCULS DES OBJECTIFS ---------- */
function getGoalProgress(g) {
  if (g.type === 'manual') return { pct: g.progress || 0, text: `${g.progress || 0}%` };
  const done = Store.get().sessions.filter(s => s.status === 'done' && (!g.sport || s.sport === g.sport));
  if (g.type === 'sessions') {
    const cur = done.length;
    const pct = Math.min(100, Math.round((cur / g.target) * 100));
    return { pct, text: `${cur} / ${g.target} séances` };
  }
  if (g.type === 'distance') {
    const cur = done.reduce((sum, s) => sum + (s.distance || 0), 0);
    const pct = Math.min(100, Math.round((cur / g.target) * 100));
    return { pct, text: `${Math.round(cur * 10) / 10} / ${g.target} km` };
  }
  return { pct: 0, text: '0%' };
}

/* ---------- 9. VUES ---------- */
const Views = {};

Views.accueil = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const totalKm = sessions.reduce((s, x) => s + (x.distance || 0), 0);
  const totalMin = sessions.reduce((s, x) => s + (x.duration || 0), 0);

  el.innerHTML = `
    <header class="page-head"><h1>Bonjour ${Store.get().profile.name || 'Athlète'} !</h1><p>Votre tableau de bord personnel.</p></header>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card"><p class="muted">Séances réalisées</p><h2 style="font-size: 2rem; margin-top: 8px;">${sessions.length}</h2></div>
      <div class="card"><p class="muted">Distance totale</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round(totalKm * 10) / 10} km</h2></div>
      <div class="card"><p class="muted">Temps cumulé</p><h2 style="font-size: 2rem; margin-top: 8px;">${Math.round((totalMin / 60) * 10) / 10} h</h2></div>
    </div>
    <section class="card">
      <h2>Dernières activités</h2>
      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
        ${sessions.slice(0, 3).map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
            <div><strong>${s.sport}</strong><p class="muted" style="font-size: 0.85rem;">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''}</p></div>
            <span class="chip">${STATUS[s.status]?.label || 'Done'}</span>
          </div>
        `).join('')}
      </div>
    </section>`;
};

Views.seances = (el) => {
  const list = Store.get().sessions;
  el.innerHTML = `
    <header class="page-head"><h1>Vos Séances</h1><p>Toutes vos séances enregistrées.</p></header>
    <div style="margin-bottom: 16px;"><button class="btn" id="btn-new-s">${icon('plus')} Nouvelle séance</button></div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${list.map(s => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3>${s.sport}</h3>
            <p class="muted">${fmtDate(s.date)} — ${s.duration} min${s.distance ? `| ${s.distance} km` : ''} | Effort: ${s.effort \vert{}\vert{} 'N/A'}</p>${s.notes ? `<p style="margin-top: 4px; font-size: 0.9rem;">${s.notes}</p>` : ''}
          </div>
          <button class="btn btn-ghost" data-edit="${s.id}">Edit</button>
        </div>
      `).join('')}
    </div>`;

  el.querySelector('#btn-new-s').onclick = () => SessionForm.open(null);
  el.querySelectorAll('[data-edit]').forEach(b => {
    b.onclick = () => SessionForm.open(Store.get().sessions.find(x => x.id === b.dataset.edit));
  });
};

Views.calendrier = (el) => {
  const sessions = Store.get().sessions;
  const first = new Date(Cal.y, Cal.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nbDays = new Date(Cal.y, Cal.m + 1, 0).getDate();

  let cells = '<span></span>'.repeat(offset);
  for (let d = 1; d <= nbDays; d++) {
    const key = `${Cal.y}-${pad(Cal.m + 1)}-${pad(d)}`;
    const list = sessions.filter(s => s.date === key);
    const dots = list.map(s => `<i style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${STATUS[s.status]?.css || '#333'}; margin:1px;"></i>`).join('');
    cells += `<button class="day" data-date="${key}" style="aspect-ratio:1; padding:4px; border:1px solid var(--line); border-radius:8px; background:var(--surface);"><b>${d}</b><div>${dots}</div></button>`;
  }

  const dayList = sessions.filter(s => s.date === Cal.sel);

  el.innerHTML = `
    <header class="page-head"><h1>Calendrier</h1><p>Vue mensuelle de vos séances.</p></header>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <button class="btn btn-ghost" id="cal-prev">${icon('left')}</button>
      <h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
      <button class="btn btn-ghost" id="cal-next">${icon('right')}</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; margin-bottom:24px;">${cells}</div>
    <div class="card">
      <h3>Séances du ${fmtDate(Cal.sel)}</h3>
      <div style="margin-top:12px;">
        ${dayList.length ? dayList.map(s => `<p><strong>${s.sport}</strong> - ${s.duration} min (${STATUS[s.status]?.label})</p>`).join('') : '<p class="muted">Aucune séance prévue ce jour.</p>'}
      </div>
      <button class="btn" id="cal-add" style="margin-top:12px;">${icon('plus')} Ajouter une séance</button>
    </div>`;

  el.querySelector('#cal-prev').onclick = () => { Cal.m--; if (Cal.m < 0) { Cal.m = 11; Cal.y--; } refreshView(); };
  el.querySelector('#cal-next').onclick = () => { Cal.m++; if (Cal.m > 11) { Cal.m = 0; Cal.y++; } refreshView(); };
  el.querySelectorAll('.day').forEach(b => b.onclick = () => { Cal.sel = b.dataset.date; refreshView(); });
  el.querySelector('#cal-add').onclick = () => SessionForm.open(null, Cal.sel);
};

Views.objectifs = (el) => {
  const goals = Store.get().goals;
  el.innerHTML = `
    <header class="page-head"><h1>Objectifs</h1><p>Suivez votre progression.</p></header>
    <div style="margin-bottom:16px;"><button class="btn" id="btn-new-goal">${icon('plus')} Nouvel objectif</button></div>
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${goals.map(g => {
        const prog = getGoalProgress(g);
        return `
          <div class="card">
            <div style="display:flex; justify-content:space-between;">
              <h3>${g.title}</h3>
              <strong>${prog.pct}%</strong>
            </div>
            <p class="muted" style="margin-bottom:8px;">${prog.text}${g.sport ? `(${g.sport})` : ''}</p>
            <div style="height:8px; background:var(--hover); border-radius:4px; overflow:hidden;">
              <div style="height:100%; width:${prog.pct}%; background:var(--accent);"></div>
            </div>
          </div>`;
      }).join('')}
    </div>`;

  el.querySelector('#btn-new-goal').onclick = () => GoalForm.open(null);
};

Views.statistiques = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const sportsMap = {};
  sessions.forEach(s => {
    sportsMap[s.sport] = (sportsMap[s.sport] || 0) + (s.distance || s.duration || 1);
  });

  el.innerHTML = `
    <header class="page-head"><h1>Statistiques</h1><p>Analyse de vos données d'entraînement.</p></header>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:16px;">
      <div class="card">
        <h3>Répartition par Sport</h3>
        <ul style="margin-top:12px; padding-left:20px;">
          ${Object.entries(sportsMap).map(([k, v]) => `<li><strong>${k}</strong> :${Math.round(v * 10) / 10}</li>`).join('')}
        </ul>
      </div>
      <div class="card">
        <h3>Résumé Global</h3>
        <p style="margin-top:12px;">Total de séances : <strong>${sessions.length}</strong></p>
        <p>Distance globale : <strong>${sessions.reduce((a, b) => a + (b.distance || 0), 0)} km</strong></p>
      </div>
    </div>`;
};

Views.records = (el) => {
  const sessions = Store.get().sessions.filter(s => s.status === 'done');
  const sports = [...new Set(sessions.map(s => s.sport))];

  el.innerHTML = `
    <header class="page-head"><h1>Records & Performances</h1><p>Vos meilleures performances calculées par discipline.</p></header>
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${sports.map(sp => {
        const list = sessions.filter(s => s.sport === sp);
        const maxDist = Math.max(...list.map(s => s.distance || 0));
        const maxDur = Math.max(...list.map(s => s.duration || 0));
        return `
          <div class="card">
            <h2>${sp}</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
              <div><p class="muted">Plus longue distance</p><strong>${maxDist > 0 ? maxDist + ' km' : 'N/A'}</strong></div>
              <div><p class="muted">Plus longue durée</p><strong>${maxDur > 0 ? maxDur + ' min' : 'N/A'}</strong></div>
            </div>
          </div>`;
      }).join('') || '<div class="card"><p class="muted">Aucune donnée disponible pour établir des records.</p></div>'}
    </div>`;
};

Views.parametres = (el) => {
  el.innerHTML = `
    <header class="page-head"><h1>Paramètres</h1><p>Gestion des données.</p></header>
    <div class="card"><button class="btn btn-ghost" id="btn-reset">Réinitialiser l'application</button></div>`;
  el.querySelector('#btn-reset').onclick = () => {
    if (confirm('Voulez-vous tout réinitialiser ?')) {
      localStorage.removeItem(APP.storageKey);
      location.reload();
    }
  };
};

/* ---------- 10. INITIALISATION ---------- */
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
    navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()));
  }
});  { id: 'cyclisme', name: 'Cyclisme', unit: 'km', color: '#F59E0B' },
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
