import { GAME_TRIGGERS, MODIFIERS } from "./dictionary.js";
import { Style } from "./RenderUI.js";
import { Upgrade } from "./upgradeBase.js";

export const upgradesList = [];

function removeTrigger(game, triggeredFunction, trigger, upgrade) {
  game.triggers[trigger] = game.triggers[trigger].filter(
    h => !(h.handler === triggeredFunction && h.upgrade === upgrade)
  );
}

const defaultimage = { image: "default" };

export const upgradeBlueprints = [
  {
    name: "AppleHater",
    descriptionfn: `Jeżeli jabłko nie zostanie zniszczone, ${Style.Score("+100 punktów")}`,
    effect(game) {
      this.setProps({
        found: false,
        onMatch: (payload) => {
          if (this.props.found) return false;
          payload.forEach(m => {
            if (m.fruit.icon === game.fruits[0].icon) {
              this.props.found = true;
              return true;
            }
          });
          return false;
        },
        onScore: () => {
          if (!this.props.found) {
            game.tempscore += 100;
            game.GameRenderer.displayTempScore();
            return true;
          }
          this.props.found = false;
          return false;
        }
      });
      game.on(GAME_TRIGGERS.onMatch, this.props.onMatch, this);
      game.on(GAME_TRIGGERS.onScore, this.props.onScore, this);
    },
    remove(game) {
      removeTrigger(game, this.props.onMatch, GAME_TRIGGERS.onMatch, this);
      removeTrigger(game, this.props.onScore, GAME_TRIGGERS.onScore, this);
    },
    price: 4
  },
  {
    name: "StockMarket",
    descriptionfn(game) {
      if (!this.props.randomfruit)
        return `${Style.Chance("-100%")} dla losowego owoca, reszta dostanie równo podzielone procenty. zmienia się co rundę.`;
      return `${Style.Chance("-100%")} ${this.props.randomfruit.icon}, +${Style.Chance(game.calcEqualize(this.props.previousPercent).toString()+"%")} reszta`;
    },
    effect(game) {
      this.setProps({
        randomfruit: null,
        previousPercent: null,
        onStart: () => {
          this.props.randomfruit = game.fruits[Math.floor(Math.random() * game.fruits.length)];
          this.props.previousPercent = this.props.randomfruit.percent;
          game.equalizeChancesExcept(this.props.randomfruit);
          this.props.randomfruit.percent = 0;
          return true;
        },
        onEnd: () => {
          const chance = game.calcEqualize(this.props.previousPercent);
          this.props.randomfruit.percent += this.props.previousPercent;
          game.addChancesExcept(this.props.randomfruit, -chance);
          this.props.randomfruit = null;
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onRoundStart, this.props.onStart, this);
      game.on(GAME_TRIGGERS.onRoundEnd, this.props.onEnd, this);
    },
    remove(game) {
      removeTrigger(game, this.props.onStart, GAME_TRIGGERS.onRoundStart, this);
      removeTrigger(game, this.props.onEnd, GAME_TRIGGERS.onRoundEnd, this);
    },
    price: 8
  },
  {
    name: "Boom",
    descriptionfn: `Dynamit pojawia się ${Style.Chance("+2%")} częściej`,
    effect(game) {
      game.special[0].percent += 2;
    },
    remove(game) {
      game.special[0].percent -= 2;
    },
    price: 2
  },
  {
    name: "Bomber",
    descriptionfn: `${Style.Score("+250 punktów")} za ruch, ${Style.Moves("-2 ruchy")}`,
    effect(game) {
      game.moves -= 2;
      game.moveBox.innerHTML = game.movescounter + "/" + game.moves;
      this.setProps({
        handler: () => {
          game.tempscore += 250;
          game.GameRenderer.displayScore();
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onMove, this.props.handler, this);
    },
    remove(game) {
      game.moves += 2;
      game.moveBox.innerHTML = game.movescounter + "/" + game.moves;
      removeTrigger(game, this.props.handler, GAME_TRIGGERS.onMove, this);
    },
    price: 4,
    props: { image: "boom" }
  },
  {
    name: "tetris",
    descriptionfn: `${Style.Moves("+4 ruchy")}`,
    effect(game) {
      game.moves += 4;
    },
    remove(game) {
      game.moves -= 4;
    },
    price: 4
  },
  {
    name: "Mult",
    descriptionfn: `${Style.Mult("+1 mult")}`,
    effect(game) {
      this.setProps({
        handler: () => {
          game.mult += 1;
          game.GameRenderer.displayTempScore();
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onScore, this.props.handler, this);
    },
    remove(game) {
      removeTrigger(game, this.props.handler, GAME_TRIGGERS.onScore, this);
    },
    price: 4,
    props: defaultimage
  },
  {
    name: "applelover",
    descriptionfn: `${Style.Mult("+1 mult")} za każde 🍎 (raz na kaskadę)`,
    effect(game) {
      this.setProps({
        handler: (matches) => {
          const uniqueFruits = new Set(matches.map(m => m.fruit.icon));
          if (uniqueFruits.has("🍎")) {
            game.mult += 1;
          }
          game.GameRenderer.displayTempScore();
          return uniqueFruits.has("🍎");
        }
      });
      game.on(GAME_TRIGGERS.onMatch, this.props.handler, this);
    },
    remove(game) {
      removeTrigger(game, this.props.handler, GAME_TRIGGERS.onMatch, this);
    },
    price: 5
  },
  {
    name: "Coconut Bank",
    descriptionfn(game) {
      if(!this.props.previousPercent||this.props.previousPercent==-1) return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance("-10%")} ${game.fruits[4].icon}, ${Style.Chance("+2.5%")} dla reszty`;
      return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance(`-${this.props.previousPercent}%`)} ${game.fruits[4].icon}, ${Style.Chance(`+${this.props.previousPercent/(game.fruits.length-1)}`)} dla reszty`;
    },
    effect(game) {
      this.setProps({
        previousPercent: -1,
        onRoundStart: ()=>{
          game.fruits[4].props.upgrade.goldchance += 50;
        let percent = 10;
        if(game.fruits[4].percent<10){
          percent = game.fruits[4].percent;
        }
        this.props.previousPercent = percent;
        game.fruits[4].percent -= this.props.previousPercent;
        game.addChancesExcept(game.fruits[4], this.props.previousPercent/(game.fruits.length-1));
        return true;
        },
        onRoundEnd: ()=>{
          game.fruits[4].percent += this.props.previousPercent;
          game.fruits[4].props.upgrade.goldchance -= 50;
          game.addChancesExcept(game.fruits[4], -this.props.previousPercent/(game.fruits.length-1));
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onRoundStart,this.props.onRoundStart,this);
      game.on(GAME_TRIGGERS.onRoundEnd,this.props.onRoundEnd,this);
    },
    remove(game) {
      removeTrigger(game,this.props.onRoundStart,GAME_TRIGGERS.onRoundStart,this);
      removeTrigger(game,this.props.onRoundEnd,GAME_TRIGGERS.onRoundEnd,this);
    },
    price: 10,
    props: { image: "coconutbank" }
  },
  {
    name: "Golden Fruits",
    descriptionfn: `${Style.Chance("+5%")}  szansa na gold`,
    effect(game) {
      game.fruits.forEach(fruit => {
        fruit.props.upgrade.goldchance += 5;
      });
    },
    remove(game) {
      game.fruits.forEach(fruit => {
        fruit.props.upgrade.goldchance -= 5;
      });
    },
    price: 10,
    props: defaultimage
  },
  {
    name: "Silver Fruits",
    descriptionfn: `${Style.Chance("+2%")} szansa na silver`,
    effect(game) {
      game.fruits.forEach(fruit => {
        fruit.props.upgrade.silverchance += 2;
      });
    },
    remove(game) {
      game.fruits.forEach(fruit => {
        fruit.props.upgrade.silverchance -= 2;
      });
    },
    price: 10,
    props: { image: "metalplate" }
  },
  {
    name: "GrapeInterest",
    descriptionfn(game) {
      if (!this.props.isactive) return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+15 pkt")}`;
      return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+15 pkt")} (Obecnie ${Style.Score(`+${this.props.value} pkt`)})`;
    },
    effect(game) {
      this.setProps({
        value: 5,
        isactive: true,
        handler: (matches) => {
          let found = false;
          matches.forEach(m => {
            if (m.fruit.icon === game.fruits[3].icon) {
              game.tempscore += this.props.value;
              found = true;
            }
          });
          game.GameRenderer.displayTempScore();
          return found;
        },
        onRoundEnd: () => {
          this.props.value += 15;
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onMatch, this.props.handler, this);
      game.on(GAME_TRIGGERS.onRoundEnd, this.props.onRoundEnd, this);
    },
    remove(game) {
      removeTrigger(game, this.props.handler, GAME_TRIGGERS.onMatch, this);
      removeTrigger(game, this.props.onRoundEnd, GAME_TRIGGERS.onRoundEnd, this);
    },
    price: 6,
    props: defaultimage
  },
  {
    name: "ChainReaction",
    descriptionfn: `Każda kaskada daje dodatkowe ${Style.Score("+30 punktów")}`,
    effect(game) {
      this.setProps({
        handler: () => {
          game.tempscore += 30;
          game.GameRenderer.displayTempScore();
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onMatch, this.props.handler, this);
    },
    remove(game) {
      removeTrigger(game, this.props.handler, GAME_TRIGGERS.onMatch, this);
    },
    price: 4,
  },
  {
    name: "Battlepass",
    descriptionfn(game) {
      if (!this.props.isactive) return `${Style.Mult("+1 mult")}. na końcu rundy dostaje ${Style.Mult("+1 mult")}`;
      return `${Style.Mult("+1 mult")}. na końcu rundy dostaje ${Style.Mult("+1 mult")}. obecnie ${Style.Mult("+"+this.props.mult+" mult")}`;
    },
    effect(game) {
      this.setProps({
        mult: 1,
        isactive: true,
        onScore: () => {
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          return true;
        },
        onRoundEnd: () => {
          this.props.mult += 1;
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onScore, this.props.onScore, this);
      game.on(GAME_TRIGGERS.onRoundEnd, this.props.onRoundEnd, this);
    },
    remove(game) {
      removeTrigger(game, this.props.onScore, GAME_TRIGGERS.onScore, this);
      removeTrigger(game, this.props.onRoundEnd, GAME_TRIGGERS.onRoundEnd, this);
    },
    price: 8
  },
  {
    name: "High Five",
    descriptionfn: `Gdy podczas gry zrobi się piątke, ${Style.Mult("X2 mult")}`,
    effect(game) {
      this.setProps({
        triggered: false,
        onMatch: (payload) => {
          if (this.props.triggered) return false;
          this.props.triggered = payload && game.isFiveLine(payload);
          return payload && game.isFiveLine(payload);
        },
        onScore: () => {
          if (this.props.triggered) {
            game.mult *= 2;
            game.GameRenderer.displayTempScore();
            this.props.triggered = false;
            return true;
          }
          return false;
        }
      });
      game.on(GAME_TRIGGERS.onMatch, this.props.onMatch, this);
      game.on(GAME_TRIGGERS.onScore, this.props.onScore, this);
    },
    remove(game) {
      removeTrigger(game, this.props.onMatch, GAME_TRIGGERS.onMatch, this);
      removeTrigger(game, this.props.onScore, GAME_TRIGGERS.onScore, this);
    },
    price: 6,
    props: {image: "highfive"}
  },
  {
    name: "broke",
    descriptionfn: `Jeżeli ma się mniej niż $6, +${Style.Score("+250 punktów")}`,
    effect(game) {
      this.setProps({
        onScore: () => {
          if (game.money < 6) {
            game.tempscore += 250;
          }
          return game.money < 6;
        }
      });
      game.on(GAME_TRIGGERS.onScore, this.props.onScore, this);
    },
    remove(game) {
      removeTrigger(game, this.props.onScore, GAME_TRIGGERS.onScore, this);
    },
    price: 6,
    props: defaultimage
  },
  {
    name: "Robber",
    descriptionfn(game) {
      if (this.props.sellPriceMult && this.props.sellPriceMult !== 0) {
        return `Daje + Mult ceny sprzedarzy wszystkich kupionych ulepszeń. (Obecnie ${Style.Mult(`+${this.props.sellPriceMult} mult`)})`;
      }
      return `Daje + Mult ceny sprzedarzy wszystkich kupionych ulepszeń.`;
    },
    effect(game) {
      this.setProps({
        sellPriceMult: 0,
        onRoundStart: () => {
          let x = 0;
          game.upgrades.forEach(upgrade => {
            x += upgrade.sellPrice;
          });
          this.props.sellPriceMult = x;
          return true;
        },
        onRoundEnd: () => {
          this.sellPriceMult = 0;
          return true;
        },
        onScore: () => {
          game.mult += this.props.sellPriceMult;
          game.GameRenderer.displayTempScore();
          return true;
        }
      });
      game.on(GAME_TRIGGERS.onRoundStart, this.props.onRoundStart, this);
      game.on(GAME_TRIGGERS.onRoundEnd, this.props.onRoundEnd, this);
      game.on(GAME_TRIGGERS.onScore, this.props.onScore, this);
    },
    remove(game) {
      removeTrigger(game, this.props.onScore, GAME_TRIGGERS.onScore, this);
      removeTrigger(game, this.props.onRoundStart, GAME_TRIGGERS.onRoundStart, this);
      removeTrigger(game, this.props.onRoundEnd, GAME_TRIGGERS.onRoundEnd, this);
    },
    price: 4,
  },
  {
    name: "circus",
    descriptionfn: "Pozwala na pojawianie się w sklepie tych samych upgradeów.",
    effect(game) {
      game.upgradeDedupe = false;
    },
    remove(game) {
      let counter = 0;
      game.upgrades.forEach(up => {
        if (up.name === this.name) counter++;
      });
      game.upgradeDedupe = true;
      if (counter > 1) game.upgradeDedupe = false;
    },
    price: 8
  }
];

// push all blueprints into upgradesList
upgradeBlueprints.forEach(bp => upgradesList.push(bp));
