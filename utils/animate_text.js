import { animate,stagger,splitText } from '../libs/animejs/index.js';


export function fadeInAndBalatro(element){
    if (!element) return;
    fadeIn(element).then(()=>{
        initBalatroEffect(element)
    });
}
export function firstplace(element) {
    if (!element) return;
    animateWave(element);
    // SplitText przygotowuje litery jako osobne spany
    const { chars } = splitText(element, { chars: true });

    return animate(chars, {
        // Pełna paleta kolorów tęczy
        color: [
            '#FFFF00', // Żółty
            '#2cff2c', // Niebieski
            '#001eff',  // Powrót do czerwonego dla płynnej pętli // Czerwony
            '#FFFF00' // Pomarańczowy
        ],
        easing: 'linear',
        loop: true,
        delay: stagger(150), // Opóźnienie między literami tworzy efekt fali
    });
}
export function secondplace(element) {
    if (!element) return;
    // SplitText przygotowuje litery jako osobne spany
    const { chars } = splitText(element, { chars: true });

    return animate(chars, {
        // Pełna paleta kolorów tęczy
        color: [
            '#c3c3c3',
            '#ffffff',
            '#c3c3c3',
        ],
        easing: 'linear',
        loop: true,
        delay: stagger(150), // Opóźnienie między literami tworzy efekt fali
    });
}
export function thirdplace(element) {
    if (!element) return;
    // SplitText przygotowuje litery jako osobne spany
    const { chars } = splitText(element, { chars: true });

    return animate(chars, {
        // Pełna paleta kolorów tęczy
        color: [
            '#bc7a00',
            '#ffa600',
            '#bc7a00',
        ],
        easing: 'linear',
        loop: true,
        delay: stagger(150), // Opóźnienie między literami tworzy efekt fali
    });
}
export function scaleText(element){
    if (!element) return;
    const { chars } = splitText(element, {chars: true,});
    return animate(chars, {
        // Definiujemy pełny cykl góra -> dół -> powrót
        // Kluczem jest brak wartości 0 w środku, co eliminowało "czkawkę"
        scale: [2,1],
        easing: 'linear',
        duration: 150,
        delay: stagger(10)
    });
}
export function fadeIn(element){
    if (!element) return;
    const { chars } = splitText(element, {chars: true,});

    return animate(chars, {
        // Definiujemy pełny cykl góra -> dół -> powrót
        // Kluczem jest brak wartości 0 w środku, co eliminowało "czkawkę"
        opacity: [0,1],
        easing: 'linear',
        duration: 100,
        delay: stagger(25)
    });
}
export function animateWave(element) {
    if (!element) return;
    
    const { chars } = splitText(element, {chars: true,});

    animate(chars, {
        // Definiujemy pełny cykl góra -> dół -> powrót
        // Kluczem jest brak wartości 0 w środku, co eliminowało "czkawkę"
        translateY: [0,-2, 2, 0],
        easing: 'linear',
        duration: 800,
        loop: true,
        // Stagger tworzy efekt "węża" – każda litera jest w innym punkcie sinusoidy
        delay: stagger(100)
    });
}
export function initBalatroEffect(element) {
    if (!element) return;

    const { chars } = splitText(element, {chars: true,});
    
    animate(chars, {
            // Skok w górę i powrót
            translateY: [
                { to: -3, duration: 300, easing: 'easeOutQuad' },
                { to: 0, duration: 300, easing: 'easeInQuad' }
            ],
            // Opóźnienie startowe dla danej litery w fali
            delay: stagger(500),
            loop: true,
            loopDelay: 1000,
        });
}