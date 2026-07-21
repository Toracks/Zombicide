const toggleButton = document.getElementById('theme-toggle');
const lienCSS = document.getElementById('theme-stylesheet');

function appliquerTheme(theme) {
    lienCSS.setAttribute('href', theme === 'dark' ? 'style-dark.css' : 'style-light.css');
    toggleButton.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('theme', theme);
}

const themeSauvegarde = localStorage.getItem('theme') || 'dark';
appliquerTheme(themeSauvegarde);

toggleButton.addEventListener('click', () => {
    const themeActuel = localStorage.getItem('theme') || 'dark';
    const nouveauTheme = themeActuel === 'dark' ? 'light' : 'dark';
    appliquerTheme(nouveauTheme);
});