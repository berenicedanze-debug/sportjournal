/* ==========================================================
   SPORT JOURNAL - APP.JS (Partie 1 / 3)
   Configuration, Stockage, Utilitaires & UI
   ========================================================== */

/* ---------- 1. CONFIGURATION & PAGES ---------- */
const APP = {
  name: "Sport Journal",
  version: "1.0.0",
  storageKey: "sportjournal_data_v1"
};

const PAGES = [
  { id: "accueil", label: "Accueil", icon: "home", sub: "Vue d'ensemble de votre activité physique.", empty: ["Aucune séance récente", "Commencez par ajouter votre première séance d'entraînement."] },
  { id: "sessions", label: "Séances", icon: "activity", sub: "Historique complet de vos entraînements.", empty: ["Aucune séance enregistrée."] },
  { id: "calendrier", label: "Calendrier", icon: "calendar", sub: "Planification et suivi mensuel." },
  { id: "objectifs", label: "Objectifs", icon: "target", sub: "Fixez et suivez vos buts sportifs." },
  { id: "sports", label: "Sports", icon: "compass", sub: "Gérez vos disciplines sportives." },
  { id: "records", label: "Records", icon: "award", sub: "Vos meilleures performances." },
  { id: "parametres", label: "Paramètres", icon: "settings", sub: "Préférences et gestion des données." }
];

/* ---------- 2. BIBLIOTHÈQUE D'ICÔNES SVG ---------- */
const ICONS = {
  home: `<svg class="ico" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  activity: `<svg class="ico" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  calendar: `<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  target: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  compass: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
  award: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
  settings: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  plus: `<svg class="ico" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  trash: `<svg class="ico" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  sun: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  moon: `<svg class="ico" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  monitor: `<svg class="ico" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
};

function icon(name) {
  return ICONS[name] || ICONS.activity;
}

/* ---------- 3. GESTION DES DONNÉES (STORE) ---------- */
const Store = {
  data: null,
  get() {
    if (!this.data) {
      const raw = localStorage.getItem(APP.storageKey);
      if (raw) {
        try { this.data = JSON.parse(raw); } catch (e) { /* ignore */ }
      }
      if (!this.data) {
        this.data = {
          profile: null,
          settings: { theme: "auto" },
          sports: [
            { id: "run", name: "Course à pied", icon: "activity", category: "Endurance" },
            { id: "bike", name: "Cyclisme", icon: "compass", category: "Endurance" },
            { id: "gym", name: "Musculation", icon: "target", category: "Force" }
          ],
          sessions: [],
          goals: []
        };
        this.save();
      }
    }
    return this.data;
  },
  save() {
    localStorage.setItem(APP.storageKey, JSON.stringify(this.data));
  }
};

/* ---------- 4. UTILITAIRES ---------- */
function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDuration(mins) {
  const m = parseInt(mins, 10);
  if (isNaN(m) || m <= 0) return "0 min";
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem} min`;
  return rem === 0 ? `${h}h` : `${h}h${rem < 10 ? '0' : ''}${rem}`;
}

/* ---------- 5. MODULE UI & THÈMES ---------- */
const UI = {
  THEMES: ["auto", "light", "dark"],
  THEME_LABELS: { auto: "Auto", light: "Clair", dark: "Sombre" },
  THEME_ICONS: { auto: "monitor", light: "sun", dark: "moon" },

  applyTheme() {
    const s = Store.get();
    const t = s.settings.theme || "auto";
    document.documentElement.setAttribute("data-theme", t);
    
    // Mise à jour du bouton de thème dans la sidebar s'il existe
    const btn = document.getElementById("theme-btn");
    if (btn) {
      btn.innerHTML = `${icon(this.THEME_ICONS[t])} <span>${this.THEME_LABELS[t]}</span>`;
    }
  },

  cycleTheme() {
    const s = Store.get();
    const current = s.settings.theme || "auto";
    const nextIdx = (this.THEMES.indexOf(current) + 1) % this.THEMES.length;
    s.settings.theme = this.THEMES[nextIdx];
    Store.save();
    this.applyTheme();
    this.toast(`Thème : ${this.THEME_LABELS[s.settings.theme]}`);
  },

  toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 3000);
  }
};
/* ==========================================================
   SPORT JOURNAL - APP.JS (Partie 2 / 3)
   Vues, Modaux et Gestion des Séances
   ========================================================== */

/* ---------- 6. RENDU DES VUES & ROUTAGE ---------- */
const Views = {};

function refreshView() {
  const container = document.getElementById('view');
  if (!container) return;
  const currentId = Router.current();
  
  // Animation de transition de page
  container.classList.remove('enter');
  void container.offsetWidth; // Trigger reflow
  container.classList.add('enter');

  container.innerHTML = '';
  if (typeof Views[currentId] === 'function') {
    Views[currentId](container);
  } else {
    container.innerHTML = `<section class="card empty"><h2>Vue introuvable</h2></section>`;
  }
}

/* ---------- 7. COMPOSANTS DE SÉANCES & MODAUX ---------- */
function getStatusColor(status) {
  switch (status) {
    case 'done': return 'var(--done)';
    case 'planned': return 'var(--planned)';
    case 'cancelled': return 'var(--cancelled)';
    default: return 'var(--rest)';
  }
}

function sessionItem(se, compact = false) {
  const s = Store.get();
  const sport = s.sports.find(sp => sp.id == se.sportId) || { name: 'Sport', icon: 'activity' };
  const borderColor = getStatusColor(se.status);

  return `
    <div class="item" style="--c: ${borderColor};" data-id="${se.id}">
      <div style="display:flex; align-items:center; gap:12px; width:100%;">
        <div style="background:var(--bg); border:1px solid var(--line); padding:10px; border-radius:var(--r-ctrl);">${icon(sport.icon)}</div>
        <div class="item-main">
          <h3>${esc(sport.name)} — ${esc(se.date)}</h3>
          <div class="tags">
            ${se.duration ? `<span>${formatDuration(se.duration)}</span>` : ''}
            ${se.distance ? `<span>${se.distance} km</span>` : ''}
            ${se.rpe ? `<span>RPE ${se.rpe}/10</span>` : ''}
            <span>${se.status === 'done' ? 'Effectuée' : 'Planifiée'}</span>
          </div>
        </div>
        ${!compact ? `
          <div class="item-actions">
            <button class="btn btn-ghost delete-session" data-id="${se.id}" title="Supprimer">${icon('trash')}</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function bindSessionActions(el) {
  el.querySelectorAll('.delete-session').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (confirm('Voulez-vous vraiment supprimer cette séance ?')) {
        const s = Store.get();
        s.sessions = s.sessions.filter(se => se.id != id);
        Store.save();
        Router.render();
        UI.toast('Séance supprimée.');
      }
    };
  });
}

/* Modal d'ajout / modification de séance */
const SessionModal = {
  open(sessionData = null) {
    const s = Store.get();
    let modal = document.getElementById('session-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'session-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="card sheet">
        <h2>${sessionData ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
        <form id="session-form" class="stack">
          <div class="field">
            <label>Sport</label>
            <select id="modal-sport" required>
              ${s.sports.map(sp => `<option value="${sp.id}" ${sessionData && sessionData.sportId == sp.id ? 'selected' : ''}>${esc(sp.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Date</label>
            <input type="date" id="modal-date" value="${sessionData ? sessionData.date : todayStr()}" required>
          </div>
          <div class="grid2">
            <div class="field">
              <label>Durée (minutes)</label>
              <input type="number" id="modal-duration" value="${sessionData ? sessionData.duration : 45}" min="1" required>
            </div>
            <div class="field">
              <label>Distance (km)</label>
              <input type="number" step="0.1" id="modal-distance" value="${sessionData ? sessionData.distance : 5}">
            </div>
          </div>
          <div class="field">
            <label>Statut</label>
            <select id="modal-status">
              <option value="done" ${!sessionData || sessionData.status === 'done' ? 'selected' : ''}>Effectuée</option>
              <option value="planned" ${sessionData && sessionData.status === 'planned' ? 'selected' : ''}>Planifiée</option>
            </select>
          </div>
          <div class="actions" style="margin-top:12px;">
            <button type="button" class="btn btn-ghost" id="modal-cancel">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>
      </div>
    `;

    modal.style.display = 'grid';

    modal.querySelector('#modal-cancel').onclick = () => { modal.style.display = 'none'; };
    modal.querySelector('#session-form').onsubmit = (e) => {
      e.preventDefault();
      const sportId = modal.querySelector('#modal-sport').value;
      const date = modal.querySelector('#modal-date').value;
      const duration = modal.querySelector('#modal-duration').value;
      const distance = modal.querySelector('#modal-distance').value;
      const status = modal.querySelector('#modal-status').value;

      if (sessionData) {
        sessionData.sportId = sportId;
        sessionData.date = date;
        sessionData.duration = duration;
        sessionData.distance = distance;
        sessionData.status = status;
      } else {
        s.sessions.push({
          id: Date.now(),
          sportId,
          date,
          duration,
          distance,
          status
        });
      }

      Store.save();
      modal.style.display = 'none';
      Router.render();
      UI.toast('Séance enregistrée avec succès !');
    };
  }
};

/* Assistant de profil (Wizard) */
const Wizard = {
  open(isEdit = false) {
    const s = Store.get();
    const p = s.profile || { name: '', goal: '' };
    let modal = document.getElementById('wizard-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wizard-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="card sheet">
        <h2>${isEdit ? 'Modifier mon profil' : 'Bienvenue sur Sport Journal'}</h2>
        <p class="muted">Configurons votre profil pour commencer.</p>
        <form id="wizard-form" class="stack">
          <div class="field">
            <label>Votre nom ou pseudo</label>
            <input type="text" id="wizard-name" value="${esc(p.name)}" required placeholder="Ex: Thomas">
          </div>
          <div class="field">
            <label>Objectif principal</label>
            <input type="text" id="wizard-goal" value="${esc(p.goal)}" placeholder="Ex: Courir un 10km">
          </div>
          <div class="actions" style="margin-top:12px;">
            <div></div>
            <button type="submit" class="btn">Valider</button>
          </div>
        </form>
      </div>
    `;

    modal.style.display = 'grid';
    modal.querySelector('#wizard-form').onsubmit = (e) => {
      e.preventDefault();
      const name = modal.querySelector('#wizard-name').value;
      const goal = modal.querySelector('#wizard-goal').value;

      s.profile = { name, goal };
      Store.save();
      modal.style.display = 'none';
      Router.render();
      UI.toast('Profil enregistré !');
    };
  }
};
/* ==========================================================
   SPORT JOURNAL - APP.JS (Partie 3 / 3)
   Vues, Routeur & Initialisation Globale
   ========================================================== */

/* ---------- 8. VUES DE L'APPLICATION ---------- */

/* 8a. Vue Accueil */
Views.accueil = (el) => {
  const page = PAGES[0], s = Store.get();
  const profile = s.profile;
  const sessions = s.sessions.filter(se => se.status === 'done');
  
  const totalDist = sessions.reduce((acc, se) => acc + (parseFloat(se.distance) || 0), 0);
  const totalMins = sessions.reduce((acc, se) => acc + (parseInt(se.duration) || 0), 0);
  const totalCount = sessions.length;

  el.innerHTML = `
    <header class="page-head">
      <h1>Bonjour ${profile ? esc(profile.name) : 'sportif'} !</h1>
      <p>${page.sub}</p>
    </header>

    <div class="grid3" style="margin-bottom:24px;">
      <div class="card">
        <h2>${totalCount}</h2>
        <p class="muted">Séances totales</p>
      </div>
      <div class="card">
        <h2>${formatDuration(totalMins)}</h2>
        <p class="muted">Temps d'effort</p>
      </div>
      <div class="card">
        <h2>${totalDist.toFixed(1)} km</h2>
        <p class="muted">Distance parcourue</p>
      </div>
    </div>

    <section class="card stack">
      <h2>Dernières séances</h2>
      ${
        sessions.length 
          ? `<div class="list">${sessions.slice(-3).reverse().map(se => sessionItem(se, true)).join('')}</div>`
          : `<p class="muted">${page.empty ? page.empty[0] : 'Aucune séance récente'}.</p>`
      }
    </section>
  `;
  bindSessionActions(el);
};

/* 8b. Vue Sessions */
Views.sessions = (el) => {
  const page = PAGES[1], s = Store.get();
  el.innerHTML = `
    <header class="page-head">
      <h1>${page.label}</h1>
      <p>${page.sub}</p>
    </header>
    <div class="toolbar">
      <button class="btn" id="new-session-btn">${icon('plus')} Ajouter une séance</button>
    </div>
    <div class="card stack">
      <h2>Toutes les séances</h2>
      ${
        s.sessions.length
          ? `<div class="list">${s.sessions.slice().reverse().map(se => sessionItem(se)).join('')}</div>`
          : `<p class="muted">Aucune séance enregistrée pour le moment.</p>`
      }
    </div>
  `;
  el.querySelector('#new-session-btn').onclick = () => SessionModal.open();
  bindSessionActions(el);
};

/* 8c. Vue Calendrier */
Views.calendrier = (el) => {
  const page = PAGES[2];
  el.innerHTML = `
    <header class="page-head">
      <h1>${page.label}</h1>
      <p>${page.sub}</p>
    </header>
    <section class="card empty">
      ${icon(page.icon)}
      <h2>Calendrier des entraînements</h2>
      <p>Visualisez vos séances planifiées et passées sous forme de calendrier mensuel.</p>
      <div class="toolbar" style="margin-top:16px;">
        <button class="btn" id="cal-add-btn">Planifier une séance</button>
      </div>
    </section>
  `;
  el.querySelector('#cal-add-btn').onclick = () => SessionModal.open();
};

/* 8d. Vue Objectifs */
Views.objectifs = (el) => {
  const page = PAGES[3], s = Store.get();
  el.innerHTML = `
    <header class="page-head">
      <h1>${page.label}</h1>
      <p>${page.sub}</p>
    </header>
    <div class="toolbar">
      <button class="btn" id="new-goal-btn">${icon('plus')} Nouvel objectif</button>
    </div>
    <div class="grid3">
      ${
        s.goals.length
          ? s.goals.map(g => `
              <div class="card stack">
                <h3>${esc(g.title)}</h3>
                <p class="muted">${esc(g.description || '')}</p>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width:${g.progress || 0}%;"></div>
                </div>
              </div>
            `).join('')
          : `<div class="card empty" style="grid-column: span 3;">${icon(page.icon)}<h2>Aucun objectif défini</h2><p>Fixez-vous des buts précis pour progresser.</p></div>`
      }
    </div>
  `;
  el.querySelector('#new-goal-btn').onclick = () => {
    const title = prompt("Titre de l'objectif :");
    if (title) {
      s.goals.push({ id: Date.now(), title, progress: 0 });
      Store.save();
      Router.render();
    }
  };
};

/* 8e. Vue Sports */
Views.sports = (el) => {
  const page = PAGES[4], s = Store.get();
  el.innerHTML = `
    <header class="page-head">
      <h1>${page.label}</h1>
      <p>${page.sub}</p>
    </header>
    <div class="toolbar">
      <button class="btn" id="new-sport-btn">${icon('plus')} Ajouter un sport</button>
    </div>
    <div class="grid3">
      ${
        s.sports.map(sp => `
          <div class="card stack" style="display:flex; flex-direction:row; align-items:center; gap:12px;">
            <div style="font-size:24px;">${icon(sp.icon || 'activity')}</div>
            <div>
              <h3>${esc(sp.name)}</h3>
              <p class="muted">${esc(sp.category || 'Général')}</p>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
  el.querySelector('#new-sport-btn').onclick = () => {
    const name = prompt("Nom du sport :");
    if (name) {
      s.sports.push({ id: Date.now(), name, icon: 'activity' });
      Store.save();
      Router.render();
    }
  };
};

/* 8f. Vue Records */
Views.records = (el) => {
  const page = PAGES[5], s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');

  let maxDistance = 0;
  let maxDuration = 0;
  doneSessions.forEach(se => {
    const dist = parseFloat(se.distance) || 0;
    const dur = parseInt(se.duration, 10) || 0;
    if (dist > maxDistance) maxDistance = dist;
    if (dur > maxDuration) maxDuration = dur;
  });

  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="grid3" style="margin-bottom:24px;">
      <div class="card">
        <h2>${maxDistance.toFixed(1)} km</h2>
        <p class="muted">Plus longue distance</p>
      </div>
      <div class="card">
        <h2>${formatDuration(maxDuration)}</h2>
        <p class="muted">Séance la plus longue</p>
      </div>
    </div>
    <section class="card empty">
      ${icon(page.icon)}
      <h2>Records et Badges</h2>
      <p>Vos meilleures performances s'afficheront ici automatiquement.</p>
    </section>
  `;
};

/* 8g. Vue Paramètres */
Views.parametres = (el) => {
  const page = PAGES[6], s = Store.get();
  const p = s.profile || {};

  el.innerHTML = `
    <header class="page-head"><h1>${page.label}</h1><p>${page.sub}</p></header>
    <div class="card stack">
      <h2>Mon Profil</h2>
      <p><b>Nom :</b> ${esc(p.name || 'Non renseigné')}</p>
      <p><b>Objectif principal :</b> ${esc(p.goal || 'Non renseigné')}</p>
      <div class="toolbar"><button class="btn btn-ghost" id="edit-profile">Modifier mon profil</button></div>
    </div>
    <div class="card stack">
      <h2>Apparence</h2>
      <div class="toolbar">
        <button class="btn btn-ghost" id="theme-toggle-btn">${icon(UI.THEME_ICONS[s.settings.theme])} Thème : ${UI.THEME_LABELS[s.settings.theme]}</button>
      </div>
    </div>
    <div class="card stack">
      <h2>Données</h2>
      <div class="toolbar">
        <button class="btn btn-ghost" id="export-data">Exporter les données (JSON)</button>
        <button class="btn btn-ghost" id="reset-data" style="color:var(--cancelled);">Réinitialiser l'application</button>
      </div>
    </div>
  `;

  el.querySelector('#edit-profile').onclick = () => Wizard.open(true);
  el.querySelector('#theme-toggle-btn').onclick = () => UI.cycleTheme();
  
  el.querySelector('#export-data').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Store.get(), null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `sportjournal_backup_${todayStr()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    UI.toast('Exportation réussie.');
  };

  el.querySelector('#reset-data').onclick = () => {
    if (confirm('Attention : toutes vos données seront effacées. Êtes-vous sûr ?')) {
      localStorage.removeItem(APP.storageKey);
      window.location.reload();
    }
  };
};

/* ---------- 9. ROUTEUR & NAVIGATION ---------- */
const Router = {
  current() {
    const hash = window.location.hash.slice(1);
    return PAGES.some(p => p.id === hash) ? hash : PAGES[0].id;
  },
  render() {
    const id = this.current();
    // Mise à jour de l'attribut aria-current sur les liens de navigation (sidebar et mobile)
    document.querySelectorAll('.nav a, .tabbar a').forEach(a => {
      const target = a.getAttribute('href')?.slice(1);
      if (target) {
        if (target === id) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      }
    });
    refreshView();
  },
  init() {
    window.addEventListener('hashchange', () => this.render());
  }
};

/* ---------- 10. INITIALISATION GLOBALE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  UI.applyTheme();
  Router.init();

  // Génération de la navigation (Sidebar et Tabbar mobile)
  const navHtml = PAGES.map(p => `
    <a href="#${p.id}">
      ${icon(p.icon)}
      <span>${p.label}</span>
    </a>
  `).join('');

  const navSide = document.getElementById('nav-side');
  const navTab = document.getElementById('nav-tab');
  if (navSide) navSide.innerHTML = navHtml;
  if (navTab) navTab.innerHTML = navHtml;

  // Liaison du bouton de thème fixe de la sidebar
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.onclick = () => UI.cycleTheme();
  }

  // Ouverture du wizard si aucun profil n'existe
  if (!Store.get().profile) {
    Wizard.open();
  }

  Router.render();
});
