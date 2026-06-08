console.log("Voucher");
import { UpgradeBase } from "./upgradeBase.js";
import { UPGRADE_RARITY,SCORE_ACTIONS, Settings, LANGUAGE } from "../dictionary.js";
export class Voucher extends UpgradeBase {
  constructor(props = {}) {
    super(props);
    this.type = "Voucher";
    this.url = "./images/vouchers/";
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY.Voucher;
  }
  translation(){
      const lang = Settings.LANGUAGE || LANGUAGE.PL;
      return translations[lang]?.vouchers?.[this.id];
    }
  apply(game) {
    this.bought = true;
    this.props.effect.call(this, game);
    if (this.message) {
      this.UpgradeRenderer.createPopup(this.message.text, {style: this.message.style, translation: this.message?.translation ?? false});
    } else {
      this.UpgradeRenderer.createPopup("popups.used", {style:SCORE_ACTIONS.Info, translation: true});
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