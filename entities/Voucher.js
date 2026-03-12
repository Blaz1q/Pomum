console.log("Voucher");
import { UpgradeBase } from "./upgradeBase.js";
import { UPGRADE_RARITY_NAME,SCORE_ACTIONS } from "../dictionary.js";
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
    if (this.message) {
      this.UpgradeRenderer.createPopup(this.message.text, this.message.style);
    } else {
      this.UpgradeRenderer.createPopup("Użyto!", SCORE_ACTIONS.Info);
    }
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