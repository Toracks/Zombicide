const searchBar = document.getElementById('search-bar');
const grid = document.getElementById('characters-grid');
const loader = document.getElementById('loader');
const boutonsFiltre = document.querySelectorAll('[class*="filtre-btn"]');
const filtresContainer = document.querySelector('.filtres-container');
const overlay = document.getElementById('fullscreen-overlay');
const overlayImage = document.getElementById('fullscreen-image');
const overlayPouvoirs = document.getElementById('fullscreen-pouvoirs');
const modeToggle = document.getElementById('mode-toggle');
const modeMenu = document.getElementById('mode-menu');
const modeOptions = document.querySelectorAll('.mode-option');
const compareToggleBtn = document.getElementById('compare-toggle');
const compareBar = document.getElementById('compare-bar');
const compareCount = document.getElementById('compare-count');
const compareAnnulerBtn = document.getElementById('compare-annuler');
const compareLancerBtn = document.getElementById('compare-lancer');
const fullscreenCompareBtn = document.getElementById('fullscreen-compare-btn');
const compareOverlay = document.getElementById('compare-overlay');
const compareCards = document.getElementById('compare-cards');

const LIMITE_COMPARAISON = 4;

let personnages = [];
let imagesManquantes = new Set();
let filtresActifs = new Set();
let modeRecherche = 'survivant';
let compareModeActif = false;
let cartesSelectionnees = new Set();

async function chargerPersonnages() {
    const reponse = await fetch('/api/personnages');
    personnages = await reponse.json();

    await preloaderImages(personnages);

    loader.classList.add('invisible');
    grid.classList.remove('invisible');
    appliquerFiltres();
}

function preloaderImages(liste) {
    const promesses = liste.map(p => {
        return new Promise(resolve => {
            const img = new Image();
            img.src = `/${p.image}`;
            img.onload = () => resolve();
            img.onerror = () => {
                imagesManquantes.add(p.image);
                resolve();
            };
        });
    });
    return Promise.all(promesses);
}

function afficherPersonnages(liste) {
    grid.innerHTML = '';
    liste.forEach(p => {
        const carte = document.createElement('div');
        carte.classList.add('carte-personnage');

        if (imagesManquantes.has(p.image)) {
            const placeholder = document.createElement('div');
            placeholder.classList.add('coming-soon');
            placeholder.textContent = p.character + ' - Coming soon';
            carte.appendChild(placeholder);
        } else {
            const img = document.createElement('img');
            img.src = `/${p.image}`;
            img.alt = p.character;
            carte.appendChild(img);
        }

        if (compareModeActif) {
            const boutonCompare = document.createElement('button');
            boutonCompare.classList.add('compare-toggle-carte');
            const estSelectionne = cartesSelectionnees.has(p.id);

            boutonCompare.textContent = estSelectionne ? 'Retirer' : 'Ajouter';
            boutonCompare.classList.toggle('actif', estSelectionne);

            if (!estSelectionne && cartesSelectionnees.size >= LIMITE_COMPARAISON) {
                boutonCompare.disabled = true;
            }

            boutonCompare.addEventListener('click', (e) => {
                e.stopPropagation();
                basculerSelectionComparaison(p.id);
            });

            carte.appendChild(boutonCompare);
        }

        carte.addEventListener('click', () => ouvrirVueAgrandie(p));
        grid.appendChild(carte);
    });
}

function basculerSelectionComparaison(id) {
    if (cartesSelectionnees.has(id)) {
        cartesSelectionnees.delete(id);
    } else if (cartesSelectionnees.size < LIMITE_COMPARAISON) {
        cartesSelectionnees.add(id);
    }
    actualiserBarreComparaison();
    appliquerFiltres();
}

function actualiserBarreComparaison() {
    compareCount.textContent = `${cartesSelectionnees.size}/${LIMITE_COMPARAISON} sélectionnées`;
}

function personnageCorrespondRecherche(p, texteRecherche) {
    if (modeRecherche === 'survivant') {
        return p.character.toLowerCase().includes(texteRecherche);
    } else {
        return p.pouvoirs.some(pouvoir =>
            pouvoir.nom.toLowerCase().includes(texteRecherche)
        );
    }
}

function appliquerFiltres() {
    const texteRecherche = searchBar.value.trim().toLowerCase();

    const resultats = personnages.filter(p => {
        const correspondRecherche = personnageCorrespondRecherche(p, texteRecherche);
        const correspondFiltres = [...filtresActifs].every(filtre =>
            p.categories.includes(filtre)
        );
        return correspondRecherche && correspondFiltres;
    });

    afficherPersonnages(resultats);
}

function ouvrirVueAgrandie(personnage) {
    overlayImage.src = `/${personnage.image}`;
    overlayImage.alt = personnage.character;

    overlayPouvoirs.innerHTML = '';
    personnage.pouvoirs.forEach(pouvoir => {
        const bloc = document.createElement('div');
        bloc.classList.add('pouvoir-bloc');

        const titre = document.createElement('h4');
        titre.textContent = pouvoir.nom;

        const description = document.createElement('p');
        description.textContent = pouvoir.description;

        bloc.appendChild(titre);
        bloc.appendChild(description);
        overlayPouvoirs.appendChild(bloc);
    });

    if (compareModeActif) {
        fullscreenCompareBtn.classList.remove('invisible');
        actualiserBoutonCompareFullscreen(personnage.id);

        fullscreenCompareBtn.onclick = () => {
            basculerSelectionComparaison(personnage.id);
            actualiserBoutonCompareFullscreen(personnage.id);
        };
    } else {
        fullscreenCompareBtn.classList.add('invisible');
    }

    overlay.classList.add('visible');
}

function actualiserBoutonCompareFullscreen(id) {
    const estSelectionne = cartesSelectionnees.has(id);
    fullscreenCompareBtn.textContent = estSelectionne ? 'Retirer' : 'Ajouter';
    fullscreenCompareBtn.classList.toggle('actif', estSelectionne);
    fullscreenCompareBtn.disabled = !estSelectionne && cartesSelectionnees.size >= LIMITE_COMPARAISON;
}

function fermerVueAgrandie() {
    overlay.classList.remove('visible');
}

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        fermerVueAgrandie();
    }
});

searchBar.addEventListener('input', appliquerFiltres);

boutonsFiltre.forEach(bouton => {
    bouton.addEventListener('click', () => {
        const categorie = bouton.dataset.categorie;

        if (filtresActifs.has(categorie)) {
            filtresActifs.delete(categorie);
            bouton.classList.remove('actif');
        } else {
            filtresActifs.add(categorie);
            bouton.classList.add('actif');
        }

        appliquerFiltres();
    });
});

modeToggle.addEventListener('click', () => {
    modeMenu.classList.toggle('invisible');
});

modeOptions.forEach(option => {
    option.addEventListener('click', () => {
        modeRecherche = option.dataset.mode;

        searchBar.placeholder = modeRecherche === 'survivant'
            ? 'Rechercher un survivant...'
            : 'Rechercher une capacité...';

        searchBar.value = '';
        modeMenu.classList.add('invisible');
        appliquerFiltres();
    });
});

document.addEventListener('click', (e) => {
    if (!modeToggle.contains(e.target) && !modeMenu.contains(e.target)) {
        modeMenu.classList.add('invisible');
    }
});

compareToggleBtn.addEventListener('click', () => {
    compareModeActif = !compareModeActif;
    compareToggleBtn.classList.toggle('actif', compareModeActif);
    compareBar.classList.toggle('invisible', !compareModeActif);

    if (!compareModeActif) {
        cartesSelectionnees.clear();
    }

    actualiserBarreComparaison();
    appliquerFiltres();
});

compareAnnulerBtn.addEventListener('click', () => {
    compareModeActif = false;
    cartesSelectionnees.clear();
    compareToggleBtn.classList.remove('actif');
    compareBar.classList.add('invisible');
    appliquerFiltres();
});

compareLancerBtn.addEventListener('click', () => {
    const selection = personnages
        .filter(p => cartesSelectionnees.has(p.id))
        .sort((a, b) => a.character.toLowerCase().localeCompare(b.character.toLowerCase()));

    afficherPageComparaison(selection);
});

function afficherPageComparaison(selection) {
    compareCards.innerHTML = '';

    selection.forEach(p => {
        const carte = document.createElement('div');
        carte.classList.add('compare-card');

        const img = document.createElement('img');
        img.src = `/${p.image}`;
        img.alt = p.character;
        carte.appendChild(img);

        carte.appendChild(construireTableauStats(p));
        compareCards.appendChild(carte);
    });

    compareOverlay.classList.add('visible');
}

function construireTableauStats(personnage) {
    const table = document.createElement('table');
    table.classList.add('compare-table');

    ajouterLigne(table, 'Nom', personnage.character);
    ajouterLigne(table, 'Type', personnage.categories.join(' + ') || '-');

    personnage.pouvoirs_par_case.forEach((capacites, index) => {
        const ligne = document.createElement('tr');

        const labelCell = document.createElement('td');
        labelCell.classList.add('label-cell');
        labelCell.textContent = `Capacité ${index + 1}`;

        const valeurCell = document.createElement('td');

        if (capacites.length === 0) {
            valeurCell.textContent = '-';
        } else {
            capacites.forEach((capacite, i) => {
                const span = document.createElement('span');
                span.classList.add('capacite-nom');
                span.textContent = capacite.nom;

                const tooltip = document.createElement('span');
                tooltip.classList.add('tooltip');
                tooltip.textContent = capacite.description;
                span.appendChild(tooltip);

                valeurCell.appendChild(span);

                if (i < capacites.length - 1) {
                    valeurCell.appendChild(document.createTextNode(' / '));
                }
            });
        }

        ligne.appendChild(labelCell);
        ligne.appendChild(valeurCell);
        table.appendChild(ligne);
    });

    return table;
}

function ajouterLigne(table, label, valeur) {
    const ligne = document.createElement('tr');

    const labelCell = document.createElement('td');
    labelCell.classList.add('label-cell');
    labelCell.textContent = label;

    const valeurCell = document.createElement('td');
    valeurCell.textContent = valeur;

    ligne.appendChild(labelCell);
    ligne.appendChild(valeurCell);
    table.appendChild(ligne);
}

function fermerComparaison() {
    compareOverlay.classList.remove('visible');
    compareModeActif = false;
    cartesSelectionnees.clear();
    compareToggleBtn.classList.remove('actif');
    compareBar.classList.add('invisible');
    appliquerFiltres();
}

compareOverlay.addEventListener('click', (e) => {
    if (e.target === compareOverlay) {
        fermerComparaison();
    }
});
chargerPersonnages();