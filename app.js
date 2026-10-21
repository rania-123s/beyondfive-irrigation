const $app = document.getElementById('app');
const filtre = { cat: 'all', eau: 'all', lieu: 'all', statut: 'all' };

// ---------- Analyse d'une plante ----------
function analyser(p) {
  const be = BESOIN_EAU[p.eau];
  const problemes = [];
  const add = (niveau, titre, conseil) => problemes.push({ niveau, titre, conseil });

  if (p.humidite < be.min) add(p.humidite < be.min - 10 ? 'crit' : 'warn', 'Manque d\'eau', 'Irriguer maintenant (sol à ' + p.humidite + ' %, minimum ' + be.min + ' %).');
  if (p.humidite > be.max) add(p.humidite > be.max + 10 ? 'crit' : 'warn', 'Excès d\'eau', 'Suspendre l\'irrigation et vérifier le drainage (risque de pourriture).');
  if (p.n < 30) add('warn', 'Carence en azote', 'Apporter un engrais azoté ou du compost.');
  if (p.p < 30) add('warn', 'Carence en phosphore', 'Apporter un engrais riche en phosphore (superphosphate).');
  if (p.k < 30) add('warn', 'Carence en potasse', 'Apporter de la potasse (sulfate de potassium, cendre de bois).');
  if (p.ph < 5.5) add('warn', 'Sol trop acide', 'Ajouter de la chaux pour remonter le pH.');
  if (p.ph > 7.5) add('warn', 'Sol trop basique', 'Ajouter de la matière organique ou du soufre pour baisser le pH.');
  if (p.ec > 3) add('crit', 'Salinité élevée', 'Lessiver le sol avec de l\'eau douce et espacer les apports d\'engrais.');
  if (p.temp > 35) add('warn', 'Chaleur excessive', 'Ombrager ou arroser tôt le matin.');
  if (p.temp < 5) add('warn', 'Risque de gel', 'Protéger la plante avec un voile d\'hivernage.');

  const pen = problemes.reduce((s, x) => s + (x.niveau === 'crit' ? 30 : 15), 0);
  const score = Math.max(0, 100 - pen);
  const statut = problemes.some(x => x.niveau === 'crit') || score < 55 ? 'crit' : score < 85 ? 'warn' : 'ok';
  return { score, statut, problemes };
}

const LIB = { ok: 'Saine', warn: 'À surveiller', crit: 'Critique' };
const analyses = () => PLANTES.map(p => ({ p, a: analyser(p) }));

// ---------- Pages ----------
function pageAccueil() {
  const all = analyses();
  const n = s => all.filter(x => x.a.statut === s).length;
  const alertes = all.flatMap(x => x.a.problemes.map(pb => ({ p: x.p, pb })));
  const moy = Math.round(all.reduce((s, x) => s + x.a.score, 0) / all.length);
  const soif = all.filter(x => x.a.problemes.some(pb => pb.titre === 'Manque d\'eau'));
  const hum = Math.round(PLANTES.reduce((s, p) => s + p.humidite, 0) / PLANTES.length);
  const tmp = Math.round(PLANTES.reduce((s, p) => s + p.temp, 0) / PLANTES.length);
  const couleur = moy >= 85 ? 'var(--ok)' : moy >= 55 ? 'var(--warn)' : 'var(--crit)';
  const message = n('crit') ? 'Certaines plantes ont besoin d\'une action rapide.'
    : n('warn') ? 'Quelques plantes sont à surveiller.' : 'Tout va bien dans vos cultures.';
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const urgents = alertes.slice().sort((a, b) => (b.pb.niveau === 'crit') - (a.pb.niveau === 'crit')).slice(0, 3);
  const parLieu = LIEUX.map(l => {
    const g = all.filter(x => x.p.lieu === l);
    const c = s => g.filter(x => x.a.statut === s).length;
    return { l, t: g.length, ok: c('ok'), warn: c('warn'), crit: c('crit') };
  }).filter(x => x.t);
  return `
    <div class="hero">
      <div class="donut" style="--p:${moy};--c:${couleur}"><span>${moy}%<small>santé</small></span></div>
      <div class="grow">
        <div class="muted" style="text-transform:capitalize">${date}</div>
        <h2 style="margin:2px 0 6px">Bonjour Mr ${UTILISATEUR.nom} 👋</h2>
        <div>${message}</div>
        <div class="legend"><span class="ok">● ${n('ok')} saines</span><span class="warn">● ${n('warn')} à surveiller</span><span class="crit">● ${n('crit')} critiques</span></div>
      </div>
    </div>

    <div class="tiles">
      <div class="tile"><span>💧</span><b>${hum}%</b><small>Humidité moyenne</small></div>
      <div class="tile"><span>🌡️</span><b>${tmp}°C</b><small>Température moyenne</small></div>
      <div class="tile"><span>🌿</span><b>${PLANTES.length}</b><small>Plantes suivies</small></div>
      <a class="tile" href="#/alertes"><span>🔔</span><b class="${alertes.length ? 'warn' : 'ok'}">${alertes.length}</b><small>Alertes actives</small></a>
    </div>

    ${soif.length
      ? `<button class="btn" onclick="arroserSoif()">💧 Arroser les ${soif.length} plante(s) assoiffée(s)</button>
         <div class="muted" style="text-align:center;margin-top:6px">${soif.map(x => x.p.nom).join(', ')}</div>`
      : '<div class="card row"><span class="emoji">✅</span><div class="grow"><b>Aucune irrigation nécessaire</b><div class="muted">Toutes les plantes ont assez d\'eau.</div></div></div>'}

    <h2>À faire aujourd'hui</h2>
    ${urgents.map(carteAlerte).join('') || '<p class="muted">Rien à faire, profitez 🎉</p>'}
    ${alertes.length > 3 ? '<a class="card" href="#/alertes">Voir toutes les alertes →</a>' : ''}

    <h2>Par emplacement</h2>
    <div class="card">${parLieu.map(x => `
      <div class="gauge"><div class="lab"><span>${x.l}</span><span class="muted">${x.t} plante(s)</span></div>
        <div class="seg">
          <i class="b-ok" style="flex:${x.ok}"></i><i class="b-warn" style="flex:${x.warn}"></i><i class="b-crit" style="flex:${x.crit}"></i>
        </div></div>`).join('')}
    </div>

    <h2>Catégories</h2>
    <div class="grid">${Object.entries(CATEGORIES).map(([k, c]) => {
      const nb = PLANTES.filter(p => p.cat === k).length;
      return `<a class="card stat" href="#/plantes" onclick="filtre.cat='${k}'"><b>${c.emoji}</b><small>${c.nom} (${nb})</small></a>`;
    }).join('')}</div>`;
}

function carteAlerte({ p, pb }) {
  return `<a class="card row" href="#/plante/${p.id}"><span class="emoji">${p.emoji}</span>
    <div class="grow"><b>${p.nom}</b> <span class="muted">· ${p.lieu}</span><div>${pb.titre}</div><div class="muted">${pb.conseil}</div></div>
    <span class="badge ${pb.niveau}">${LIB[pb.niveau]}</span></a>`;
}

function select(nom, label, options) {
  return `<label class="sel"><span>${label}</span><select onchange="setFiltre('${nom}', this.value)">${options.map(([v, l]) =>
    `<option value="${v}" ${String(filtre[nom]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
}

function listeFiltree() {
  const q = (filtre.q || '').trim().toLowerCase();
  return analyses().filter(({ p, a }) =>
    (filtre.cat === 'all' || p.cat === filtre.cat) &&
    (filtre.eau === 'all' || p.eau === +filtre.eau) &&
    (filtre.lieu === 'all' || p.lieu === filtre.lieu) &&
    (filtre.statut === 'all' || a.statut === filtre.statut) &&
    (!q || p.nom.toLowerCase().includes(q)));
}

function majListe() {
  const l = listeFiltree();
  document.getElementById('liste').innerHTML =
    `<p class="muted" style="margin:4px 0 10px">${l.length} plante(s)</p>` +
    (l.map(cartePlante).join('') || '<p class="muted">Aucune plante pour ce filtre.</p>');
}

function resetFiltres() {
  Object.assign(filtre, { cat: 'all', eau: 'all', lieu: 'all', statut: 'all', q: '' });
  render();
}

function pagePlantes() {
  const actif = ['cat', 'eau', 'lieu', 'statut'].some(k => filtre[k] !== 'all') || filtre.q;
  return `
    <h2>Mes plantes</h2>
    <div class="card filterbox">
      <input class="search" type="search" placeholder="Rechercher une plante…" value="${filtre.q || ''}" oninput="filtre.q=this.value;majListe()">
      <div class="selgrid">
        ${select('cat', 'Catégorie', [['all', 'Toutes'], ...Object.entries(CATEGORIES).map(([k, c]) => [k, c.emoji + ' ' + c.nom])])}
        ${select('statut', 'Santé', [['all', 'Tous'], ['ok', '🟢 Saine'], ['warn', '🟠 À surveiller'], ['crit', '🔴 Critique']])}
        ${select('eau', 'Besoin en eau', [['all', 'Tous'], ...Object.entries(BESOIN_EAU).map(([k, b]) => [k, b.icone + ' ' + b.nom])])}
        ${select('lieu', 'Emplacement', [['all', 'Tous'], ...LIEUX.map(l => [l, l])])}
      </div>
      ${actif ? '<button class="reset" onclick="resetFiltres()">✕ Réinitialiser les filtres</button>' : ''}
    </div>
    <div id="liste"></div>`;
}

function cartePlante({ p, a }) {
  return `
    <a class="card row" href="#/plante/${p.id}"><span class="emoji">${p.emoji}</span>
      <div class="grow"><b>${p.nom}</b><div class="muted">${CATEGORIES[p.cat].nom} · ${p.lieu}</div>
      <div class="muted">${BESOIN_EAU[p.eau].icone} · ${p.stade}</div></div>
      <div style="text-align:right"><div class="score ${a.statut}">${a.score}%</div><span class="badge ${a.statut}">${LIB[a.statut]}</span></div></a>`;
}

function pageSante() {
  const all = analyses().sort((x, y) => x.a.score - y.a.score);
  const groupe = (s, titre) => {
    const g = all.filter(x => x.a.statut === s);
    return g.length ? `<h2>${titre} (${g.length})</h2>${g.map(cartePlante).join('')}` : '';
  };
  return `<h2 style="margin-top:0">Santé des plantes</h2>
    ${groupe('crit', '🔴 Critiques')}${groupe('warn', '🟠 À surveiller')}${groupe('ok', '🟢 Saines')}`;
}

function goCat(k) {
  filtre.cat = k;
  if (location.hash === '#/plantes') render(); else location.hash = '#/plantes';
}

function jauge(label, val, unite, min, max, echelle) {
  const ok = val >= min && val <= max;
  const pct = Math.min(100, Math.max(0, val / echelle * 100));
  const cls = ok ? 'b-ok' : 'b-warn';
  return `<div class="gauge"><div class="lab"><span>${label}</span><b>${val}${unite}</b></div>
    <div class="bar"><i style="left:${min / echelle * 100}%;width:${(max - min) / echelle * 100}%"></i><b class="${cls}" style="width:${pct}%"></b></div></div>`;
}

function pagePlante(id) {
  const p = PLANTES.find(x => x.id === +id);
  if (!p) return '<p>Plante introuvable.</p>';
  const a = analyser(p), be = BESOIN_EAU[p.eau];
  return `
    <a class="back" href="#/plantes">← Retour</a>
    <div class="card row"><span class="emoji" style="font-size:48px">${p.emoji}</span>
      <div class="grow"><h2 style="margin:0">${p.nom}</h2><div class="muted">${CATEGORIES[p.cat].nom} · ${p.lieu}</div><div class="muted">Stade : ${p.stade}</div></div>
      <div style="text-align:right"><div class="score ${a.statut}">${a.score}%</div><span class="badge ${a.statut}">${LIB[a.statut]}</span></div></div>
    <h2>Mesures</h2>
    <div class="card">
      ${jauge('💧 Humidité du sol', p.humidite, ' %', be.min, be.max, 100)}
      ${jauge('Azote (N)', p.n, '', 30, 100, 100)}
      ${jauge('Phosphore (P)', p.p, '', 30, 100, 100)}
      ${jauge('Potassium (K)', p.k, '', 30, 100, 100)}
      ${jauge('pH du sol', p.ph, '', 5.5, 7.5, 14)}
      ${jauge('Salinité (EC)', p.ec, ' mS/cm', 0, 3, 6)}
      ${jauge('🌡️ Température', p.temp, ' °C', 5, 35, 50)}
      <div class="muted">La zone verte claire correspond à la plage idéale.</div>
    </div>
    <h2>Ce dont elle a besoin</h2>
    ${a.problemes.map(x => `<div class="card reco ${x.niveau}"><b>${x.titre}</b><div class="muted">${x.conseil}</div></div>`).join('')
      || '<div class="card">✅ Rien à signaler, la plante est en bonne santé.</div>'}
    <button class="btn" onclick="arroser(${p.id})">💧 Arroser maintenant (simulation)</button>`;
}

function pageAlertes() {
  const alertes = analyses().flatMap(x => x.a.problemes.map(pb => ({ p: x.p, pb })))
    .sort((a, b) => (b.pb.niveau === 'crit') - (a.pb.niveau === 'crit'));
  return `<h2>Alertes (${alertes.length})</h2>${alertes.map(carteAlerte).join('') || '<p class="muted">Aucune alerte 🎉</p>'}`;
}

function pageDiagnostic() {
  return `
    <h2>Diagnostic par photo</h2>
    <div class="card">
      <p>Prenez en photo une feuille ou une plante pour détecter une maladie, une carence ou un parasite.</p>
      <input id="photo" type="file" accept="image/*" capture="environment" hidden onchange="analyserPhoto(this)">
      <button class="btn alt" onclick="document.getElementById('photo').click()">📷 Prendre / choisir une photo</button>
      <div id="resultat"></div>
    </div>
    <p class="note">Démo : le résultat est simulé. Plus tard, un modèle d'IA analysera la vraie image.</p>`;
}

// ---------- Actions ----------
function setFiltre(nom, v) { filtre[nom] = v; render(); }

function arroser(id) {
  const p = PLANTES.find(x => x.id === id);
  p.humidite = Math.min(100, p.humidite + 20);
  save();
  render();
}

function arroserSoif() {
  PLANTES.forEach(p => {
    const be = BESOIN_EAU[p.eau];
    if (p.humidite < be.min) p.humidite = Math.round((be.min + be.max) / 2);
  });
  save();
  render();
}

function analyserPhoto(input) {
  const f = input.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  const zone = document.getElementById('resultat');
  zone.innerHTML = `<img class="preview" src="${url}" alt="Photo"><p class="muted">Analyse en cours…</p>`;
  setTimeout(() => {
    const d = DIAGNOSTICS[Math.floor(Math.random() * DIAGNOSTICS.length)];
    zone.innerHTML = `<img class="preview" src="${url}" alt="Photo">
      <div class="reco ${d.nom === 'Plante saine' ? '' : 'crit'}" style="margin-top:12px"><b>${d.nom}</b> · confiance ${d.confiance} %<div class="muted">${d.conseil}</div></div>`;
  }, 1200);
}

// ---------- Sauvegarde locale (humidité modifiée par l'arrosage) ----------
function save() {
  try { localStorage.setItem('agrismart-hum', JSON.stringify(PLANTES.map(p => [p.id, p.humidite]))); } catch (e) {}
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem('agrismart-hum') || '[]');
    d.forEach(([id, h]) => { const p = PLANTES.find(x => x.id === id); if (p) p.humidite = h; });
  } catch (e) {}
}

// ---------- Routeur ----------
function render() {
  const [, route, arg] = (location.hash || '#/').split('/');
  const nom = route || 'home';
  $app.innerHTML = nom === 'plantes' ? pagePlantes()
    : nom === 'plante' ? pagePlante(arg)
    : nom === 'sante' ? pageSante()
    : nom === 'alertes' ? pageAlertes()
    : nom === 'diagnostic' ? pageDiagnostic()
    : pageAccueil();
  if (document.getElementById('liste')) majListe();
  document.querySelectorAll('.tabs a').forEach(a =>
    a.classList.toggle('on', a.dataset.r === (nom === 'plante' ? 'plantes' : nom)));
  document.getElementById('sidecats').innerHTML = '<div class="sidetitle">Catégories</div>' +
    Object.entries(CATEGORIES).map(([k, c]) =>
      `<a href="#/plantes" class="${nom === 'plantes' && filtre.cat === k ? 'on' : ''}" onclick="goCat('${k}');return false">${c.emoji} ${c.nom}<small>${PLANTES.filter(p => p.cat === k).length}</small></a>`).join('');
  const nb = analyses().reduce((s, x) => s + x.a.problemes.length, 0);
  const badge = document.getElementById('nb-alertes');
  badge.textContent = nb || '';
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
load();
render();

// ---------- PWA ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
let promptInstall;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  promptInstall = e;
  const b = document.getElementById('install');
  b.hidden = false;
  b.onclick = () => { promptInstall.prompt(); b.hidden = true; };
});
