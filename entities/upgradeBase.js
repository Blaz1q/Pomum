console.log("UpgradeBase");
import {
  GAME_TRIGGERS,
  LANGUAGE,
  MODIFIERS,
  PRIORITY,
  SCORE_ACTIONS,
  Settings,
  STAGES,
  UPGRADE_RARITY,
  UPGRADE_STATES,
} from "../dictionary.js";
import { translations } from "../entityData/translations.js";
import { UpgradeRenderer } from "../UI/upgradeRenderer.js";

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
    this.priority = props.priority ?? PRIORITY.NORMAL;
    this.image = () => {
      return `${this.url}${props.image ? props.image.toLowerCase() : this._name?.toLowerCase()}.png`;
    };
    this.UpgradeRenderer = null;
    this.id = props.id || props.name?.toLowerCase().replace(/\s/g,'');
  }
  set name(value){
    this._name = value;
  }
  get name(){
    const translationEntry = this.translation();
    if(translationEntry){
      return translationEntry.name;
    }
    return this._name || "Missing name";
  }
  canBuy(game) {
    throw new Error("Method canBuy must be implemented.");
  }
  canSell(game){
    return true;
  }
  hasMoney(game) {
    return this.price <= game.money + game.minMoney;
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
  translation(){
    const lang = Settings.LANGUAGE || LANGUAGE.PL;
    return translations[lang]?.upgrades?.[this.id];
  }
  description(game) {
    // console.log(lang);
    // console.log(translations);
    // console.log(this.id);
    const translationEntry = this.translation(game);
    //console.log(translationEntry);
    if (translationEntry && typeof translationEntry.description === 'function') {
      return translationEntry.description({game: game,upgrade: this});
    }
    if(translationEntry){
      return translationEntry.description;
    }
    if (typeof this.descriptionfn === "function") {
      return this.descriptionfn.call(this, game);
    }
    return this.descriptionfn || "Missing description";
  }
  checkChance(game) {
    let chance = this.props.chance ?? 1;
    let max = this.props.max ?? 1;
    let bonusChance = game.bonusChance ?? 0;
    let finalChance = chance + bonusChance;
    if (finalChance >= max) return true;
    const probability = finalChance / max;
    // Losujemy i sprawdzamy, czy mieści się w prawdopodobieństwie
    return Math.random() < probability;
  }
  apply(game) {
    throw new Error("Method apply must be implemented.");
  }
  getIndex(game){
    throw new Error("Method getIndex must be implemented.");
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