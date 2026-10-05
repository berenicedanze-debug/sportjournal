'use strict';

const APP = { storageKey: 'sportjournal:v8' };

const PAGES = [
  { id: 'accueil', label: 'Accueil', icon: 'home', sub: 'Tableau de bord.' },
  { id: 'parametres', label: 'Paramètres', icon: 'gear', sub: 'Configuration.' }
];

const Store = (() => {
  const defaults = () => ({
    profile: { name: '', weight: '', goal: '' },
    settings: { theme: 'auto' },
    sessions: []
  });
  const load = () => {
    try {
      const raw = localStorage.getItem(APP.storageKey);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch (e) { return defaults(); }
  };
  let state = load();
  return {
    get: () => state,
    update(fn) { fn(state); try { localStorage.setItem(APP.storageKey, JSON.stringify(state)); } catch(e){} }
  };
})();

const WelcomeModal = {
  showIfNeeded() {
    const p = Store.get().profile;
    if (p.name && p.name.trim() !== '') return;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000;';
    overlay.innerHTML = `
      <div style="background:#fff; padding:30px; border-radius:12px; width:350px; color:#333;">
        <h2>Bienvenue !</h2>
        <form id="w-form" style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
          <label>Votre Prénom : <input type="text" name="name" required style="width:100%; padding:6px; margin-top:4px;"></label>
          <button type="submit" style="padding:8px; background:#007bff; color:#fff; border:none; border-radius:4px; cursor:pointer;">Valider</button>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#w-form').onsubmit = (e) => {
      e.preventDefault();
      const name = e.target.name.value.trim();
      Store.update(s => { s.profile.name = name; });
      overlay.remove();
      location.reload();
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const view = document.getElementById('view');
  const p = Store.get().profile;
  view.innerHTML = `<div style="padding:40px;"><h1>Bonjour ${p.name || ''}</h1><p>Votre journal de sport est prêt.</p></div>`;
  WelcomeModal.showIfNeeded();
});  });

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
});
