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
        if(this.game.activeExplosions.length>0){
            console.log(this.game.activeExplosions);
            this.game.activeExplosions.forEach(tile=>{
                matches.push(...this.triggerSpecial(tile));
            });
        }
        let unique = this.specialMatches(matches);
        unique.forEach(tile => {
            matches.push(...this.triggerSpecial(tile));
        });
        if (matches.length === 0) {
            await this.game.finishMatches();
            return;
        }
        this.game.locked = true;

        console.log("waiting for matches..")

        //console.log(this.isSixLine(matches));
        //dedupe matches.

        matches = this.dedupe(matches); //przez to że deduplikacja jest tutaj, możliwe będzie kopiowanie niektórych upgrade'ów (np. SAPER).
        if (this.isFiveLine(matches) || this.isLShape(matches)) {
            this.game.mult += 1.5;
        }
        console.log(matches);
        await this.game.emit(GAME_TRIGGERS.onMatch, matches);
        if (this.game.FALL_MS > MIN_FALL_MS) {
            this.game.FALL_MS -= 10;
        }
        console.log("ended.");
        // pozwól przeglądarce „zobaczyć” stan po swapie zanim nałożymy .fade
        requestAnimationFrame(() => {
            for (const m of matches) {
                const idx = m.y * this.matrixsize + m.x;
                const cell = this.game.gameContainer.children[idx];
                const tile = this.game.board[m.y][m.x];
                if (tile && (tile.type === TYPES.Bomb || tile.type === TYPES.Dynamite)) {
                    // decrement detonations
                    tile.props.detonations -= 1;

                    if (tile.props.detonations > 0) {
                        // still has detonations → keep in activeExplosions
                        this.game.activeExplosions.push(tile);
                        continue; // skip fading / removal
                    }
                    // detonations now 0 → remove from activeExplosions if exists
                    this.game.activeExplosions = this.game.activeExplosions.filter(e => !(e.x === m.x && e.y === m.y));
                }
                if (cell) cell.classList.add("fade");
            }
            setTimeout(() => {
                // fizycznie usuń z board
                let groups = {};
                let addmoney = 0;
                for (const m of matches) {
                    const tile = this.game.board[m.y][m.x];
                    let skip = false;
                    this.game.activeExplosions.forEach(detonation => {
                        if (m.x == detonation.x && m.y == detonation.y) skip = true;
                    });
                    if (skip) continue;
                    let gold = tile.props.modifier == MODIFIERS.Gold;
                    let silver = tile.props.modifier == MODIFIERS.Silver;
                    let type = tile.icon;
                    if (gold) {
                        addmoney++;
                    }
                    if (silver) {
                        this.game.mult = this.game.mult * 1.5;
                    }
                    if (!groups[type]) {
                        groups[type] = {
                            mult: 0,
                            multAdded: false
                        };
                    }
                    if (!groups[type].multAdded && !tile.props.debuffed) {
                        groups[type].mult = tile.props.upgrade.mult;
                        groups[type].multAdded = true;
                    }
                    if (!tile.props.debuffed) this.game.tempscore += Math.round(tile.props.upgrade.score);
                    this.game.board[m.y][m.x] = null;
                }
                if (addmoney > 0) {
                    this.game.Audio.playSound('buy.mp3');
                    this.game.GameRenderer.updateMoney(addmoney);
                    this.game.money += addmoney;
                }
                for (let type in groups) {
                    let group = groups[type];
                    this.game.mult += group.mult;
                    this.game.mult = Math.round(this.game.mult * 100) / 100;
                }
                this.game.Audio.playSound('score_sound.mp3', this.game.pitch);
                this.game.pitch += 0.2;
                this.game.GameRenderer.displayTempScore();
                // animacja spadania istniejących owoców
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