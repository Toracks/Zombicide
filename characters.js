const searchBar = document.getElementById('search-bar');
const grid = document.getElementById('characters-grid');
const loader = document.getElementById('loader');
const boutonsFiltre = document.querySelectorAll('.filtre-btn');

let personnages = [];
let imagesManquantes = new Set();
let filtresActifs = new Set();

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
            placeholder.textContent = 'Coming soon';
            carte.appendChild(placeholder);
        } else {
            const img = document.createElement('img');
            img.src = `/${p.image}`;
            img.alt = p.character;
            carte.appendChild(img);
        }

        carte.addEventListener('click', () => afficherEnGrand(carte, p));
        grid.appendChild(carte);
    });
}

function appliquerFiltres() {
    const texteRecherche = searchBar.value.trim().toLowerCase();

    const resultats = personnages.filter(p => {
        const correspondNom = p.character.toLowerCase().includes(texteRecherche);
        const correspondFiltres = [...filtresActifs].every(filtre =>
            p.categories.includes(filtre)
        );
        return correspondNom && correspondFiltres;
    });

    afficherPersonnages(resultats);
}

function afficherEnGrand(carteCliquee, personnage) {
    document.querySelectorAll('.carte-personnage').forEach(carte => {
        carte.classList.toggle('cachee', carte !== carteCliquee);
        carte.classList.toggle('agrandie', carte === carteCliquee);
    });

    afficherPouvoirs(personnage);

    carteCliquee.addEventListener('click', reinitialiserAffichage, { once: true });
}

function afficherPouvoirs(personnage) {
    const panel = document.getElementById('pouvoirs-panel');
    panel.innerHTML = '';

    personnage.pouvoirs.forEach(pouvoir => {
        const bloc = document.createElement('div');
        bloc.classList.add('pouvoir-bloc');

        const titre = document.createElement('h4');
        titre.textContent = pouvoir.nom;

        const description = document.createElement('p');
        description.textContent = pouvoir.description;

        bloc.appendChild(titre);
        bloc.appendChild(description);
        panel.appendChild(bloc);
    });

    panel.classList.add('visible');
}

function reinitialiserAffichage() {
    document.querySelectorAll('.carte-personnage').forEach(carte => {
        carte.classList.remove('cachee', 'agrandie');
    });

    const panel = document.getElementById('pouvoirs-panel');
    panel.classList.remove('visible');
    panel.innerHTML = '';
}

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

chargerPersonnages();