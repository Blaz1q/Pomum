import { UPGRADE_STATES, SCORE_ACTIONS, PRIORITY, Settings, STAGES } from "../dictionary.js";
import { PriorityQueue } from "../utils/PriorityQueue.js";
import { Queue } from "../utils/Queue.js";
import { GAME_TRIGGERS } from "../dictionary.js";

export class TriggerManager {
    constructor(game) {
        this.game = game;
        this.Audio = game.Audio;
        
        this.eventQueue = new PriorityQueue();
        this.queues = new Map();
        // Globalny łańcuch wizualny dla całej instancji
        this.visualChain = Promise.resolve();
        this.activeScores = new Set(); 
        this.iterators = new Map();
        this.pitch = 1;
    }

    async emit(event, payload) {
        // Czyścimy flagi z poprzedniego pełnego wywołania
        
        this.game.upgrades.forEach(u => u.isExhausted = false);
        this.visualChain = Promise.resolve(); // Resetujemy łańcuch na start nowej akcji gracza
        const queue = this.handleQueues(event);
        // 1. Dodajemy bazowe karty wg priorytetów
        for (const [key, value] of Object.entries(PRIORITY)) {
            const priorityUpgrades = this.game.upgrades.filter(u => u.priority === value);
            if (this.game.stage === STAGES.Boss && this.game.nextBoss && this.game.nextBoss.priority === value) {
                priorityUpgrades.push(this.game.nextBoss);
            }
            this.addToQueue(priorityUpgrades, event, payload);
        }
        
        // 2. Procesujemy kolejkę (obsługa retriggerów)
        while (queue.size > 0) {
            const { upgrade, event, payload } = queue.dequeue();
            console.log(upgrade.name+" "+event);
            // Mechanizm EXHAUSTED (opcjonalny bezpiecznik)
            if (upgrade.isExhausted) continue;
            
            await this.processHandlers(event, upgrade, payload);
        }

        // 3. Czekamy, aż ostatnia animacja w łańcuchu się zakończy
        await this.visualChain;
        
        // 4. Dopiero teraz reset
        this.resetAll(event);
    }
getHandlers(upgrade,event){
    if (!upgrade || typeof upgrade !== "object" || upgrade.isExhausted ) return null;  

            const handlerName = `on${event[0].toUpperCase()}${event.slice(1)}`;
            const mainHandler = typeof upgrade[handlerName] === "function"
                ? upgrade[handlerName]
                : upgrade.props?.[handlerName];

            const specialHandler = (event === "score" && typeof upgrade.specialFunc === "function")
                ? upgrade.specialFunc
                : null;

            const stickerHandlers = (upgrade.stickers || [])
                .map(sticker => {
                    const fn = sticker.props?.[handlerName];
                    if (typeof fn === "function") {
                        return fn.bind(sticker.props); 
                    }
                    return null;
                })
                .filter(Boolean);
            let handlers = [];
            if(!upgrade.active){
                handlers = [...stickerHandlers].filter(Boolean);
                return handlers;
            }
            handlers = [mainHandler, specialHandler, ...stickerHandlers].filter(Boolean);
            return handlers;
}
    async processHandlers(event, upgrade, payload) {
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const handlers = this.getHandlers(upgrade, event); 
        const queue = this.handleQueues(event);
        console.log(queue);
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
            let translation = result?.translation ?? false;

            if (state && state !== UPGRADE_STATES.Failed) {
                this.visualChain = this.visualChain.then(() => {
                    if (this.game.emitTimingMs > this.game.minEmitMs) {
                        this.game.emitTimingMs -= 5;
                    }
                    const finaltiming = this.game.emitTimingMs;
                    upgrade.UpgradeRenderer.trigger(finaltiming - 50, state);
                    if(message&&result?.style==SCORE_ACTIONS.Mult&&message[0]=='X'){
                        this.Audio.playSound("xmult.mp3",this.pitch);
                    }
                    else if(result?.style==SCORE_ACTIONS.Mult){
                        this.Audio.playSound("mult.mp3",this.pitch);
                    }else{
                        this.Audio.playSound("tick.mp3");
                    }
                    if (message) {
                        upgrade.UpgradeRenderer.createPopup(message, {style: style, duration: finaltiming-50, translation: translation});
                    }
                    this.pitch+=0.05;
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
        if(event!=GAME_TRIGGERS.onUpgradeTriggered){
            this.emit(GAME_TRIGGERS.onUpgradeTriggered,{upgrade: upgrade,event: event});
        }
        // 3. PLANOWANIE KOLEJNEJ ITERACJI (Cała karta wraca do kolejki)
        if (currentIter < totalRepeat) {
            this.iterators.set(iterKey, currentIter + 1);
            queue.unshift({ 
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
        const queue = this.handleQueues(event);
        
        for (const upgrade of upgrades) { 
            const handlers = this.getHandlers(upgrade, event); 
            console.log(handlers);
            if (handlers&&handlers.length > 0) {
                queue.enqueue({ upgrade, event, payload },upgrade.priority);
            }
        }
    }
    handleQueues(event){
        if(!this.queues.get(event)){
            this.queues.set(event,new PriorityQueue());
        }
        return this.queues.get(event);
    }
    resetAll(event) {
        if(event!=GAME_TRIGGERS.onScore) return;
        this.activeScores.forEach(upgrade => {
            if (typeof upgrade.reset === "function") {
                upgrade.reset();
            }
        });
        this.iterators.clear();
        this.activeScores.clear();
        // Resetujemy emitTimingMs do wartości domyślnej po zakończeniu serii
        this.game.emitTimingMs = Settings.EMIT_TIMING_MS; // Przykład: powrót do Settings.EMIT_TIMING_MS
        this.pitch = 1;
    }
}