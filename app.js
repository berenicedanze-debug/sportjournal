// --- 1. STORE & DONNÉES LOCALES ---
const Store = {
  get() {
    const data = localStorage.getItem('fit_track_pro');
    if (!data) {
      const initial = {
        user: { name: "Utilisateur", weight: 70, targetWeight: 65 },
        widgets: { kpi: true, chart: true, upcoming: true, objectives: true, quote: true, weight: true },
        sports: [
          { id: "run", name: "Course à pied", category: "Cardio", unit: "km", color: "#2f57f0" },
          { id: "bike", name: "Cyclisme", category: "Cardio", unit: "km", color: "#10b981" },
          { id: "swim", name: "Natation", category: "Cardio", unit: "m", color: "#06b6d4" },
          { id: "gym", name: "Musculation", category: "Renforcement", unit: "kg", color: "#8b5cf6" },
          { id: "pilates", name: "Pilate", category: "Souplesse", unit: "min", color: "#f59e0b" },
          { id: "tennis", name: "Tennis", category: "Technique", unit: "min", color: "#ec4899" }
        ],
        categories: ["Cardio", "Renforcement", "Souplesse", "Compétition", "Récupération", "Technique"],
        sessions: [],
        objectives: [],
        records: []
      };
      localStorage.setItem('fit_track_pro', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },
  save(data) {
    localStorage.setItem('fit_track_pro', JSON.stringify(data));
  }
};

const Views = {};

function getSportEmoji(sportId) {
  const map = {
    run: "🏃",
    bike: "🚴",
    swim: "🏊",
    gym: "🏋️",
    pilates: "🧘",
    tennis: "🎾"
  };
  return map[sportId] || "🎯";
}

// --- 2. ROUTEUR & NAVIGATION ---
function router() {
  const hash = location.hash || '#accueil';
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = '';

  if (hash === '#accueil' && Views.accueil) {
    Views.accueil(appContainer);
  } else if (hash === '#calendrier' && Views.calendrier) {
    Views.calendrier(appContainer);
  } else if (hash === '#seances' && Views.seances) {
    Views.seances(appContainer);
  } else if (hash === '#records' && Views.records) {
    Views.records(appContainer);
  } else if (hash === '#objectifs' && Views.objectifs) {
    Views.objectifs(appContainer);
  } else if (hash === '#sports' && Views.sports) {
    Views.sports(appContainer);
  } else if (hash === '#parametres' && Views.parametres) {
    Views.parametres(appContainer);
  } else if (hash === '#statistiques' && Views.statistiques) {
    Views.statistiques(appContainer);
  } else {
    appContainer.innerHTML = `
      <header class="page-head">
        <h1>Section en cours de construction</h1>
        <p>Cette page sera bientôt disponible.</p>
      </header>
    `;
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

window.addEventListener('hashchange', router);

// --- 3. MODALE DE GESTION DES SÉANCES ---
const SessionModal = {
  open(sessionData = {}) {
    const s = Store.get();
    const modal = document.createElement('div');
    modal.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;";
    
    modal.innerHTML = `
      <div class="card stack" style="width: 100%; max-width: 550px; padding: 24px; background: var(--surface);">
        <h3 style="margin-top: 0;">${sessionData.id ? 'Modifier la séance' : 'Nouvelle séance'}</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Date</label>
            <input type="date" id="m-date" class="input" value="${sessionData.date || new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
          </div>
          <div>
            <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Sport</label>
            <select id="m-sport" class="input" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
              ${s.sports.map(sp => `<option value="${sp.id}" ${sessionData.sportId === sp.id ? 'selected' : ''}>${sp.name}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
          <div>
            <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Catégorie</label>
            <select id="m-cat" class="input" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
              ${s.categories.map(cat => `<option value="${cat}" ${sessionData.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Statut</label>
            <select id="m-status" class="input" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
              <option value="planned" ${sessionData.status === 'planned' ? 'selected' : ''}>Prévue</option>
              <option value="done" ${sessionData.status === 'done' ? 'selected' : ''}>Réalisée</option>
              <option value="cancelled" ${sessionData.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
            </select>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
          <div>
            <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Durée (minutes)</label>
            <input type="number" id="m-duration" class="input" value="${sessionData.duration || 45}" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
          </div>
          <div>
            <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Performance</label>
            <input type="number" id="m-perf" class="input" value="${sessionData.performance || 0}" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
          </div>
        </div>
        
        <div style="margin-top: 12px;">
          <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Intensité d'effort : <span id="intensity-val">${sessionData.intensity || 5}</span>/10</label>
          <input type="range" id="m-intensity" min="1" max="10" value="${sessionData.intensity || 5}" style="width: 100%;">
        </div>
        
        <div style="margin-top: 12px;">
          <label style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">Notes & Remarques</label>
          <textarea id="m-notes" class="input" placeholder="Sensations, météo, parcours..." style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface); height: 80px;">${sessionData.notes || ''}</textarea>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
          <button class="btn btn-ghost" id="modal-cancel">Annuler</button>
          <button class="btn btn-primary" id="modal-save">Enregistrer</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#m-intensity').oninput = (e) => {
      modal.querySelector('#intensity-val').textContent = e.target.value;
    };
    
    modal.querySelector('#modal-cancel').onclick = () => modal.remove();
    modal.querySelector('#modal-save').onclick = () => {
      const newSession = {
        id: sessionData.id || Date.now(),
        date: modal.querySelector('#m-date').value,
        sportId: modal.querySelector('#m-sport').value,
        category: modal.querySelector('#m-cat').value,
        status: modal.querySelector('#m-status').value,
        duration: parseInt(modal.querySelector('#m-duration').value) || 0,
        performance: parseFloat(modal.querySelector('#m-perf').value) || 0,
        intensity: parseInt(modal.querySelector('#m-intensity').value),
        notes: modal.querySelector('#m-notes').value
      };
      
      if (sessionData.id) {
        const idx = s.sessions.findIndex(x => x.id === sessionData.id);
        if (idx !== -1) s.sessions[idx] = newSession;
      } else {
        s.sessions.push(newSession);
      }
      
      Store.save(s);
      modal.remove();
      router();
    };
  }
};

// --- 4. MODALE DE PERSONNALISATION DES WIDGETS ---
function openWidgetCustomizerModal() {
  const s = Store.get();
  const modal = document.createElement('div');
  modal.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;";
  
  modal.innerHTML = `
    <div class="card stack" style="width: 100%; max-width: 500px; padding: 24px; background: var(--surface);">
      <h3 style="margin-top: 0;">Personnaliser le Tableau de bord</h3>
      <div class="stack" style="gap: 12px; margin: 16px 0;">
        <label><input type="checkbox" id="w-kpi" ${s.widgets.kpi ? 'checked' : ''}> Statistiques Rapides</label>
        <label><input type="checkbox" id="w-upcoming" ${s.widgets.upcoming ? 'checked' : ''}> Prochaines Séances</label>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button class="btn btn-ghost" id="modal-cancel">Annuler</button>
        <button class="btn btn-primary" id="modal-apply">Appliquer</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.querySelector('#modal-cancel').onclick = () => modal.remove();
  modal.querySelector('#modal-apply').onclick = () => {
    s.widgets.kpi = modal.querySelector('#w-kpi').checked;
    s.widgets.upcoming = modal.querySelector('#w-upcoming').checked;
    Store.save(s);
    modal.remove();
    router();
  };
}

// --- 5. VUE ACCUEIL ---
Views.accueil = (el) => {
  const s = Store.get();
  const w = s.widgets;
  
  el.innerHTML = `
    <header class="page-head" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1>Bonjour ${s.user.name} 👋</h1>
        <p>Voici l'aperçu dynamique de vos activités sportives.</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-ghost" id="btn-custom-widgets">⚙️️ Personnaliser</button>
        <button class="btn btn-primary" id="btn-new-session">+ Nouvelle séance</button>
      </div>
    </header>
    
    <div class="stack" style="gap: 24px;">
      ${w.kpi ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div class="card" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">🏃 Séances ce mois</div>
            <div style="font-size: 1.75rem; font-weight: bold;">${s.sessions.filter(se => se.status === 'done').length}</div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">Séances réalisées</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">⏱️️ Volume d'effort</div>
            <div style="font-size: 1.75rem; font-weight: bold;">${(s.sessions.filter(se => se.status === 'done').reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60).toFixed(1)}h</div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">Cumul total</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">🎯 Objectifs actifs</div>
            <div style="font-size: 1.75rem; font-weight: bold;">${s.objectives.length}</div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">En cours</div>
          </div>
        </div>
      ` : ''}

      ${w.upcoming ? `
        <section class="card" style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 1rem;">Prochaines séances</h3>
          ${s.sessions.filter(se => se.status === 'planned').length === 0 ? '<p style="color: var(--muted); font-size: 0.9rem;">Aucune séance prévue.</p>' : 
            s.sessions.filter(se => se.status === 'planned').map(se => {
              const sp = s.sports.find(x => x.id === se.sportId);
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface); margin-bottom: 8px;">
                  <div>
                    <div style="font-weight: 600;">${sp ? sp.name : 'Séance'}</div>
                    <div style="font-size: 0.8rem; color: var(--muted);">${se.date} · ${se.duration} min</div>
                  </div>
                  <span style="font-size: 0.75rem; font-weight: bold; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 8px; border-radius: 4px;">PRÉVUE</span>
                </div>
              `;
            }).join('')
          }
        </section>
      ` : ''}
    </div>
  `;
  
  el.querySelector('#btn-custom-widgets').onclick = () => {
    openWidgetCustomizerModal();
  };
  
  el.querySelector('#btn-new-session').onclick = () => {
    SessionModal.open({ date: new Date().toISOString().split('T')[0], duration: 45, status: 'planned', sportId: s.sports[0]?.id });
  };
};

// --- 6. VUE CALENDRIER ---
Views.calendrier = (el) => {
  const s = Store.get();
  
  el.innerHTML = `
    <header class="page-head" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1>Calendrier des entraînements</h1>
        <p>Planifiez et suivez vos séances jour par jour.</p>
      </div>
      <button class="btn btn-primary" id="btn-cal-new">+ Planifier une séance</button>
    </header>

    <div class="card" style="padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 20px 0;">Octobre 2026</h3>
      <div class="cal">
        <div class="wd">Lun</div><div class="wd">Mar</div><div class="wd">Mer</div>
        <div class="wd">Jeu</div><div class="wd">Ven</div><div class="wd">Sam</div><div class="wd">Dim</div>
        
        ${Array.from({ length: 31 }, (_, i) => {
          const dayNum = i + 1;
          const dateStr = `2026-10-${dayNum < 10 ? '0' + dayNum : dayNum}`;
          const daySessions = s.sessions.filter(se => se.date === dateStr);
          
          return `
            <div class="day day-cell" data-date="${dateStr}" style="cursor: pointer;">
              <b>${dayNum}</b>
              <div class="dots">
                ${daySessions.map(se => `<i style="background: ${se.status === 'done' ? 'var(--done)' : 'var(--planned)'};"></i>`).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <section class="card" style="padding: 24px;">
      <h3 id="detail-title" style="margin-top: 0; font-size: 1rem; margin-bottom: 16px;">Séances du mois</h3>
      <div id="day-sessions-container" class="stack" style="gap: 12px;">
        ${s.sessions.length === 0 ? `<p style="color: var(--muted); font-size: 0.9rem;">Aucune séance enregistrée.</p>` : s.sessions.map(se => renderSessionItem(se, s)).join('')}
      </div>
    </section>
  `;

  function renderSessionItem(se, storeData) {
    const sp = storeData.sports.find(x => x.id === se.sportId);
    const emoji = getSportEmoji(se.sportId);
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.5rem;">${emoji}</span>
          <div>
            <div style="font-weight: 600;">${sp ? sp.name : 'Séance'} (${se.category})</div>
            <div style="font-size: 0.8rem; color: var(--muted);">${se.date} · ${se.duration} min · ${se.notes || 'Aucune note'}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn btn-ghost btn-edit-s" data-id="${se.id}" style="font-size: 0.75rem; padding: 4px 8px;">Modifier</button>
          <button class="btn btn-ghost btn-del-s" data-id="${se.id}" style="font-size: 0.75rem; padding: 4px 8px; color: var(--cancelled);">Supprimer</button>
        </div>
      </div>
    `;
  }

  const container = el.querySelector('#day-sessions-container');

  function attachActions() {
    container.querySelectorAll('.btn-edit-s').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const sId = parseInt(btn.getAttribute('data-id'));
        const sessionToEdit = s.sessions.find(x => x.id === sId);
        if (sessionToEdit) SessionModal.open(sessionToEdit);
      };
    });

    container.querySelectorAll('.btn-del-s').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const sId = parseInt(btn.getAttribute('data-id'));
        if (confirm("Voulez-vous vraiment supprimer cette séance ?")) {
          s.sessions = s.sessions.filter(x => x.id !== sId);
          Store.save(s);
          router();
        }
      };
    });
  }

  attachActions();

  const btnCalNew = el.querySelector('#btn-cal-new');
  if (btnCalNew) {
    btnCalNew.onclick = () => {
      SessionModal.open({ date: new Date().toISOString().split('T')[0], duration: 45, status: 'planned', sportId: s.sports[0]?.id });
    };
  }

  el.querySelectorAll('.day-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const selectedDate = cell.getAttribute('data-date');
      const daySessions = s.sessions.filter(se => se.date === selectedDate);
      const titleEl = el.querySelector('#detail-title');
      
      if (!titleEl || !container) return;
      titleEl.textContent = `Séances du ${selectedDate}`;

      if (daySessions.length === 0) {
        container.innerHTML = `
          <p style="color: var(--muted); font-size: 0.9rem;">Aucune séance prévue ce jour-là.</p>
          <button class="btn btn-primary" id="btn-add-day" style="width: fit-content; font-size: 0.85rem; margin-top: 8px;">+ Ajouter une séance le ${selectedDate}</button>
        `;
        const addBtn = container.querySelector('#btn-add-day');
        if (addBtn) {
          addBtn.onclick = () => {
            SessionModal.open({ date: selectedDate, duration: 45, status: 'planned', sportId: s.sports[0]?.id });
          };
        }
        return;
      }

      container.innerHTML = daySessions.map(se => renderSessionItem(se, s)).join('');
      attachActions();
    });
  });
};

// --- 7. VUE SÉANCES ---
Views.seances = (el) => {
  const s = Store.get();
  el.innerHTML = `
    <header class="page-head" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1>Journal des séances</h1>
        <p>Retrouvez l'historique complet de vos entraînements.</p>
      </div>
      <button class="btn btn-primary" id="btn-seance-new">+ Nouvelle séance</button>
    </header>
    <div class="stack" style="gap: 12px;">
      ${s.sessions.length === 0 ? `<div class="card" style="padding: 24px; color: var(--muted);"><p>Aucune séance enregistrée pour le moment.</p></div>` : s.sessions.map(se => {
        const sp = s.sports.find(x => x.id === se.sportId);
        const emoji = getSportEmoji(se.sportId);
        return `
          <div class="card" style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.5rem;">${emoji}</span>
              <div>
                <div style="font-weight: 600;">${sp ? sp.name : 'Séance'} (${se.category})</div>
                <div style="font-size: 0.8rem; color: var(--muted);">${se.date} · ${se.duration} min · Statut : ${se.status}</div>
              </div>
            </div>
            <button class="btn btn-ghost btn-edit-seance" data-id="${se.id}" style="font-size: 0.75rem; padding: 4px 8px;">Modifier</button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  el.querySelector('#btn-seance-new').onclick = () => {
    SessionModal.open({ date: new Date().toISOString().split('T')[0], duration: 45, status: 'planned', sportId: s.sports[0]?.id });
  };

  el.querySelectorAll('.btn-edit-seance').forEach(btn => {
    btn.onclick = () => {
      const sId = parseInt(btn.getAttribute('data-id'));
      const sessionToEdit = s.sessions.find(x => x.id === sId);
      if (sessionToEdit) SessionModal.open(sessionToEdit);
    };
  });
};

// --- 8. VUE STATISTIQUES ---
Views.statistiques = (el) => {
  const s = Store.get();
  const doneSessions = s.sessions.filter(se => se.status === 'done');
  const totalMinutes = doneSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  el.innerHTML = `
    <header class="page-head">
      <h1>Statistiques & Analyses</h1>
      <p>Analyses dynamiques de vos performances réelles.</p>
    </header>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="card" style="padding: 20px;">
        <div style="font-size: 0.85rem; color: var(--muted);">Volume Total Réalisé</div>
        <div style="font-size: 2rem; font-weight: bold; margin-top: 8px;">${totalHours} h</div>
        <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">${doneSessions.length} séance(s) validée(s)</div>
      </div>
    </div>
  `;
};

// --- 9. AUTRES VUES (OBJECTIFS, RECORDS, SPORTS, PARAMÈTRES) ---
Views.objectifs = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Objectifs</h1><p>Suivez l'avancement de vos objectifs sportifs.</p></header>`;
};

Views.records = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Records</h1><p>Consultez vos meilleures performances.</p></header>`;
};

Views.sports = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Sports & Catégories</h1><p>Gérez vos disciplines et catégories.</p></header>`;
};

Views.parametres = (el) => {
  el.innerHTML = `<header class="page-head"><h1>Paramètres</h1><p>Configurez vos préférences.</p></header>`;
};

// --- 10. INITIALISATION FINALE ---
document.addEventListener('DOMContentLoaded', () => {
  router();
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        location.hash = hash;
      }
    });
  });
});
