import { animate,stagger,splitText } from '../libs/animejs/index.js';


export function fadeInAndBalatro(element){
    if (!element) return;
    fadeIn(element).then(()=>{
        initBalatroEffect(element)
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