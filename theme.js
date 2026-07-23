function appliquerTheme(theme) {
    const lienCSS = document.getElementById('theme-stylesheet');
    lienCSS.setAttribute('href', theme === 'dark' ? 'style-dark.css' : 'style-light.css');
    localStorage.setItem('theme', theme);

    const selecteur = document.getElementById('theme-select');
    if (selecteur) {
        selecteur.value = theme;
    }
}

const themeSauvegarde = localStorage.getItem('theme') || 'dark';
appliquerTheme(themeSauvegarde);

const selecteurTheme = document.getElementById('theme-select');
if (selecteurTheme) {
    selecteurTheme.addEventListener('change', (e) => {
        appliquerTheme(e.target.value);
    });
}