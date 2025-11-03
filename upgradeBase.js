import { GAME_TRIGGERS, MODIFIERS, SCORE_ACTIONS, UPGRADE_RARITY, UPGRADE_STATES } from "./dictionary.js";

export class Upgrade {
  constructor(name,descriptionfn, effect, remove, price = 2,props = {}) {
    this.name = name;
    this.descriptionfn = descriptionfn;
    this.effect = effect; // funkcja, która modyfikuje grę
    this.remove = remove; // funkcja cofająca efekt
    this.price = price;
    this.sellPrice = props.sellPrice ?? Math.round(price/2);
    this.active = true;
    this.bought = false;
    this.negative = false;
    this.type = "Upgrade";
    this.image = `./images/cards/${props.image ? props.image.toLowerCase() : name.toLowerCase()}.png`
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY.Common;
    this.modifier = MODIFIERS.None;
    this.specialFunc;
    this.props = {...props};
  }
  changeModifier(game,modifier){
    this.modifier = modifier;
    if(this.modifier==MODIFIERS.Mult){
      this.price+=2;
    }
    if(this.modifier==MODIFIERS.Chip){
      this.price+=1;
    }
    //playsound;
  }
  changeNegative(game,negative){
    this.negative = negative;
    if(this.negative){
      this.price+=5;
    }
    //playsound
  }
  addChip(game){
    game.tempscore+=50;
    game.GameRenderer.displayTempScore();
    return {state:UPGRADE_STATES.Score,message: `+50 pkt`,style: SCORE_ACTIONS.Score};
  }
  addMult(game){
    game.mult*=1.5;
    game.mult = Math.round(game.mult * 100) / 100;
    game.GameRenderer.displayTempScore();
    return {state:UPGRADE_STATES.Score,message: `X1.5 pkt`,style: SCORE_ACTIONS.Mult};
  }
  addSpecial(game){
    if(this.modifier==MODIFIERS.Chip){
      this.specialFunc = () => this.addChip(game);
    }
    else if(this.modifier==MODIFIERS.Mult){
      this.specialFunc= ()=> this.addMult(game);
    }
    //if(typeof this.specialFunc==="function")
      //game.on(GAME_TRIGGERS.onScore,this.specialFunc,this);
  }
  removeSpecial(game){
    this.specialFunc = null;
    this.modifier = MODIFIERS.None;
  }
  // inside Upgrade class
static CopyUpgrade(upgrade) {
  // shallow factory for a new instance of the correct subclass (props placeholder for now)
  const makeInstance = (propsPlaceholder) => {
    switch (upgrade.type) {
      case "Consumable":
        return new Consumable(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.price,
          propsPlaceholder
        );
      case "Voucher":
        return new Voucher(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.price,
          propsPlaceholder
        );
      case "ConsumablePack":
        return new ConsumablePack(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.consumables ? [...upgrade.consumables] : [],
          upgrade.price,
          propsPlaceholder
        );
      default:
        return new Upgrade(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.remove,
          upgrade.price,
          propsPlaceholder
        );
    }
  };

  // Helper: deep-copy data-only values (functions will be handled separately).
  const deepCopyData = (val) => {
    if (val === null || typeof val !== "object") return val;
    try {
      return JSON.parse(JSON.stringify(val));
    } catch {
      // fallback - shallow clone for weird objects
      if (Array.isArray(val)) return val.slice();
      const out = {};
      for (const k in val) out[k] = val[k];
      return out;
    }
  };

  // 1) Create a placeholder props object first so the constructor receives something.
  // We'll populate real props (with functions bound) after creating the instance.
  const placeholderProps = {};
  const newUpgrade = makeInstance(placeholderProps);

  // 2) Copy simple fields
  newUpgrade.sellPrice = upgrade.sellPrice;
  newUpgrade.active = upgrade.active;
  newUpgrade.bought = upgrade.bought;
  newUpgrade.image = upgrade.image;
  newUpgrade.rarity = upgrade.rarity;
  newUpgrade.modifier = upgrade.modifier;
  newUpgrade.negative = upgrade.negative;
  newUpgrade.type = upgrade.type;

  // 3) Build new props: copy data, preserve functions (bound to newUpgrade)
  const origProps = upgrade.props || {};
  const newProps = Array.isArray(origProps) ? [] : {};

  for (const key of Object.keys(origProps)) {
    const val = origProps[key];
    if (typeof val === "function") {
      // bind original function to the new upgrade instance
      // If original function references closure-local variables (rare), that can't be preserved.
      newProps[key] = val.bind(newUpgrade);
    } else {
      newProps[key] = deepCopyData(val);
    }
  }

  // 4) Assign the composed props object to the new upgrade (replace placeholder)
  newUpgrade.props = newProps;

  // 5) If constructors or prototype methods expect some derived/linked fields, copy them as needed
  // (you already copied basic meta fields above). If upgrade has arrays like consumables, copy those:
  if (upgrade.consumables) newUpgrade.consumables = [...upgrade.consumables];

  return newUpgrade;
}

  description(game){
    if (typeof this.descriptionfn === "function") {
      return this.descriptionfn.call(this,game);
    }
    return this.descriptionfn;
  }
  setProps(props) {
    this.props = {...props};
  }

  apply(game) {
    this.bought = true;
    if(this.negative==true){
      game.maxUpgrades+=1;
      game.GameRenderer.displayUpgradesCounter();
    }
    this.addSpecial(game);
    this.effect.call(this, game); // this wewnątrz effect wskazuje na instancję
  }

  sell(game) {
    this.bought = false;
    if(this.negative){
      game.maxUpgrades-=1;
      game.GameRenderer.displayUpgradesCounter();
    }
    this.remove.call(this, game); // this wewnątrz remove wskazuje na instancję
    this.removeSpecial(game);
    game.money += Math.floor(this.sellPrice);
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
        available = available.filter(c => 
          !game.upgrades.some(pu => pu.name === c.name)
        );
    }

    // Make a copy for shuffling
    const pool = [...available];

    // Fisher–Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(game.boosterRand() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Pick first 'count' items and create new instances
    const picked = pool.slice(0, count).map(c => {
      if(c.type=="Consumable"){
        return new Consumable(c.name, c.description, c.effect, c.price, c.props);
      }else if(c.type=="Upgrade"){
        let upgrade = new Upgrade(c.name,c.descriptionfn,c.effect,c.remove,c.price,c.props);
        if(game.shopRand() < 0.01){
          upgrade.changeNegative(game,true);
        }
        if(game.shopRand() < 0.2){
                if(game.shopRand()<0.5){
                    upgrade.changeModifier(game,MODIFIERS.Chip);
                }else{
                    upgrade.changeModifier(game,MODIFIERS.Mult);
                }
            }
        return upgrade;
      }
      return null;
    });
    console.log(picked);
    return picked;
}
}
export class Voucher extends Upgrade{
    constructor(name,descriptionfn,effect,price,props = {}){
        super(name,descriptionfn,effect,null,price,props);
        this.type = "Voucher";
    }
}
export class Consumable extends Upgrade{
    constructor(name,descriptionfn,effect,price,props = {}){
        super(name,descriptionfn,effect,null,price,props);
        this.type = "Consumable";
        this.image = `./images/consumables/${props.image ? props.image.toLowerCase() : 'default'}.png`
    }
    apply(game){
      this.bought = true;
      if(this.negative==true){
        game.maxConsumables+=1;
        game.GameRenderer.displayConsumablesCounter();
      }
        this.effect.call(this,game);
    }
    sell(game) {
    this.bought = false;
    if(this.modifier==true){
      game.maxConsumables-=1;
      game.GameRenderer.displayConsumablesCounter();
    }
    game.money += Math.floor(this.sellPrice);
  }
}