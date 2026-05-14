console.log("ConsumablePack");
import { UpgradeBase } from "./upgradeBase.js";
import { Consumable } from "./Consumable.js";
import { Tarot } from "./Tarot.js";
import { Upgrade } from "./Upgrade.js";
import { LANGUAGE, Settings, UPGRADE_RARITY } from "../dictionary.js";
export class ConsumablePack extends UpgradeBase {
  constructor(props = {}) {
    super(props);
    this.consumables = props.consumables;
    this.url = "./images/boosters/";
    this.type = "ConsumablePack";
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY.PomumPackCommon;
  }
  canBuy() {
    this.notEnoughMoney();
    return this.hasMoney(game);
  }
  hasSpace() {
    return true;
  }
  translation(){
      const lang = Settings.LANGUAGE || LANGUAGE.PL;
      return translations[lang]?.boosters?.[this.id];
    }
  roll(game) {
    // Start with all available consumables
    let count = this.props.maxRoll;
    let available = this.consumables;

    // Optional dedupe: exclude ones already owned
    if (game.upgradeDedupe) {
      available = available.filter(
        (c) => !game.consumables.some((pc) => pc._name === c.name),
      );
      available = available.filter(
        (c) => !game.upgrades.some((pu) => pu._name === c.name),
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
      if (c.type == "Consumable" || c.type=="Pact") {
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