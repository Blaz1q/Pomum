import { consumableList } from "./consumable.js";
import { Upgrade,ConsumablePack,Consumable } from "./upgradeBase.js";
import { upgradesList } from "./upgrade.js";
import { Audio } from "./sound.js";
import { Tile } from "./Tile.js";
import { GAME_TRIGGERS,TYPES,MODIFIERS,STAGES,UPGRADE_STATES, SCORE_ACTIONS, UPGRADE_RARITY } from "./dictionary.js";
import { RenderUI } from "./RenderUI.js";
import { Animator,animate } from "./loadshaders.js";
import { cyrb128, getRandomString, sfc32 } from "./random.js";
import { Roll } from "./roll.js";
const CELL_PX = 50;
const FADE_MS = 300;
const FALL_MS = 350;
const ANIMATION_DURATION = 8*60;
export class Game{
    constructor(){
        //gold
        this.money = 2;
        this.goldChance = 0;
        //moves
        this.moves = 10;
        this.movescounter=0;
        this.moveBox = document.getElementById("moves");
        //game
        this.round = 0;
        this.level = 1;
        this.Audio = Audio;
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
        this.GameRenderer = new RenderUI(this);
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
            new Tile("💣", TYPES.Bomb, { detonations: 1,percent: 0 }),
        ];
        this.activeExplosions = [];
        this.equalizeChances();
        this.triggers = {
            [GAME_TRIGGERS.onMatch]: [],        // kiedy znajdzie się match
            [GAME_TRIGGERS.onRoundStart]: [],
            [GAME_TRIGGERS.onRoundEnd]: [],     // na koniec rundy
            [GAME_TRIGGERS.onMove]: [],          //ruch    
            [GAME_TRIGGERS.onSpawn]: [],
            [GAME_TRIGGERS.onUpgradeTriggered]: [],
            [GAME_TRIGGERS.onScore]: [],
        };
        this.board = [];
        this.selected = null; // zapamiętany pierwszy klik
        this.locked = false;
        //upgrades
        this.maxUpgrades = 4;
        this.maxConsumables = 2;
        //storage
        this.upgrades = [];
        this.consumables = [];
        this.coupons = [];
        this.bosses = [];
        this.nextBoss = null;
        this.BuysFromBoosterLeft = 0;
        this.overstock = false;
        this.upgradeDedupe = true;
        this.bonusPercentage = {
            negative: 0,
            modifier: 0,
        }
        //random
        this.roll = new Roll(this);
        this.seed = getRandomString(6);
        this.hash = cyrb128(this.seed);
        this.rand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.shopRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.bossRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.voucherRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.boosterRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
    }
    setSeed(seed){
        this.seed = seed;
        this.hash = cyrb128(this.seed);
        this.rand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.shopRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.bossRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.voucherRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
        this.boosterRand = sfc32(this.hash[0],this.hash[1],this.hash[2],this.hash[3]);
    }
    on(event, handler, upgrade) {
    this.triggers[event].push({ handler, upgrade });
    }
async emit(event, payload) {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let visualChain = Promise.resolve();

    console.log(event);

    for (const upgrade of this.upgrades) {
        if (!upgrade || typeof upgrade !== "object") continue;

        const handlerName = `on${event[0].toUpperCase()}${event.slice(1)}`;

        // Find handler (either direct function or in props)
        const mainHandler = typeof upgrade[handlerName] === "function"
            ? upgrade[handlerName]
            : upgrade.props?.[handlerName];

        // Optional special handler for score
        const specialHandler = (event === "score" && typeof upgrade.specialFunc === "function")
            ? upgrade.specialFunc
            : null;

        // Run all handlers in order
        const handlers = [mainHandler, specialHandler].filter(Boolean);

        for (const handler of handlers) {
            const result = handler.call(upgrade, payload);

            // Normalize return value
            let state = null;
            let message = null;
            let style = SCORE_ACTIONS.Mult;
            if (typeof result === "object" && result !== null) {
                state = result.state ?? result.UPGRADE_STATES ?? null;
                message = result.message ?? null;
                style = result.style ?? SCORE_ACTIONS.Mult;
            } else {
                state = result;
            }

            // --- Handle result ---
            if (state === UPGRADE_STATES.Active||state === UPGRADE_STATES.Ready||state === UPGRADE_STATES.Tried) {
                visualChain = visualChain.then(() => {
                    this.GameRenderer.upgradeTrigger(upgrade, 0,state);
                    this.Audio.playSound("tick.mp3");
                    if (message) {
                        const upgradeSlot = this.GameRenderer.getPlayerUpgrades(this.upgrades.indexOf(upgrade));
                        this.GameRenderer.createPopup(message, upgradeSlot, style);
                    }
                    return wait(350);
                });
            }
            else if (state === UPGRADE_STATES.Score) {
                visualChain = visualChain.then(() => {
                    this.GameRenderer.upgradeTrigger(upgrade, 0);
                    this.Audio.playSound("tick.mp3");

                    // NEW: show popup if message exists
                    if (message) {
                        const upgradeSlot = this.GameRenderer.getPlayerUpgrades(this.upgrades.indexOf(upgrade));
                        this.GameRenderer.createPopup(message, upgradeSlot, style);
                    }
                    return wait(350);
                });
                await visualChain;
                visualChain = Promise.resolve();
            }
        }
    }
}
rollUpgrades(count = 3) {
    if(this.overstock){
        count+=1;
    }
    // build upgrade pool with optional dedupe
    let available = upgradesList;
    if (this.upgradeDedupe) {
        available = upgradesList.filter(up =>
            !this.upgrades.some(u => u.name === up.name)
        );
    }

    // build consumable pool with optional dedupe
    let consumablePool = consumableList;
    if (this.upgradeDedupe) {
        consumablePool = consumablePool.filter(c =>
            !this.consumables.some(pc => pc.name === c.name)
        );
    }

    // combine both into one unified rolling pool
    const pool = [...available, ...consumablePool];

    // copy so we can remove taken items (no duplicates)
    const poolCopy = [...pool];
    const picked = [];

    for (let i = 0; i < count && poolCopy.length > 0; i++) {
        const entry = this.roll.weightedPick(poolCopy, this.shopRand.bind(this));

        // remove from pool
        const idx = poolCopy.indexOf(entry);
        if (idx >= 0) poolCopy.splice(idx, 1);

        // create Upgrade or Consumable instance
        if ("descriptionfn" in entry) {
            // it's an upgrade
            const up = new Upgrade(
                entry.name,
                entry.descriptionfn,
                entry.effect,
                entry.remove,
                entry.price,
                entry.props
            );
            // negative / modifier rolling
            this.roll.Modifier(up);
            picked.push(up);
        } else {
            // it's a consumable
            picked.push(
                new Consumable(
                    entry.name,
                    entry.description,
                    entry.effect,
                    entry.price,
                    entry.props
                )
            );
        }
    }

    return picked;
}
    displayMoves(){
        this.moveBox.innerHTML = this.movescounter + "/" + this.moves;
    }
    rerollUpgrades(){
        if(this.money<4){
            this.GameRenderer.notEnoughMoney();
            return;
        } 
        this.money-=4;
        this.Audio.playSound('buy.mp3');
        this.GameRenderer.displayUpgradesInShop();
        this.GameRenderer.updateMoney(-4);
    }
    rerollBoosters(){
        if(this.money<2) return;
        this.money-=2;
        this.GameRenderer.displayBoosterPacks();
        this.GameRenderer.displayMoney();
    }
    gameover(){
        this.GameRenderer.gameOver();
    }
    endround(){
        let addmoney = 0;
        this.GameRenderer.displayUpgradesCounter();
        this.GameRenderer.displayMoves();
        if(this.stage==STAGES.Boss){
            addmoney += this.nextBoss.moneyreward;
            this.nextBoss.revert(this);
            this.bosses.push(this.nextBoss);
            this.nextBoss = null;
            this.GameRenderer.displayBossInGame();
            this.stage=STAGES.Game;
            this.GameRenderer.displayBossCounter();
        }
        this.stage = STAGES.Shop;
        if(this.round%4==0||this.round==1){
            this.level++;
            this.GameRenderer.displayCoupons();
        }
        this.emit(GAME_TRIGGERS.onRoundEnd);
        this.locked = true;
        addmoney+=this.calcMoney();
        this.movescounter=0;
        addmoney+=3;
        this.money+=addmoney;
        this.Audio.playSound('buy.mp3');
        this.GameRenderer.updateMoney(addmoney);
        //this.GameRenderer.displayMoney();
        this.GameRenderer.displayUpgradesInShop();
        this.GameRenderer.displayBoosterPacks();
        this.GameRenderer.hideGame();
        this.GameRenderer.showShop();
    }
    async startround(){
        this.stage = STAGES.Game;
        
        console.log("waiting..");
        await this.emit(GAME_TRIGGERS.onRoundStart);
        console.log("done");
        this.round++;
        this.score=0;
        if(this.round%4==0&&this.nextBoss!=null){
            this.stage = STAGES.Boss;
            this.nextBoss.apply(this);
        }
        if((this.round%4==0||this.round==1)&&this.stage!=STAGES.Boss){
            this.GameRenderer.displayBossInGame();
        }
        this.GameRenderer.displayBossCounter();
        this.locked = false;
        this.GameRenderer.displayRound();
        this.GameRenderer.displayMoney();
        this.GameRenderer.displayMoves();
        this.fill();
        this.GameRenderer.hideShop();
        this.GameRenderer.showGame();
        console.log(this.stage);
    }
    calcMoney(){
        return Math.round((this.moves-this.movescounter)/1.2);
    }
    calcRoundScore() {
        return Math.floor(Math.pow(1.5, this.round) * 350);
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
    this.GameRenderer.displayMoves();

    // animate swap first
    this.animateSwap(x1, y1, x2, y2, true, () => {
        // trigger special if exists
        if (special) {
            let triggerMatches = this.triggerSpecial(special.x, special.y, special.tile, { includeSwapped: true, swappedX: special.swappedX, swappedY: special.swappedY });
            this.emit(GAME_TRIGGERS.onMove,triggerMatches);
            this.processMatches(triggerMatches);
            //matches.push(...triggerMatches);
        }
        else if (matches.length > 0) {
            this.emit(GAME_TRIGGERS.onMove,matches);
            this.processMatches(matches);
        }
    }, { start1, start2, preIcon1, preIcon2 });

    return true;
}
    getTopFruit(tiles = this.fruits) {
        if (!tiles || tiles.length === 0) return null;

        // Only consider fruits
        const fruits = tiles.filter(t => t.type === TYPES.Fruit);
        if (fruits.length === 0) return null;

        // Find max percent
        const maxPercent = Math.max(...fruits.map(f => f.props.percent));

        // Get all fruits with that percent
        const topFruits = fruits.filter(f => f.props.percent === maxPercent);

        // Pick one randomly if multiple
        return topFruits[Math.floor(this.rand() * topFruits.length)];
    }
    equalizeChances(){
        const eq = parseFloat(100 / this.fruits.length);
        this.fruits.forEach(fruit => {
            fruit.percent = eq;
        });
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
    useConsumable(upgrade) {
        if (upgrade.type === "Consumable") {
            upgrade.apply(this);
            this.emit(GAME_TRIGGERS.onConsumableUse,upgrade);
            const idx = this.consumables.indexOf(upgrade);
            if (idx !== -1) {
                this.consumables.splice(idx, 1); // removes the element in-place
            }
            this.Audio.playSound('pop.mp3');
            this.GameRenderer.displayPlayerConsumables();
            this.GameRenderer.displayConsumablesCounter();
        }
    }
    buyanduse(upgrade){
        if(this.stage!==STAGES.Shop) return false;
        if(this.money<upgrade.price) return false;
        this.Audio.playSound('buy.mp3');
        this.money -= upgrade.price;
        this.GameRenderer.updateMoney(-upgrade.price);
        upgrade.apply(this);
        this.emit(GAME_TRIGGERS.onConsumableUse,upgrade);
        //this.GameRenderer.displayMoney();
        return true;
    }
    buy(upgrade){
        console.log("buyin");
        if(this.stage!==STAGES.Shop) return false; // not in shop -> can't buy
        if(this.money<upgrade.price) return false; // not enough money
        this.Audio.playSound('buy.mp3');
        console.log("buying true");
        if(upgrade.type=="Upgrade"){
            this.upgrades.push(upgrade);
            upgrade.apply(this);
            this.GameRenderer.displayPlayerUpgrade(upgrade);
            this.emit(GAME_TRIGGERS.onUpgradesChanged);
        }else if(upgrade.type=="Consumable"){
            if(upgrade.negative) this.maxConsumables+=1;
            this.consumables.push(upgrade);
            this.GameRenderer.displayPlayerConsumable(upgrade);  
        }
        else if(upgrade.type=="ConsumablePack"){
            this.GameRenderer.OpenBoosterPack(upgrade);
            this.Audio.playSound('pop.mp3');
        }else if(upgrade.type=="Voucher"){
            this.coupons.push(upgrade);
            upgrade.apply(this);
        }
        this.money -= upgrade.price;
        this.GameRenderer.updateMoney(-upgrade.price);
        //this.GameRenderer.displayMoney();
        return true;
    }
    sell(upgrade){
        //if(this.stage!==STAGES.Shop) return false; // not in shop -> can't sell
        this.Audio.playSound('sell.mp3');
        if(upgrade.type=="Upgrade"){
            const index = this.upgrades.indexOf(upgrade) ?? -1;
            if(index==-1) return;
            console.log("SELLINNN");
            this.upgrades[index].sell(this);
            this.upgrades.splice(index,1);
            this.GameRenderer.displayUpgradesCounter();
            this.emit(GAME_TRIGGERS.onUpgradesChanged);
        }
        else if(upgrade.type=="Consumable"){
            const index = this.consumables.indexOf(upgrade) ?? -1;
            if(index==-1) return;
            console.log("SELLINNN");
            this.consumables[index].sell(this);
            this.consumables.splice(index,1);
            this.GameRenderer.displayConsumablesCounter();
        }
        this.GameRenderer.updateMoney(upgrade.sellPrice);
        return true;
    }

    randomTile() {
    if (this.rand()*100 < this.special[1].percent) {
        return new Tile(this.special[1].icon, this.special[1].type, {detonations: this.special[1].detonations}); 
    }
    if (this.rand()*100 < this.special[0].percent) {
        return new Tile(this.special[0].icon, this.special[0].type, {detonations: this.special[0].detonations}); 
    }
    return this.randomFruit();
    }
    randomFruit() {
    const weights = this.fruits.map(f => Math.max(0, f.percent));
    let total = weights.reduce((a,b)=>a+b, 0);

    // fallback – jeśli wszystkie wagi są 0
    if (total <= 0) {
        total = this.fruits.length;
        const r = Math.floor(this.rand() * total);
        const base = this.fruits[r];
        return new Tile(base.icon, TYPES.Fruit, {
            modifier: this.rollModifier(base),
            debuffed: base.props.debuffed,
            upgrade: { ...base.props.upgrade }  // <- kopiujemy upgrade
        });
    }

    let r = this.rand() * total;
    for (let i = 0; i < this.fruits.length; i++) {
        r -= weights[i];
        if (r < 0) {
            const base = this.fruits[i];
            return new Tile(base.icon, TYPES.Fruit, {
                modifier: this.rollModifier(base),
                debuffed: base.props.debuffed,
                upgrade: { ...base.props.upgrade }  // <- kopiujemy upgrade
            });
        }
    }

    // default – pierwszy owoc
    const base = this.fruits[0];
    return new Tile(base.icon, TYPES.Fruit, {
        modifier: this.rollModifier(base),
        debuffed: base.props.debuffed,
        upgrade: { ...base.props.upgrade }  // <- kopiujemy upgrade
    });
}
    rollModifier(tile) {
        let modifier = MODIFIERS.None;
        const goldChance = tile.props.upgrade.goldchance ?? 0;
        const silverChance = tile.props.upgrade.silverchance ?? 0;

        const isSilver = this.rand() * 100 < silverChance;
        const isGold = this.rand() * 100 < goldChance;

        if (isSilver) modifier = MODIFIERS.Silver;
        if (isGold) modifier = MODIFIERS.Gold; // gold nadpisuje silver jeśli oba trafione
        return modifier;
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
        let matches = this.findMatches(this.board);
        if(matches.length>0){
            for (const m of matches) {
                const uniqueKey = `${m.x},${m.y}`;
                if (!allSeen.has(uniqueKey)) {
                    allSeen.add(uniqueKey);
                    all.push(m);
                }
            }
        }
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
        return all;
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
        console.log("render", performance.now());
        this.gameContainer.innerHTML = "";
        for (let y = 0; y < this.matrixsize; y++) {
            for (let x = 0; x < this.matrixsize; x++) {
                const tile = this.board[y][x];
                const icon = tile ? tile.icon : " ";
                const isGold = this.board[y][x].props.modifier==MODIFIERS.Gold;
                const isSilver = this.board[y][x].props.modifier==MODIFIERS.Silver;
                const isDebuffed = this.board[y][x].props.debuffed;
                const el = this.createElement(icon, x, y);
                el.style.transform = "translate(0,0)";
                el.style.transition = "";
                if(isGold){
                    el.classList.add("gold");
                }
                if(isSilver){
                    el.classList.add("silver");
                }
                if(isDebuffed){
                    el.classList.add("debuffed")
                }
                el.classList.remove("fade");
                this.gameContainer.appendChild(el);
            }
        }
        this.GameRenderer.displayScore();
    }

    isThreeLine(matches){
        if(matches.length != 3) return false;
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
    isSixLine(matches){
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
}animateSwap(x1, y1, x2, y2, success, callback, opts = {}) {
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

    // copy relevant classes from originals so ghosts look the same (gold/silver/debuffed etc.)
    const copyClasses = (sourceEl) => {
        if (!sourceEl) return [];
        return Array.from(sourceEl.classList).filter(c => c !== 'fade'); // don't copy "fade"
    };

    const g1 = this.createGhost(preIcon1, start1.x, start1.y, start1.w, start1.h, copyClasses(el1));
    const g2 = this.createGhost(preIcon2, start2.x, start2.y, start2.w, start2.h, copyClasses(el2));

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
_waitForTransition(el, property = 'transform', timeout = FALL_MS + 100) {
    return new Promise(resolve => {
        if (!el) return resolve();
        let fired = false;
        const onEnd = (e) => {
            if (property && e.propertyName !== property) return;
            if (fired) return;
            fired = true;
            el.removeEventListener('transitionend', onEnd);
            clearTimeout(timer);
            resolve();
        };
        el.addEventListener('transitionend', onEnd);
        const timer = setTimeout(() => {
            if (!fired) {
                fired = true;
                el.removeEventListener('transitionend', onEnd);
                resolve();
            }
        }, timeout);
    });
}
async animateSpawns(spawnCounts) {
    const size = this.board.length;
    const promises = [];

    // 1) Place new top cells above board instantly (no transition)
    for (let x = 0; x < size; x++) {
        const spawn = spawnCounts[x];
        if (!spawn) continue;
        for (let y = 0; y < spawn; y++) {
            const idx = y * this.matrixsize + x;
            const cell = this.gameContainer.children[idx];
            if (!cell) continue;
            cell.style.transition = "none";
            // move visually above
            cell.style.transform = `translateY(-${spawn * CELL_PX}px)`;
        }
    }

    // flush layout / wait for a RAF so the "none" transform is applied
    await new Promise(requestAnimationFrame);

    // 2) animate them into place and wait for their transitions
    for (let x = 0; x < size; x++) {
        const spawn = spawnCounts[x];
        if (!spawn) continue;
        for (let y = 0; y < spawn; y++) {
            const idx = y * this.matrixsize + x;
            const cell = this.gameContainer.children[idx];
            if (!cell) continue;
            // set transition then move to final
            cell.style.transition = `transform ${FALL_MS}ms ease`;
            // force a layout read to ensure transition is picked up (defensive)
            void cell.offsetWidth;
            cell.style.transform = "translateY(0)";
            promises.push(this._waitForTransition(cell, 'transform', FALL_MS + 120));
        }
    }

    // wait for all spawn animations to finish
    await Promise.all(promises);

    // cleanup (optional) - remove transition so future instant changes won't animate unintentionally
    for (let x = 0; x < size; x++) {
        const spawn = spawnCounts[x];
        if (!spawn) continue;
        for (let y = 0; y < spawn; y++) {
            const idx = y * this.matrixsize + x;
            const cell = this.gameContainer.children[idx];
            if (!cell) continue;
            cell.style.transition = "";
            cell.style.transform = "translate(0,0)";
        }
    }
}

async animateCollapse() {
    const size = this.board.length;
    const drops = [];
    const spawnCounts = Array(size).fill(0);

    // 1) Compute drop distances (based on current nulls)
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

    // 2) Animate existing cells down (collect transition promises)
    const dropPromises = [];
    for (const d of drops) {
        const idx = d.y * this.matrixsize + d.x;
        const cell = this.gameContainer.children[idx];
        if (!cell) continue;
        cell.style.transition = `transform ${FALL_MS}ms ease`;
        // force layout/read to ensure transition is applied
        void cell.offsetWidth;
        cell.style.transform = `translateY(${d.shift * CELL_PX}px)`;
        dropPromises.push(this._waitForTransition(cell, 'transform', FALL_MS + 120));
    }

    // wait for all drop animations to complete
    await Promise.all(dropPromises);

    // 3) Update board data & determine how many spawns were created
    const updatedSpawns = this.collapseBoard(spawnCounts);

    // 4) Re-render so new top tiles exist in the DOM before animating them
    this.render();

    // 5) Animate the newly spawned tiles from above (this function will wait)
    await this.animateSpawns(updatedSpawns);

    // 6) After everything lands, compute specials/matches and continue cascade
    let triggerMatches = [];
    if (this.activeExplosions.length > 0) {
        const copy = [...this.activeExplosions];
        for (const exp of copy) {
            const tile = this.board[exp.y][exp.x];
            if (tile) triggerMatches.push(...this.triggerSpecial(exp.x, exp.y, tile));
        }
    }

    let matches = this.findMatches(this.board);
    matches.push(...triggerMatches);

    // dedupe
    const map = {};
    for (const m of matches) map[`${m.x},${m.y}`] = m;
    matches = Object.values(map);

    // small delay to make sure UI updated; then continue cascade
    await new Promise(r => setTimeout(r, 10));
    this.processMatches(matches);
}
async animateSpawns(spawnCounts) {
    const size = this.board.length;

    // Move new tiles above the board
    for (let x = 0; x < size; x++) {
        const spawn = spawnCounts[x];
        if (spawn === 0) continue;

        for (let y = 0; y < spawn; y++) {
            const idx = y * this.matrixsize + x;
            const cell = this.gameContainer.children[idx];
            if (!cell) continue;
            cell.style.transition = "none";
            cell.style.transform = `translateY(-${spawn * CELL_PX}px)`;
        }
    }

    await new Promise(requestAnimationFrame);

    // Drop them into place
    for (let x = 0; x < size; x++) {
        const spawn = spawnCounts[x];
        if (spawn === 0) continue;

        for (let y = 0; y < spawn; y++) {
            const idx = y * this.matrixsize + x;
            const cell = this.gameContainer.children[idx];
            if (!cell) continue;
            cell.style.transition = `transform ${FALL_MS}ms ease`;
            cell.style.transform = "translateY(0)";
        }
    }

    await new Promise(r => setTimeout(r, FALL_MS));
}
    // zel 100 
    // french 15
    // po stylidstce 20
    collapseBoard(spawnCounts, preSpawns = null) {
    // compute final placements but do NOT mutate DOM here
    console.log("Collapse started", performance.now());
    const size = this.board.length;
    const moveMap = {}; // oldKey -> newKey

    for (let x = 0; x < size; x++) {
        let writeY = size - 1;

        for (let y = size - 1; y >= 0; y--) {
            const tile = this.board[y][x];
            if (tile) {
                if (writeY !== y) {
                    const oldKey = `${x},${y}`;
                    const newKey = `${x},${writeY}`;
                    moveMap[oldKey] = newKey;

                    this.board[writeY][x] = tile;
                    this.board[y][x] = null;
                }
                writeY--;
            }
        }

        // fill empty cells with new random tiles (or use preSpawns)
        for (let y = writeY; y >= 0; y--) {
            if (preSpawns && preSpawns[x] && preSpawns[x].length > 0) {
                // preSpawns stored highest-first (index 0 -> finalY writeY)
                // When we generated preSpawns we should have created them in this order.
                const next = preSpawns[x].shift();
                this.board[y][x] = next;
            } else {
                this.board[y][x] = this.randomTile();
            }
            spawnCounts[x]++;
        }
    }

    // update active explosions based on moveMap
    this.activeExplosions = this.activeExplosions.map(exp => {
        const oldKey = `${exp.x},${exp.y}`;
        if (moveMap[oldKey]) {
            const [nx, ny] = moveMap[oldKey].split(",").map(Number);
            return { ...exp, x: nx, y: ny };
        }
        return exp;
    });

    console.log(spawnCounts);
    return spawnCounts;
}

// === NEW single-pass animateCollapse that animates both existing and new tiles together ===
async animateCollapse() {
    const size = this.board.length;
    const drops = []; // for existing tiles that will move
    const spawnCounts = Array(size).fill(0);

    // 1) Compute final targets (without mutating board)
    const targets = {}; // oldKey -> { x, fromY, toY }
    const writeYs = Array(size).fill(0);
    for (let x = 0; x < size; x++) {
        let writeY = size - 1;
        for (let y = size - 1; y >= 0; y--) {
            const tile = this.board[y][x];
            if (tile) {
                if (writeY !== y) {
                    const oldKey = `${x},${y}`;
                    targets[oldKey] = { x, fromY: y, toY: writeY };
                }
                writeY--;
            }
        }
        // number of new tiles needed is writeY + 1 (rows 0..writeY)
        spawnCounts[x] = writeY + 1;
        writeYs[x] = writeY;
    }

    const anyDrops = Object.keys(targets).length > 0;
    const anySpawns = spawnCounts.some(v => v > 0);
    if (!anyDrops && !anySpawns) return [];

    // 2) Pre-generate the new tiles so visuals and state match
    const preSpawns = Array(size).fill(null).map(() => []);
    for (let x = 0; x < size; x++) {
        const spawn = spawnCounts[x];
        if (spawn <= 0) continue;
        for (let i = 0; i < spawn; i++) {
            const tile = this.randomTile();
            preSpawns[x].push(tile);
        }
    }

    // 3) Create ghosts for all animated tiles (existing moving tiles + new tiles)
    const containerRect = this.gameContainer.getBoundingClientRect();
    let refCell = this.gameContainer.children[0];
    let cellW = CELL_PX, cellH = CELL_PX;
    if (refCell) {
        const r = refCell.getBoundingClientRect();
        cellW = r.width;
        cellH = r.height;
    }

    const ghostPromises = [];
    const ghosts = [];
    const hideOriginals = [];

    // existing tiles ghosts — copy classes from the original cell so ghost matches gold/silver/debuffed
    for (const key of Object.keys(targets)) {
        const { x, fromY, toY } = targets[key];
        const idx = fromY * this.matrixsize + x;
        const cell = this.gameContainer.children[idx];
        if (!cell) continue;
        const rect = cell.getBoundingClientRect();
        const relLeft = rect.left - containerRect.left;
        const relTop = rect.top - containerRect.top;

        const classes = Array.from(cell.classList).filter(c => c !== 'fade');

        const ghost = this.createGhost(cell.textContent, relLeft, relTop, rect.width, rect.height, classes);
        ghost.style.transition = `transform ${FALL_MS}ms ease`;
        this.gameContainer.appendChild(ghost);

        cell.style.visibility = "hidden";
        hideOriginals.push(cell);

        const dy = (toY - fromY) * CELL_PX;
        requestAnimationFrame(() => {
            ghost.style.transform = `translateY(${dy}px)`;
        });

        ghosts.push(ghost);
        ghostPromises.push(this._waitForTransition(ghost, 'transform', FALL_MS + 150));
    }

    // new tile ghosts — set classes according to the tile props (gold/silver/debuffed)
    for (let x = 0; x < size; x++) {
        const spawn = preSpawns[x].length;
        if (spawn === 0) continue;
        const writeY = writeYs[x]; // final highest Y where new tiles start
        for (let i = 0; i < spawn; i++) {
            const finalY = writeY - i;
            const tile = preSpawns[x][i];
            const left = x * cellW;
            const top = finalY * cellH;
            const classes = [];
            if (tile && tile.props) {
                if (tile.props.modifier === MODIFIERS.Gold) classes.push('gold');
                else if (tile.props.modifier === MODIFIERS.Silver) classes.push('silver');
                if (tile.props.debuffed) classes.push('debuffed');
                // if you have other semantic classes for bombs/dynamite, add here:
                if (tile.type === TYPES.Bomb || tile.type === TYPES.Dynamite) classes.push('special');
            }
            const ghost = this.createGhost(tile.icon, left, top, cellW, cellH, classes);
            ghost.style.transition = `transform ${FALL_MS}ms ease`;
            ghost.style.transform = `translateY(-${spawn * CELL_PX}px)`; // start above
            this.gameContainer.appendChild(ghost);
            requestAnimationFrame(() => {
                ghost.style.transform = `translateY(0)`;
            });
            ghosts.push(ghost);
            ghostPromises.push(this._waitForTransition(ghost, 'transform', FALL_MS + 150));
        }
    }

    // 4) Wait for all ghost transitions to finish
    await Promise.all(ghostPromises);

    // 5) cleanup ghosts and originals
    for (const g of ghosts) g.remove();
    for (const o of hideOriginals) o.style.visibility = "";

    // 6) Now update the board for real using preSpawns (pass a copy because collapseBoard may mutate)
    const preSpawnsForCollapse = preSpawns.map(arr => arr.slice());
    const updatedSpawns = this.collapseBoard(spawnCounts, preSpawnsForCollapse);

    // 7) Re-render the grid to reflect new board state
    this.render();

    // 8) Continue cascade as before (compute specials / matches)
    let triggerMatches = [];
    if (this.activeExplosions.length > 0) {
        for (const exp of [...this.activeExplosions]) {
            const tile = this.board[exp.y][exp.x];
            if (tile) triggerMatches.push(...this.triggerSpecial(exp.x, exp.y, tile));
        }
    }

    let matches = this.findMatches(this.board);
    matches.push(...triggerMatches);
    const map = {};
    for (const m of matches) map[`${m.x},${m.y}`] = m;
    matches = Object.values(map);

    await new Promise(r => setTimeout(r, 10));
    this.processMatches(matches);
}


createGhost(icon, xPx, yPx, w, h, classList = []) {
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

    // apply classes that make ghosts visually identical to tiles (gold/silver/debuffed/etc.)
    if (Array.isArray(classList)) {
        for (const c of classList) {
            if (c && typeof c === 'string') g.classList.add(c);
        }
    }
    return g;
}
    async processMatches(matches){
        console.log("processMatches");
        if(matches.length === 0){
            console.log("waiting..");
            await this.emit(GAME_TRIGGERS.onScore);
            console.log("finished");
            this.GameRenderer.displayTempScore();
            let delay = 0;
            if(this.triggers[GAME_TRIGGERS.onScore].length>0){delay = 300}
            setTimeout(()=>{
                this.locked = false; // koniec kaskady
                this.score += Math.round(this.tempscore * this.mult);
                this.tempscore = 0;
                this.mult = 1;
                this.pitch=1;
                this.GameRenderer.displayScore();
                this.GameRenderer.displayTempScore();
                if(this.score>=this.calcRoundScore()){
                    this.endround();
                    return;
                }
                else if(this.movescounter>=this.moves&&this.score<this.calcRoundScore()){
                    this.locked = true;
                    this.gameover();
                    return;
                }
            },delay);
            return;
        }
        this.locked = true;
        if (this.isFiveLine(matches) || this.isLShape(matches)) {
            this.mult+=1;
        //     // pick center tile by bounding box for stability
        //     let xs = matches.map(m=>m.x);
        //     let ys = matches.map(m=>m.y);
        //     let minX = Math.min(...xs), maxX = Math.max(...xs);
        //     let minY = Math.min(...ys), maxY = Math.max(...ys);
        //     let cx = Math.round((minX + maxX)/2);
        //     let cy = Math.round((minY + maxY)/2);
        //     // ensure valid coordinates
        //     cx = Math.max(0, Math.min(this.matrixsize-1, cx));
        //     cy = Math.max(0, Math.min(this.matrixsize-1, cy));
        //     //this.board[cy][cx] = this.makeBomb();
        }
        console.log("waiting for matches..")
        //console.log(matches);
        //console.log(this.isSixLine(matches));
        await this.emit(GAME_TRIGGERS.onMatch, matches);
        console.log("ended.");
        // pozwól przeglądarce „zobaczyć” stan po swapie zanim nałożymy .fade
        requestAnimationFrame(() => {
            for(const m of matches){
                const idx = m.y * this.matrixsize + m.x;
                const cell = this.gameContainer.children[idx];
                const tile = this.board[m.y][m.x];
                if(tile && (tile.type === TYPES.Bomb || tile.type === TYPES.Dynamite)){
                    // decrement detonations
                    tile.props.detonations -= 1;

                    if(tile.props.detonations > 0){
                        // still has detonations → keep in activeExplosions
                        this.activeExplosions.push({ x: m.x, y: m.y, type: tile.type, detonations: tile.props.detonations });
                        continue; // skip fading / removal
                    }
                    // detonations now 0 → remove from activeExplosions if exists
                    this.activeExplosions = this.activeExplosions.filter(e => !(e.x === m.x && e.y === m.y));
                }
                if(cell) cell.classList.add("fade");
            }
            setTimeout(()=>{
                // fizycznie usuń z board
                let groups = {};
                let addmoney = 0;
                for(const m of matches){
                    const tile = this.board[m.y][m.x];
                    let skip = false;
                    this.activeExplosions.forEach(detonation => {
                        if(m.x==detonation.x&&m.y==detonation.y) skip=true;
                    });
                    if(skip) continue;
                    let gold = tile.props.modifier==MODIFIERS.Gold;
                    let silver = tile.props.modifier==MODIFIERS.Silver;
                    let type = tile.icon;
                    if(gold){
                        addmoney++;
                    }
                    if(silver){
                        this.mult = this.mult * 1.5;
                    }
                    if (!groups[type]) {
                        groups[type] = {
                            mult: 0,
                            multAdded: false
                        };
                    }
                    if(!groups[type].multAdded&&!tile.props.debuffed){
                        groups[type].mult = tile.props.upgrade.mult;
                        groups[type].multAdded = true;
                    }
                    if(!tile.props.debuffed) this.tempscore += Math.round(tile.props.upgrade.score);
                    this.board[m.y][m.x] = null;
                }
                if(addmoney>0){
                    this.Audio.playSound('buy.mp3');
                    this.GameRenderer.updateMoney(addmoney);
                    this.money+=addmoney;
                }
                for (let type in groups) {
                    let group = groups[type];
                    this.mult += group.mult;
                    this.mult = Math.round(this.mult * 100) / 100;
                }
                this.Audio.playSound('score_sound.mp3',this.pitch);
                this.pitch+=0.2;
                this.GameRenderer.displayTempScore();
                // animacja spadania istniejących owoców
                this.animateCollapse();
            }, FADE_MS);
        });
    }
}

let game = new Game();
console.log(game.fruits);
//consumableList[0].consume(game);
//game.startround();
function startRound(){
    game.startround();
}
function startGame(seed = ""){
    game = new Game();
    if(seed!=""){
        game.setSeed(seed);   
    }
    game.GameRenderer.hideMenu();
    game.GameRenderer.showGameContainer();
    game.GameRenderer.displayPlayerUpgrades();
    console.log(game.fruits);
    startRound();
    Audio.playSound('pop.mp3');
    window.game = game;
}
function showMenu(){
    document.getElementById("game-over").style.display = "none";
    game.GameRenderer.hideGameContainer();
    game.GameRenderer.showMenu();
}
function restartGame() {
  game = new Game();
  window.game = game;
  game.GameRenderer.displayPlayerUpgrades();
  game.GameRenderer.displayPlayerConsumables();
  console.log(game.fruits);
  startRound();
  document.getElementById("game-over").style.display = "none";
}
function skip(){
    game.GameRenderer.hideTileOverlay();
    game.GameRenderer.showShop();
}
function reroll(){
    game.rerollUpgrades();
}
function rerollBoosters(){
    game.rerollBoosters();
}
function showInfo(){
    game.GameRenderer.displayTiles();
    document.getElementById("info-container").style.display = "flex";
}
function hideInfo(){
    document.getElementById("info-container").style.display = "none";
}
const R = document.getElementById('funcR');
const G = document.getElementById('funcG');
const B = document.getElementById('funcB');

let t = 0;
function animateholo() {
  t += 0.02;
  const hue = Math.sin(t) * 0.5 + 0.5;
  R.setAttribute('tableValues', `0 ${hue.toFixed(2)} 1`);
  G.setAttribute('tableValues', `0 ${(1-hue).toFixed(2)} 1`);
  B.setAttribute('tableValues', `${hue.toFixed(2)} 0 1`);
  requestAnimationFrame(animateholo);
}
animateholo();
window.skip = skip;
window.game = game;
window.showInfo = showInfo;
window.hideInfo = hideInfo;
window.startRound = startRound; 
window.upgradesList = upgradesList;
window.consumableList = consumableList;
window.reroll = reroll;
// window.rerollBoosters = rerollBoosters;
window.restartGame = restartGame;
window.startGame = startGame;
window.showMenu = showMenu;