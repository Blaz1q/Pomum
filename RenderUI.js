import { Consumable,ConsumablePack,consumableList,rollConsumablePacks,rollVouchers } from "./consumable.js";
import { Upgrade } from "./upgradeBase.js";
import { animate,Animator } from "./loadshaders.js";
import { COLORS,GAMECOLORS, DURATIONS } from "./dictionary.js";
export class RenderUI {
    constructor(game) {
        this.game = game;
    }
    displayMoves() {
        this.game.moveBox.innerHTML = this.game.movescounter + "/" + this.game.moves;
    }

    displayMoney() {
        this.game.moneyBox.innerHTML = this.game.money;
    }

    displayRound() {
        this.game.roundBox.innerHTML = this.game.round;
    }
    displayScore() {
        this.game.scoreBox.innerHTML = `${this.game.score}/${this.game.calcRoundScore()}`;
    }

    displayTempScore() {
        this.game.tempscoreBox.innerHTML = this.game.tempscore;
        this.game.multBox.innerHTML = this.game.mult;
    }
    displayUpgradesCounter(){
        document.getElementById("upgrades-counter").innerHTML = `(${this.game.upgrades.length}/${this.game.maxUpgrades})`;
    }
     displayConsumablesCounter(){
        document.getElementById("consumables-counter").innerHTML = `(${this.game.consumables.length}/${this.game.maxConsumables})`;
    }
    displayBoosterPacks(){
        const boosterPack = document.getElementById("boosterpack-container");
        boosterPack.innerHTML = "";
        boosterPack.appendChild(this.displayUpgrades(rollConsumablePacks(2),{bought: false}));
    }
    displayCoupons(){
        const coupon = document.getElementById("voucher-container");
        coupon.innerHTML = "";
        coupon.appendChild(this.displayUpgrades(rollVouchers(this.game,1),{bought: false}));
    }
    OpenBoosterPack(boosterPack){
        console.log(boosterPack);
        animate.animateColors(COLORS.magicPurples,DURATIONS.ANIMATION_DURATION);
        const consumableContainer = document.getElementById("consumables-container");
        consumableContainer.innerHTML = "";
        consumableContainer.appendChild(this.displayUpgrades(boosterPack.roll(this.game),{bought:false,free:true,origin: boosterPack}));
        this.displayTiles();
        this.dispalyTileOverlay();
        this.hideShop();
    }
    showMenu(){
        document.getElementById("menu").style.display = "flex";
        animate.animateColors(COLORS.magicPurples,DURATIONS.ANIMATION_DURATION);
        animate.smoothRotateTo(-1,DURATIONS.SWIRL_DURATION);
    }
    hideMenu(){
        document.getElementById("menu").style.display = "none";
    }
    hideGame(){
        document.getElementById("body").style.display = "none";
    }
    showGameContainer(){
        document.getElementsByClassName("game")[0].style.display = "flex";
    }
    hideGameContainer(){
        document.getElementsByClassName("game")[0].style.display = "none";
    }
    showGame(){
        document.getElementById("body").style.display = "grid";
        const palettes = Object.values(GAMECOLORS);
        const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
        animate.animateColors(randomPalette,DURATIONS.ANIMATION_DURATION);
        animate.smoothRotateTo(0.5,DURATIONS.SWIRL_DURATION);
    }
    hideShop(){
        let shop = document.getElementById("shop");
        shop.style.display="none";
    }
    showShop(){
        animate.animateColors(COLORS.shopGreens,DURATIONS.ANIMATION_DURATION);
        animate.smoothRotateTo(1,DURATIONS.SWIRL_DURATION);
        let shop = document.getElementById("shop");
        shop.style.display="grid";
    }
    dispalyTileOverlay(){
        let container = document.getElementById("upgrade-tiles");
        container.style.display = "flex";
    }
    hideTileOverlay(){
        let container = document.getElementById("upgrade-tiles");
        container.style.display = "none";
    }
    displayTiles() {
    const tiles = this.game.fruits;
    const tileContainer = document.getElementById("tiles");
    tileContainer.innerHTML = "";

    tiles.forEach(tile => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("tile");
        wrapper.textContent = tile.icon;
        wrapper.style.position = "relative"; // needed for tooltip positioning

        // Tooltip element (like upgrade-desc)
        const desc = document.createElement("div");
        desc.className = "upgrade-desc";
        desc.innerHTML = `<h1>${tile.name}</h1><p>${tile.description ?? ""}</p>`; // placeholder
        wrapper.appendChild(desc);

        // Show tooltip on hover
        wrapper.addEventListener("mouseenter", () => {
            desc.innerHTML = `
                <p><b>Level:</b> ${tile.props?.upgrade?.level ?? "-"}</p>
                <p><span class="chance">Szansa:</span> ${tile.percent ?? 0}</p>
                <p><span class="mult">Mult:</span> ${tile.props?.upgrade?.mult ?? 0}</p>
                <p><span class="score">Punkty:</span> ${tile.props?.upgrade?.score ?? 0}</p>
                <p><span class="chance">Gold Chance:</span> ${tile.props?.upgrade?.goldchance ?? 0}%</p>
                <p><span class="chance">Silver Chance:</span> ${tile.props?.upgrade?.silverchance ?? 0}%</p>
            `;
            desc.style.opacity = "1";
        });
        wrapper.addEventListener("mouseleave", () => {
            desc.style.opacity = "0";
        });

        tileContainer.appendChild(wrapper);
    });
}
displayPlayerConsumables(){
    const playerConsumables = document.getElementById("player-consumables-container");
    playerConsumables.innerHTML = "";
    const consumables = this.displayUpgrades(this.game.consumables, { bought: true });
    playerConsumables.appendChild(consumables);
}
displayPlayerUpgrades() {
    const playerUpgrades = document.getElementById("player-upgrades-container");
    playerUpgrades.innerHTML = "";
    const upgradesFragment = this.displayUpgrades(this.game.upgrades, { bought: true });

    upgradesFragment.querySelectorAll(".upgrade-wrapper").forEach((wrapper) => {
        wrapper.draggable = true;

        wrapper.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", [...wrapper.parentElement.children].indexOf(wrapper));
            wrapper.classList.add("dragging");
        });

        wrapper.addEventListener("dragend", () => {
            wrapper.classList.remove("dragging");
            // reset transform after drop
            wrapper.style.transform = "";
        });

        wrapper.addEventListener("dragover", (e) => {
            e.preventDefault();
            wrapper.classList.add("drag-over");
        });

        wrapper.addEventListener("dragleave", () => {
            wrapper.classList.remove("drag-over");
        });

        wrapper.addEventListener("drop", (e) => {
            e.preventDefault();
            wrapper.classList.remove("drag-over");

            const container = wrapper.parentElement;
            const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
            const targetIndex = [...container.children].indexOf(wrapper);

            if (draggedIndex === targetIndex) return;

            const draggedElement = container.children[draggedIndex];

            draggedElement.style.transition = "";
                draggedElement.style.transform = "";

                if (draggedIndex < targetIndex) {
                    container.insertBefore(draggedElement, container.children[targetIndex + 1] || null);
                } else {
                    container.insertBefore(draggedElement, container.children[targetIndex]);
                }

                // Update array
                const movedUpgrade = this.game.upgrades.splice(draggedIndex, 1)[0];
                this.game.upgrades.splice(targetIndex, 0, movedUpgrade);

                this.displayUpgradesCounter();
        });
    });

    playerUpgrades.appendChild(upgradesFragment);
}
    getPlayerUpgrades(upgradeid) {
        return document.querySelectorAll('#player-upgrades-container .upgrade-wrapper.bought')[upgradeid];
    }
    upgradeTrigger(upgrade,delay){
        console.log(`upgrade trigger: ${upgrade.name}`);
        const gameupgrades = this.game.upgrades;
        const index = gameupgrades.indexOf(upgrade);
        if(index<0) return;
        let upgradecard = this.getPlayerUpgrades(index);

        const descElement = upgradecard.querySelector(".upgrade-desc p");
        descElement.innerHTML = upgrade.description(this.game);
        setTimeout(()=>{
                upgradecard.classList.add("triggered");
            setTimeout(()=>{
                upgradecard.classList.remove("triggered");
            },500);
        },delay)
    }
    displayUpgradesInShop() {
        const shopEl = document.getElementById("upgrades-container");
        shopEl.innerHTML = ""; 
        shopEl.appendChild(this.displayUpgrades(this.game.rollUpgrades(),{bought:false}));
    }
    displayUpgrades(upgrades, params = { bought:false, origin: null }) {
    console.log(params.origin);
    let full = document.createDocumentFragment();

    if(params.origin && params.origin.type == "ConsumablePack"){
        this.game.BuysFromBoosterLeft = params.origin.props.maxSelect;
    }

    upgrades.forEach(up => {
        const wrapper = document.createElement("div");
        const originalZ = wrapper.style.zIndex || 0;
        wrapper.addEventListener('mouseenter', () => wrapper.style.zIndex = 500);
        wrapper.addEventListener('mouseleave', () => wrapper.style.zIndex = originalZ);
        wrapper.className = "upgrade-wrapper";
        wrapper.dataset.type = up.type;
        if (params.bought) wrapper.classList.add("bought");

        if(params.free){
            up.price = 0;
        }

        // Price above card
        const priceEl = document.createElement("div");
        priceEl.className = "upgrade-price";
        priceEl.textContent = `$${params.bought ? up.sellPrice : up.price}`;
        
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
        desc.innerHTML = `<h1>${up.name}</h1><p>${up.description(this.game)}</p>`;

        wrapper.addEventListener("mouseenter", () => {
            desc.innerHTML = `<h1>${up.name}</h1><p>${up.description(this.game)}</p>`;
        });
        wrapper.appendChild(this.createUpgradeButtons(wrapper,up,params));
        // Click handlers
        wrapper.appendChild(priceEl);
        wrapper.appendChild(card);
        wrapper.appendChild(desc);
        full.appendChild(wrapper);
    });

    return full;
}
gameOver(){
    document.getElementById("game-over").style.display = "flex";
    animate.animateColors(COLORS.gameOver,DURATIONS.ANIMATION_DURATION);
    animate.smoothRotateTo(-1,DURATIONS.SWIRL_DURATION);
}
createUpgradeButtons(wrapper,upgrade,params = {bought:false,origin:null}){
    if(params.origin && params.origin.type == "ConsumablePack"){
        this.game.BuysFromBoosterLeft = params.origin.props.maxSelect;
    }
    function buy(game,upgrade,params){
        let success = false;
        if(game.money<upgrade.price){
            console.log("not enough money")
            return false;
        }
        if(upgrade.type==="Upgrade"&&game.upgrades.length>=game.maxUpgrades){
            console.log("not enough upgrade space");
            return false;
        }
        if(upgrade.type==="Consumable"&&game.consumables.length>=game.maxConsumables){
            console.log("not enough consumable space space");
            return false;
        }
        success = game.buy(upgrade);
        console.log(success);
        if (success&&params.origin&&params.origin.type=="ConsumablePack"){
            game.BuysFromBoosterLeft--;
        }
        if(params.origin&&params.origin.type=="ConsumablePack"&&game.BuysFromBoosterLeft <= 0){
            const container = document.getElementById("consumables-container");
            container.innerHTML = "";
        }
        if(success){
            wrapper.remove();
            return true;
        }
        return false;
    }
    const btnRow = document.createElement("div");
    btnRow.className = "consumable-buttons";
    const btnBuy = document.createElement("button");
    btnBuy.textContent = "Kup";
    btnBuy.addEventListener("click", (e) => {
        e.stopPropagation();
        buy(this.game,upgrade,params);
        this.refreshBuyButtons();
    });
    const btnUse = document.createElement("button");
    btnUse.textContent = "Użyj";
    btnUse.addEventListener("click", (e) => {
        e.stopPropagation();
        this.game.useConsumable(upgrade);
    });
    const btnBuyUse = document.createElement("button");
    btnBuyUse.textContent = "Kup i Użyj";
    btnBuyUse.addEventListener("click", (e) => {
        e.stopPropagation();
        let success = this.game.buyanduse(upgrade);
        if (success&&params.origin&&params.origin.type=="ConsumablePack"){
            this.game.BuysFromBoosterLeft--;
        }
        if(params.origin&&params.origin.type=="ConsumablePack"&&game.BuysFromBoosterLeft <= 0){
            const container = document.getElementById("consumables-container");
            container.innerHTML = "";
        }
        if(success){
            wrapper.remove();
        }
    });
    const btnSell = document.createElement("button");
    btnSell.textContent = "Sprzedaj";
    btnSell.addEventListener("click", (e)=>{
        e.stopPropagation();
        if(this.game.sell(upgrade)){
            this.refreshBuyButtons();
            wrapper.remove();
        }
    })
    if(params.bought===false){
        btnRow.appendChild(btnBuy);
        if(upgrade.type==="Consumable"){
            btnRow.appendChild(btnBuyUse);
        }
    }
    else{
       if(upgrade.type==="Consumable"){
            btnRow.appendChild(btnUse); 
        }
        btnRow.appendChild(btnSell);
    }       
    return btnRow;    
    }
    refreshBuyButtons() {
    // Disable or remove buy buttons when limits are reached
    const noUpgradeSpace = this.game.upgrades.length >= this.game.maxUpgrades;
    const noConsumableSpace = this.game.consumables.length >= this.game.maxConsumables;

    document.querySelectorAll(".consumable-buttons button").forEach(btn => {
        if (btn.textContent === "Buy") {
            const wrapper = btn.closest(".upgrade-wrapper");
            if (!wrapper) return;

            // Find upgrade type from dataset
            const type = wrapper.dataset.type;
            if(type==="Upgrade"){
                btn.disabled = noUpgradeSpace;
            }
            if(type==="Consumable"){
                btn.disabled = noConsumableSpace;
            }
        }
    });
}
}
export class Style{
    static Mult(text){
        return `<b class='mult'>${text}</b>`;
    }
    static Score(text){
    return `<b class='score'>${text}</b>`;
    }
    static Chance(text){
    return `<b class='chance'>${text}</b>`;
    }
    static Moves(text){
    return `<b class='moves'>${text}</b>`;
    }
    static Money(text){
        return `<b class='money'>${text}</b>`;
    }
}