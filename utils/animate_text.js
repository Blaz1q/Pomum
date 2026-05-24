import { animate,stagger,splitText } from '../libs/animejs/index.js';


const activeAnimations = new Map();
export function clearAnimation(element) {
    if (!element) return;

    if (activeAnimations.has(element)) {
        const animationData = activeAnimations.get(element);

        // 1. Wyciągamy AKTUALNY tekst prosto z DOM, na wypadek gdyby zmienił się w locie
        // Filtrujemy, aby pobrać czysty string bez tagów span wrzuconych przez splitter

        // 2. Bezpiecznie zatrzymujemy i revertujemy instancję animacji anime.js
        animationData.animInstance.revert();
        animationData.splitter.revert();

        // 4. KLUCZOWY FIX: Wymuszamy wrzucenie najbardziej aktualnego tekstu,

        // 5. Czyścimy mapę
        activeAnimations.delete(element);
    }
}
function prepareElement(element) {
    // Najpierw bezwzględnie czyścimy starą animację, jeśli istnieje
    clearAnimation(element);

    // Zapisujemy oryginalny tekst zanim splitText podzieli go na spany
    const originalText = element.textContent;

    // Dzielimy tekst na spany
    let splitter = splitText(element, { chars: true,clone: false });
    const { chars } = splitter;

    // Zapisujemy dane elementu (na razie bez instancji animacji)
    activeAnimations.set(element, { originalText, animInstance: null, splitter: splitter});

    return chars;
}
export function fadeInAndBalatro(element){
    if (!element) return;
    
    // Przygotowujemy element TYLKO RAZ na początku całej sekwencji
    const chars = prepareElement(element);

    const anim = animate(chars, {
        opacity: [0, 1],
        easing: 'linear',
        duration: 100,
        delay: stagger(25),
        complete: () => {
            // Sprawdzamy czy w międzyczasie animacja nie została przerwana/wyczyszczona
            if (!activeAnimations.has(element)) return;

            // Odpalamy Balatro Effect na TYCH SAMYCH przygotowanych wcześniej spanach (chars)
            const balatroAnim = animate(chars, {
                translateY: [
                    { to: -3, duration: 300, easing: 'easeOutQuad' },
                    { to: 0, duration: 300, easing: 'easeInQuad' }
                ],
                delay: stagger(500),
                loop: true,
                loopDelay: 1000,
            });

            // Podmieniamy instancję animacji w mapie na tę zapętloną, żeby clearAnimation mogło ją zatrzymać
            const data = activeAnimations.get(element);
            if (data) data.animInstance = balatroAnim;
        }
    });

    activeAnimations.get(element).animInstance = anim;
    return anim;
}
export function firstplace(element) {
    if (!element) return;
    // Usunąłem stąd bezpośrednie wywołanie animateWave(element), 
    // ponieważ wywoływało prepareElement() drugi raz i zamrażało tekst!
    // Zamiast tego robimy połączoną animację:
    const chars = prepareElement(element);

    const anim = animate(chars, {
        color: ['#FFFF00', '#2cff2c', '#001eff', '#FFFF00'],
        translateY: [0, -2, 2, 0], // Efekt fali wstrzyknięty bezpośrednio tutaj
        easing: 'linear',
        loop: true,
        delay: stagger(150),
        duration: 800
    });
    
    activeAnimations.get(element).animInstance = anim;
    return anim;
}
export function secondplace(element) {
    if (!element) return;
    // SplitText przygotowuje litery jako osobne spany
    const chars = prepareElement(element);
    const anim = animate(chars, {
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
    activeAnimations.get(element).animInstance = anim;
    return anim;
}
export function thirdplace(element) {
    if (!element) return;
    // SplitText przygotowuje litery jako osobne spany
    const chars = prepareElement(element);
    const anim = animate(chars, {
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
    activeAnimations.get(element).animInstance = anim;
    return anim;
}
export function scaleText(element){
    if (!element) return;
    const chars = prepareElement(element);
    const anim = animate(chars, {
        // Definiujemy pełny cykl góra -> dół -> powrót
        // Kluczem jest brak wartości 0 w środku, co eliminowało "czkawkę"
        scale: [2,1],
        easing: 'linear',
        duration: 150,
        delay: stagger(10)
    });
    activeAnimations.get(element).animInstance = anim;
    return anim;
}
export function fadeIn(element){
    if (!element) return;
    const chars = prepareElement(element);

    const anim = animate(chars, {
        // Definiujemy pełny cykl góra -> dół -> powrót
        // Kluczem jest brak wartości 0 w środku, co eliminowało "czkawkę"
        opacity: [0,1],
        easing: 'linear',
        duration: 100,
        delay: stagger(25)
    });
    activeAnimations.get(element).animInstance = anim;
    return anim;
}
export function animateWave(element) {
    if (!element) return;
    const chars = prepareElement(element);
    const anim = animate(chars, {
        // Definiujemy pełny cykl góra -> dół -> powrót
        // Kluczem jest brak wartości 0 w środku, co eliminowało "czkawkę"
        translateY: [0,-2, 2, 0],
        easing: 'linear',
        duration: 800,
        loop: true,
        // Stagger tworzy efekt "węża" – każda litera jest w innym punkcie sinusoidy
        delay: stagger(100)
    });
    activeAnimations.get(element).animInstance = anim;
    return anim;
}
export function initBalatroEffect(element) {
    if (!element) return;
    const chars = prepareElement(element);
    const anim = animate(chars, {
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
    activeAnimations.get(element).animInstance = anim;
    return anim;
}