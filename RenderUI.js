import { Consumable,ConsumablePack,consumableList,rollConsumablePacks } from "./consumable.js";
import { Upgrade } from "./upgradeBase.js";
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
    displayBoosterPacks(){
        const boosterPack = document.getElementById("boosterpack-container");
        boosterPack.innerHTML = "";
        boosterPack.appendChild(this.displayUpgrades(rollConsumablePacks(2),{bought: false}));
    }
    OpenBoosterPack(boosterPack){
        const consumableContainer = document.getElementById("consumables-container");
        consumableContainer.innerHTML = "";
        consumableContainer.appendChild(this.displayUpgrades(boosterPack.roll(),{bought:false,free:true,origin: boosterPack}));
    }
    displayPlayerUpgrades(){
        const playerUpgrades = document.getElementById("player-upgrades-container");
        playerUpgrades.innerHTML = "";
        playerUpgrades.appendChild(this.displayUpgrades(this.game.upgrades,{bought:true}));
        this.displayUpgradesCounter();
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
    displayUpgrades(upgrades, params = {bought:false, origin: null }) {
        console.log(params.origin);
        let full = document.createDocumentFragment();
        if(params.origin&&params.origin.type=="ConsumablePack"){
            this.game.BuysFromBoosterLeft = params.origin.props.maxSelect;
        }
        upgrades.forEach(up => {
            // Wrapper
            const wrapper = document.createElement("div");
            wrapper.className = "upgrade-wrapper";
            if (params.bought) {
                wrapper.classList.add("bought");
            }
            if(params.free){
                up.price = 0;
            }
            // Price above card
            const priceEl = document.createElement("div");
            priceEl.className = "upgrade-price";
            priceEl.textContent = `$${params.bought ? Math.floor(up.price / 2) : up.price}`;
            
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
    
            // Aktualizacja opisu przy hover
            wrapper.addEventListener("mouseenter", () => {
                // jeśli opis się zmienia dynamicznie w zależności od stanu gry
                desc.innerHTML = `<h1>${up.name}</h1><p>${up.description(this.game)}</p>`;
            });
    
            // Click handlers
            if (!params.bought) {
                card.addEventListener("click", () => {
                    if ((this.game.upgrades.length < this.game.maxUpgrades && this.game.money >= up.price&&up.type=="Upgrade") || (this.game.money >= up.price&&up.type=="ConsumablePack")) {
                        this.game.buy(up);
                        wrapper.remove();
                    }
                    else if(params.origin&&params.origin.type=="ConsumablePack"){
                        this.game.buy(up);
                        this.game.BuysFromBoosterLeft--;
                        if(this.game.BuysFromBoosterLeft<=0){
                            const container = document.getElementById("consumables-container");
                            container.innerHTML = "";
                        }
                        wrapper.remove();    
                    }
                });
            }
            if (params.bought&&(up.type=="Consumable"||up.type=="Upgrade")) {
                card.addEventListener("click", () => {
                    if(this.game.sell(up)){
                        wrapper.remove();
                        this.displayMoney();
                        this.displayUpgradesCounter();
                    } 
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
    // przeniesione displayUpgrades, displayPlayerUpgrades itd...
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
}