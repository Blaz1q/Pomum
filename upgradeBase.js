export class Upgrade {
  constructor(name,descriptionfn, effect, remove, price = 2,props = {}) {
    this.name = name;
    this.descriptionfn = descriptionfn;
    this.effect = effect; // funkcja, która modyfikuje grę
    this.remove = remove; // funkcja cofająca efekt
    this.price = price;
    this.type = "Upgrade";
    this.image = `./images/cards/${props.image ? props.image.toLowerCase() : name.toLowerCase()}.png`
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
    this.props = props;
  }

  apply(game) {
    this.effect.call(this, game); // this wewnątrz effect wskazuje na instancję
  }

  sell(game) {
    this.remove.call(this, game); // this wewnątrz remove wskazuje na instancję
    game.money += Math.floor(this.price/2);
  }
}