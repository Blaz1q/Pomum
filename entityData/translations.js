import { Style,LANGUAGE, DIFFICULTY } from "../dictionary.js";

export const translations = {
    [LANGUAGE.PL]: {
        ui:{
            startGame: "Rozpocznij",
            collection: "Kolekcja",
            settings: "Ustawienia",
            difficulty: "Poziom trudności",
            normal: "Normalny",
            getAtLeast: "Zdobądź",
            score: "Wynik",
            yourScore: "Twój wynik",
            round: "runda",
            moves: "ruchy",
            info: "Informacje"
        },
        upgrades: {
            battlepass:{
                name: "Battlepass",
                description: (up) => `Na końcu rundy to ulepszenie dostaje ${Style.Mult("+1 mult")}. (Obecnie ${Style.Mult("+" + up.props.mult + " mult")})`
            },
            highfive:{
                name: "High Five",
                description: `Gdy zniszczy się ${Style.Highlight('pięć')} kafelków w linii, ${Style.Mult("X2 mult")}`
            },
            broke:{
                name: "Broke",
                description: `Jeżeli ma się mniej niż ${Style.Money('$6')}, ${Style.Score("+250 punktów")}`
            },
            robber: {
                name: "Robber",
                description: (up) => `Daje ${Style.Mult('mult')} za ${Style.Highlight('cenę sprzedaży')} wszystkich kupionych ulepszeń. (Obecnie ${Style.Mult(`+${up.props.calcMult()} mult`)}).`
            }
        }
    },
    [LANGUAGE.EN]: {
        ui:{
            startGame: "Start Game",
            collection: "Collection",
            settings: "Settings",
            difficulty: "Difficulty",
            normal: "Normal",
            getAtLeast: "Get at least",
            score: "Score",
            yourScore: "Your score",
            round: "round",
            moves: "moves",
            info: "Info"
        },
        upgrades: {
            battlepass:{
                name: "Battlepass",
                description: (up) => `At the end of round this upgrade gets ${Style.Mult("+1 mult")}. (Currently ${Style.Mult("+" + (up.props.mult ?? 3) + " mult")})`
            },
            highfive:{
                name: "High Five",
                description: `Upon destroying ${Style.Highlight('five')} tiles in a line, ${Style.Mult("X2 mult")}`
            },
            broke:{
                name: "Broke",
                description: `If you have less than ${Style.Money('$6')}, ${Style.Score("+250 points")}`
            },
            robber: {
                name: "Robber",
                description: (up) => `Gives ${Style.Mult('mult')} for ${Style.Highlight('sell price')} of all owned upgrades. (Currently ${Style.Mult(`+${up.props.calcMult()} mult`)}).`
            }
        }
    }
}
export const t = (path, lang, data = null) => {
    // Rozbijamy ścieżkę 'ui.buy' na ['ui', 'buy'] i szukamy w obiekcie
    const keys = path.split('.');
    let translation = translations[lang];

    for (const key of keys) {
        if (translation[key]) {
            translation = translation[key];
        } else {
            return path; // Zwraca ścieżkę, jeśli tłumaczenie nie istnieje (ułatwia debugowanie)
        }
    }

    // Jeśli tłumaczenie jest funkcją (jak w Twoich opisach), wywołujemy ją z danymi
    return typeof translation === 'function' ? translation(data) : translation;
};
export function changeLanguage(game){
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key, game.lang);
    });
}