import { Game } from "./main.js";
import { Tile } from "./Tile.js";
import { GAME_TRIGGERS,MODIFIERS } from "./dictionary.js";
export const consumableList = [];
export class Consumable{
    constructor(name,descriptionfn,effect,price,props = {}){
        this.name = name;
        this.descriptionfn = descriptionfn;
        this.effect = effect;
        this.price = price;
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
    consume(game){
        this.effect.call(this,game);
    }
}
const apple = new Consumable(
    "Jabłko",
    function(game){
        const fruit = game.fruits[0];
        return `daje +5 pointów, +0.5mult do ${fruit.icon}, obecnie ${fruit.props.upgrade.score}, ${fruit.props.upgrade.mult}`;
    },
    function(game){
        const fruit = game.fruits[0].props.upgrade;
        fruit.score+=5;
        fruit.mult+=0.5;
        fruit.level+=1;
    },
    5,{image: "applelover"}
);
consumableList.push(apple);