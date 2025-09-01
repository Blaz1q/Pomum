import { upgradesList,Upgrade } from "./upgrade.js";
import { GAME_TRIGGERS,TYPES,MODIFIERS,STAGES } from "./dictionary.js";
const CELL_PX = 50;
const FADE_MS = 300;
const FALL_MS = 350;
console.log(upgradesList);

export class Tile {
    constructor(icon, type = TYPES.Fruit, props = {}) {
        this.icon = icon;
        this.type = type; // "fruit", "dynamite", "bomb"
        this.props = {
            detonations: props.detonations ?? 0, // default 0 unless provided
            percent: props.percent ?? 1,
            modifier: props.modifier ?? MODIFIERS.None,
            ...props
        };
    }
    get percent(){
        return this.props.percent;
    }
    get detonations(){
        if(this.type==TYPES.Bomb||this.type==TYPES.Dynamite){
            return this.props.detonations;
        }
        return 0;
    }
    set percent(percent){
        if(this.type==TYPES.Fruit||this.type==TYPES.Dynamite){
            this.props.percent = percent;
        }
    }
    set detonations(detonations){
        if(this.type==TYPES.Dynamite||this.type==TYPES.Bomb){
            this.props.detonations = detonations;
        }
    }
}
export class Fruit {
    constructor(icon, percent=1, type="fruit",props = {}) {
        this.icon = icon;
        this.percent = percent;
        this.type;
        this.props;
    }
}
export class Game{
    constructor(){
        //gold
        this.money = 2;
        this.moneyBox = document.getElementById("money")
        this.goldChance = 0;
        //moves
        this.moves = 10;
        this.movescounter=0;
        this.moveBox = document.getElementById("moves");
        //game
        this.round = 0;
        this.roundBox = document.getElementById("round");
        this.matrixsize = 9;
        this.stage = STAGES.Game;
        this.gameContainer = document.getElementById("body");
        this.shopContainer = document.getElementById("shop");
        this.pitch = 1;
        this.mult = 1;
        this.silverChance = 0;
        this.tempscore = 0;
        this.score = 0;
        this.scoreBox = document.getElementById("score");
        this.tempscoreBox = document.getElementById("tempscore");
        this.multBox = document.getElementById("mult");
        
        this.fruits = [
            new Tile("🍎", TYPES.Fruit),
            new Tile("🍐", TYPES.Fruit),
            new Tile("🍍", TYPES.Fruit),
            new Tile("🍇", TYPES.Fruit),
            new Tile("🥥", TYPES.Fruit),
        ];
        this.special = [
            new Tile("🧨", TYPES.Dynamite, { detonations: 1, percent: 1 }),
            new Tile("💣", TYPES.Bomb, { detonations: 1 }),
            
        ];
        this.equalizeChances();
        this.triggers = {
            [GAME_TRIGGERS.onMatch]: [],        // kiedy znajdzie się match
            [GAME_TRIGGERS.onRoundStart]: [],
            [GAME_TRIGGERS.onRoundEnd]: [],     // na koniec rundy
            [GAME_TRIGGERS.onMove]: [],          //ruch    
            [GAME_TRIGGERS.onSpawn]: []
        };
        this.board = [];
        this.selected = null; // zapamiętany pierwszy klik
        this.locked = false;
        //upgrades
        this.upgrades = [];
    }
    on(event, handler) { this.triggers[event].push(handler); }
    emit(event, payload) { this.triggers[event].forEach(h => h(payload)); }
    rollUpgrades(count = 3){
        const available = upgradesList.filter(up => !this.upgrades.includes(up));
        const shuffled = available.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    displayMoves(){
        this.moveBox.innerHTML = this.movescounter + "/" + this.moves;
    }
displayUpgrades(upgrades, params = { canbuy: true, cansell: false }) {
    let full = document.createDocumentFragment();

    upgrades.forEach(up => {
        // Wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "upgrade-wrapper";
        if (params.cansell) {
            wrapper.classList.add("bought");
        }

        // Price above card
        const priceEl = document.createElement("div");
        priceEl.className = "upgrade-price";
        priceEl.textContent = `${params.cansell ? Math.floor(up.price / 2) : up.price}$`;

        // Card inner
        const cardInner = document.createElement("div");
        cardInner.className = "upgrade-inner";
        cardInner.style.backgroundImage = `url('${up.image}')`;
        

        // Card
        const card = document.createElement("div");
        card.className = "upgrade-card";
        card.style.animationDelay = `-${Math.random() * 3}s`;
        card.appendChild(cardInner);
        
        // Description
        const desc = document.createElement("div");
        desc.className = "upgrade-desc";
        desc.innerHTML = `<h1>${up.name}</h1><p>${up.description(this)}</p>`;

        // Aktualizacja opisu przy hover
        wrapper.addEventListener("mouseenter", () => {
            // jeśli opis się zmienia dynamicznie w zależności od stanu gry
            desc.innerHTML = `<h1>${up.name}</h1><p>${up.description(this)}</p>`;
        });

        // Click handlers
        if (params.canbuy) {
            card.addEventListener("click", () => {
                if (this.upgrades.length < 4 && this.money >= up.price) {
                    this.buy(up);
                    wrapper.remove();
                }
            });
        }

        if (params.cansell) {
            card.addEventListener("click", () => {
                if(this.sell(up)) wrapper.remove();
            });
        }

        // Append
        wrapper.appendChild(priceEl);
        wrapper.appendChild(card);
        wrapper.appendChild(desc);
        full.appendChild(wrapper);
    });

    return full;
}
    displayPlayerUpgrades(){
        const playerUpgrades = document.getElementById("player-upgrades-container");
        playerUpgrades.innerHTML = "";
        playerUpgrades.appendChild(this.displayUpgrades(this.upgrades,{canbuy:false,cansell:true}));
    }
    displayUpgradesInShop() {
        const shopEl = document.getElementById("upgrades-container");
        shopEl.innerHTML = ""; 
        shopEl.appendChild(this.displayUpgrades(this.rollUpgrades(),{canbuy:true,cansell:false}));
    }
    rerollUpgrades(){
        if(this.money<4) return;
        this.money-=4;
        this.displayUpgradesInShop();
        this.displayMoney();
    }
    displayMoney(){
        this.moneyBox.innerHTML = this.money;
    }
    displayRound(){
        this.roundBox.innerHTML = this.round;
    }
    gameover(){
        document.getElementById("game-over").style.display = "flex";
    }
    endround(){
        this.movescounter=0;
        this.displayMoves();
        this.stage = STAGES.Shop;
        this.emit(GAME_TRIGGERS.onRoundEnd);
        this.locked = true;
        this.money+=this.calcMoney();
        this.money+=2;
        this.displayMoney();
        this.displayUpgradesInShop();
        this.gameContainer.style.display = "none";
        this.shopContainer.style.display = "block";
    }
    startround(){
        this.stage = STAGES.Game;
        this.emit(GAME_TRIGGERS.onRoundStart);
        this.round++;
        this.score=0;
        this.locked = false;
        this.displayRound();
        this.displayMoney();
        this.displayMoves();
        this.fill();
        this.gameContainer.style.display = "grid";
        this.shopContainer.style.display = "none";
    }
    displayScore(){
        this.scoreBox.innerHTML=`${this.score}/${this.calcRoundScore()}`;
    }
    displayTempScore(){
        this.tempscoreBox.innerHTML = this.tempscore;
        this.multBox.innerHTML = this.mult;
    }
    calcMoney(){
        return (this.moves-this.movescounter);
    }
    calcRoundScore(){
        return Math.floor(this.round*1.1*500);
    }
    createElement(icon, x, y) {
        let element = document.createElement("div");
        element.textContent = icon;
        element.dataset.x = x;
        element.dataset.y = y;

        // kliknięcie
        element.addEventListener("click", () => this.handleClick(x, y, element));

        // przeciąganie
        element.draggable = true;
        element.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ x, y }));

        // Pusty obrazek zamiast kafla
        const img = new Image();
        img.src =
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
        e.dataTransfer.setDragImage(img, 0, 0);
    });

    element.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move"; // jawnie ustaw efekt
    });

    element.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation(); // <- WAŻNE
        let from = JSON.parse(e.dataTransfer.getData("text/plain"));
        this.handleDragDrop(from, { x, y });
    });
        return element;
    }
handleClick(x, y, element) {
    if (!this.selected) {
        this.selected = {x, y, element};
        element.classList.add("selected");
    } else {
        let {x: x1, y: y1, element: el1} = this.selected;
        el1.classList.remove("selected");
        this.selected = null;
        this.trySwap(x1, y1, x, y);
    }
}

handleDragDrop(from, to) {
    this.trySwap(from.x, from.y, to.x, to.y);
}
trySwap(x1, y1, x2, y2) {
    if (this.locked) return false;
    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) !== 1) return false;

    const idx1 = y1 * this.matrixsize + x1;
    const idx2 = y2 * this.matrixsize + x2;
    const el1 = this.gameContainer.children[idx1];
    const el2 = this.gameContainer.children[idx2];
    if (!el1 || !el2) return false;

    const contRect = this.gameContainer.getBoundingClientRect();
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const start1 = { x: r1.left - contRect.left, y: r1.top - contRect.top, w: r1.width, h: r1.height };
    const start2 = { x: r2.left - contRect.left, y: r2.top - contRect.top, w: r2.width, h: r2.height };
    const preIcon1 = el1.textContent;
    const preIcon2 = el2.textContent;

    const { success, matches, special } = this.swap(x1, y1, x2, y2);

    if (!success) {
        this.animateSwap(x1, y1, x2, y2, false, null, { start1, start2, preIcon1, preIcon2 });
        return false;
    }

    this.movescounter++;
    this.emit(GAME_TRIGGERS.onMove);
    this.displayMoves();

    // animate swap first
    this.animateSwap(x1, y1, x2, y2, true, () => {
        // trigger special if exists
        if (special) {
            this.triggerSpecial(special.x, special.y, special.tile, { includeSwapped: true, swappedX: special.swappedX, swappedY: special.swappedY });
        } else if (matches.length > 0) {
            this.processMatches(matches);
        }
    }, { start1, start2, preIcon1, preIcon2 });

    return true;
}

    equalizeChances(){
        const eq = parseFloat(100 / this.fruits.length);
        for (const f of this.fruits) f.percent = eq;
    }
    calcEqualize(percent){
        return (parseFloat)(percent/(this.fruits.length-1));
    }
    equalizeChancesExcept(fruit){
        const chance = this.calcEqualize(fruit.percent);
        for(const f of this.fruits){
            if(fruit == f) continue;
            f.percent +=chance;
        }
    }
    addChancesExcept(fruit,chance){
        for(const f of this.fruits){
            if(fruit == f) continue;
            f.percent +=chance;
        }
    }
    buy(upgrade){
        if(this.stage!==STAGES.Shop) return; // not in shop -> can't buy
        if(this.money<upgrade.price) return; // not enough money
        this.upgrades.push(upgrade);
        upgrade.apply(this);
        this.money -= upgrade.price;
        this.moneyBox.innerHTML = this.money;
        this.displayPlayerUpgrades();
    }
    sell(upgrade){
        if(this.stage!==STAGES.Shop) return false; // not in shop -> can't sell
        const index = this.upgrades.indexOf(upgrade) ?? -1;
        if(index==-1) return;
        this.upgrades[index].sell(this);
        this.upgrades.splice(index,1);
        return true;
    }

    randomTile() {
    if (Math.random()*100 < this.special[0].percent) {
        return new Tile("🧨", TYPES.Dynamite, { detonations: 1 });
    }
    return this.randomFruit();
    }
    // FIXED: return correct Tile object
    makeBomb() {
    return new Tile("💣", TYPES.Bomb, { detonations: 1 });
    }
    randomFruit() {
    let modifier = MODIFIERS.None;
    let isGold = Math.random()*100 < this.goldChance;
    let isSilver = Math.random()*100 < this.silverChance;
    if(isSilver){
        modifier = MODIFIERS.Silver;
    }
    if(isGold){
        modifier = MODIFIERS.Gold;
    }
    const props = {modifier: modifier};
    const weights = this.fruits.map(f => Math.max(0, f.percent));
    let total = weights.reduce((a,b)=>a+b, 0);
    
    if (total <= 0) {
        total = this.fruits.length;
        const r = Math.floor(Math.random() * total);
        return new Tile(this.fruits[r].icon, TYPES.Fruit, props);
    }

    let r = Math.random() * total;
    for (let i=0;i<this.fruits.length;i++){
        r -= weights[i];
        if (r < 0) return new Tile(this.fruits[i].icon, TYPES.Fruit, props);
    }
    return new Tile(this.fruits[0].icon, TYPES.Fruit, props); 
}
    updateCell(x, y){
    const idx = y * this.matrixsize + x;
    const cell = this.gameContainer.children[idx];
    const tile = this.board[y][x];
    if(cell) cell.textContent = tile ? tile.icon : " "; // fallback for null
}
triggerSpecial(x, y, tile, options = {}, collected = new Set()) {
    if (!tile) return;

    const key = `${x},${y}`;
    if (collected.has(key)) return; // avoid loops
    collected.add(key);

    //console.log("Special!", tile.type, x, y);

    // collect affected coords
    const coords = [];
    const add = (cx, cy) => {
        if (cx < 0 || cy < 0 || cx >= this.matrixsize || cy >= this.matrixsize) return;
        const t = this.board[cy][cx];
        if (t) coords.push({ x: cx, y: cy, fruit: t });
    };

    // always include center
    add(x, y);

    if (tile.type === TYPES.Dynamite) {
        add(x + 1, y); add(x - 1, y); add(x, y + 1); add(x, y - 1);
    } else if (tile.type === TYPES.Bomb) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                add(x + dx, y + dy);
            }
        }
    }

    if (options.includeSwapped && Number.isSafeInteger(options.swappedX) && Number.isSafeInteger(options.swappedY)) {
        add(options.swappedX, options.swappedY);
    }

    // dedupe local
    const seen = new Set();
    const toDestroy = [];
    for (const c of coords) {
        const k = `${c.x},${c.y}`;
        if (!seen.has(k)) {
            seen.add(k);
            toDestroy.push(c);
        }
    }

    // recursively expand specials
    for (const c of toDestroy) {
        if ((c.fruit.type === TYPES.Bomb || c.fruit.type === TYPES.Dynamite) && (c.x !== x || c.y !== y)) {
            this.triggerSpecial(c.x, c.y, c.fruit, { _nested: true }, collected);
        } else {
            collected.add(`${c.x},${c.y}`);
        }
    }

    // only root call will process
    if (!options._nested) {
        // build final deduped array
        const allSeen = new Set();
        const all = [];

        for (const k of collected) {
            const [cx, cy] = k.split(",").map(Number);
            const fruit = this.board[cy][cx];
            if (!fruit) continue;

            const uniqueKey = `${cx},${cy}`;
            if (!allSeen.has(uniqueKey)) {
                allSeen.add(uniqueKey);
                all.push({ x: cx, y: cy, fruit });
            }
        }
        this.processMatches(all);
    }
}
    fill(){
        this.board = Array.from({ length: this.matrixsize }, () => Array(this.matrixsize).fill(null));
        this.boardarray = [];
        for(let y=0;y<this.matrixsize;y++){
            for(let x=0;x<this.matrixsize;x++){
                let fruit;
                do {
                    fruit = this.randomTile();
                } while (
                    (x >= 2 && this.board[y][x-1] && this.board[y][x-2] && this.board[y][x-1].icon === fruit.icon && this.board[y][x-2].icon === fruit.icon) ||
                    (y >= 2 && this.board[y-1][x] && this.board[y-2][x] && this.board[y-1][x].icon === fruit.icon && this.board[y-2][x].icon === fruit.icon)
                );
                this.board[y][x] = fruit;
                this.boardarray.push(this.board[y][x]);
            }
        }
        this.emit(GAME_TRIGGERS.onSpawn,this.boardarray);
        this.render();
    }

    // render(full = true) -> if full === false do an in-place update:
    render() {
        //console.log("render");
        this.gameContainer.innerHTML = "";
        for (let y = 0; y < this.matrixsize; y++) {
            for (let x = 0; x < this.matrixsize; x++) {
                const tile = this.board[y][x];
                const icon = tile ? tile.icon : " ";
                const isGold = this.board[y][x].props.modifier==MODIFIERS.Gold;
                const isSilver = this.board[y][x].props.modifier==MODIFIERS.Silver;
                const el = this.createElement(icon, x, y);
                el.style.transform = "translate(0,0)";
                el.style.transition = "";
                if(isGold){
                    el.classList.add("gold");
                }
                if(isSilver){
                    el.classList.add("silver");
                }
                el.classList.remove("fade");
                this.gameContainer.appendChild(el);
            }
        }
        this.displayScore();
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

    findMatches(board){
    const size = board.length;
    let matches = [];

    // horizontal
    for(let y=0;y<size;y++){
        let count = 1;
        for(let x=1;x<size;x++){
            const curr = board[y][x];
            const prev = board[y][x-1];
            if(curr && prev && curr.type === TYPES.Fruit && prev.type === TYPES.Fruit && curr.icon === prev.icon){
                count++;
            } else {
                if(count >= 3){
                    for(let k=0;k<count;k++){
                        matches.push({x:x-1-k, y, fruit: board[y][x-1-k]});
                    }
                }
                count = 1;
            }
        }
        if(count >= 3){
            for(let k=0;k<count;k++){
                matches.push({x:size-1-k, y, fruit: board[y][size-1-k]});
            }
        }
    }

    // vertical
    for(let x=0;x<size;x++){
        let count = 1;
        for(let y=1;y<size;y++){
            const curr = board[y][x];
            const prev = board[y-1][x];
            if(curr && prev && curr.type === TYPES.Fruit && prev.type === TYPES.Fruit && curr.icon === prev.icon){
                count++;
            } else {
                if(count >= 3){
                    for(let k=0;k<count;k++){
                        matches.push({x, y:y-1-k, fruit: board[y-1-k][x]});
                    }
                }
                count = 1;
            }
        }
        if(count >= 3){
            for(let k=0;k<count;k++){
                matches.push({x, y:size-1-k, fruit: board[size-1-k][x]});
            }
        }
    }

    // Dedupe matches by x,y (horizontal + vertical overlap)
    const map = {};
    for (const m of matches) {
        const k = `${m.x},${m.y}`;
        if (!map[k]) map[k] = m;
    }
    return Object.values(map);
}


swap(x1, y1, x2, y2) {
    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) !== 1) {
        return { success: false, matches: [], special: null };
    }

    // swap tiles
    [this.board[y1][x1], this.board[y2][x2]] = [this.board[y2][x2], this.board[y1][x1]];

    const t1 = this.board[y1][x1];
    const t2 = this.board[y2][x2];

    // check for specials first
    if (t1 && (t1.type === TYPES.Bomb || t1.type === TYPES.Dynamite)) {
        return { success: true, matches: [], special: { x: x1, y: y1, tile: t1, swappedX: x2, swappedY: y2 } };
    }
    if (t2 && (t2.type === TYPES.Bomb || t2.type === TYPES.Dynamite)) {
        return { success: true, matches: [], special: { x: x2, y: y2, tile: t2, swappedX: x1, swappedY: y1 } };
    }

    // normal match check
    const matches = this.findMatches(this.board);
    if (matches.length === 0) {
        // revert swap
        [this.board[y1][x1], this.board[y2][x2]] = [this.board[y2][x2], this.board[y1][x1]];
        return { success: false, matches: [], special: null };
    }

    return { success: true, matches, special: null };
}
animateSwap(x1, y1, x2, y2, success, callback, opts = {}) {
    const idx1 = y1 * this.matrixsize + x1;
    const idx2 = y2 * this.matrixsize + x2;
    const el1 = this.gameContainer.children[idx1];
    const el2 = this.gameContainer.children[idx2];
    if (!el1 || !el2) return;

    const contRect = this.gameContainer.getBoundingClientRect();

    // jeżeli caller dostarczył snapshot pozycji/ikon -> użyj, w przeciwnym razie policz teraz
    let { start1, start2, preIcon1, preIcon2 } = opts;
    if (!start1 || !start2) {
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        start1 = { x: r1.left - contRect.left, y: r1.top - contRect.top, w: r1.width, h: r1.height };
        start2 = { x: r2.left - contRect.left, y: r2.top - contRect.top, w: r2.width, h: r2.height };
    }
    preIcon1 = (preIcon1 !== undefined) ? preIcon1 : el1.textContent;
    preIcon2 = (preIcon2 !== undefined) ? preIcon2 : el2.textContent;

    const g1 = this.createGhost(preIcon1, start1.x, start1.y, start1.w, start1.h);
    const g2 = this.createGhost(preIcon2, start2.x, start2.y, start2.w, start2.h);

    el1.style.visibility = "hidden";
    el2.style.visibility = "hidden";
    this.gameContainer.appendChild(g1);
    this.gameContainer.appendChild(g2);

    const dx = start2.x - start1.x;
    const dy = start2.y - start1.y;

    // wymuś layout, potem ustaw transform w RAF -> miękka animacja
    requestAnimationFrame(() => {
        g1.style.transform = `translate(${dx}px, ${dy}px)`;
        g2.style.transform = `translate(${-dx}px, ${-dy}px)`;
    });

    const finish = () => {
        g1.remove();
        g2.remove();
        el1.style.visibility = "";
        el2.style.visibility = "";

        if (success) this.render();

        if (callback) callback();
    };

    setTimeout(() => {
        if (success) {
            finish();
        } else {
            // odbicie z powrotem
            g1.style.transform = `translate(0,0)`;
            g2.style.transform = `translate(0,0)`;
            setTimeout(finish, 160);
        }
    }, 160);
}
    animateSpawns(spawnCounts){
    const size = this.board.length;

    // first set spawn elements above board without transition
    for(let x=0;x<size;x++){
        const spawn = spawnCounts[x];
        if(spawn === 0) continue;

        for(let y=0; y<spawn; y++){
            const idx = y * this.matrixsize + x;
            const cell = this.gameContainer.children[idx];
            if(!cell) continue;
            // position the cell visually above the board
            cell.style.transition = "";
            cell.style.transform = `translateY(-${spawn * CELL_PX}px)`;
        }
    }

    // on next frame set transitions and drop to zero
    requestAnimationFrame(()=>{
            for(let x=0;x<size;x++){
                const spawn = spawnCounts[x];
                if(spawn === 0) continue;

                for(let y=0; y<spawn; y++){
                    const idx = y * this.matrixsize + x;
                    const cell = this.gameContainer.children[idx];
                    if(!cell) continue;
                    cell.style.transition = `transform ${FALL_MS}ms ease`;
                    cell.style.transform = "translateY(0)";
                }
            }
        });
    }
   collapseBoard(spawnCounts){
        const size = this.board.length;
        for(let x=0;x<size;x++){
            let writeY = size - 1;

            // ściągnij istniejące w dół
            for(let y=size-1;y>=0;y--){
                if(this.board[y][x] !== null){
                    this.board[writeY][x] = this.board[y][x];
                    writeY--;
                }
            }
            // uzupełnij górę nowymi (dokładnie spawnCounts[x] sztuk)
            let spawnArray = [];
            for(let y=writeY; y>=0; y--){
                this.board[y][x] = this.randomTile();
                spawnArray.push(this.board[y][x]);
            }
            if(spawnArray.length>0) this.emit(GAME_TRIGGERS.onSpawn,spawnArray);
        }
    }
    animateCollapse() {
    const size = this.board.length;
    const drops = [];
    const spawnCounts = Array(size).fill(0);

    // compute drops and spawns based on current nulls
    for (let x = 0; x < size; x++) {
        let shift = 0;
        for (let y = size - 1; y >= 0; y--) {
            if (this.board[y][x] === null) {
                shift++;
            } else if (shift > 0) {
                drops.push({ x, y, shift });
            }
        }
        spawnCounts[x] = shift;
    }

    // animate existing cells down
    for (const d of drops) {
        const idx = d.y * this.matrixsize + d.x;
        const cell = this.gameContainer.children[idx];
        if (cell) {
            cell.style.transition = `transform ${FALL_MS}ms ease`;
            cell.style.transform = `translateY(${d.shift * CELL_PX}px)`;
        }
    }

    // after fall ends: update board, fully render, then animate spawns from above
    setTimeout(() => {
        
        this.collapseBoard(spawnCounts); // rewrite board data
        this.render(); 
                          // full render to reset transforms

        // animate spawns (top 'spawnCounts[x]' cells)
        this.animateSpawns(spawnCounts);

        // after spawns land, continue cascade
        setTimeout(() => this.processMatches(this.findMatches(this.board)), FALL_MS);
    }, FALL_MS);
}
    createGhost(icon, xPx, yPx, w, h) {
        const g = document.createElement("div");
        g.textContent = icon;
        g.style.position = "absolute";
        g.style.left = xPx + "px";
        g.style.top = yPx + "px";
        g.style.width = w + "px";
        g.style.height = h + "px";
        g.style.display = "flex";
        g.style.alignItems = "center";
        g.style.justifyContent = "center";
        g.style.userSelect = "none";
        g.style.pointerEvents = "none";
        g.style.transition = "transform 150ms ease";
        g.style.zIndex = "100";
        return g;
    }
    processMatches(matches){
        if(matches.length === 0){
            this.locked = false; // koniec kaskady
            this.score += this.tempscore * this.mult;
            this.tempscore = 0;
            this.mult = 1;
            this.pitch=1;
            this.displayScore();
            this.displayTempScore();
            if(this.score>=this.calcRoundScore()){
                this.endround();
                return;
            }
            else if(this.movescounter>=this.moves&&this.score<this.calcRoundScore()){
                this.locked = true;
                this.gameover();
                return;
            }
            return;
        }
        this.locked = true;
        if (this.isFiveLine(matches) || this.isLShape(matches)) {
            // pick center tile by bounding box for stability
            let xs = matches.map(m=>m.x);
            let ys = matches.map(m=>m.y);
            let minX = Math.min(...xs), maxX = Math.max(...xs);
            let minY = Math.min(...ys), maxY = Math.max(...ys);
            let cx = Math.round((minX + maxX)/2);
            let cy = Math.round((minY + maxY)/2);
            // ensure valid coordinates
            cx = Math.max(0, Math.min(this.matrixsize-1, cx));
            cy = Math.max(0, Math.min(this.matrixsize-1, cy));
            //this.board[cy][cx] = this.makeBomb();
        }
        this.emit("match", matches);
        // pozwól przeglądarce „zobaczyć” stan po swapie zanim nałożymy .fade
        requestAnimationFrame(() => {
            for(const m of matches){
                const idx = m.y * this.matrixsize + m.x;
                const cell = this.gameContainer.children[idx];
                if(cell) cell.classList.add("fade");
            }

            setTimeout(()=>{
                // fizycznie usuń z board
                for(const m of matches){
                    let gold = this.board[m.y][m.x].props.modifier==MODIFIERS.Gold;
                    let silver = this.board[m.y][m.x].props.modifier==MODIFIERS.Silver;
                    if(gold){
                        this.money++;
                        this.displayMoney();
                    }
                    if(silver){
                        this.mult = this.mult * 1.5;
                    }
                    this.board[m.y][m.x] = null;
                }
                this.tempscore += matches.length * 10;
                playSound('score_sound.mp3',this.pitch);
                this.pitch+=0.2;
                this.displayTempScore();
                // animacja spadania istniejących owoców
                this.animateCollapse();
            }, FADE_MS);
        });
    }
}

let game = new Game();

game.startround();
function startRound(){
    game.startround();
}
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundBufferCache = {};

async function loadSound(url) {
  if (soundBufferCache[url]) return soundBufferCache[url];

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  soundBufferCache[url] = audioBuffer;
  return audioBuffer;
}

/**
 * Play a sound with adjustable pitch
 * @param {string} url - Path to audio file
 * @param {number} pitch - Playback rate (1 = normal, 2 = one octave up, 0.5 = one octave down)
 */
async function playSound(url, pitch = 1) {
  const buffer = await loadSound(url);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = pitch; // changes pitch
  source.connect(audioContext.destination);
  source.start();
}
function restartGame() {
  game = new Game();
  game.displayPlayerUpgrades();
  startRound();
  document.getElementById("game-over").style.display = "none";
}
function reroll(){
    game.rerollUpgrades();
}
//window.game = game;
window.startRound = startRound; 
window.upgradesList = upgradesList;
window.reroll = reroll;
window.restartGame = restartGame
