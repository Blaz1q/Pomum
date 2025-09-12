import { Upgrade } from "./upgradeBase.js";
import { Style } from "./RenderUI.js";
export const consumableList = [];
export const consumablePacks = [];
export const vouchers = [];
const pomumpackItems = [];
export class Voucher extends Upgrade{
    constructor(name,descriptionfn,effect,price,props = {}){
        super(name,descriptionfn,effect,null,price,props);
        this.type = "Voucher";
    }
}
export class ConsumablePack extends Upgrade{
    constructor(name,descriptionfn,consumables,price,props = {}){
        super(name, descriptionfn, null, null, price, props);
        this.consumables = consumables;
        this.type = "ConsumablePack";
        this.props = {
            maxSelect: props.maxSelect ?? 1,
            maxRoll: props.maxRoll ?? 3,
            ...props
        }
    }
    roll(game) {
    // Start with all available consumables
    let count = this.props.maxRoll
    let available = this.consumables;

    // Optional dedupe: exclude ones already owned
    if (game.upgradeDedupe) {
        available = available.filter(c => 
            !game.consumables.some(pc => pc.name === c.name)
        );
    }

    // Make a copy for shuffling
    const pool = [...available];

    // Fisher–Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Pick first 'count' items and create new instances
    const picked = pool.slice(0, count).map(c =>
        new Consumable(c.name, c.description, c.effect, c.price, c.props)
    );
    return picked;
}
}
export class Consumable extends Upgrade{
    constructor(name,descriptionfn,effect,price,props = {}){
        super(name,descriptionfn,effect,null,price,props);
        this.type = "Consumable";
    }
    apply(game){
        this.effect.call(this,game);
    }
}
function desc(fruit){
    return `daje ${Style.Score('+2 punkty')}, ${Style.Mult('+0.4 mult')} do ${fruit.icon}, obecnie ${ Style.Score('+'+fruit.props.upgrade.score+' punktów') }, ${Style.Mult('+'+fruit.props.upgrade.mult+' mult')}`;
}
function add(fruit){
    fruit.score+=1;
    fruit.mult+=0.4;
    fruit.mult=Math.round(fruit.mult * 100) / 100;
    fruit.level+=1;
}
const consumableBlueprints = [];
consumableBlueprints.push(
    {
        name: "Jabłko",
        description(game) {
            return desc(game.fruits[0]);
        },
        effect(game) {
            add(game.fruits[0].props.upgrade);
        },
        price: 5,
        props: { image: "lvlup_apple" }
    },
    {
        name: "Gruszka",
        description(game) {
            return desc(game.fruits[1]);
        },
        effect(game) {
            add(game.fruits[1].props.upgrade);
        },
        price: 5,
        props: { image: "lvlup_pear" }
    },
    {
        name: "Ananas",
        description(game) {
            return desc(game.fruits[2]);
        },
        effect(game) {
            add(game.fruits[2].props.upgrade);
        },
        price: 5,
        props: { image: "lvlup_pineapple" }
    },
    {
        name: "Winogron",
        description(game) {
            return desc(game.fruits[3]);
        },
        effect(game) {
            add(game.fruits[3].props.upgrade);
        },
        price: 5,
        props: { image: "lvlup_grape" }
    },
    {
        name: "Kokos",
        description(game) {
            return desc(game.fruits[4]);
        },
        effect(game) {
            add(game.fruits[4].props.upgrade);
        },
        price: 5,
        props: { image: "lvlup_coconut" }
    },
    {
        name: "Bad Apple",
        description(game) {
            return evildesc(game.fruits[0], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[0]);
        },
        price: 5,
        props: { image: "devil_apple" }
    },
    {
        name: "p-bear?",
        description(game) {
            return evildesc(game.fruits[1], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[1]);
        },
        price: 5,
        props: { image: "devil_pear" }
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
        props: { image: "devil_grape" }
    },
    {
        name: "Toxic pineapple",
        description(game) {
            return evildesc(game.fruits[2], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[2]);
        },
        price: 5,
        props: { image: "devil_pineapple" }
    },
    {
        name: "Coconut Granade",
        description(game) {
            return evildesc(game.fruits[4], game);
        },
        effect(game) {
            evilfunc(game, game.fruits[4]);
        },
        price: 5,
        props: { image: "devil_coconut" }
    }
);
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
    `Zwiększa upgrade slot o 1`,
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
export function rollConsumablePacks(count = 2) {
  if (!consumablePacks.length) return [];

  // compute weights inversely proportional to price
  const weights = consumablePacks.map(pack => 1 / pack.price);

  const result = [];
  for (let n = 0; n < count; n++) {
    // sum of weights
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;

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
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
vouchers.push(voucher,overstock);
pomumpackItems.push(...consumableBlueprints);
consumableList.push(...consumableBlueprints);
const pomumpackSmall = new ConsumablePack("Pomumpack",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,4);
const pomumpackBig = new ConsumablePack("Poumpack BIG",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,6,{maxSelect: 1,maxRoll: 4,image: 'pomumpackbig'});
const pomumpackMega = new ConsumablePack("Poumpack MEGA",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,8,{maxSelect: 2,maxRoll: 5,image: 'pomumpackmega'});
consumablePacks.push(pomumpackSmall);
consumablePacks.push(pomumpackBig);
consumablePacks.push(pomumpackMega);
