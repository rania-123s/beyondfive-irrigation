// Données statiques de démonstration (aucun serveur, aucun capteur réel).
// Plus tard, ces mesures viendront d'une API (ESP32 / Arduino).

const CATEGORIES = {
  legume:    { nom: 'Légumes',            emoji: '🍅' },
  feuille:   { nom: 'Légumes feuilles',   emoji: '🥬' },
  fruit:     { nom: 'Fruits',             emoji: '🍉' },
  arbre:     { nom: 'Arbres fruitiers',   emoji: '🫒' },
  cereale:   { nom: 'Céréales',           emoji: '🌾' },
  legumineuse: { nom: 'Légumineuses',     emoji: '🫘' },
  aromatique:{ nom: 'Aromatiques',        emoji: '🌿' },
  ornement:  { nom: 'Ornementales',       emoji: '🌸' }
};

const BESOIN_EAU = {
  1: { nom: 'Faible', icone: '💧',     min: 15, max: 35 },
  2: { nom: 'Moyen',  icone: '💧💧',   min: 30, max: 60 },
  3: { nom: 'Élevé',  icone: '💧💧💧', min: 50, max: 80 }
};

const LIEUX = ['Serre 1', 'Parcelle Nord', 'Verger', 'Jardin'];

const STADES = ['Semis', 'Croissance', 'Floraison', 'Fructification', 'Récolte'];

// humidite en %, N/P/K en indice 0-100, ph, ec en mS/cm, temp en °C
const PLANTES = [
  { id: 1,  nom: 'Tomate',        emoji: '🍅', cat: 'legume',     eau: 3, lieu: 'Serre 1',       stade: 'Fructification', humidite: 62, n: 70, p: 55, k: 65, ph: 6.4, ec: 1.8, temp: 27 },
  { id: 2,  nom: 'Poivron',       emoji: '🫑', cat: 'legume',     eau: 2, lieu: 'Serre 1',       stade: 'Floraison',      humidite: 28, n: 60, p: 50, k: 58, ph: 6.6, ec: 1.6, temp: 28 },
  { id: 3,  nom: 'Laitue',        emoji: '🥬', cat: 'feuille',    eau: 3, lieu: 'Serre 1',       stade: 'Croissance',     humidite: 66, n: 22, p: 48, k: 52, ph: 6.2, ec: 1.2, temp: 22 },
  { id: 4,  nom: 'Pastèque',      emoji: '🍉', cat: 'fruit',      eau: 3, lieu: 'Parcelle Nord', stade: 'Croissance',     humidite: 88, n: 55, p: 50, k: 60, ph: 6.5, ec: 1.9, temp: 30 },
  { id: 5,  nom: 'Olivier',       emoji: '🫒', cat: 'arbre',      eau: 1, lieu: 'Verger',        stade: 'Fructification', humidite: 24, n: 52, p: 45, k: 55, ph: 7.9, ec: 2.1, temp: 29 },
  { id: 6,  nom: 'Grenadier',     emoji: '🍎', cat: 'arbre',      eau: 2, lieu: 'Verger',        stade: 'Floraison',      humidite: 45, n: 58, p: 49, k: 61, ph: 6.9, ec: 1.7, temp: 29 },
  { id: 7,  nom: 'Blé',           emoji: '🌾', cat: 'cereale',    eau: 2, lieu: 'Parcelle Nord', stade: 'Croissance',     humidite: 44, n: 64, p: 52, k: 57, ph: 7.0, ec: 3.6, temp: 26 },
  { id: 8,  nom: 'Fève',          emoji: '🫘', cat: 'legumineuse',eau: 2, lieu: 'Parcelle Nord', stade: 'Récolte',        humidite: 40, n: 50, p: 28, k: 54, ph: 6.8, ec: 1.4, temp: 25 },
  { id: 9,  nom: 'Menthe',        emoji: '🌿', cat: 'aromatique', eau: 3, lieu: 'Jardin',        stade: 'Croissance',     humidite: 72, n: 62, p: 50, k: 56, ph: 6.3, ec: 1.3, temp: 24 },
  { id: 10, nom: 'Romarin',       emoji: '🌱', cat: 'aromatique', eau: 1, lieu: 'Jardin',        stade: 'Croissance',     humidite: 22, n: 48, p: 44, k: 50, ph: 7.2, ec: 1.0, temp: 26 },
  { id: 11, nom: 'Rose',          emoji: '🌹', cat: 'ornement',   eau: 2, lieu: 'Jardin',        stade: 'Floraison',      humidite: 48, n: 57, p: 51, k: 20, ph: 6.5, ec: 1.5, temp: 25 },
  { id: 12, nom: 'Courgette',     emoji: '🥒', cat: 'legume',     eau: 3, lieu: 'Serre 1',       stade: 'Récolte',        humidite: 58, n: 63, p: 53, k: 59, ph: 6.4, ec: 1.7, temp: 27 }
];

const DIAGNOSTICS = [
  { nom: 'Plante saine',            confiance: 94, conseil: 'Aucun problème visible. Continuez le suivi habituel.' },
  { nom: 'Carence en azote',        confiance: 87, conseil: 'Feuilles jaunes en bas de la plante. Apporter un engrais azoté (urée ou compost).' },
  { nom: 'Mildiou',                 confiance: 81, conseil: 'Taches brunes sur les feuilles. Retirer les feuilles touchées et réduire l\'humidité.' },
  { nom: 'Stress hydrique',         confiance: 90, conseil: 'Feuilles flétries ou enroulées. Irriguer et pailler le sol.' },
  { nom: 'Pucerons',                confiance: 78, conseil: 'Insectes sous les feuilles. Pulvériser du savon noir dilué.' }
];

const UTILISATEUR = { nom: 'Mohamed Trabelsi', prenom: 'Mohamed', initiales: 'MT', role: 'Agriculteur' };
