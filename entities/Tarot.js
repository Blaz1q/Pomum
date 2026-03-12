console.log("Tarot");
import { Consumable } from "./Consumable.js";

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