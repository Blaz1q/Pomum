import { Upgrade } from "./upgradeBase.js";
import { Style } from "./RenderUI.js";
export const consumableList = [];
export const consumablePacks = [];
export const vouchers = [];
const pomumpackItems = [];
export class Voucher extends Upgrade{
    constructor(name,descriptionfn,effect,price,props = {}){
        super(name,descriptionfn,effect,price,props);
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
    fruit.level+=1;
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
const badapple = new Consumable(
    "Bad Apple",
    function(game){
        return evildesc(game.fruits[0]);
    },
    function(game){
        evilfunc(game,game.fruits[0]);
    },5,{image: "devil_apple"}
);
const pbear = new Consumable(
    "p-bear?",
    function(game){
        return evildesc(game.fruits[1]);
    },
    function(game){
        evilfunc(game,game.fruits[1]);
    },5,{image: "devil_pear"}
);
const winogronevil = new Consumable(
    "EVIL Winogron",
    function(game){
        return evildesc(game.fruits[3]);
    },
    function(game){
        evilfunc(game,game.fruits[3]);
    },5,{image: "devil_grape"}
);
const toxicpineapple = new Consumable(
    "Toxic pineapple",
    function(game){
        return evildesc(game.fruits[2]);
    },
    function(game){
        evilfunc(game,game.fruits[2]);
    },5,{image: "devil_pineapple"}
);
const coconutGranade = new Consumable(
    "Coconut Granade",
    function(game){
        return evildesc(game.fruits[4]);
    },
    function(game){
        evilfunc(game,game.fruits[4]);
    },5,{image: "devil_coconut"}
);
const voucher = new Voucher(
    "Voucher",
    `Zwiększa upgrade slot o 1`,
    function (game){
        game.maxUpgrades+=1;
        game.GameRenderer.displayUpgradesCounter();
    },
    10,
    {image:'metalplate'}
);
const overstock = new Voucher(
    "Overstock",
    `Ulepszenia owoców pojawiają się w sklepie!`,
    function(game){
        game.overstock = true;
    },
    10,{image: 'default'}
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
vouchers.push(voucher,overstock);
pomumpackItems.push(apple,pear,grape,coconut,pineapple,badapple,pbear,winogronevil,toxicpineapple,coconutGranade);
consumableList.push(apple,pear,grape,coconut,pineapple,badapple,pbear,winogronevil,toxicpineapple,coconutGranade);
const pomumpackSmall = new ConsumablePack("Pomumpack",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,4);
const pomumpackBig = new ConsumablePack("Poumpack BIG",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,6,{maxSelect: 1,maxRoll: 4,image: 'pomumpackbig'});
const pomumpackMega = new ConsumablePack("Poumpack MEGA",function(){return `Znajdują się ${this.props.maxRoll} karty ulepszeń kafelków. Możesz wybrać maksymalnie ${this.props.maxSelect}`},pomumpackItems,8,{maxSelect: 2,maxRoll: 5,image: 'pomumpackmega'});
consumablePacks.push(pomumpackSmall);
consumablePacks.push(pomumpackBig);
consumablePacks.push(pomumpackMega);
