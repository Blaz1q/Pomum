import { GAME_TRIGGERS, MODIFIERS, SCORE_ACTIONS, UPGRADE_RARITY, UPGRADE_RARITY_NAME, UPGRADE_STATES } from "./dictionary.js";
import { Roll } from "./roll.js";
import { upgradesList } from "./upgrade.js";

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
    this.isReady = false;
    this.type = "Upgrade";
    this.image = `./images/cards/${props.image ? props.image.toLowerCase() : name.toLowerCase()}.png`
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY_NAME.None;
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
    return {state:UPGRADE_STATES.Score,message: `X1.5 Mult`,style: SCORE_ACTIONS.Mult};
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
  static Copy(source){
      const buildCopy = (source) => {
      if (!source) return null;
      let copyUpgrade;
      switch (source.type) {
      case "Consumable":
        return new Consumable(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.price,
          upgrade?.props ?? {}
        );
      case "Voucher":
        return new Voucher(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.price,
          upgrade?.props ?? {}
        );
      case "ConsumablePack":
        return new ConsumablePack(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.consumables ? [...upgrade.consumables] : [],
          upgrade.price,
          upgrade?.props ?? {}
        );
      default:
        const copyBp = upgradesList.find(up => up.name === source.name);
        if (!copyBp) return null;
        copyUpgrade = new Upgrade(
        copyBp.name,
        copyBp.descriptionfn,
        copyBp.effect,
        copyBp.remove,
        copyBp.price,
        deepClone(copyBp.props ?? {})
      );
    }
    if (typeof copyUpgrade.effect === "function") {
      copyUpgrade.effect(game);
      console.log("applied");
    }
      for (const key in source.props) {
        const val = source.props[key];
        if (typeof val !== "function") {
          copyUpgrade.props[key] = deepClone(val);
        }
      }
      copyUpgrade.bought = true;
      console.log("BuildCopy:");
      console.log(copyUpgrade);
      copyUpgrade.negative = source.negative;
      copyUpgrade.sellPrice = source.sellPrice;
      copyUpgrade.active = source.active;
      copyUpgrade.bought = source.bought;
      copyUpgrade.image = source.image;
      copyUpgrade.rarity = source.rarity;
      copyUpgrade.modifier = source.modifier;
      copyUpgrade.type = source.type;
      return copyUpgrade;
    };
    
    // --- Helper: Deep clone supporting Set, Map, Array, Object ---
    function deepClone(obj, visited = new WeakMap()) {
      if (obj === null || typeof obj !== "object") return obj;
      if (visited.has(obj)) return visited.get(obj);
    
      if (obj instanceof Set) {
        const newSet = new Set();
        visited.set(obj, newSet);
        for (const item of obj) newSet.add(deepClone(item, visited));
        return newSet;
      }
    
      if (obj instanceof Map) {
        const newMap = new Map();
        visited.set(obj, newMap);
        for (const [k, v] of obj) newMap.set(deepClone(k, visited), deepClone(v, visited));
        return newMap;
      }
    
      if (Array.isArray(obj)) {
        const arr = [];
        visited.set(obj, arr);
        for (const item of obj) arr.push(deepClone(item, visited));
        return arr;
      }
    
      const cloned = {};
      visited.set(obj, cloned);
      for (const key in obj) {
        cloned[key] = deepClone(obj[key], visited);
      }
      return cloned;
    }
    return buildCopy(source);
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
        this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY_NAME.Common;
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
        game.roll.Modifier(upgrade,{negative: 0.0025,modifier:0.015});
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
      console.log(this);
      if(this.negative==true){
        game.maxConsumables-=1;
        game.GameRenderer.displayConsumablesCounter();
      }
        this.effect.call(this,game);
    }
    sell(game) {
    this.bought = false;
    if(this.negative==true){
      game.maxConsumables-=1;
      game.GameRenderer.displayConsumablesCounter();
    }
    game.money += Math.floor(this.sellPrice);
  }
}