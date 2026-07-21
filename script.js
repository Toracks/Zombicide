const traductions = {
    fr: {
        home: "Menu",
        play: "Jouer",
        settings: "Paramètres",
        regles: "Règles",
        characters: "Personnages",
        tools: "Outils",
    },

    en: {
        home: "Home",
        play: "Play",
        settings: "Settings",
        regles: "Rules",
        characters: "Characters",
        tools: "Tools",
    }
};

let langue = "fr";

document.getElementById("home").textContent = traductions[langue].home;
document.getElementById("play").textContent = traductions[langue].play;
document.getElementById("settings").textContent = traductions[langue].settings;
document.getElementById("regles").textContent = traductions[langue].regles;
document.getElementById("characters").textContent = traductions[langue].characters;
document.getElementById("tools").textContent = traductions[langue].tools;