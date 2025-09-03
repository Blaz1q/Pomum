import { Upgrade } from "./upgradeBase.js";
import { Style } from "./RenderUI.js";
export const consumableList = [];
export const consumablePacks = [];
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
    roll(count = this.props.maxRoll){
        const shuffled = this.consumables.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
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
    fruit.level+=2;
}
const apple = new Consumable(
    "Jabłko",
    function(game){
        const fruit = game.fruits[0];
        return desc(fruit);
    },
    function(game){
        const fruit = game.fruits[0].props.upgrade;
        add(fruit);
    },
    5,{image: "lvlup_apple"}
);
const pear = new Consumable(
    "Gruszka",
    function(game){
        const fruit = game.fruits[1];
        return desc(fruit);
    },
    function(game){
        const fruit = game.fruits[1].props.upgrade;
        add(fruit);
    },
    5,{image: "lvlup_pear"}
);
const pineapple = new Consumable(
    "Ananas",
    function(game){
        const fruit = game.fruits[2];
        return desc(fruit);
    },
    function(game){
        const fruit = game.fruits[2].props.upgrade;
        add(fruit);
    },
    5,{image: "lvlup_pineapple"}
);
const grape = new Consumable(
    "Winogron",
    function(game){
        const fruit = game.fruits[3];
        return desc(fruit);
    },
    function(game){
        const fruit = game.fruits[3].props.upgrade;
        add(fruit);
    },
    5,{image: "lvlup_grape"}
);
const coconut = new Consumable(
    "Kokos",
    function(game){
        const fruit = game.fruits[4];
        return desc(fruit);
    },
    function(game){
        const fruit = game.fruits[4].props.upgrade;
        add(fruit);
    },
    5,{image: "lvlup_coconut"}
);
const voucher = new Consumable(
    "Voucher",`Zwiększa upgrade slot o 1`,function (game){
        game.maxUpgrades+=1;
        game.GameRenderer.displayUpgradesCounter();
    },
    10,{image:'metalplate'}
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

const pomumpackSmall = new ConsumablePack("Pomumpack",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},[apple,pear,grape,coconut,pineapple],4);
const pomumpackBig = new ConsumablePack("Poumpack BIG",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},[apple,pear,grape,coconut,pineapple],6,{maxSelect: 1,maxRoll: 4,image: 'pomumpackbig'});
const pomumpackMega = new ConsumablePack("Poumpack MEGA",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},[apple,pear,grape,coconut,pineapple],8,{maxSelect: 2,maxRoll: 5,image: 'pomumpackmega'});
consumablePacks.push(pomumpackSmall);
consumablePacks.push(pomumpackBig);
consumablePacks.push(pomumpackMega);
consumableList.push(apple);