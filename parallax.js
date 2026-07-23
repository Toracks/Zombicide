const bgLayer = document.getElementById('bg-layer');

const VITESSE_PARALLAX = -0.05;
const DECALAGE_MAXIMUM = 200;

let enAttente = false;

function mettreAJourParallax() {
    let decalage = window.scrollY * VITESSE_PARALLAX;
    decalage = Math.max(-DECALAGE_MAXIMUM, Math.min(decalage, DECALAGE_MAXIMUM));

    bgLayer.style.transform = `scale(1.1) translateY(${decalage}px)`;
    enAttente = false;
}

window.addEventListener('scroll', () => {
    if (!enAttente) {
        requestAnimationFrame(mettreAJourParallax);
        enAttente = true;
    }
}, { passive: true });