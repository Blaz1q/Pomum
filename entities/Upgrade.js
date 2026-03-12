console.log("Upgrade");
import { UpgradeBase } from "./upgradeBase.js";
import { MODIFIERS,SCORE_ACTIONS,UPGRADE_STATES, } from "../dictionary.js";
import { Consumable } from "./Consumable.js";
import { Voucher } from "./Voucher.js";
import { ConsumablePack } from "./ConsumablePack.js";
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
      // if (typeof copyUpgrade.props?.effect === "function") {
      //   copyUpgrade.props?.effect.call(this, game);
      //   console.log("applied");
      // }
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
  reset(){
    this.props?.reset?.call(this,game);
    this.isExhausted = false;
  }
  remove(game){
     this.bought = false;
    if (this.negative) {
      game.maxUpgrades -= 1;
      game.GameRenderer.displayUpgradesCounter();
    }
    this.props?.remove?.call(this, game);
  }
  sell(game) {
    this.bought = false;
    this.remove(game);
    //this.remove.call(this, game); // this wewnątrz remove wskazuje na instancję
    this.removeSpecial(game);
    game.money += Math.floor(this.sellPrice);
  }
}