import { animate,stagger } from 'https://esm.sh/animejs';


export function animateWave(element) {
    if (!element) return;
    prepareElement(element);
    
    const chars = element.querySelectorAll('.char');

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
function prepareElement(element){
    if (!element) return;

    let text = element.textContent;
    
    // Logika pakowania w słowa i litery
    element.innerHTML = text.split(/(\s+)/).map(word => {
        if (word.trim().length === 0) return word; // Spacje zwracamy bez zmian
        return `<span class="word" style="display:inline-block; white-space:nowrap;">${
            word.split("").map(char => `<span class="char" style="display:inline-block">${char}</span>`).join("")
        }</span>`;
    }).join("");
}
export function initBalatroEffect(element) {
    if (!element) return;

    prepareElement(element);

    const chars = element.querySelectorAll('.char');
    
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