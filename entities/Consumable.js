console.log("Consumable");
import { UpgradeBase } from "./upgradeBase.js";
import { SCORE_ACTIONS } from "../dictionary.js";
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