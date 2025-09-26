import { UPGRADE_RARITY } from "./dictionary.js";

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
    this.type = "Upgrade";
    this.image = `./images/cards/${props.image ? props.image.toLowerCase() : name.toLowerCase()}.png`
    this.rarity = props.rarity ? props.rarity : UPGRADE_RARITY.Common;
    this.props = {
      ...props
    };
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
    this.effect.call(this, game); // this wewnątrz effect wskazuje na instancję
  }

  sell(game) {
    this.bought = false;
    this.remove.call(this, game); // this wewnątrz remove wskazuje na instancję
    game.money += Math.floor(this.sellPrice);
  }
}