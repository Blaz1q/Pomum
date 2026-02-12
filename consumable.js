import { Upgrade,Consumable,Voucher,ConsumablePack } from "./upgradeBase.js";
import { Style } from "./dictionary.js";
import { upgradesList } from "./upgrade.js";
import { GAME_TRIGGERS, MODIFIERS, UPGRADE_RARITY, UPGRADE_RARITY_NAME, STAGES } from "./dictionary.js";
export const consumableList = [];
export const consumablePacks = [];
export const vouchers = [];
const pomumpackItems = [];
function desc(fruit){
    return `daje ${Style.Score('+2 punkty')}, ${Style.Mult('+0.4 mult')} do ${fruit.icon}, obecnie ${ Style.Score('+'+fruit.props.upgrade.score+' punktów') }, ${Style.Mult('+'+fruit.props.upgrade.mult+' mult')}`;
}
function add(fruit){
    fruit.levelUp();
}
const consumableBlueprints = [];
const consumableLvlUp = [];
const consumbaleEvil = [];
consumableLvlUp.push(    {
        name: "Jabłko",
        descriptionfn(game) {
            return desc(game.fruits[0]);
        },
        effect(game) {
            add(game.fruits[0]);
        },
        price: 3,
        image: "lvlup_apple", getFruit(game){return game.fruits[0];
        }
    },
    {
        name: "Gruszka",
        descriptionfn(game) {
            return desc(game.fruits[1]);
        },
        effect(game) {
            add(game.fruits[1]);
        },
        price: 3,
        image: "lvlup_pear", getFruit(game){return game.fruits[1];}
    },
    {
        name: "Ananas",
        descriptionfn(game) {
            return desc(game.fruits[2]);
        },
        effect(game) {
            add(game.fruits[2]);
        },
        price: 3,
        image: "lvlup_pineapple", getFruit(game){return game.fruits[2];}
    },
    {
        name: "Winogron",
        descriptionfn(game) {
            return desc(game.fruits[3]);
        },
        effect(game) {
            add(game.fruits[3]);
        },
        price: 3,
        image: "lvlup_grape", getFruit(game){return game.fruits[3];} 
    },
    {
        name: "Kokos",
        descriptionfn(game) {
            return desc(game.fruits[4]);
        },
        effect(game) {
            add(game.fruits[4]);
        },
        price: 3,
        image: "lvlup_coconut", getFruit(game){return game.fruits[4];}
    },)
consumbaleEvil.push(
    {
        name: "EVIL Jabłko",
        descriptionfn(game) {
            return evildesc(game.fruits[0], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[0]);
        },
        price: 3,
        image: "devil_apple", getFruit(game){return game.fruits[0];}
    },
    {
        name: "EVIL Gruszka",
        descriptionfn(game) {
            return evildesc(game.fruits[1], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[1]);
        },
        price: 3,
        image: "devil_pear", getFruit(game){return game.fruits[1];}
    },
    {
        name: "EVIL Winogron",
        descriptionfn(game) {
            return evildesc(game.fruits[3], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[3]);
        },
        price: 3,
        image: "devil_grape", getFruit(game){return game.fruits[3];}
    },
    {
        name: "EVIL Ananas",
        descriptionfn(game) {
            return evildesc(game.fruits[2], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[2]);
        },
        price: 3,
         image: "devil_pineapple", getFruit(game){return game.fruits[2];}
    },
    {
        name: "EVIL Kokos",
        descriptionfn(game) {
            return evildesc(game.fruits[4], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[4]);
        },
        price: 3,
         image: "devil_coconut", getFruit(game){return game.fruits[4];} 
    }
);
const consumableSilverBlueprints = [
    {
        name: "Silver Jabłko",
        descriptionfn(game){
            return silverDesc(game.fruits[0]);
        },
        effect(game){
            silverFunc(game,game.fruits[0]);
        },
        price: 3,
        image: 'lvlup_apple_silver', getFruit(game){return game.fruits[0];}
    },
    {
        name: "Silver Gruszka",
        descriptionfn(game){
            return silverDesc(game.fruits[1]);
        },
        effect(game){
            silverFunc(game,game.fruits[1]);
        },
        price: 3,
        image: 'lvlup_pear_silver', getFruit(game){return game.fruits[1];}
    },
    {
        name: "Silver Winogron",
        descriptionfn(game){
            return silverDesc(game.fruits[3]);
        },
        effect(game){
            silverFunc(game,game.fruits[3]);
        },
        price: 3,
        image: 'lvlup_grape_silver', getFruit(game){return game.fruits[3];}
    },
    {
        name: "Silver Ananas",
        descriptionfn(game){
            return silverDesc(game.fruits[2]);
        },
        effect(game){
            silverFunc(game,game.fruits[2]);
        },
        price: 3,
        image: 'lvlup_pineapple_silver', getFruit(game){return game.fruits[2];}
    },
    {
        name: "Silver Kokos",
        descriptionfn(game){
            return silverDesc(game.fruits[4]);
        },
        effect(game){
            silverFunc(game,game.fruits[4]);
        },
        price: 3,
        image: 'lvlup_coconut_silver', getFruit(game){return game.fruits[4];}
    }
];
export const consumableUpgradeBlueprints = [
    {
        name: "Negative",
        descriptionfn(game){
            return 'losowy upgrade staje się negative.';
        },
        effect(game){
            if(game.upgrades.length==0) return;
            let upgrades = game.upgrades.filter( upgrade => (upgrade.negative!=true));
            if(upgrades.length==0) return
            let index = Math.floor(Math.random() * upgrades.length); 
            upgrades[index].negative = true;
            game.maxUpgrades+=1;
            game.GameRenderer.displayUpgradesCounter();
            game.GameRenderer.updateUpgrade(game.upgrades.indexOf(upgrades[index]));
            game.Audio.playSound('foil_reverse.mp3');
        },
        price: 8,
        image: 'negative'
    },
    {
        name: "Copy",
        descriptionfn(game){
            return "Kopiuje losowe ulepszenie, usuwa reszte.";
        },
        effect(game){
            if(game.upgrades.length==0) return;
            let index = Math.floor(Math.random()*game.upgrades.length);
            let copy = game.upgrades[index];
            const newUpgrade = Upgrade.Copy(copy);
            console.log(newUpgrade);
            game.upgrades.forEach(upgrade => {
                if(upgrade!=copy) upgrade.props?.remove(game);
            });
            game.upgrades = [];
            newUpgrade.props?.effect(game);
            game.upgrades.push(copy,newUpgrade);  
            game.GameRenderer.displayPlayerUpgrades();
            game.GameRenderer.displayUpgradesCounter();
        },
        price: 8,
        image: 'copy'
    },
    {
        name: "Thunder",
        descriptionfn(game){
            return `Daje 4 losowe ulepszenia owoców. (Mogą się powtarzać)`;
        },
        effect(game){
            const filter = [...consumableLvlUp,...consumableGoldBlueprints,...consumableSilverBlueprints];
            for(var i=0;i<4;i++){
                const picked = Math.floor(Math.random()*filter.length); 
                const con = filter[picked];
                const consumable = new Consumable(con);
                consumable.negative = true;
                game.consumables.push(consumable);
            }
            game.maxConsumables+=4;
            game.Audio.playSound('foil_reverse.mp3');
            game.GameRenderer.displayPlayerConsumables();
            game.GameRenderer.displayConsumablesCounter();
        },
        price: 8,
        image: 'thunder'
    },
    {
        name: "Foiled",
        descriptionfn(game){
            return `Losowe ulepszenie dostaje bonusowe ${Style.Chance(MODIFIERS.Chip)}, lub ${Style.Chance(MODIFIERS.Mult)}`;
        },
        effect(game){
            if(game.upgrades.length==0) return;
            let index = Math.floor(Math.random()*game.upgrades.length);
            let upgrade = game.upgrades[index];
            if(Math.random()<0.5)
                upgrade.modifier = MODIFIERS.Chip;
            else
                 upgrade.modifier = MODIFIERS.Mult;
            upgrade.addSpecial(game);
            game.GameRenderer.updateUpgrade(index);
            game.Audio.playSound('foil.mp3');
        },
        price: 8,
        image: 'foiled'
    },
    {
        name: "Fire",
        descriptionfn(game){
            return `Daje cenę sprzedarzy kupionych ulepszeń. (Max ${Style.Money(`$40`)})`;
        },
        effect(game){
            let money = 0;
            game.upgrades.forEach(upgrade => {
                money+=upgrade.sellPrice;
            });
            if(money>40) money = 40;
            game.money += 40;
            game.GameRenderer.updateMoney(money);
        },
        price: 8,
        image: 'fire'
    }
]
const consumableGoldBlueprints = [
    {
        name: "Gold Jabłko",
        descriptionfn(game){
            return goldDesc(game.fruits[0]);
        },
        effect(game){
            goldFunc(game,game.fruits[0]);
        },
        price: 3,
        image: 'lvlup_apple_gold', getFruit(game){return game.fruits[0];}
    },
    {
        name: "Gold Gruszka",
        descriptionfn(game){
            return goldDesc(game.fruits[1]);
        },
        effect(game){
            goldFunc(game,game.fruits[1]);
        },
        price: 3,
        image: 'lvlup_pear_gold', getFruit(game){return game.fruits[1];}
    },
    {
        name: "Gold Winogron",
        descriptionfn(game){
            return goldDesc(game.fruits[3]);
        },
        effect(game){
            goldFunc(game,game.fruits[3]);
        },
        price: 3,
        image: 'lvlup_grape_gold', getFruit(game){return game.fruits[3];}
    },
    {
        name: "Gold Ananas",
        descriptionfn(game){
            return goldDesc(game.fruits[2]);
        },
        effect(game){
            goldFunc(game,game.fruits[2]);
        },
        price: 3,
        image: 'lvlup_pineapple_gold', getFruit(game){return game.fruits[2];}
    },
    {
        name: "Gold Kokos",
        descriptionfn(game){
            return goldDesc(game.fruits[4]);
        },
        effect(game){
            goldFunc(game,game.fruits[4]);
        },
        price: 3,
        image: 'lvlup_coconut_gold', getFruit(game){return game.fruits[4];}
    }
];
const tarotCards = [
    /*{
      name: "Głupiec",
      descriptionfn(game){
        return `Daje ostatnią użytą kartę.`
      },
        canUse(){
            return true;
        },
        effect(){

        },
      price: 4,
      image: 'default',
    },*/
    {
        name: "Mag",
        descriptionfn(game){
            return `Zamienia szanse 2 losowych owoców.`;
        },
        effect(game){
            let index = Math.floor(Math.random()*game.fruits.length);
            let index2 = Math.floor(Math.random()*game.fruits.length);
            while(index==index2){
                index2 = Math.floor(Math.random()*game.fruits.length);
            }
            
            let fruit1 = game.fruits[index];
            const temp = fruit1;
            let fruit2 = game.fruits[index2];
            fruit1.props.percent = fruit2.props.percent;
            fruit2.props.percent = temp.props.percent;
        },
      price: 4,
      image: 'magician',
    },/*
    {
        name: "Arcykapłanka"
    },
    {
        name: "Cesarzowa",
        descriptionfn(game){
            return ``
        }
    },
    {
        name: "Cesarz",
        descriptionfn(game){
            return `Zmienia 10 kafelków na losowe ulepszone kafelki.`;
        }
    },
    {
        name: "Arcykapłan",
        descriptionfn(game){
            return `Daje 2 losowe karty tarota.`
        }
    },
    {
        name: "Kochankowie"
    },
    {
        name: "Powóz"
    },*/
    {
        name: "Siła",
        descriptionfn(game){
            return `Po użyciu daje ${Style.Mult('+10 Mult')}`;
        },
        effect(game){
            game.mult+=10;
            game.GameRenderer.displayTempScore();
        },
        canUse(game){
            return game.stage!=STAGES.Shop&&game.locked==false;
        },
        price: 4,
        image: "strength"
    },/*
    {
        name: "Pustelnik",
        descriptionfn(game){
            return `Daje tyle $, ile złotych kafelków na planszy. (max. $20)`;
        }
    },*/
    {
        name: "Fortuna",
        descriptionfn(game){
            return `${Style.Chance('1 na 4')} że ulepszenie dostaje bonusowe ${Style.Chance(MODIFIERS.Chip)}, lub ${Style.Chance(MODIFIERS.Mult)}`;
        },
        effect(game){
            if(Math.random()>=0.25){
                return;
            }
            let index = Math.floor(Math.random()*game.upgrades.length);
            let upgrade = game.upgrades[index];
            if(Math.random()<0.5){
                upgrade.modifier = MODIFIERS.Chip;
            }
            else{
                upgrade.modifier = MODIFIERS.Mult;
            }
            upgrade.addSpecial(game);
            game.GameRenderer.updateUpgrade(index);
        },
        price: 4,
        image: 'tarot_default',
    },
    /*{
        name: "Sprawiedliwość"
    },*/
    {
        name: "Szubieniczyk",
        descriptionfn(game){
            return `Niszczy 10 losowych kafelków na planszy.`;
        },
        effect(game) {
            let matches = [];
            let usedCoords = new Set(); // Przechowujemy klucze tekstowe (np. "2,5")
            let results = []; // Tablica wynikowa ze współrzędnymi

            while (results.length < 10) {
                let x = Math.floor(Math.random() * game.matrixsize);
                let y = Math.floor(Math.random() * game.matrixsize);
                let key = `${x},${y}`;

                if (!usedCoords.has(key)) {
                    usedCoords.add(key);
                    results.push({ x, y });
                }
            }

            // Mapujemy wyniki na format oczekiwany przez silnik (z danymi o owocu)
            matches = results.map(pos => ({
                x: pos.x,
                y: pos.y,
                fruit: game.board[pos.x][pos.y]
            }));

            // Przekazujemy tablicę obiektów do procesowania
            game.processMatches(matches);
        },
        canUse(game){
            return game.stage!=STAGES.Shop&&game.locked==false;
        },
      price: 4,
      image: 'tarot_default',
    },
    /*
    {
        name: "Śmierć"
    },
    {
        name: "Umiarkowanie"
    },
    {
        name: "Diabeł"
    },
    */{
        name: "Wieża",
        descriptionfn(game){
            return `${Style.Chance(`1 na 2`)} na losowanie szans wszystkich owoców.`;
        },
        effect(game){
            if(Math.random()>=0.5) return;
            let percent = 100;
            game.fruits.forEach(fruit => {
                const result = Math.random()*percent;
                fruit.props.percent = result;
                percent-=result;
            });
        },
      price: 4,
      image: 'tower',
    },
    {
        name: "Gwiazdy",
        descriptionfn(game){
            return `Niszczy losowy rząd i kolumnę na planszy.`;
        },
        effect(game) {
            let cords = {x: Math.floor(Math.random()*game.matrixsize),y: Math.floor(Math.random()*game.matrixsize)};
            let matches = [];
            for(var i=0;i<game.matrixsize;i++){
                matches.push({x:cords.x,y:i,fruit:game.board[cords.x][i]});
                matches.push({x:i,y:cords.y,fruit:game.board[i][cords.y]});
            }
            game.processMatches(matches);
        },
        canUse(game){
            return game.stage!=STAGES.Shop&&game.locked==false;
        },
      price: 4,
      image: 'tarot_default',
    },/*
    {
        name: "Księżyc"
    },
    {
        name: "Słońce"
    },
    {
        name: "Sędzia"
    },
    {
        name: "Świat"
    }
        */
    
]
function silverDesc(fruit){
    return `${Style.Chance(`+1.5%`)} szansa na Silver dla ${fruit.icon}`;
}
function silverFunc(game,fruit){
    game.fruits[game.fruits.indexOf(fruit)].props.upgrade.silverchance+=1.5;
}
function goldDesc(fruit){
    return `${Style.Chance(`+1%`)} szansa na Gold dla ${fruit.icon}`;
}
function goldFunc(game,fruit){
    game.fruits[game.fruits.indexOf(fruit)].props.upgrade.goldchance+=1;
}
function evildesc(fruit){
    if(fruit.props.percent-5<=0){
        return `${Style.Chance('-'+fruit.props.percent+'%')} ${Style.Chance(`+${game.calcEqualize(fruit.props.percent)}%`) } reszta`;
    }
    return `${Style.Chance('-5%')} dla ${fruit.icon} ${Style.Chance('+1.25%')} reszta`;
}
function evilfunc(game,fruit){
    if(fruit.props.percent-5<=0){
            game.equalizeChancesExcept(fruit);
            fruit.props.percent-=fruit.props.percent;
        }
        else{
            fruit.props.percent -= 5;
            game.addChancesExcept(fruit,1.25);
        }
}
const voucher = new Voucher({
    name: "Voucher",
    descriptionfn(game){
        return `Zwiększa miejsce na ulepszenia o 1. (Obecnie ${Style.Chance(game.maxUpgrades)} -> ${Style.Chance(game.maxUpgrades+1)})`
    },
    effect(game){
        game.maxUpgrades+=1;
        game.GameRenderer.displayUpgradesCounter();
        game.emit(GAME_TRIGGERS.onUpgradesChanged);
    },
    price: 10,
    image: 'coupon_plus1'
}
);
const overstock = new Voucher({
    name: "Overstock",
    descriptionfn(game) {
        // dynamiczny opis, by zawsze pokazywał aktualny stan sklepu
        const current = game.shopSize || 3; 
        return `Zwiększa miejsce na ulepszenia w sklepie o 1. (Obecnie ${Style.Chance(current)} -> ${Style.Chance(current + 1)})`;
    },
    effect(game) {
        game.overstock = true;
        game.shopSize = (game.shopSize || 3) + 1; // przykład aktualizacji stanu
    },
    price: 10,
    image: 'coupon_hand'
});

const movevoucher = new Voucher({
    name: "Moves",
    descriptionfn(game) {
        return `Zwiększa możliwe ruchy w rundzie o ${Style.Moves(`+1 ruch`)}`;
    },
    effect(game) {
        game.moves += 1;
        game.GameRenderer.displayMoves();
    },
    price: 10,
    image: 'default'
});

const percentageVoucher = new Voucher({
    name: "Power",
    descriptionfn(game) {
        return `Ulepszone karty pojawiają się ${Style.Chance(`X2`)} częściej`;
    },
    effect(game) {
        game.bonusPercentage.modifier += 0.05;
    },
    price: 10,
    image: 'default'
});

const consumableVoucher = new Voucher({
    name: "Voucher?",
    descriptionfn(game) {
        return `Zwiększa miejsce na ulepszenia kafelków o 1. (Obecnie ${Style.Chance(game.maxConsumables)} -> ${Style.Chance(game.maxConsumables + 1)})`;
    },
    effect(game) {
        game.maxConsumables += 1;
        game.GameRenderer.displayConsumablesCounter();
    },
    price: 10,
    image: 'default'
});
vouchers.push(voucher,overstock,movevoucher,percentageVoucher,consumableVoucher);
consumableBlueprints.push(...consumableLvlUp,...consumbaleEvil);
consumbaleEvil.forEach(consumable => {
    consumable.type = "Consumable";
    consumable.rarity = UPGRADE_RARITY_NAME.ConsumableCommon;
});
consumableLvlUp.forEach(consumable => {
    consumable.type = "Consumable";
    consumable.rarity = UPGRADE_RARITY_NAME.ConsumableCommon;
});
consumableBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
    consumable.rarity = UPGRADE_RARITY_NAME.ConsumableCommon;
});
consumableGoldBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
    consumable.rarity = UPGRADE_RARITY_NAME.ConsumableCommon;
});
consumableSilverBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
    consumable.rarity = UPGRADE_RARITY_NAME.ConsumableCommon;
});
consumableUpgradeBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
    consumable.rarity = UPGRADE_RARITY_NAME.ConsumableRare;
});
tarotCards.forEach(card => {
    card.type = "Tarot";
    card.rarity = UPGRADE_RARITY_NAME.ConsumableCommon;
});
pomumpackItems.push(...consumableBlueprints);
consumableList.push(...consumableBlueprints,...consumableGoldBlueprints,...consumableSilverBlueprints,...consumableUpgradeBlueprints,...tarotCards);
const pomumpackSmall = new ConsumablePack({
    name: "Pomumpack",
    descriptionfn() {
        return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`;
    },
    consumables: pomumpackItems,
    price: 4,
    props:{
maxSelect: 1, maxRoll: 3
    }
    , image: 'pomumpack' // Dodane domyślne wartości
});

const pomumpackBig = new ConsumablePack({
    name: "Poumpack BIG",
    descriptionfn() {
        return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`;
    },
    consumables: pomumpackItems,
    price: 6,
    props: {
        maxSelect: 1, maxRoll: 4
    }, image: 'pomumpackbig'
});

const pomumpackMega = new ConsumablePack({
    name: "Poumpack MEGA",
    descriptionfn() {
        return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`;
    },
    consumables: pomumpackItems,
    price: 8,
    props: {
        maxSelect: 2, maxRoll: 5
    }, image: 'pomumpackmega'
});

const pomumpackGold = new ConsumablePack({
    name: "Pomumpack GOLD",
    descriptionfn() {
        return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`;
    },
    consumables: consumableGoldBlueprints,
    price: 4,
    props: {
        maxSelect: 1, maxRoll: 3
    }, image: 'pomumpack_gold'
});

const pomumpackSilver = new ConsumablePack({
    name: "Pomumpack SILVER",
    descriptionfn() {
        return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`;
    },
    consumables: consumableSilverBlueprints,
    price: 4,
    props: {
        maxSelect: 1, maxRoll: 3
    }, 
    image: 'pomumpack_silver'
});

const pomumpackUpgrade = new ConsumablePack({
    name: "Pomumpack Upgrade",
    descriptionfn() {
        return `Znajdują się ${this.props.maxRoll} karty ulepszeń. Możesz wybrać maksymalnie ${this.props.maxSelect}`;
    },
    consumables: upgradesList,
    price: 4,
     props: {
        maxSelect: 1, maxRoll: 3
    },
     image: 'pomumpackupgrade' 
});

const tarotPack = new ConsumablePack({
    name: "Tarot Pack",
    descriptionfn() {
        return `Znajdują się ${this.props.maxRoll} karty tarota. Możesz wybrać maksymalnie ${this.props.maxSelect}`;
    },
    consumables: tarotCards,
    price: 4,
    props: {
        maxSelect: 1, maxRoll: 3
    },
    image: 'tarot_pack'
})
consumablePacks.push(pomumpackSmall);
consumablePacks.push(pomumpackBig);
consumablePacks.push(pomumpackMega);
consumablePacks.push(pomumpackGold,pomumpackSilver,pomumpackUpgrade,tarotPack);
