export class Queue {
    constructor() {
        this.items = {};    // Przechowujemy elementy w obiekcie
        this.head = 0;      // Wskaźnik na początek kolejki
        this.tail = 0;      // Wskaźnik na koniec kolejki
    }

    // Dodaje kafelek na koniec
    enqueue(element) {
        this.items[this.tail] = element;
        this.tail++;
    }
    enqueueAll(elements) {
        if (!Array.isArray(elements)) {
            console.error("Błąd: Przekazany argument nie jest tablicą!");
            return;
        }

        // Iterujemy po tablicy i używamy istniejącej metody enqueue
        for (let i = 0; i < elements.length; i++) {
            this.enqueue(elements[i]);
        }
    }
    // Usuwa i zwraca kafelek z początku
    dequeue() {
        if (this.isEmpty()) return null;

        const item = this.items[this.head];
        delete this.items[this.head]; // Czyścimy pamięć
        this.head++;
        return item;
    }
    dequeueAll() {
        const items = [];
        while (!this.isEmpty()) {
            items.push(this.dequeue());
        }
        return items;
    }

    // Sprawdza następny element bez usuwania go
    peek() {
        return this.items[this.head] || null;
    }

    isEmpty() {
        return this.tail - this.head === 0;
    }

    get size() {
        return this.tail - this.head;
    }
    unshift(element) {
        this.head--; // Przesuwamy wskaźnik głowy w tył
        this.items[this.head] = element;
    }
    // Opcjonalnie: czyści całą kolejkę
    clear() {
        this.items = {};
        this.head = 0;
        this.tail = 0;
    }
}
