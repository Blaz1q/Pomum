import {
  GAME_TRIGGERS,
  MODIFIERS,
  SCORE_ACTIONS,
  STAGES,
  UPGRADE_RARITY,
  UPGRADE_RARITY_NAME,
  UPGRADE_STATES,
} from "./dictionary.js";
import { Roll } from "./roll.js";
import { upgradesList } from "./upgrade.js";
import { UpgradeRenderer } from "./upgradeRenderer.js";

export class UpgradeBase {
  constructor(props = {}) {
    const rawProps =
      typeof props.props === "function" ? props.props() : props.props;

    // 2. Gwarancja, że this.props to zawsze obiekt
    this.props = rawProps || {};
    if (props.effect) {
      this.props.effect = props.effect;
    }

    if (props.remove) {
      this.props.remove = props.remove;
    }

    this.name = props.name;
    this.descriptionfn = props.descriptionfn;
    this.price = props.price;
    this.sellPrice = props.sellPrice ?? Math.round(props.price / 2);
    this.modifier = MODIFIERS.None;
    this.specialFunc;
    this.rarity = UPGRADE_RARITY.Common;
    this.url = "./unknown/url/";
    this.type = "unknown";
    this.wrapper = null;
    this.image = () => {
      return `${this.url}${props.image ? props.image.toLowerCase() : this.name?.toLowerCase()}.png`;
    };
    this.UpgradeRenderer = null;
  }
  canBuy(game) {
    throw new Error("Method canBuy must be implemented.");
  }
  hasMoney(game) {
    return this.price <= game.money;
  }
  notEnoughMoney() {
    if (this.hasMoney(game) == false) {
      console.log("not enough money");
      game.GameRenderer.notEnoughMoney();
    }
  }
  hasSpace(game) {
    throw new Error("Method hasSpace must be implemented.");
  }
  description(game) {
    if (typeof this.descriptionfn === "function") {
      return this.descriptionfn.call(this, game);
    }
    return this.descriptionfn;
  }
  apply(game) {
    throw new Error("Method apply must be implemented.");
  }
  sell(game) {
    throw new Error("Method sell must be implemented.");
  }
  static Copy(source) {
    throw new Error("Copy method must be implemented.");
  }
  initRenderer(game) {
    this.UpgradeRenderer = new UpgradeRenderer(this, game.GameRenderer);
  }
}

export class Upgrade extends UpgradeBase {
  constructor(props = {}) {
    super(props);
    this.active = true;
    this.bought = false;
    this.negative = false;
    this.isReady = false;
    this.type = "Upgrade";
    this.url = "./images/cards/";
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY_NAME.None;
    this.specialFunc;
  }
  changeModifier(game, modifier) {
    this.modifier = modifier;
    if (this.modifier == MODIFIERS.Mult) {
      this.price += 2;
    }
    if (this.modifier == MODIFIERS.Chip) {
      this.price += 1;
    }
    //playsound;
  }
  changeNegative(game, negative) {
    this.negative = negative;
    if (this.negative) {
      this.price += 5;
    }
    //playsound
  }
  addChip(game) {
    game.tempscore += 50;
    game.GameRenderer.displayTempScore();
    return {
      state: UPGRADE_STATES.Score,
      message: `+50 pkt`,
      style: SCORE_ACTIONS.Score,
    };
  }
  addMult(game) {
    game.mult *= 1.5;
    game.mult = Math.round(game.mult * 100) / 100;
    game.GameRenderer.displayTempScore();
    return {
      state: UPGRADE_STATES.Score,
      message: `X1.5 Mult`,
      style: SCORE_ACTIONS.Mult,
    };
  }
  hasSpace(game) {
    let space = game.upgrades.length < game.maxUpgrades || this.negative;

    return space;
  }
  canBuy(game) {
    this.notEnoughMoney();
    if (this.hasSpace(game) == false) {
      console.log("not enough upgrade space");
      game.GameRenderer.notEnoughSpace(
        document.getElementById("player-upgrades-container"),
      );
    }
    return this.hasMoney(game) && this.hasSpace(game);
  }
  addSpecial(game) {
    if (this.modifier == MODIFIERS.Chip) {
      this.specialFunc = () => this.addChip(game);
    } else if (this.modifier == MODIFIERS.Mult) {
      this.specialFunc = () => this.addMult(game);
    }
    //if(typeof this.specialFunc==="function")
    //game.on(GAME_TRIGGERS.onScore,this.specialFunc,this);
  }
  removeSpecial(game) {
    this.specialFunc = null;
    this.modifier = MODIFIERS.None;
  }
  // inside Upgrade class
  static Copy(source) {
    const buildCopy = (source) => {
      if (!source) return null;
      let copyUpgrade;
      switch (source.type) {
        case "Consumable":
          return new Consumable(upgrade);
        case "Voucher":
          return new Voucher(upgrade);
        case "ConsumablePack":
          return new ConsumablePack(upgrade);
        default:
          const copyBp = upgradesList.find((up) => up.name === source.name);
          if (!copyBp) return null;
          copyUpgrade = new Upgrade(copyBp);
      }
      if (typeof copyUpgrade.props?.effect === "function") {
        copyUpgrade.props?.effect.call(this, game);
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
        for (const [k, v] of obj)
          newMap.set(deepClone(k, visited), deepClone(v, visited));
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
  description(game) {
    if (typeof this.descriptionfn === "function") {
      return this.descriptionfn.call(this, game);
    }
    return this.descriptionfn;
  }
  apply(game) {
    this.bought = true;
    if (this.negative == true) {
      game.maxUpgrades += 1;
      game.GameRenderer.displayUpgradesCounter();
    }

    this.addSpecial(game);
    this.props?.effect?.call(this, game);
    //this.effect?.call(this, game); // this wewnątrz effect wskazuje na instancję
  }

  sell(game) {
    this.bought = false;
    if (this.negative) {
      game.maxUpgrades -= 1;
      game.GameRenderer.displayUpgradesCounter();
    }
    this.props?.remove?.call(this, game);
    //this.remove.call(this, game); // this wewnątrz remove wskazuje na instancję
    this.removeSpecial(game);
    game.money += Math.floor(this.sellPrice);
  }
}
export class ConsumablePack extends UpgradeBase {
  constructor(props = {}) {
    super(props);
    this.consumables = props.consumables;
    this.url = "./images/boosters/";
    this.type = "ConsumablePack";
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY_NAME.Common;
  }
  canBuy() {
    this.notEnoughMoney();
    return this.hasMoney(game);
  }
  hasSpace() {
    return true;
  }
  roll(game) {
    // Start with all available consumables
    let count = this.props.maxRoll;
    let available = this.consumables;

    // Optional dedupe: exclude ones already owned
    if (game.upgradeDedupe) {
      available = available.filter(
        (c) => !game.consumables.some((pc) => pc.name === c.name),
      );
      available = available.filter(
        (c) => !game.upgrades.some((pu) => pu.name === c.name),
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
    const picked = pool.slice(0, count).map((c) => {
      if (c.type == "Consumable") {
        return new Consumable(c);
      } else if (c.type == "Upgrade") {
        let upgrade = new Upgrade(c);
        game.roll.Modifier(upgrade, { negative: 0.0025, modifier: 0.015 });
        return upgrade;
      } else if (c.type == "Tarot") {
        return new Tarot(c);
      }
      return null;
    });
    console.log(picked);
    return picked;
  }
}
export class Voucher extends UpgradeBase {
  constructor(props = {}) {
    super(props);
    this.type = "Voucher";
    this.url = "./images/vouchers/";
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY_NAME.None;
  }
  apply(game) {
    this.bought = true;
    this.props.effect.call(this, game);
    //this.effect?.call(this, game); // this wewnątrz effect wskazuje na instancję
  }
  hasSpace() {
    return true;
  }
  canBuy() {
    this.notEnoughMoney();
    return this.hasMoney(game);
  }
}
export class Consumable extends UpgradeBase {
  constructor(props = {}) {
    super(props);
    this.type = "Consumable";
    this.url = "./images/consumables/";
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY_NAME.None;
    this.negative = false;
  }
  apply(game) {
    this.bought = true;
    console.log(this);
    if (this.negative == true) {
      game.maxConsumables -= 1;
      game.GameRenderer.displayConsumablesCounter();
    }
    this.props?.effect?.call(this, game);
    if (this.message) {
      this.UpgradeRenderer.createPopup(this.message.text, this.message.style);
    } else {
      this.UpgradeRenderer.createPopup("Użyto!", SCORE_ACTIONS.Info);
    }
  }
  hasSpace(game) {
    let space = game.consumables.length < game.maxConsumables || this.negative;

    return space;
  }
  canBuy(game) {
    this.notEnoughMoney();
    if (this.hasSpace(game) == false) {
      console.log("not enough consumable space");
      game.GameRenderer.notEnoughSpace(
        document.getElementById("player-consumables-container"),
      );
    }
    return this.hasMoney(game) && this.hasSpace(game);
  }
  canUse(game) {
    return true;
  }
  sell(game) {
    this.bought = false;
    if (this.negative == true) {
      game.maxConsumables -= 1;
      game.GameRenderer.displayConsumablesCounter();
    }
    game.money += Math.floor(this.sellPrice);
  }
}
export class Tarot extends Consumable {
  constructor(props = {}) {
    super(props);
    this.type = "Tarot";
    this.props.canUse = props?.canUse;
  }
  canUse(game) {
    return this.props?.canUse?.call(this, game) ?? true;
  }
}