import { UPGRADE_STATES, SCORE_ACTIONS, PRIORITY, Settings } from "../dictionary.js";
import { PriorityQueue } from "../utils/PriorityQueue.js";
import { Queue } from "../utils/Queue.js";

export class TriggerManager {
    constructor(game) {
        this.game = game;
        this.playerInventory = game.upgrades;
        this.Audio = game.Audio;
        
        this.eventQueue = new PriorityQueue();
        // Globalny łańcuch wizualny dla całej instancji
        this.visualChain = Promise.resolve();
        this.activeScores = new Set(); 
        this.iterators = new Map();
    }

    async emit(event, payload) {
        // Czyścimy flagi z poprzedniego pełnego wywołania
        this.playerInventory.forEach(u => u.isExhausted = false);
        this.visualChain = Promise.resolve(); // Resetujemy łańcuch na start nowej akcji gracza

        // 1. Dodajemy bazowe karty wg priorytetów
        for (const [key, value] of Object.entries(PRIORITY)) {
            const priorityUpgrades = this.playerInventory.filter(u => u.priority === value);
            console.log(priorityUpgrades);
            this.addToQueue(priorityUpgrades, event, payload);
        }

        // 2. Procesujemy kolejkę (obsługa retriggerów)
        while (this.eventQueue.size > 0) {
            const { upgrade, event, payload } = this.eventQueue.dequeue();
            console.log(upgrade.name+" "+event);
            // Mechanizm EXHAUSTED (opcjonalny bezpiecznik)
            if (upgrade.isExhausted) continue;

            await this.processHandlers(event, upgrade, payload);
        }

        // 3. Czekamy, aż ostatnia animacja w łańcuchu się zakończy
        await this.visualChain;
        
        // 4. Dopiero teraz reset
        this.resetAll();
    }
getHandlers(upgrade,event){
    if (!upgrade || typeof upgrade !== "object" || upgrade.isExhausted) return null;

            const handlerName = `on${event[0].toUpperCase()}${event.slice(1)}`;
            const mainHandler = typeof upgrade[handlerName] === "function"
                ? upgrade[handlerName]
                : upgrade.props?.[handlerName];

            const specialHandler = (event === "score" && typeof upgrade.specialFunc === "function")
                ? upgrade.specialFunc
                : null;
            const handlers = [mainHandler, specialHandler].filter(Boolean);
            return handlers;
}
    async processHandlers(event, upgrade, payload) {
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const handlers = this.getHandlers(upgrade, event); 
        if (!handlers || handlers.length === 0) return;

        // 1. Zarządzanie iteracjami na poziomie KARTY + EVENTU
        const iterKey = `${upgrade.name}_${event}`;
        let currentIter = this.iterators.get(iterKey) || 1; // Zaczynamy od 1
        
        // Pobieramy bonusowe powtórzenia z ulepszenia (Twoja nowa tablica/obiekt)
        let extraRepeats = upgrade.repeats?.[event] ?? 0;
        let totalRepeat = 1 + extraRepeats; // 1 (bazowe) + bonus

        // 2. Wykonujemy WSZYSTKIE handlery przypisane do tego eventu w tej JEDNEJ iteracji
        for (const handler of handlers) {
            let result = handler.call(upgrade, payload);
            if (!result) continue;

            // --- LOGIKA RETRIGGERA ---
            if (result.retrigger) {
                this.addToQueue(result.retrigger.upgrades, result.retrigger.event, result.retrigger.payload);
            }

            // --- WIZUALIZACJA ---
            let state = (typeof result === "object" && result !== null)
                ? (result.state ?? result.UPGRADE_STATES ?? null)
                : result;
            
            let message = result?.message ?? null;
            let style = result?.style ?? SCORE_ACTIONS.Mult;

            if (state && state !== UPGRADE_STATES.Failed) {
                this.visualChain = this.visualChain.then(() => {
                    if (this.game.emitTimingMs > this.game.minEmitMs) {
                        this.game.emitTimingMs -= 5;
                    }
                    const finaltiming = this.game.emitTimingMs;
                    upgrade.UpgradeRenderer.trigger(finaltiming - 50, state);
                    this.Audio.playSound("tick.mp3");
                    
                    if (message) {
                        upgrade.UpgradeRenderer.createPopup(message, style,finaltiming-50);
                    }
                    return wait(finaltiming);
                });

                if (state === UPGRADE_STATES.Score) {
                    await this.visualChain;
                    this.visualChain = Promise.resolve();
                    this.activeScores.add(upgrade);
                }
            }

            // --- OBSŁUGA EXHAUSTED ---
            // Jeśli karta ma priorytet REPEAT lub odpaliła retrigger, po ostatniej iteracji odpoczywa
            if ((result.retrigger) && currentIter >= totalRepeat) {
                upgrade.isExhausted = true;
            }
        }

        // 3. PLANOWANIE KOLEJNEJ ITERACJI (Cała karta wraca do kolejki)
        if (currentIter < totalRepeat) {
            this.iterators.set(iterKey, currentIter + 1);
            this.eventQueue.unshift({ 
                upgrade, 
                event: event, 
                payload: payload 
            }, upgrade.priority);
        } else {
            // Sprzątamy po zakończeniu wszystkich powtórzeń
            this.iterators.delete(iterKey);
        }
    }
    addToQueue(upgrades, event, payload) {
        for (const upgrade of upgrades) {
            
            const handlers = this.getHandlers(upgrade, event); 

            if (handlers&&handlers.length > 0) {
                this.eventQueue.enqueue({ upgrade, event, payload },upgrade.priority);
            }
        }
    }

    resetAll() {
        this.activeScores.forEach(upgrade => {
            if (typeof upgrade.reset === "function") {
                upgrade.reset();
            }
        });
        this.iterators.clear();
        this.activeScores.clear();
        // Resetujemy emitTimingMs do wartości domyślnej po zakończeniu serii
        this.game.emitTimingMs = Settings.EMIT_TIMING_MS; // Przykład: powrót do Settings.EMIT_TIMING_MS
    }
}