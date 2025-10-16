console.log("Upgrade");
import { Upgrade } from "./upgradeBase.js";
import { GAME_TRIGGERS, MODIFIERS, STAGES, TYPES, UPGRADE_STATES } from "./dictionary.js";
import { Style } from "./RenderUI.js";


export const upgradesList = [];

const defaultimage = { image: "default" };

function removeTrigger(game, trigger, triggeredFunction, upgrade) {
  game.triggers[trigger] = game.triggers[trigger].filter(
    h => !(h.handler === triggeredFunction && h.upgrade === upgrade)
  );
}

// === TRIGGER HELPERS ===
function addUpgradeTriggers(game, upgrade) {
  Upgrade.addUpgradeTriggers(game,upgrade);
}

function removeUpgradeTriggers(game, upgrade) {
  if (!upgrade.props) return;
  for (const [propName, fn] of Object.entries(upgrade.props)) {
    if (typeof fn === "function" && GAME_TRIGGERS[propName]) {
      removeTrigger(game, GAME_TRIGGERS[propName], fn, upgrade);
    }
  }
}

export const upgradeBlueprints = [
  {
    name: "AppleHater",
    descriptionfn(game) {
      return `Jeżeli ${game.fruits[0].icon} w kaskadzie nie zostanie zniszczone, ${Style.Score("+60 punktów")}`;
    },
    effect(game) {
      this.setProps({
        score: 0,
        onMatch: (payload) => {
          const uniqueFruits = new Set(payload.map(m => m.fruit.icon));
          const hasFruit = uniqueFruits.has(game.fruits[0].icon); 
          if (hasFruit) return UPGRADE_STATES.Failed;
          this.props.score += 60;
          return UPGRADE_STATES.Active;
        },
        onScore: () => {
          if (this.props.score != 0) {
            game.tempscore += this.props.score;
            game.GameRenderer.displayTempScore();
            this.props.score = 0;
            return UPGRADE_STATES.Score;
          }
          return UPGRADE_STATES.Failed;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 4
  },

  {
    name: "StockMarket",
    descriptionfn(game) {
      if (!this.props.randomfruit)
        return `${Style.Chance("-100%")} dla losowego owoca, reszta dostanie równo podzielone procenty. zmienia się co rundę.`;
      return `${Style.Chance("-100%")} ${this.props.randomfruit.icon}, ${Style.Chance('+'+game.calcEqualize(this.props.previousPercent).toString()+"%")} reszta`;
    },
    effect(game) {
      this.setProps({
        randomfruit: null,
        previousPercent: null,
        onRoundStart: () => {
          this.props.randomfruit = game.fruits[Math.floor(Math.random() * game.fruits.length)];
          this.props.previousPercent = this.props.randomfruit.percent;
          game.equalizeChancesExcept(this.props.randomfruit);
          this.props.randomfruit.percent = 0;
          return UPGRADE_STATES.Active;
        },
        onRoundEnd: () => {
          const chance = game.calcEqualize(this.props.previousPercent);
          this.props.randomfruit.percent += this.props.previousPercent;
          game.addChancesExcept(this.props.randomfruit, -chance);
          this.props.randomfruit = null;
          return UPGRADE_STATES.Failed;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
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
        onScore: () => {
          game.tempscore += 250;
          game.GameRenderer.displayScore();
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      game.moves += 2;
      game.moveBox.innerHTML = game.movescounter + "/" + game.moves;
      removeUpgradeTriggers(game, this);
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
    descriptionfn: `${Style.Mult("+4 mult")}`,
    effect(game) {
      this.setProps({
        onScore: () => {
          game.mult += 4;
          game.GameRenderer.displayTempScore();
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 4,
  },

  {
    name: "applelover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[0].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[0].icon} na kaskadę.`;
    },
    effect(game) {
      this.setProps({
        mult: 0,
        onMatch: (matches) => {
          const uniqueFruits = new Set(matches.map(m => m.fruit.icon));
          const hasFruit = uniqueFruits.has(game.fruits[0].icon); 
          if (hasFruit) {
            this.props.mult += 1;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.mult == 0) return UPGRADE_STATES.Failed;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 5,
    props: { mult: 0 }
  },
  {
    name: "pearlover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[1].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[1].icon} na kaskadę.`;
    },
    effect(game) {
      this.setProps({
        mult: 0,
        onMatch: (matches) => {
          const uniqueFruits = new Set(matches.map(m => m.fruit.icon));
          const hasFruit = uniqueFruits.has(game.fruits[1].icon); 
          if (hasFruit) {
            this.props.mult += 1;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.mult == 0) return UPGRADE_STATES.Failed;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 5,
    props: { mult: 0, image: 'default' }
  },
  {
    name: "pineapplelover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[2].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[2].icon} na kaskadę.`;
    },
    effect(game) {
      this.setProps({
        mult: 0,
        onMatch: (matches) => {
          const uniqueFruits = new Set(matches.map(m => m.fruit.icon));
          const hasFruit = uniqueFruits.has(game.fruits[2].icon); 
          if (hasFruit) {
            this.props.mult += 1;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.mult == 0) return UPGRADE_STATES.Failed;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 5,
    props: { mult: 0, image: 'default' }
  },
  {
    name: "grapelover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[3].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[3].icon} na kaskadę.`;
    },
    effect(game) {
      this.setProps({
        mult: 0,
        onMatch: (matches) => {
          const uniqueFruits = new Set(matches.map(m => m.fruit.icon));
          const hasFruit = uniqueFruits.has(game.fruits[3].icon); 
          if (hasFruit) {
            this.props.mult += 1;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.mult == 0) return UPGRADE_STATES.Failed;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 5,
    props: { mult: 0, image: 'default'}
  },
  {
    name: "coconutlover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[4].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[4].icon} na kaskadę.`;
    },
    effect(game) {
      this.setProps({
        mult: 0,
        onMatch: (matches) => {
          const uniqueFruits = new Set(matches.map(m => m.fruit.icon));
          const hasFruit = uniqueFruits.has(game.fruits[4].icon); 
          if (hasFruit) {
            this.props.mult += 1;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.mult == 0) return UPGRADE_STATES.Failed;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 5,
    props: { mult: 0, image: 'default' }
  },
  {
    name: "Coconut Bank",
    descriptionfn(game) {
      if (!this.props.previousPercent || this.props.previousPercent == -1) 
        return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance("-10%")} ${game.fruits[4].icon}, ${Style.Chance("+2.5%")} dla reszty`;
      return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance(`-${this.props.previousPercent}%`)} ${game.fruits[4].icon}, ${Style.Chance(`+${this.props.previousPercent/(game.fruits.length-1)}`)} dla reszty`;
    },
    effect(game) {
      this.setProps({
        previousPercent: -1,
        onRoundStart: () => {
          game.fruits[4].props.upgrade.goldchance += 50;
          let percent = 10;
          if (game.fruits[4].percent < 10) {
            percent = game.fruits[4].percent;
          }
          this.props.previousPercent = percent;
          game.fruits[4].percent -= this.props.previousPercent;
          game.addChancesExcept(game.fruits[4], this.props.previousPercent / (game.fruits.length - 1));
          return UPGRADE_STATES.Active;
        },
        onRoundEnd: () => {
          game.fruits[4].percent += this.props.previousPercent;
          game.fruits[4].props.upgrade.goldchance -= 50;
          game.addChancesExcept(game.fruits[4], -this.props.previousPercent / (game.fruits.length - 1));
          return UPGRADE_STATES.Failed;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
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
    props: {image: 'goldenfruits'}
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
      if (!this.props.isactive) return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+10 pkt")}`;
      return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+10 pkt")} (Obecnie ${Style.Score(`+${this.props.value} pkt`)}, ${Style.Score(`+${this.props.value} pkt do wyniku`)})`;
    },
    effect(game) {
      this.setProps({
        value: 5,
        isactive: true,
        score: 0,
        onMatch: (matches) => {
          let found = false;
          matches.forEach(m => {
            if (m.fruit.icon === game.fruits[3].icon) {
              this.props.score += this.props.value;
              found = true;
            }
          });
          if (found) return UPGRADE_STATES.Active;
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.score == 0) return UPGRADE_STATES.Failed;
          game.tempscore += this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return UPGRADE_STATES.Score;
        },
        onRoundEnd: () => {
          this.props.value += 10;
          return UPGRADE_STATES.Active;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 6,
    props: defaultimage
  },

  {
    name: "ChainReaction",
    descriptionfn(game) {
      if (this.bought) return `Każda kaskada daje dodatkowe ${Style.Score("+30 punktów")}, (obecnie ${Style.Score(`+${this.props.score}`)})`;
      return `Każda kaskada daje dodatkowe ${Style.Score("+30 punktów")}`;
    },
    effect(game) {
      this.setProps({
        score: 0,
        onMatch: () => {
          this.props.score += 30;
          return UPGRADE_STATES.Active;
        },
        onScore: () => {
          game.tempscore += this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 4,
    props: { score: 0 }
  },

  {
    name: "Battlepass",
    descriptionfn(game) {
      if (!this.props.isactive) return `${Style.Mult("+1 mult")}. na końcu rundy dostaje ${Style.Mult("+1 mult")}`;
      return `${Style.Mult("+1 mult")}. na końcu rundy dostaje ${Style.Mult("+1 mult")}. obecnie ${Style.Mult("+" + this.props.mult + " mult")}`;
    },
    effect(game) {
      this.setProps({
        mult: 1,
        isactive: true,
        onScore: () => {
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          return UPGRADE_STATES.Score;
        },
        onRoundEnd: () => {
          this.props.mult += 1;
          return UPGRADE_STATES.Active;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 8,
    props: {mult:1}
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
          if (this.props.triggered) return UPGRADE_STATES.Active;
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.triggered) {
            game.mult *= 2;
            game.GameRenderer.displayTempScore();
            this.props.triggered = false;
            return UPGRADE_STATES.Score;
          }
          return UPGRADE_STATES.Failed;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 6,
    props: { image: "highfive" }
  },

  {
    name: "broke",
    descriptionfn: `Jeżeli ma się mniej niż $6, +${Style.Score("+250 punktów")}`,
    effect(game) {
      this.setProps({
        onScore: () => {
          let hasMoney = game.money < 6;
          if (hasMoney) {
            game.tempscore += 250;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 6,
    props: defaultimage
  },

  {
    name: "Robber",
    descriptionfn(game) {
      if (this.props.sellPriceMult !== 0&&this.bought) {
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
          return UPGRADE_STATES.Active;
        },
        onRoundEnd: () => {
          this.sellPriceMult = 0;
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          game.mult += this.props.sellPriceMult;
          game.GameRenderer.displayTempScore();
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
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
  },

  {
    name: "Fossil",
    descriptionfn(game) {
      if (this.props.chosenFruit) {
        return `Gdy zostanie zniszczony ${this.props.chosenFruit.icon}, ${Style.Mult(`X1.5 Mult`)}`;
      }
      return `Gdy zostanie zniszczony najrzadszy owoc, ${Style.Mult(`X1.5 Mult`)}`;
    },
    effect(game) {
      this.setProps({
        mult: 1,
        chosenFruit: null,
        onRoundStart: () => {
          const minPercent = Math.min(...game.fruits.map(f => f.percent));
          const lowestFruits = game.fruits.filter(f => f.percent === minPercent);
          const choice = lowestFruits[Math.floor(Math.random() * lowestFruits.length)];
          this.props.chosenFruit = choice;
          return UPGRADE_STATES.Active;
        },
        onMatch: (payload) => {
          const uniqueFruits = new Set(payload.map(m => m.fruit.icon));
          if (uniqueFruits.has(this.props.chosenFruit.icon)) {
            this.props.mult *= 1.5;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.mult !== 1) {
            game.mult *= this.props.mult;
            this.props.mult = 1;
            return UPGRADE_STATES.Score;
          }
          return UPGRADE_STATES.Failed;
        }
      });
      addUpgradeTriggers(game, this);
    },
    remove(game) {
      removeUpgradeTriggers(game, this);
    },
    price: 10,
  },
  {
    name: "Madness",
    descriptionfn(game){
        return `Gdy podczas kaskady zrobi się tylko trójkę ${Style.Mult(`+X1 Mult`)}, po turze wraca do oryginalnej wartości. (Obecnie ${Style.Mult(`X${this.props.mult}`)})`;
    },
    effect(game){
      this.setProps({
        mult: 1,
        onMatch: (payload) => {
          if(game.isThreeLine(payload)){
            this.props.mult+=1;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if(this.props.mult==1){
          return UPGRADE_STATES.Failed;
          }
          game.mult*=this.props.mult;
          game.mult = Math.round(game.mult * 100) / 100;
          game.GameRenderer.displayTempScore();
          this.props.mult = 1;
          return UPGRADE_STATES.Score
        }
      });
      addUpgradeTriggers(game,this);
    },
    remove(game){
      removeUpgradeTriggers(game,this);
    },
    price: 8,
    props: {image: 'default', mult: 1}
  },
  {
    name: "Zdrapka",
    descriptionfn: `${Style.Chance(`1 na 20`)} że za kaskade dostanie się ${Style.Money(`$20`)}`,
    effect(game){
      this.setProps({
        onMatch: () => {
          if(Math.random() < 0.05){
            game.money+=20;
            game.GameRenderer.updateMoney(20);
            return UPGRADE_STATES.Active;
          } 
          return UPGRADE_STATES.Failed;
        }
      });
      addUpgradeTriggers(game,this);
    },
    remove(game){
      removeUpgradeTriggers(game,this);
    },
    price: 8,
  },
  {
    name: "6pak",
    descriptionfn(game){
      let value = this.props.mult ?? 1;
      return `Jeżeli podczas rundy zrobi się conajmniej szóstkę, ${Style.Mult(`+X2 Mult`)} do ulepszenia. (obecnie ${Style.Mult(`X${value} Mult`)})`;
    },
    effect(game){
      this.setProps({
        found: false,
        mult: 1,
        onMatch: (payload) => {
          if(game.isSixLine(payload)&&!this.props.found){
            this.props.found = true;
            this.props.mult+=2;
            return UPGRADE_STATES.Active;
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: () =>{
          if(this.props.mult==1) return UPGRADE_STATES.Failed;
          game.mult *= this.props.mult;
          game.mult = Math.round(game.mult * 100) / 100;
          game.GameRenderer.displayTempScore();
          return UPGRADE_STATES.Score;
        },
        onRoundEnd: () => {
          this.props.found = false;
          return UPGRADE_STATES.Active;
        }
      });
      addUpgradeTriggers(game,this);
    },
    remove(game){
      removeUpgradeTriggers(game,this);
    },
    price: 8,
    props: {image: 'default'}
  },
  {
    name: "Money Maker",
    descriptionfn(game){
      if(this.bought) return `co kaskadę daje 3x punkty za trzymane $. (obecnie ${Style.Score(`+${game.money*3} pkt co kaskadę`)}, ${Style.Score(`+${this.props.score} pkt`)})`;
      return `co kaskadę daje 3x punkty za trzymane $. (obecnie ${Style.Score(`+${game.money*3} pkt co kaskadę`)})`;
    },
    effect(game){
      this.setProps({
        score: 0,
        onMatch: (matches) => {
            this.props.score+=game.money*3;
            return UPGRADE_STATES.Active;
        },
        onScore: () => {
            game.tempscore+=this.props.score;
            game.GameRenderer.displayTempScore();
            this.props.score = 0;
            return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game,this);
    },
    remove(game){
      removeUpgradeTriggers(game,this);
    },
    price: 4,
    props: {image: 'default'}
  },
  {
    name: "fish",
    descriptionfn(game){
      return `co rundę cena sprzedarzy zwiększa się o ${Style.Money(`$3`)}. (Obecnie ${Style.Money('$'+this.sellPrice)})`;
    },
    effect(game){
      this.setProps({
        onRoundEnd: () => {
          this.sellPrice+=3;
          return UPGRADE_STATES.Active;
        }
      });
      addUpgradeTriggers(game,this);
    },
    remove(game){
      removeUpgradeTriggers(game,this);
    },
    price: 6,
    props: defaultimage
  },
  {
    name: "Tutti Frutti",
    descriptionfn(game){
      const fruit = this.props?.chosenFruit;
      if(this.bought && fruit)
        return `Za ${fruit.icon}, ${Style.Score(`+20 pkt`)}, obecnie ${Style.Score(`${this.props.score ?? 0} pkt`)}`;
      return `Za zniszczony pierwszy owoc w rundzie dostaje ${Style.Score(`+20 pkt`)}. Owoc resetuje się na koniec rundy.`;
    },
    effect(game){
      this.setProps({
        chosenFruit: null,
        score: 0,
        onMove: (matches) => {
          if(this.props.chosenFruit==null){
            const firstFruit = matches[0]?.fruit ?? null;
            this.props.chosenFruit = firstFruit;
            return UPGRADE_STATES.Active;
          }
          return  UPGRADE_STATES.Failed;
        },
        onMatch: (matches) => {
          if(this.props.chosenFruit==null) return UPGRADE_STATES.Failed;
          var found = false
          matches.forEach(m => {
            if (m.fruit.icon === this.props.chosenFruit.icon) {
              this.props.score += 20;
              found = true;
            }
          });
          if(found) return UPGRADE_STATES.Active;
          return UPGRADE_STATES.Failed;
        },
        onRoundEnd: () => {
          this.props.chosenFruit = null;
          return UPGRADE_STATES.Active;
        },
        onScore: () => {
          if(this.props.score<=0) return UPGRADE_STATES.Failed;
          game.tempscore+=this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return UPGRADE_STATES.Score;
        }
      });
      addUpgradeTriggers(game,this);
    },
    remove(game){
      removeUpgradeTriggers(game,this);
    },
    price: 6,
    props: defaultimage
    },
    {
      name: "Fruit Tycoon",
      descriptionfn: `Na koniec rundy, ${Style.Money("+$1")} za każdy ulepszony owoc w grze.`,
      effect(game) {
        this.setProps({
          onRoundEnd: () => {
            let upgradedfruits=0;
            game.board.forEach(boardx => {
                boardx.forEach(fruit => {
                  if(fruit.props.modifier != MODIFIERS.None){
                    upgradedfruits++;
                  }
                });
            });
            if(upgradedfruits==0) return UPGRADE_STATES.Failed;
            game.money += upgradedfruits;
            game.GameRenderer.displayMoney();
            return UPGRADE_STATES.Active;
          }
        });
        addUpgradeTriggers(game, this);
      },
      remove(game) { removeUpgradeTriggers(game, this); },
      price: 8,
      props: defaultimage
    },
    {
  name: "Jackpot",
  descriptionfn: `Szansa ${Style.Chance("1 na 100")} że po rundzie dostaniesz ${Style.Money("$100")}`,
  effect(game) {
    this.setProps({
      onRoundEnd: () => {
        if (Math.random() < 0.01) {
          game.money += 100;
          game.GameRenderer.displayMoney();
          return UPGRADE_STATES.Active;
        }
        return UPGRADE_STATES.Failed;
      }
    });
    addUpgradeTriggers(game, this);
  },
  remove(game) { removeUpgradeTriggers(game, this); },
  price: 10,
  props: defaultimage
},
{
  name: "Collector",
  descriptionfn(game){
    const collected = this.props?.collected;
    const score = this.props?.score;
    const collectedIcons = collected && collected.size > 0 
      ? [...collected].join(" ")
      : "0";
    if(score&&score>0&&this.bought){
      return `Jeżeli zniszczysz każdy rodzaj owocu w rundzie, ${Style.Score("+200 pkt")} za kaskade. (Zniszczono: ${collectedIcons}/${game.fruits.length}),(Obecnie ${Style.Score(`+${score} pkt`)})`;
    }
    if(collected&&game.stage!=STAGES.Shop&&this.bought){
      return `Jeżeli zniszczysz każdy rodzaj owocu w rundzie, ${Style.Score("+200 pkt")} za kaskade. (Zniszczono: ${collectedIcons}/${game.fruits.length})`;
    }
    return `Jeżeli zniszczysz każdy rodzaj owocu w rundzie, ${Style.Score("+200 pkt")} za kaskade.`;
  },
  effect(game) {
    this.setProps({
      score: 0,
      collected: new Set(),

      onMatch: (matches) => {
        let size=this.props.collected.size;
        matches.forEach(m => {
            if(m.fruit.type==TYPES.Fruit) this.props.collected.add(m.fruit.icon)
          });
        
        if (this.props.collected.size === game.fruits.length){
          this.props.score += 200;
          return UPGRADE_STATES.Active;
        }
        if(size<this.props.collected.size) return UPGRADE_STATES.Active;
        return UPGRADE_STATES.Failed;
      },
      onScore: ()=>{
          if(this.props.score<=0) return UPGRADE_STATES.Failed;
          game.tempscore += this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return UPGRADE_STATES.Score;
      },
      onRoundEnd: () => {
        this.props.collected.clear();
        return UPGRADE_STATES.Active;
      }
    });
    addUpgradeTriggers(game, this);
  },
  remove(game) { removeUpgradeTriggers(game, this); },
  price: 9,
  props: defaultimage
},
{
  name: "BOOM!!",
  descriptionfn(game){
    return `${Style.Chance(`+1%`)} dla ${game.special[1].icon}`;
  },
  effect(game){
    game.special[1].props.percent += 1;
    return UPGRADE_STATES.Active;
  },
  remove(game){
    game.special[1].props.percent -= 1;
    return UPGRADE_STATES.Active;
  },
  price: 4,
  props: {image: 'boom'}
},
{
  name: "",
  descriptionfn(game){
    return `${game.special[0].icon} i ${game.special[1].icon} detonują się 1 raz więcej.`;
  },
  effect(game){
    game.special[0].props.detonations += 1;
    game.special[1].props.detonations += 1;
  },
  remove(game){
    game.special[0].props.detonations -= 1;
    game.special[1].props.detonations -= 1;
  },
  price: 4,
  props: {image: 'boom'}
}
  ];
upgradeBlueprints.forEach(upgrade => {
  upgrade.type="Upgrade";
});
// push all blueprints into upgradesList
upgradeBlueprints.forEach(bp => upgradesList.push(bp));
