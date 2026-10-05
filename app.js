// --- PARTIE 1 : STORE & DONNÉES LOCALES ---
const Store = {
  get() {
    const data = localStorage.getItem('fit_track_pro');
    if (!data) {
      const initial = {
        user: { name: " ", weight: " ", targetWeight: " " },
        widgets: {
          kpi: true,
          chart: true,
          upcoming: true,
          objectives: true,
          calendar: true,
          records: true,
          quote: true,
          weight: true
        },
        sports: [
          { id: "run", name: "Course à pied", icon: "activity", category: "Cardio", unit: "km", color: "#2f57f0" },
          { id: "bike", name: "Cyclisme", icon: "compass", category: "Cardio", unit: "km", color: "#10b981" },
          { id: "swim", name: "Natation", icon: "compass", category: "Cardio", unit: "m", color: "#06b6d4" },
          { id: "gym", name: "Musculation", icon: "target", category: "Renforcement", unit: "kg", color: "#8b5cf6" },
          { id: "pilates", name: "Pilate", icon: "target", category: "Souplesse", unit: "min", color: "#f59e0b" },
          { id: "tennis", name: "Tennis", icon: "activity", category: "Technique", unit: "min", color: "#ec4899" }
        ],
        categories: ["Cardio", "Renforcement", "Souplesse", "Compétition", "Récupération", "Technique"],
        sessions: [
          { id: 1, sportId: "gym", category: "Renforcement", date: "2026-10-06", duration: 60, performance: 80, status: "planned", intensity: 6, notes: "Séance Chest & Triceps" },
          { id: 2, sportId: "run", category: "Cardio", date: "2026-10-04", duration: 45, performance: 8.5, status: "done", intensity: 7, notes: "Super sensations matinales !" },
          { id: 3, sportId: "bike", category: "Cardio", date: "2026-10-01", duration: 75, performance: 32, status: "done", intensity: 8, notes: "Sortie vélo de route" },
          { id: 4, sportId: "swim", category: "Technique", date: "2026-09-27", duration: 40, performance: 2000, status: "done", intensity: 6, notes: "Educatifs crawl" }
        ],
        objectives: [
          { id: 1, title: "Courir 60 km ce mois", progress: 14, target: 60, current: 8.5 },
          { id: 2, title: "12 Séances d'entraînement", progress: 17, target: 12, current: 2 },
          { id: 3, title: "Souplesse & Stretch", progress: 45, target: 100, current: 45 }
        ],
        records: [
          { id: 1, title: "Développé Couché Max", value: "95 kg", date: "2026-09-15" },
          { id: 2, title: "Meilleur 5km", value: "21 min 30s", date: "2026-09-25" }
        ]
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
    // Fonction pour associer un émoji selon le type de sport
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
// --- PARTIE 2 : ROUTEUR & NAVIGATION ---
const navItems = [
  { id: '#accueil', label: 'Accueil', icon: '🏠' },
  { id: '#calendrier', label: 'Calendrier', icon: '📅' },
  { id: '#seances', label: 'Séances', icon: '📋' },
  { id: '#records', label: 'Records', icon: '🏆' },
  { id: '#objectifs', label: 'Objectifs', icon: '🎯' },
  { id: '#sports', label: 'Sports & Catégories', icon: '⚙️' },
  { id: '#parametres', label: 'Paramètres', icon: '🛠️' }
];
function router() {
  const hash = location.hash || '#accueil';
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = '';

  // Sélection de la vue correspondante
  if (hash === '#accueil' && Views.accueil) {
    Views.accueil(appContainer);
  } else if (hash === '#statistiques' && Views.statistiques) {
    Views.statistiques(appContainer);
    } else if (hash === '#calendrier' && Views.calendrier) {
    Views.calendrier(appContainer);
  } else {
    // Vue par défaut si la route n'existe pas encore
    appContainer.innerHTML = `
      <header class="page-head">
        <h1>Section en cours de construction</h1>
        <p>Cette page sera bientôt disponible dans les prochaines étapes.</p>
      </header>
    `;
  }

  // Mise à jour de la classe active dans la barre de navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

window.addEventListener('hashchange', router);
// --- PARTIE 3 : VUE ACCUEIL & WIDGETS MODULAIRES ---
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
        <button class="btn btn-ghost" id="btn-custom-widgets">⚙️ Personnaliser</button>
        <button class="btn btn-primary" id="btn-new-session">+ Nouvelle séance</button>
      </div>
    </header>
    
    <div class="stack" style="gap: 24px;">
      <!-- KPI Cards -->
      ${w.kpi ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div class="card" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">🏃 Séances ce mois</div>
            <div style="font-size: 1.75rem; font-weight: bold;">2</div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">Séances réalisées</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">⏱️ Volume d'effort</div>
            <div style="font-size: 1.75rem; font-weight: bold;">2h 00m</div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">Objectif : 20h/mois</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">🔥 Calories estimées</div>
            <div style="font-size: 1.75rem; font-weight: bold;">1020 kcal</div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">Activité cumulée</div>
          </div>
          <div class="card" style="padding: 20px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">🎯 Objectifs actifs</div>
            <div style="font-size: 1.75rem; font-weight: bold;">${s.objectives.length}</div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">En cours de succès</div>
          </div>
        </div>
      ` : ''}
      
      <!-- Graphique d'activité -->
      ${w.chart ? `
        <section class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 1rem;">Graphique d'Activité (7 derniers jours)</h3>
          </div>
          <div style="height: 180px; display: flex; align-items: flex-end; justify-content: space-around; padding-top: 20px; border-bottom: 1px solid var(--line);">
            ${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => {
              const heights = ['40%', '55%', '30%', '70%', '15%', '85%', '60%'];
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1;">
                  <div style="width: 36px; height: ${heights[idx]}; background: var(--primary); border-radius: 6px 6px 0 0;"></div>
                  <span style="font-size: 0.75rem; color: var(--muted);">${day}</span>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Prochaines séances -->
      ${w.upcoming ? `
        <section class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 1rem;">Prochaines séances</h3>
          </div>
          ${s.sessions.filter(se => se.status === 'planned').map(se => {
            const sp = s.sports.find(x => x.id === se.sportId);
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--line); border-radius: var(--r-ctrl); background: var(--surface);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 1.25rem;">🏋️</span>
                  <div>
                    <div style="font-weight: 600;">${sp ? sp.name : 'Séance'}</div>
                    <div style="font-size: 0.8rem; color: var(--muted);">${se.date} · ${se.duration} min</div>
                  </div>
                </div>
                <span style="font-size: 0.75rem; font-weight: bold; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 8px; border-radius: 4px;">PRÉVUE</span>
              </div>
            `;
          }).join('')}
        </section>
      ` : ''}

      <!-- Objectifs en cours -->
      ${w.objectives ? `
        <section class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 1rem;">Objectifs en cours</h3>
          </div>
          <div class="stack" style="gap: 16px;">
            ${s.objectives.map(obj => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                  <span>${obj.title}</span>
                  <span style="font-weight: 600;">${obj.progress}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--line); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${obj.progress}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Motivation & Poids -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        ${w.quote ? `
          <div class="card" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
            <span style="font-size: 1.5rem;">💡</span>
            <div>
              <div style="font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 4px;">Motivation du jour</div>
              <div style="font-size: 0.95rem; font-style: italic;">“Le seul mauvais entraînement est celui que tu ne fais pas.”</div>
            </div>
          </div>
        ` : ''}
        ${w.weight ? `
          <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 4px;">Suivi du Poids</div>
              <div style="font-size: 1.5rem; font-weight: bold;">${s.user.weight} kg <span style="font-size: 0.85rem; font-weight: normal; color: var(--muted);">Cible: ${s.user.targetWeight} kg</span></div>
            </div>
            <button class="btn btn-ghost" id="btn-update-weight" style="font-size: 0.8rem;">Mettre à jour</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Écouteurs d'événements de la vue Accueil
  el.querySelector('#btn-custom-widgets').onclick = () => {
    if (typeof openWidgetCustomizerModal === 'function') openWidgetCustomizerModal();
  };
  
  el.querySelector('#btn-new-session').onclick = () => {
    if (typeof SessionModal !== 'undefined') {
      SessionModal.open({ date: new Date().toISOString().split('T')[0], duration: 45, status: 'planned', sportId: s.sports[0]?.id });
    }
  };
  
  const btnWeight = el.querySelector('#btn-update-weight');
  if (btnWeight) {
    btnWeight.onclick = () => {
      const newW = prompt("Entrez votre nouveau poids (kg) :", s.user.weight);
      if (newW && !isNaN(newW)) {
        s.user.weight = parseFloat(newW);
        Store.save(s);
        router();
      }
    };
  }
};
// --- PARTIE 4 : VUE STATISTIQUES & GRAPHIQUES ---
Views.statistiques = (el) => {
  el.innerHTML = `
    <header class="page-head">
      <h1>Statistiques & Analyses Graphiques</h1>
      <p>Graphiques et répartition de vos performances sportives.</p>
    </header>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      <section class="card" style="padding: 24px;">
        <h3 style="margin-top: 0; font-size: 1rem; margin-bottom: 16px;">Répartition des séances par Sport</h3>
        <div style="height: 220px; display: flex; align-items: center; justify-content: center;">
          <!-- Représentation visuelle type camembert / anneau -->
          <div style="width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#2f57f0 0deg 180deg, #10b981 180deg 280deg, #f59e0b 280deg 360deg); display: flex; align-items: center; justify-content: center;">
            <div style="width: 90px; height: 90px; background: var(--surface); border-radius: 50%;"></div>
          </div>
        </div>
      </section>
      
      <section class="card" style="padding: 24px;">
        <h3 style="margin-top: 0; font-size: 1rem; margin-bottom: 16px;">Volume d'entraînement par Semaine</h3>
        <div style="height: 220px; display: flex; align-items: flex-end; justify-content: space-around; padding-top: 20px; border-bottom: 1px solid var(--line);">
          ${['Semaine 1', 'Semaine 2', 'Semaine 3', 'Cette semaine'].map((sem, idx) => {
            const h = ['50%', '75%', '60%', '85%'][idx];
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1;">
                <div style="width: 40px; height: ${h}; background: #8b5cf6; border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--muted);">${sem}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;
};
// --- PARTIE 5 : MODALE DE GESTION DES SÉANCES ---
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
    
    const rangeInput = modal.querySelector('#m-intensity');
    rangeInput.oninput = (e) => {
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
// --- PARTIE 6 : MODALE DE PERSONNALISATION DES WIDGETS ---
function openWidgetCustomizerModal() {
  const s = Store.get();
  const modal = document.createElement('div');
  modal.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;";
  
  modal.innerHTML = `
    <div class="card stack" style="width: 100%; max-width: 500px; padding: 24px; background: var(--surface);">
      <h3 style="margin-top: 0;">Personnaliser le Tableau de bord</h3>
      <p style="font-size: 0.85rem; color: var(--muted);">Cochez les widgets que vous souhaitez afficher sur votre accueil :</p>
      
      <div class="stack" style="gap: 12px; margin: 16px 0;">
        <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="w-kpi" ${s.widgets.kpi ? 'checked' : ''}> Statistiques Rapides (KPIs)
        </label>
        <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="w-chart" ${s.widgets.chart ? 'checked' : ''}> Graphique de Volume
        </label>
        <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="w-upcoming" ${s.widgets.upcoming ? 'checked' : ''}> Prochaines Séances
        </label>
        <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="w-objectives" ${s.widgets.objectives ? 'checked' : ''}> Aperçu des Objectifs
        </label>
        <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="w-quote" ${s.widgets.quote ? 'checked' : ''}> Citation Motivante
        </label>
        <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="w-weight" ${s.widgets.weight ? 'checked' : ''}> Suivi du Poids
        </label>
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
    s.widgets.chart = modal.querySelector('#w-chart').checked;
    s.widgets.upcoming = modal.querySelector('#w-upcoming').checked;
    s.widgets.objectives = modal.querySelector('#w-objectives').checked;
    s.widgets.quote = modal.querySelector('#w-quote').checked;
    s.widgets.weight = modal.querySelector('#w-weight').checked;
    Store.save(s);
    modal.remove();
    router();
  };
}
// --- PARTIE 7 : INITIALISATION & LANCEMENT ---
document.addEventListener('DOMContentLoaded', () => {
  // Lancement initial du routeur
  router();

  // Gestion des clics sur les liens de la barre de navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        // Le hashchange s'occupera d'appeler le routeur
        location.hash = hash;
      }
    });
  });
});
// --- VUE CALENDRIER & PLANIFICATION ---
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0;">Octobre 2026</h3>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-ghost" style="padding: 6px 12px;">&lt;</button>
          <button class="btn btn-ghost" style="padding: 6px 12px;">&gt;</button>
        </div>
      </div>

      <!-- Grille des jours de la semaine -->
      <div class="cal">
        <div class="wd">Lun</div><div class="wd">Mar</div><div class="wd">Mer</div>
        <div class="wd">Jeu</div><div class="wd">Ven</div><div class="wd">Sam</div><div class="wd">Dim</div>
        
        <!-- Génération fictive des jours du mois pour l'exemple -->
        ${Array.from({ length: 31 }, (_, i) => {
          const dayNum = i + 1;
          const dateStr = `2026-10-${dayNum < 10 ? '0' + dayNum : dayNum}`;
          const daySessions = s.sessions.filter(se => se.date === dateStr);
          
          return `
            <div class="day ${dayNum === 6 ? 'today' : ''}" data-date="${dateStr}">
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
      <h3 style="margin-top: 0; font-size: 1rem; margin-bottom: 16px;">Séances du mois</h3>
      <div class="stack" style="gap: 12px;">
        ${s.sessions.map(se => {
          const sp = s.sports.find(x => x.id === se.sportId);
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
              <span style="font-size: 0.75rem; font-weight: bold; padding: 4px 8px; border-radius: 4px; background: ${se.status === 'done' ? 'rgba(31, 169, 113, 0.1); color: #1fa971;' : 'rgba(245, 158, 11, 0.1); color: #f59e0b;'}">
                ${se.status === 'done' ? 'RÉALISÉE' : 'PRÉVUE'}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;

  el.querySelector('#btn-cal-new').onclick = () => {
    if (typeof SessionModal !== 'undefined') {
      SessionModal.open({ date: new Date().toISOString().split('T')[0], duration: 45, status: 'planned', sportId: s.sports[0]?.id });
    }
  };
};
