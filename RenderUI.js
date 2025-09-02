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
    displayPlayerUpgrades(){
        const playerUpgrades = document.getElementById("player-upgrades-container");
        playerUpgrades.innerHTML = "";
        playerUpgrades.appendChild(this.displayUpgrades(this.game.upgrades,{canbuy:false,cansell:true}));
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
        shopEl.appendChild(this.displayUpgrades(this.game.rollUpgrades(),{canbuy:true,cansell:false}));
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
            priceEl.textContent = `$${params.cansell ? Math.floor(up.price / 2) : up.price}`;
    
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
            if (params.canbuy) {
                card.addEventListener("click", () => {
                    if (this.game.upgrades.length < this.game.maxUpgrades && this.game.money >= up.price) {
                        this.game.buy(up);
                        wrapper.remove();
                    }
                });
            }
    
            if (params.cansell) {
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