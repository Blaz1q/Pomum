import { GAME_TRIGGERS, MODIFIERS, UPGRADE_RARITY, UPGRADE_STATES } from "./dictionary.js";

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
  addChip(game){
    game.tempscore+=50;
    game.GameRenderer.displayTempScore();
    return UPGRADE_STATES.Score;
  }
  addMult(game){
    game.mult+=5;
    game.GameRenderer.displayTempScore();
    return UPGRADE_STATES.Score;
  }
  addSpecial(game){
    if(this.modifier==MODIFIERS.Chip){
      this.specialFunc = () => this.addChip(game);
    }
    else if(this.modifier==MODIFIERS.Mult){
      this.specialFunc= ()=> this.addMult(game);
    }
    if(typeof this.specialFunc==="function")
      game.on(GAME_TRIGGERS.onScore,this.specialFunc,this);
  }
  removeSpecial(game){
    if(typeof this.specialFunc!=="function") return;
    Upgrade.removeTrigger(game,GAME_TRIGGERS.onScore,this.specialFunc,this);
    this.modifier = MODIFIERS.None;
  }
  static removeTrigger(game, trigger, triggeredFunction, upgrade) {
    game.triggers[trigger] = game.triggers[trigger].filter(
      h => !(h.handler === triggeredFunction && h.upgrade === upgrade)
    );
  }
  static addUpgradeTriggers(game, upgrade) {
    if (!upgrade.props) return;
    for (const [propName, fn] of Object.entries(upgrade.props)) {
      if (typeof fn === "function" && GAME_TRIGGERS[propName]) {
        game.on(GAME_TRIGGERS[propName], fn, upgrade);
      }
    }
  }
  static CopyUpgrade(upgrade) {
    // Deep clone the props to avoid reference sharing
    const clonedProps = JSON.parse(JSON.stringify(upgrade.props));

    // Determine the correct subclass type
    let newUpgrade;
    switch (upgrade.type) {
      case "Consumable":
        newUpgrade = new Consumable(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.price,
          clonedProps
        );
        break;
      case "Voucher":
        newUpgrade = new Voucher(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.price,
          clonedProps
        );
        break;
      case "ConsumablePack":
        newUpgrade = new ConsumablePack(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.consumables ? [...upgrade.consumables] : [],
          upgrade.price,
          clonedProps
        );
        break;
      default:
        newUpgrade = new Upgrade(
          upgrade.name,
          upgrade.descriptionfn,
          upgrade.effect,
          upgrade.remove,
          upgrade.price,
          clonedProps
        );
        break;
    }

    // Copy over simple fields
    newUpgrade.sellPrice = upgrade.sellPrice;
    newUpgrade.active = upgrade.active;
    newUpgrade.bought = upgrade.bought;
    newUpgrade.image = upgrade.image;
    newUpgrade.rarity = upgrade.rarity;
    newUpgrade.modifier = upgrade.modifier;
    newUpgrade.negative = upgrade.negative;
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
    this.effect.call(this, game); // this wewnątrz effect wskazuje na instancję
  }

  sell(game) {
    this.bought = false;
    if(this.modifier==true){
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
        if(game.shopRand() < 0.0075){
          upgrade.modifier = MODIFIERS.Negative;
          if(game.shopRand() < 0.05){
                if(game.shopRand()<0.5){
                    upgrade.modifier=MODIFIERS.Chip;
                }else{
                    upgrade.modifier=MODIFIERS.Mult;
                }
            }
        }
        return new Upgrade(c.name,c.descriptionfn,c.effect,c.remove,c.price,c.props);
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
        this.effect.call(this,game);
    }
}