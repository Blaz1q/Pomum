export class PriorityQueue {
    constructor() {
        this.items = []; // Używamy tablicy dla łatwiejszego sortowania
    }

    // Dodaje element z określonym priorytetem (im niższa liczba, tym wyższy priorytet)
    enqueue(element, priority) {
        const queueElement = { element, priority };
        let added = false;

        // Szukamy odpowiedniego miejsca w kolejce (Linear Insertion)
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }

        // Jeśli ma najniższy priorytet, dodajemy na koniec
        if (!added) {
            this.items.push(queueElement);
        }
    }
    unshift(element, priority) {
        const queueElement = { element, priority };
        let added = false;

        for (const [i, item] of this.items.entries()) {
            // Zmiana: używamy <= zamiast <. 
            // Jeśli priorytet jest mniejszy LUB RÓWNY, wpychamy się PRZED istniejący element.
            if (queueElement.priority <= item.priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(queueElement);
        }
    }
    enqueueAll(elementsWithPriority) {
        if (!Array.isArray(elementsWithPriority)) {
            console.error("Błąd: Przekazany argument nie jest tablicą!");
            return;
        }
        elementsWithPriority.forEach(({ element, priority }) => {
            this.enqueue(element, priority);
        });
    }

    // Zwraca i usuwa element o najwyższym priorytecie (z początku tablicy)
    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift().element;
    }

    dequeueAll() {
        const result = [];
        while (!this.isEmpty()) {
            result.push(this.dequeue());
        }
        return result;
    }

    // Podgląd elementu o najwyższym priorytecie
    peek() {
        return this.isEmpty() ? null : this.items[0].element;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    get size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }
}