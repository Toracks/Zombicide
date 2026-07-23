const LANGUES_DISPONIBLES = [
    { code: "fr", nom: "Français" },
    { code: "en", nom: "English" }
];

async function chargerTraductions(code) {
    const reponse = await fetch(`lang/${code}.json`);
    return await reponse.json();
}

function appliquerTraductions(traductions) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const cle = element.dataset.i18n;
        if (traductions[cle]) {
            element.textContent = traductions[cle];
        }
    });
}

function remplirSelecteurLangues() {
    const selecteur = document.getElementById('language-select');
    if (!selecteur) return;

    selecteur.innerHTML = '';
    LANGUES_DISPONIBLES.forEach(langue => {
        const option = document.createElement('option');
        option.value = langue.code;
        option.textContent = langue.nom;
        selecteur.appendChild(option);
    });
}

async function changerLangue(code) {
    const traductions = await chargerTraductions(code);
    appliquerTraductions(traductions);
    localStorage.setItem('langue', code);

    const selecteur = document.getElementById('language-select');
    if (selecteur) {
        selecteur.value = code;
    }
}

remplirSelecteurLangues();

const langueSauvegardee = localStorage.getItem('langue') || 'fr';
changerLangue(langueSauvegardee);

const selecteurLangue = document.getElementById('language-select');
if (selecteurLangue) {
    selecteurLangue.addEventListener('change', (e) => {
        changerLangue(e.target.value);
    });
}