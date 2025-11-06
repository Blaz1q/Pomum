import { Upgrade,Consumable,Voucher,ConsumablePack } from "./upgradeBase.js";
import { Style } from "./RenderUI.js";
import { upgradesList } from "./upgrade.js";
import { MODIFIERS } from "./dictionary.js";
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
consumableBlueprints.push(
    {
        name: "Jabłko",
        description(game) {
            return desc(game.fruits[0]);
        },
        effect(game) {
            add(game.fruits[0]);
        },
        price: 5,
        props: { image: "lvlup_apple", getFruit(game){return game.fruits[0];}
        }
    },
    {
        name: "Gruszka",
        description(game) {
            return desc(game.fruits[1]);
        },
        effect(game) {
            add(game.fruits[1]);
        },
        price: 5,
        props: { image: "lvlup_pear", getFruit(game){return game.fruits[1];} }
    },
    {
        name: "Ananas",
        description(game) {
            return desc(game.fruits[2]);
        },
        effect(game) {
            add(game.fruits[2]);
        },
        price: 5,
        props: { image: "lvlup_pineapple", getFruit(game){return game.fruits[2];} }
    },
    {
        name: "Winogron",
        description(game) {
            return desc(game.fruits[3]);
        },
        effect(game) {
            add(game.fruits[3]);
        },
        price: 5,
        props: { image: "lvlup_grape", getFruit(game){return game.fruits[3];} }
    },
    {
        name: "Kokos",
        description(game) {
            return desc(game.fruits[4]);
        },
        effect(game) {
            add(game.fruits[4]);
        },
        price: 5,
        props: { image: "lvlup_coconut", getFruit(game){return game.fruits[4];} }
    },
    {
        name: "EVIL Jabłko",
        description(game) {
            return evildesc(game.fruits[0], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[0]);
        },
        price: 5,
        props: { image: "devil_apple", getFruit(game){return game.fruits[0];} }
    },
    {
        name: "EVIL Gruszka",
        description(game) {
            return evildesc(game.fruits[1], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[1]);
        },
        price: 5,
        props: { image: "devil_pear", getFruit(game){return game.fruits[1];} }
    },
    {
        name: "EVIL Winogron",
        description(game) {
            return evildesc(game.fruits[3], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[3]);
        },
        price: 5,
        props: { image: "devil_grape", getFruit(game){return game.fruits[3];} }
    },
    {
        name: "EVIL Ananas",
        description(game) {
            return evildesc(game.fruits[2], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[2]);
        },
        price: 5,
        props: { image: "devil_pineapple", getFruit(game){return game.fruits[2];} }
    },
    {
        name: "EVIL Kokos",
        description(game) {
            return evildesc(game.fruits[4], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[4]);
        },
        price: 5,
        props: { image: "devil_coconut", getFruit(game){return game.fruits[4];} }
    }
);
const consumableSilverBlueprints = [
    {
        name: "Silver Jabłko",
        description(game){
            return silverDesc(game.fruits[0]);
        },
        effect(game){
            silverFunc(game,game.fruits[0]);
        },
        price: 8,
        props: {image: 'lvlup_apple_silver', getFruit(game){return game.fruits[0];}}
    },
    {
        name: "Silver Gruszka",
        description(game){
            return silverDesc(game.fruits[1]);
        },
        effect(game){
            silverFunc(game,game.fruits[1]);
        },
        price: 8,
        props: {image: 'lvlup_pear_silver', getFruit(game){return game.fruits[1];}}
    },
    {
        name: "Silver Winogron",
        description(game){
            return silverDesc(game.fruits[3]);
        },
        effect(game){
            silverFunc(game,game.fruits[3]);
        },
        price: 8,
        props: {image: 'lvlup_grape_silver', getFruit(game){return game.fruits[3];}}
    },
    {
        name: "Silver Ananas",
        description(game){
            return silverDesc(game.fruits[2]);
        },
        effect(game){
            silverFunc(game,game.fruits[2]);
        },
        price: 8,
        props: {image: 'lvlup_pineapple_silver', getFruit(game){return game.fruits[2];}}
    },
    {
        name: "Silver Kokos",
        description(game){
            return silverDesc(game.fruits[4]);
        },
        effect(game){
            silverFunc(game,game.fruits[4]);
        },
        price: 8,
        props: {image: 'lvlup_coconut_silver', getFruit(game){return game.fruits[4];}}
    }
];
const consumableUpgradeBlueprints = [
    {
        name: "Negative",
        description(game){
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
        },
        price: 8,
        props: {image: 'default'}
    },
    {
        name: "Copy",
        description(game){
            return "Kopiuje losowe ulepszenie, usuwa reszte.";
        },
        effect(game){
            if(game.upgrades.length==0) return;
            let index = Math.floor(Math.random()*game.upgrades.length);
            let copy = game.upgrades[index];
            let copyBp = upgradesList.filter(up => 
                up.name === copy.name
            )[0];
            //console.log(copyBp);
            let copyUpgrade = new Upgrade(copyBp.name,copyBp.descriptionfn,copyBp.effect,copyBp.remove,copyBp.price,copyBp.props);
            copyUpgrade.bought = true;
            copyUpgrade.modifier = copy.modifier;
            copyUpgrade.negative = copy.negative;
            copyUpgrade.props = JSON.parse(JSON.stringify(copy.props));
            copyUpgrade.apply(game);
            console.log(copy);
            console.log(copyUpgrade);
            game.upgrades.forEach(upgrade => {
                upgrade.remove(game);
            });
            game.upgrades = [];
            game.upgrades.push(copy,copyUpgrade);  
            game.GameRenderer.displayPlayerUpgrades();
            game.GameRenderer.displayUpgradesCounter();
        },
        price: 8,
        props: {image: 'default'}
    },
    {
        name: "Foiled",
        description(game){
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
        },
        price: 8,
        props: {image: 'default'}
    }
]
const consumableGoldBlueprints = [
    {
        name: "Gold Jabłko",
        description(game){
            return goldDesc(game.fruits[0]);
        },
        effect(game){
            goldFunc(game,game.fruits[0]);
        },
        price: 8,
        props: {image: 'lvlup_apple_gold', getFruit(game){return game.fruits[0];}}
    },
    {
        name: "Gold Gruszka",
        description(game){
            return goldDesc(game.fruits[1]);
        },
        effect(game){
            goldFunc(game,game.fruits[1]);
        },
        price: 8,
        props: {image: 'lvlup_pear_gold', getFruit(game){return game.fruits[1];}}
    },
    {
        name: "Gold Winogron",
        description(game){
            return goldDesc(game.fruits[3]);
        },
        effect(game){
            goldFunc(game,game.fruits[3]);
        },
        price: 8,
        props: {image: 'lvlup_grape_gold', getFruit(game){return game.fruits[3];}}
    },
    {
        name: "Gold Ananas",
        description(game){
            return goldDesc(game.fruits[2]);
        },
        effect(game){
            goldFunc(game,game.fruits[2]);
        },
        price: 8,
        props: {image: 'lvlup_pineapple_gold', getFruit(game){return game.fruits[2];}}
    },
    {
        name: "Silver Kokos",
        description(game){
            return goldDesc(game.fruits[4]);
        },
        effect(game){
            goldFunc(game,game.fruits[4]);
        },
        price: 8,
        props: {image: 'lvlup_coconut_gold', getFruit(game){return game.fruits[4];}}
    }
];
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
const voucher = new Voucher(
    "Voucher",
    function(game){
        return `Zwiększa miejsce na ulepszenia o 1. (Obecnie ${Style.Chance(game.maxUpgrades)} -> ${Style.Chance(game.maxUpgrades+1)})`
    }
    ,
    function (game){
        game.maxUpgrades+=1;
        game.GameRenderer.displayUpgradesCounter();
    },
    10,
    {image:'coupon_plus1'}
);
const overstock = new Voucher(
    "Overstock",
    `Ulepszenia owoców pojawiają się w sklepie!`,
    function(game){
        game.overstock = true;
    },
    10,{image: 'coupon_hand'}
);
const movevoucher = new Voucher(
    "Moves",
    `Zwiększa możliwe ruchy w rundzie o ${Style.Moves(`+1 ruch`)}`,
    function(game){
        game.moves+=1;
        game.GameRenderer.displayMoves();
    },
    10,{image: 'default'}
);
export function rollConsumablePacks(game,count = 2) {
  if (!consumablePacks.length) return [];

  // compute weights inversely proportional to price
  const weights = consumablePacks.map(pack => 1 / pack.price);

  const result = [];
  for (let n = 0; n < count; n++) {
    // sum of weights
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = game.boosterRand() * totalWeight;

    // pick based on weight
    let pickedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        pickedIndex = i;
        break;
      }
    }
    result.push(consumablePacks[pickedIndex]);
  }
  return result;
}
export function rollVouchers(game, count = 1) {
    if (!vouchers || vouchers.length === 0) return [];

    // Get names of already owned vouchers
    const ownedNames = new Set(game.coupons.map(v => v.name));

    // Filter out owned vouchers
    const available = vouchers.filter(v => !ownedNames.has(v.name));

    if (available.length === 0) return []; // player owns all vouchers

    // Shuffle and pick `count` vouchers
    const shuffled = [...available].sort(() => game.voucherRand() - 0.5);
    return shuffled.slice(0, count);
}
vouchers.push(voucher,overstock,movevoucher);
consumableBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
});
consumableGoldBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
});
consumableSilverBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
});
consumableUpgradeBlueprints.forEach(consumable => {
    consumable.type = "Consumable";
});
pomumpackItems.push(...consumableBlueprints);
consumableList.push(...consumableBlueprints,...consumableGoldBlueprints,...consumableSilverBlueprints,...consumableUpgradeBlueprints);
const pomumpackSmall = new ConsumablePack("Pomumpack",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,4);
const pomumpackBig = new ConsumablePack("Poumpack BIG",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,6,{maxSelect: 1,maxRoll: 4,image: 'pomumpackbig'});
const pomumpackMega = new ConsumablePack("Poumpack MEGA",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,8,{maxSelect: 2,maxRoll: 5,image: 'pomumpackmega'});

const pomumpackGold = new ConsumablePack("Pomumpack GOLD",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},consumableGoldBlueprints,4,{maxSelect: 1,maxRoll: 3,image: 'pomumpack_gold'});
const pomumpackSilver = new ConsumablePack("Pomumpack SILVER",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},consumableSilverBlueprints,4,{maxSelect: 1,maxRoll: 3,image: 'pomumpack_silver'});
const pomumpackUpgrade = new ConsumablePack("Pomumpack Upgrade",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń. Możesz wybrać maksymalnie ${this.props.maxSelect}`},upgradesList,4,{maxSelect: 1,maxRoll: 3,image: 'pomumpackupgrade'});
consumablePacks.push(pomumpackSmall);
consumablePacks.push(pomumpackBig);
consumablePacks.push(pomumpackMega);
consumablePacks.push(pomumpackGold,pomumpackSilver,pomumpackUpgrade);
