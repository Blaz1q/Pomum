import { TYPES, GAME_TRIGGERS, Settings, MODIFIERS } from "./dictionary.js";
import { Tile } from "./Tile.js";

let FADE_MS = Settings.FADE_MS;
let MIN_FALL_MS = Settings.MIN_FALL_MS;
export class Matches {
    constructor(game) {
        this.game = game;
        this.matrixsize = game.matrixsize;
        this.activeExplosions = [];
    }
    specialMatches(matches) {
        let special = [];
        //console.log("matches:");
        //console.log(matches);
        matches.forEach(match => {
            if (match.type == TYPES.Bomb || match.type === TYPES.Dynamite) {
                special.push(match);
            }
        });
        //console.log("special matches:");
        //console.log(special);
        return special;
    }
    collectAllImpactedTiles(seeds) {
    const visited = new Set();
    const toProcess = [...seeds];
    const results = [];

    const getKey = (t) => `${t.x},${t.y}`;

    // 1. Dodaj nasiona do visited, żeby nie przetwarzać ich dwa razy
    seeds.forEach(s => visited.add(getKey(s)));

    // 2. BFS dla reakcji łańcuchowej
    let head = 0;
    while (head < toProcess.length) {
        const tile = toProcess[head++];
        results.push(tile);

        // Jeśli trafiony element to bomba/dynamit -> niszczy sąsiadów
        if (tile.type === TYPES.Bomb || tile.type === TYPES.Dynamite) {
            const neighbors = this.getNeighborsForSpecial(tile);
            for (const n of neighbors) {
                const nKey = getKey(n);
                if (!visited.has(nKey)) {
                    visited.add(nKey);
                    toProcess.push(n); // Dodajemy sąsiada do kolejki - jeśli to bomba, ona też wybuchnie!
                }
            }
        }
    }
    
    // 3. Dodaj normalne dopasowania (owoce), które mogły nie zostać trafione przez bomby
    const boardMatches = this.findMatches() || [];
    boardMatches.forEach(m => {
        if (!visited.has(getKey(m))) {
            results.push(m);
            visited.add(getKey(m));
        }
    });

    return results;
}

// Pomocnicza metoda wyciągnięta z triggerSpecial
getNeighborsForSpecial(tile) {
    const { x, y } = tile;
    const neighbors = [];
    
    const add = (nx, ny) => {
        if (nx >= 0 && ny >= 0 && nx < this.matrixsize && ny < this.matrixsize) {
            const t = this.game.board[ny][nx];
            if (t) neighbors.push(t);
        }
    };

    if (tile.type === TYPES.Dynamite) {
        add(x + 1, y); add(x - 1, y); add(x, y + 1); add(x, y - 1);
    } else if (tile.type === TYPES.Bomb) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                add(x + dx, y + dy);
            }
        }
    }
    return neighbors;
}
    dedupe(matches) {
        const seen = new Set();
        const uniqueMatches = matches.filter(tile => {
            const coords = `${tile.x},${tile.y}`;

            if (seen.has(coords)) {
                return false;
            }

            seen.add(coords);
            return true;
        });
        return uniqueMatches;
    }
    async processMatches(matches) {
    // 1. Definiujemy punkty zapalne (to co przyszło z dopasowań + to co już wybucha)
    let seeds = [...matches];
    if (this.game.activeExplosions.length > 0) {
        seeds.push(...this.game.activeExplosions);
    }

    // 2. JEDNO wywołanie, które zajmie się całą rekurencją i reakcjami łańcuchowymi
    // collectAllImpactedTiles sam wywoła getNeighborsForSpecial, więc nie potrzebujemy triggerSpecial!
    let finalMatches = this.collectAllImpactedTiles(seeds);
    
    this.game.stats.setDestroyedTiles(finalMatches);
    if (finalMatches.length === 0) {
        await this.game.finishMatches();
        return;
    }
    
    this.game.locked = true;
    
    // Nadpisujemy matches wynikiem z optymalnego zbierania
    matches = finalMatches;

    // 3. Sprawdzanie bonusów (mnożniki za 5-line / L-Shape)
    if (this.isFiveLine(matches) || this.isLShape(matches)) {
        this.game.mult += 1.5;
    }

    // 4. Emitowanie zdarzeń i dźwięków
    await this.game.emit(GAME_TRIGGERS.onMatch, matches);
    
    if (this.game.FALL_MS > MIN_FALL_MS) {
        this.game.FALL_MS -= 10;
    }

    // 5. Animacja Fading i obsługa detonacji
    requestAnimationFrame(() => {
        for (const m of matches) {
            const idx = m.y * this.matrixsize + m.x;
            const cell = this.game.gameContainer.children[idx];
            const tile = this.game.board[m.y][m.x];

            if (tile && (tile.type === TYPES.Bomb || tile.type === TYPES.Dynamite)) {
                tile.props.detonations -= 1;

                if (tile.props.detonations > 0) {
                    // Dodaj do aktywnych, jeśli ma jeszcze ładunki
                    if (!this.game.activeExplosions.includes(tile)) {
                        this.game.activeExplosions.push(tile);
                    }
                    continue; // Nie dodajemy klasy .fade, bo bomba zostaje
                } else {
                    // Usuń z aktywnych, jeśli wybuchła całkowicie
                    this.game.activeExplosions = this.game.activeExplosions.filter(e => e !== tile);
                }
            }
            if (cell) cell.classList.add("fade");
        }

        // 6. Fizyczne usuwanie z tablicy board po zakończeniu fade
        setTimeout(() => {
            let groups = {};
            let addmoney = 0;

            for (const m of matches) {
                const tile = this.game.board[m.y][m.x];
                if (!tile) continue;

                // Skip, jeśli to bomba która ma jeszcze detonacje
                let isStillActive = this.game.activeExplosions.some(e => e.x === m.x && e.y === m.y);
                if (isStillActive) continue;

                // Logika złota/srebra/punktów
                if (tile.props.modifier == MODIFIERS.Gold) addmoney++;
                if (tile.props.modifier == MODIFIERS.Silver) this.game.mult *= 1.5;

                let type = tile.icon;
                if (!groups[type]) groups[type] = { mult: 0, added: false };
                
                if (!groups[type].added && !tile.props.debuffed) {
                    groups[type].mult = tile.props.upgrade.mult;
                    groups[type].added = true;
                }

                if (!tile.props.debuffed) {
                    this.game.tempscore += Math.round(tile.props.upgrade.score);
                }

                // Usunięcie z tablicy
                this.game.board[m.y][m.x] = null;
            }

            // Aktualizacja multów z grup
            for (let type in groups) {
                this.game.mult += groups[type].mult;
            }
            this.game.mult = Math.round(this.game.mult * 100) / 100;

            if (addmoney > 0) {
                this.game.Audio.playSound('buy.mp3');
                this.game.money += addmoney;
                this.game.GameRenderer.updateMoney(addmoney);
            }

            this.game.Audio.playSound('score_sound.mp3', this.game.pitch);
            this.game.pitch += 0.2;
            this.game.GameRenderer.displayTempScore();
            
            this.game.animateCollapse();
        }, FADE_MS);
    });
}

    triggerSpecial(tile, options = {}, collected = new Set()) {
        if (!tile) return;
        console.log("triggerSpecial");
        console.log(tile);
        const x = tile.x;
        const y = tile.y;
        const key = `${x},${y}`;

        if (collected.has(key)) return;
        collected.add(key);

        const coords = [];
        const add = (cx, cy) => {
            if (cx < 0 || cy < 0 || cx >= this.matrixsize || cy >= this.matrixsize) return;
            const t = this.game.board[cy][cx];
            if (t) coords.push(t); // t zawiera już x i y
        };

        // 1. Zbieranie obszaru rażenia
        add(x, y);

        if (tile.type === TYPES.Dynamite) {
            add(x + 1, y); add(x - 1, y); add(x, y + 1); add(x, y - 1);
        } else if (tile.type === TYPES.Bomb) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue; // centrum już dodane
                    add(x + dx, y + dy);
                }
            }
        }

        if (options.includeSwapped && Number.isSafeInteger(options.swappedX) && Number.isSafeInteger(options.swappedY)) {
            add(options.swappedX, options.swappedY);
        }

        // 2. Rekurencyjne rozszerzanie o kolejne "specjały"
        for (const nearbyTile of coords) {
            const isSpecial = nearbyTile.type === TYPES.Bomb || nearbyTile.type === TYPES.Dynamite;
            const isNotSelf = nearbyTile.x !== x || nearbyTile.y !== y;

            if (isSpecial && isNotSelf) {
                this.triggerSpecial(nearbyTile, { _nested: true }, collected);
            } else {
                collected.add(`${nearbyTile.x},${nearbyTile.y}`);
            }
        }

        // 3. Finalizacja (tylko w głównym wywołaniu)
        if (!options._nested) {
            const allSeen = new Set();
            const finalMatches = [];

            // Dodaj naturalne dopasowania (jeśli istnieją)
            const boardMatches = this.findMatches() || [];

            // Scalanie wyników z obu źródeł
            const combinedResults = [...boardMatches];

            // Dodaj owoce z 'collected'
            for (const k of collected) {
                const [cx, cy] = k.split(",").map(Number);
                const t = this.game.board[cy][cx];
                if (t) combinedResults.push(t);
            }

            // Unifikacja końcowa
            for (const t of combinedResults) {
                const uniqueKey = `${t.x},${t.y}`;
                if (!allSeen.has(uniqueKey)) {
                    allSeen.add(uniqueKey);
                    finalMatches.push(t);
                }
            }

            return finalMatches;
        }
    }
    findMatches() {
        const board = this.game.board;
        const size = board.length;
        const matchedTiles = new Set();

        // Pomocnicza funkcja sprawdzająca dopasowania w linii
        const checkLine = (line) => {
            let count = 1;
            for (let i = 1; i <= line.length; i++) {
                const curr = line[i];
                const prev = line[i - 1];

                if (curr && prev &&
                    curr.type === TYPES.Fruit &&
                    prev.type === TYPES.Fruit &&
                    curr.icon === prev.icon) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let k = 1; k <= count; k++) {
                            matchedTiles.add(line[i - k]);
                        }
                    }
                    count = 1;
                }
            }
        };

        // Sprawdzanie poziomów (Horizontal)
        for (let y = 0; y < size; y++) {
            checkLine(board[y]);
        }

        // Sprawdzanie pionów (Vertical)
        for (let x = 0; x < size; x++) {
            const column = [];
            for (let y = 0; y < size; y++) {
                column.push(board[y][x]);
            }
            checkLine(column);
        }

        // Set automatycznie dba o unikalność referencji obiektów, 
        // więc nie potrzebujemy ręcznej deduplikacji po kluczu `${x},${y}`.
        return Array.from(matchedTiles);
    }
    isThreeLine(matches) {
        if (matches.length != 3) return false;
        // group by row and column
        let byRow = {};
        let byCol = {};

        for (let m of matches) {
            byRow[m.y] = (byRow[m.y] || 0) + 1;
            byCol[m.x] = (byCol[m.x] || 0) + 1;
        }

        // check if any row or column has >= 3
        return Object.values(byRow).some(c => c >= 3) ||
            Object.values(byCol).some(c => c >= 3);
    }
    isSixLine(matches) {
        if (matches.length < 6) return false;

        // group by row and column
        let byRow = {};
        let byCol = {};

        for (let m of matches) {
            byRow[m.y] = (byRow[m.y] || 0) + 1;
            byCol[m.x] = (byCol[m.x] || 0) + 1;
        }

        // check if any row or column has >= 6
        return Object.values(byRow).some(c => c >= 6) ||
            Object.values(byCol).some(c => c >= 6);
    }
    isFiveLine(matches) {
        if (matches.length < 5) return false;

        // group by row and column
        let byRow = {};
        let byCol = {};

        for (let m of matches) {
            byRow[m.y] = (byRow[m.y] || 0) + 1;
            byCol[m.x] = (byCol[m.x] || 0) + 1;
        }

        // check if any row or column has >= 5
        return Object.values(byRow).some(c => c >= 5) ||
            Object.values(byCol).some(c => c >= 5);
    }

    isLShape(matches) {
        if (matches.length < 5) return false;

        // group by rows and columns
        let byRow = {};
        let byCol = {};

        for (let m of matches) {
            if (!byRow[m.y]) byRow[m.y] = [];
            byRow[m.y].push(m.x);

            if (!byCol[m.x]) byCol[m.x] = [];
            byCol[m.x].push(m.y);
        }

        // an L shape means:
        // - at least 3 in one row
        // - at least 2 in a column that shares one of those x’s
        for (let row in byRow) {
            if (byRow[row].length >= 3) {
                for (let x of byRow[row]) {
                    if (byCol[x] && byCol[x].length >= 2) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}