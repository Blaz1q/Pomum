console.log("Upgrade");
import { Consumable, Upgrade } from "./upgradeBase.js";
import { GAME_TRIGGERS, MODIFIERS, SCORE_ACTIONS, STAGES, TYPES, UPGRADE_RARITY, UPGRADE_RARITY_NAME, UPGRADE_STATES } from "./dictionary.js";
import { Style } from "./dictionary.js";
import { consumableList, consumableUpgradeBlueprints } from "./consumable.js";


export const upgradesList = [];

const defaultimage = { image: "default" };
const COMMON = { rarity: UPGRADE_RARITY_NAME.Common };
const UNCOMMON = { rarity: UPGRADE_RARITY_NAME.Uncommon };
const RARE = { rarity: UPGRADE_RARITY_NAME.Rare };
export const upgradeBlueprints = [
  {
    name: "AppleHater",
    descriptionfn(game) {
      return `Jeżeli ${game.fruits[0].icon} w kaskadzie nie zostanie zniszczone, ${Style.Score("+60 punktów")}`;
    },
    props: () => ({
      score: 0,
      onMatch(payload) {
        const uniqueFruits = new Set(payload.map(m => m.icon));
        const hasFruit = uniqueFruits.has(game.fruits[0].icon);
        if (hasFruit) return UPGRADE_STATES.Failed;
        this.props.score += 60;
        return UPGRADE_STATES.Active;
      },
      onScore() {
        if (this.props.score != 0) {
          game.tempscore += this.props.score;
          game.GameRenderer.displayTempScore();
          const gained = this.props.score;
          return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
        }
        return UPGRADE_STATES.Failed;
      },
      reset(){
        this.props.score = 0;
      }
    }),
    price: 4,
    ...COMMON
  },

  {
    name: "StockMarket",
    descriptionfn(game) {
      if (!this.props.randomfruit)
        return `${Style.Chance("-100%")} dla losowego owoca, reszta dostanie równo podzielone procenty. zmienia się co rundę.`;
      return `${Style.Chance("-100%")} ${this.props.randomfruit.icon}, ${Style.Chance('+' + game.calcEqualize(this.props.previousPercent).toString() + "%")} reszta`;
    },
    props: () => ({
      randomfruit: null,
      previousPercent: null,
      onRoundStart() {
        this.props.randomfruit = game.fruits[Math.floor(Math.random() * game.fruits.length)];
        this.props.previousPercent = this.props.randomfruit.percent;
        game.equalizeChancesExcept(this.props.randomfruit);
        this.props.randomfruit.percent = 0;
        return { state: UPGRADE_STATES.Active, message: `-100% ${this.props.randomfruit.icon}`, style: SCORE_ACTIONS.Info };
      },
      onRoundEnd() {
        const chance = game.calcEqualize(this.props.previousPercent);
        this.props.randomfruit.percent += this.props.previousPercent;
        game.addChancesExcept(this.props.randomfruit, -chance);
        this.props.randomfruit = null;
        return UPGRADE_STATES.Failed;
      },
    }),
    remove(game) {
      if (this.props.randomfruit) {
        const chance = game.calcEqualize(this.props.previousPercent);
        this.props.randomfruit.percent += this.props.previousPercent;
        game.addChancesExcept(this.props.randomfruit, -chance);
        this.props.randomfruit = null;
      }
    },
    price: 8,
    ...UNCOMMON
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
    price: 2,
    ...COMMON
  },

  {
    name: "Bomber",
    descriptionfn: `${Style.Score("+250 punktów")} za ruch, ${Style.Moves("-2 ruchy")}`,
    effect(game) {
      game.moves -= 2;
      game.GameRenderer.displayMoves();
    },
    remove(game) {
      game.moves += 2;
      game.GameRenderer.displayMoves();
    },
    props: () => ({
      onScore() {
        game.tempscore += 250;
        game.GameRenderer.displayScore();
        return { state: UPGRADE_STATES.Score, message: "+250 pkt", style: SCORE_ACTIONS.Score };
      },
    }),
    price: 4,
    image: "boom",
    ...COMMON,
  },

  {
    name: "tetris",
    descriptionfn: `${Style.Moves("+4 ruchy")}`,
    rarity: UPGRADE_RARITY_NAME.Common,
    effect(game) {
      game.moves += 4;
      game.GameRenderer.displayMoves();
    },
    remove(game) {
      game.moves -= 4;
      game.GameRenderer.displayMoves();
      console.log("from props :)");
    },
    price: 4,
  },

  {
    name: "Mult",
    descriptionfn: `${Style.Mult("+4 mult")}`,
    props: () => ({
      onScore() {
        game.mult += 4;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: "+4 Mult", style: SCORE_ACTIONS.Mult };
      },
    }),
    price: 4,
    ...COMMON
  },

  {
    name: "applelover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[0].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[0].icon} na kaskadę.`;
    },
    props: () => ({
      mult: 0,
      onMatch(matches) {
        let gained = 0;
        matches.forEach(fruit => {
            if(fruit.icon == game.fruits[0].icon){
              gained++;
            }
        });
        if(gained>0){
          this.props.mult += gained;
          return { state: UPGRADE_STATES.Active, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult == 0) return UPGRADE_STATES.Failed;
        const mult = this.props.mult;
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
      },
      reset(){
        this.props.mult = 0;
      }
    }),
    price: 5,
    ...COMMON
  },
  {
    name: "pearlover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[1].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[1].icon} na kaskadę.`;
    },
    props: () => ({
      mult: 0,
      onMatch(matches) {
        let gained = 0;
        matches.forEach(fruit => {
            if(fruit.icon == game.fruits[1].icon){
              gained++;
            }
        });
        if(gained>0){
          this.props.mult += gained;
          return { state: UPGRADE_STATES.Active, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult == 0) return UPGRADE_STATES.Failed;
        const mult = this.props.mult;
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
      },
      reset(){
        this.props.mult = 0;
      }
    }),
    price: 5,
    image: 'default', ...COMMON
  },
  {
    name: "pineapplelover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[2].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[2].icon} na kaskadę.`;
    },
    price: 5,

    image: 'default',
    ...COMMON,
    props: () => ({
      mult: 0,
      onMatch(matches) {
        let gained = 0;
        matches.forEach(fruit => {
            if(fruit.icon == game.fruits[2].icon){
              gained++;
            }
        });
        if(gained>0){
          this.props.mult += gained;
          return { state: UPGRADE_STATES.Active, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult == 0) return UPGRADE_STATES.Failed;
        const mult = this.props.mult;
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
      },
      reset(){
        this.props.mult = 0;
      }
    }),
    
  },
  {
    name: "grapelover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[3].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[3].icon} na kaskadę.`;
    },
    props: () => ({
      mult: 0,
      onMatch(matches) {
        let gained = 0;
        matches.forEach(fruit => {
            if(fruit.icon == game.fruits[3].icon){
              gained++;
            }
        });
        if(gained>0){
          this.props.mult += gained;
          return { state: UPGRADE_STATES.Active, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult == 0) return UPGRADE_STATES.Failed;
        const mult = this.props.mult;
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
      },
      reset(){
        this.props.mult = 0;
      }
    }),
    price: 5,
    image: 'default',
    ...COMMON
  },
  {
    name: "coconutlover",
    descriptionfn(game) {
      if (this.props.mult !== 0) {
        return `${Style.Mult("+1 mult")} za każde ${game.fruits[4].icon} na kaskadę. (Obecnie ${Style.Mult(`+${this.props.mult} mult`)})`;
      }
      return `${Style.Mult("+1 mult")} za każde ${game.fruits[4].icon} na kaskadę.`;
    },
    props: () => ({
      mult: 0,
      onMatch(matches) {
        let gained = 0;
        matches.forEach(fruit => {
            if(fruit.icon == game.fruits[4].icon){
              gained++;
            }
        });
        if(gained>0){
          this.props.mult += gained;
          return { state: UPGRADE_STATES.Active, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult == 0) return UPGRADE_STATES.Failed;
        const mult = this.props.mult;
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
      },
      reset(){
        this.props.mult = 0;
      }
    }),
    price: 5,
    image: 'default',
    ...COMMON
  },
  {
    name: "Coconut Bank",
    descriptionfn(game) {
      if (!this.props.previousPercent || this.props.previousPercent == -1)
        return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance("-10%")} ${game.fruits[4].icon}, ${Style.Chance("+2.5%")} dla reszty`;
      return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance(`-${this.props.previousPercent}%`)} ${game.fruits[4].icon}, ${Style.Chance(`+${this.props.previousPercent / (game.fruits.length - 1)}`)} dla reszty`;
    },
    reset(game) {
      game.fruits[4].percent += this.props.previousPercent;
      game.fruits[4].props.upgrade.goldchance -= 50;
      game.addChancesExcept(game.fruits[4], -this.props.previousPercent / (game.fruits.length - 1));
    },
    props: () => ({
      previousPercent: -1,
      applied: false,
      onRoundStart() {
        game.fruits[4].props.upgrade.goldchance += 50;
        let percent = 10;
        if (game.fruits[4].percent < 10) {
          percent = game.fruits[4].percent;
        }
        this.props.previousPercent = percent;
        game.fruits[4].percent -= this.props.previousPercent;
        game.addChancesExcept(game.fruits[4], this.props.previousPercent / (game.fruits.length - 1));
        this.props.applied = false;
        return UPGRADE_STATES.Active;
      },
      onRoundEnd() {
        this.reset(game);
        this.props.applied = false;
        return UPGRADE_STATES.Failed;
      },
    }),
    remove(game) {
      if (this.props?.applied == true) {
        this.reset(game);
      }
    },
    price: 10,
    image: "coconutbank",
    ...UNCOMMON
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
    image: 'goldenfruits', ...COMMON
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
    image: "metalplate", ...COMMON
  },

  {
    name: "GrapeInterest",
    descriptionfn(game) {
      if (!this.props.isactive) return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+10 pkt")}`;
      return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+10 pkt")} (Obecnie ${Style.Score(`+${this.props.value} pkt`)}, ${Style.Score(`+${this.props.score} pkt do wyniku`)})`;
    },
    props: () => ({
      value: 5,
      isactive: true,
      score: 0,
      onMatch(matches) {
        let found = false;
        matches.forEach(m => {
          if (m.icon === game.fruits[3].icon) {
            this.props.score += this.props.value;
            found = true;
          }
        });
        if (found) return UPGRADE_STATES.Active;
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.score == 0) return UPGRADE_STATES.Failed;
        const gained = this.props.score;
        game.tempscore += this.props.score;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
      },
      reset(){
        this.props.score = 0;
      },
      onRoundEnd() {
        this.props.value += 10;
        return UPGRADE_STATES.Active;
      },
    }),
    price: 6,
    image: 'grapeinterest',
    ...UNCOMMON
  },

  {
    name: "ChainReaction",
    descriptionfn(game) {
      if (this.score && this.score > 0) return `Każda kaskada daje dodatkowe ${Style.Score("+30 punktów")}, (obecnie ${Style.Score(`+${this.props.score}`)})`;
      return `Każda kaskada daje dodatkowe ${Style.Score("+30 punktów")}`;
    },
    props: () => ({
      score: 0,
      onMatch() {
        this.props.score += 30;
        return { state: UPGRADE_STATES.Active, message: `+30 pkt`, style: SCORE_ACTIONS.Score };
      },
      onScore() {
        let messagescore = this.props.score;
        game.tempscore += this.props.score;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${messagescore} pkt`, style: SCORE_ACTIONS.Score };
      },
      reset(){
        this.props.score = 0;
      }
    }),
    price: 4,
    ...COMMON
  },

  {
    name: "Battlepass",
    descriptionfn(game) {
      if (!this.props.isactive) return `${Style.Mult("+1 mult")}. na końcu rundy dostaje ${Style.Mult("+1 mult")}`;
      return `${Style.Mult("+1 mult")}. na końcu rundy dostaje ${Style.Mult("+1 mult")}. obecnie ${Style.Mult("+" + this.props.mult + " mult")}`;
    },
    props: () => ({
      mult: 1,
      isactive: true,
      onScore() {
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult };

      },
      onRoundEnd() {
        this.props.mult += 1;
        return UPGRADE_STATES.Active;
      },
    }),
    price: 8,
    ...COMMON
  },

  {
    name: "High Five",
    descriptionfn: `Gdy zrobi się piątke, ${Style.Mult("X2 mult")}`,
    props: () => ({
      mult: 0,
      onMatch(payload) {
        if (payload && game.matchesManager.isFiveLine(payload)) {
          this.props.mult += 2;
          return { state: UPGRADE_STATES.Active, message: `+X2 Mult`, style: SCORE_ACTIONS.Mult };
        } return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult > 0) {
          let messagemult = this.props.mult;
          game.mult *= this.props.mult;
          game.GameRenderer.displayTempScore();
          return { state: UPGRADE_STATES.Score, message: `X${messagemult} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      reset(){
        this.props.mult = 0;
      }
    }),
    price: 6,
    image: "highfive", ...UNCOMMON
  },

  {
    name: "broke",
    descriptionfn: `Jeżeli ma się mniej niż $6, ${Style.Score("+250 punktów")}`,
    props: () => ({
      onScore() {
        let hasMoney = game.money < 6;
        if (hasMoney) {
          game.tempscore += 250;
          return { state: UPGRADE_STATES.Score, message: "+250 pkt", style: SCORE_ACTIONS.Score };
        }
        return UPGRADE_STATES.Failed;
      },
    }),
    price: 6,
    ...defaultimage, ...COMMON
  },

  {
    name: "Robber",
    descriptionfn(game) {
      if (this.props.sellPriceMult !== 0 && this.bought) {
        return `Daje + Mult ceny sprzedaży wszystkich kupionych ulepszeń. (Obecnie ${Style.Mult(`+${this.props.sellPriceMult} mult`)})`;
      }
      return `Daje + Mult ceny sprzedaży wszystkich kupionych ulepszeń.`;
    },
    props: () => ({
      sellPriceMult: 0,
      onRoundStart() {
        let x = 0;
        game.upgrades.forEach(upgrade => {
          x += upgrade.sellPrice;
        });
        this.props.sellPriceMult = x;
        return UPGRADE_STATES.Active;
      },
      onRoundEnd() {
        this.sellPriceMult = 0;
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        game.mult += this.props.sellPriceMult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${this.props.sellPriceMult} Mult`, style: SCORE_ACTIONS.Mult };
      },
    }),

    price: 4,
    ...UNCOMMON
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
    price: 8,
    ...RARE
  },

  {
    name: "Fossil",
    descriptionfn(game) {
      if (this.props.chosenFruit) {
        return `Gdy zostanie zniszczony ${this.props.chosenFruit.icon}, ${Style.Mult(`X1.5 Mult`)}`;
      }
      return `Gdy zostanie zniszczony najrzadszy owoc, ${Style.Mult(`X1.5 Mult`)}`;
    },
    props: () => ({
      mult: 1,
      chosenFruit: null,
      onRoundStart() {
        const minPercent = Math.min(...game.fruits.map(f => f.percent));
        const lowestFruits = game.fruits.filter(f => f.percent === minPercent);
        const choice = lowestFruits[Math.floor(Math.random() * lowestFruits.length)];
        this.props.chosenFruit = choice;
        return UPGRADE_STATES.Active;
      },
      onMatch(payload) {
        const uniqueFruits = new Set(payload.map(m => m.icon));
        if (uniqueFruits.has(this.props.chosenFruit.icon)) {
          this.props.mult *= 1.5;
          return UPGRADE_STATES.Active;
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult !== 1) {
          const gained = Math.round(this.props.mult * 100) / 100;
          game.mult *= this.props.mult;
          game.mult = Math.round(game.mult * 100) / 100;
          return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      reset(){
        this.props.mult = 1;
      }
    }),

    price: 10,
    ...UNCOMMON
  },
  {
    name: "Madness",
    descriptionfn(game) {
      return `Gdy podczas kaskady zrobi się tylko trójkę ${Style.Mult(`+X1 Mult`)}, po turze wraca do oryginalnej wartości. (Obecnie ${Style.Mult(`X${this.props.mult}`)})`;
    },
    props: () => ({
      mult: 1,
      onMatch(payload) {
        if (game.matchesManager.isThreeLine(payload)) {
          this.props.mult += 1;
          return UPGRADE_STATES.Active;
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult == 1) {
          return UPGRADE_STATES.Failed;
        }
        const gained = this.props.mult;
        game.mult *= this.props.mult;
        game.mult = Math.round(game.mult * 100) / 100;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };
      },
      reset(){
        this.props.mult = 1;
      }
    }),

    price: 8,
    image: 'clock', ...UNCOMMON
  },
  {
    name: "Zdrapka",
    descriptionfn: `${Style.Chance(`1 na 20`)} że za kaskade dostanie się ${Style.Money(`$20`)}`,
    props: () => ({
      onMatch() {
        if (Math.random() < 0.05) {
          game.money += 20;
          game.GameRenderer.updateMoney(20);
          return { state: UPGRADE_STATES.Active, message: `+$20`, style: SCORE_ACTIONS.Money };
        }
        return UPGRADE_STATES.Failed;
      },
    }),

    price: 8,
    ...UNCOMMON
  },
  {
    name: "6pak",
    descriptionfn(game) {
      let value = this.props.mult ?? 1;
      return `Jeżeli podczas rundy zrobi się conajmniej szóstkę, ${Style.Mult(`+X2 Mult`)} do ulepszenia. (obecnie ${Style.Mult(`X${value} Mult`)})`;
    },
    props: () => ({
      mult: 1,
      onMatch(payload) {
        if (game.matchesManager.isSixLine(payload) && !this.props.found) {
          this.props.found = true;
          this.props.mult += 2;
          return { state: UPGRADE_STATES.Active, message: `Upgrade!`, style: SCORE_ACTIONS.Money };
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult == 1) return UPGRADE_STATES.Failed;
        game.mult *= this.props.mult;
        game.mult = Math.round(game.mult * 100) / 100;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `X${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult };

      },
      onRoundEnd() {
        this.props.found = false;
        return UPGRADE_STATES.Active;
      },
    }),
    found: false,
    price: 8,
    image: '6pak', ...RARE
  },
  {
    name: "Money Maker",
    descriptionfn(game) {
      if (this.bought) return `co kaskadę daje 3x punkty za trzymane $. (obecnie ${Style.Score(`+${game.money * 3} pkt co kaskadę`)}, ${Style.Score(`+${this.props.score} pkt`)})`;
      return `co kaskadę daje 3x punkty za trzymane $. (obecnie ${Style.Score(`+${game.money * 3} pkt co kaskadę`)})`;
    },
    props: () => ({
      score: 0,
      onMatch(matches) {
        this.props.score += game.money * 3;
        return UPGRADE_STATES.Active;
      },
      onScore() {
        const gained = this.props.score;
        game.tempscore += this.props.score;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
      },
      reset(){
        this.props.score = 0;
      }
    }),

    price: 4,
    image: 'moneymaker', ...COMMON
  },
  {
    name: "fish",
    descriptionfn(game) {
      return `co rundę cena sprzedaży zwiększa się o ${Style.Money(`$3`)}. (Obecnie ${Style.Money('$' + this.sellPrice)})`;
    },
    props: () => ({
      sellPrice: 3,
      onRoundEnd() {
        this.props.sellPrice += 3;
        this.sellPrice = this.props.sellPrice;
        return { state: UPGRADE_STATES.Active, message: `Upgrade!`, style: SCORE_ACTIONS.Money };
      }
    }),
    price: 6,
    ...COMMON
  },
  {
    name: "Tutti Frutti",
    descriptionfn(game) {
      const fruit = this.props?.chosenFruit;
      if (this.bought && fruit)
        return `Za ${fruit.icon}, ${Style.Score(`+20 pkt`)}, obecnie ${Style.Score(`${this.props.score ?? 0} pkt`)}`;
      return `Za zniszczony pierwszy owoc w rundzie dostaje ${Style.Score(`+20 pkt`)}. Owoc resetuje się na koniec rundy.`;
    },
    props: () => ({
      chosenFruit: null,
      score: 0,
      onMove(payload) {
        const matches = payload.matches;
        if (this.props.chosenFruit == null) {
          const firstFruit = matches[0] ?? null;
          this.props.chosenFruit = firstFruit;
          return UPGRADE_STATES.Active;
        }
        return UPGRADE_STATES.Failed;
      },
      onMatch(matches) {
        if (this.props.chosenFruit == null) return UPGRADE_STATES.Failed;
        var found = false
        matches.forEach(m => {
          if (m.icon === this.props.chosenFruit.icon) {
            this.props.score += 20;
            found = true;
          }
        });
        if (found) return UPGRADE_STATES.Active;
        return UPGRADE_STATES.Failed;
      },
      onRoundEnd() {
        this.props.chosenFruit = null;
        return UPGRADE_STATES.Active;
      },
      onScore() {
        if (this.props.score <= 0) return UPGRADE_STATES.Failed;
        const gained = this.props.score;
        game.tempscore += this.props.score;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
      },
      reset(){
        this.props.score = 0;
      }
    }),

    price: 6,
    ...defaultimage, ...COMMON
  },
  {
    name: "Fruit Tycoon",
    descriptionfn: `Na koniec rundy, ${Style.Money("+$1")} za każdy ulepszony owoc w grze.`,
    props: () => ({
      onRoundEnd() {
        let upgradedfruits = 0;
        game.board.forEach(boardx => {
          boardx.forEach(fruit => {
            if (fruit.props.modifier != MODIFIERS.None) {
              upgradedfruits++;
            }
          });
        });
        if (upgradedfruits == 0) return UPGRADE_STATES.Failed;
        game.money += upgradedfruits;
        game.GameRenderer.displayMoney();
        return UPGRADE_STATES.Active;
      },
    }),
    price: 8,
    ...defaultimage, ...UNCOMMON
  },
  {
    name: "Jackpot",
    descriptionfn: `Szansa ${Style.Chance("1 na 100")} że po rundzie dostaniesz ${Style.Money("$100")}`,
    props: () => ({
      onRoundEnd() {
        if (Math.random() < 0.01) {
          game.money += 100;
          game.GameRenderer.displayMoney();
          return { state: UPGRADE_STATES.Active, message: `+$100`, style: SCORE_ACTIONS.Money };

        }
        return UPGRADE_STATES.Failed;
      }
    }),
    price: 10,
    ...defaultimage, ...COMMON
  },
  {
    name: "Collector",
    descriptionfn(game) {
      const collected = this.props?.collected;
      const score = this.props?.score;
      const collectedIcons = collected && collected.size > 0
        ? [...collected].join(" ")
        : "0";
      if (score && score > 0 && this.bought) {
        return `Jeżeli zniszczysz każdy rodzaj owocu w rundzie, ${Style.Score("+200 pkt")} za kaskade. (Zniszczono: ${collectedIcons}/${game.fruits.length}),(Obecnie ${Style.Score(`+${score} pkt`)})`;
      }
      if (collected && game.stage != STAGES.Shop && this.bought) {
        return `Jeżeli zniszczysz każdy rodzaj owocu w rundzie, ${Style.Score("+200 pkt")} za kaskade. (Zniszczono: ${collectedIcons}/${game.fruits.length})`;
      }
      return `Jeżeli zniszczysz każdy rodzaj owocu w rundzie, ${Style.Score("+200 pkt")} za kaskade.`;
    },
    props: () => ({
      score: 0,
      collected: new Set(),
      onMatch(matches) {
        let size = this.props.collected.size;
        matches.forEach(m => {
          if (m.type == TYPES.Fruit) this.props.collected.add(m.icon)
        });

        if (this.props.collected.size === game.fruits.length) {
          this.props.score += 200;
          return UPGRADE_STATES.Active;
        }
        if (size < this.props.collected.size) return UPGRADE_STATES.Active;
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.score <= 0) return UPGRADE_STATES.Failed;
        const gained = this.props.score;
        game.tempscore += this.props.score;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
      },
      reset(){
                this.props.score = 0;
      },
      onRoundEnd() {
        this.props.collected.clear();
        return UPGRADE_STATES.Active;
      },
    }),

    price: 9,
    ...defaultimage, ...COMMON
  },
  {
    name: "BOOM!!",
    descriptionfn(game) {
      return `${Style.Chance(`+1%`)} dla ${game.special[1].icon}`;
    },
    effect(game) {
      game.special[1].props.percent += 1;
      return UPGRADE_STATES.Active;
    },
    remove(game) {
      game.special[1].props.percent -= 1;
    },
    price: 4,
    image: 'boom', ...COMMON
  },
  {
    name: "Boom?",
    descriptionfn(game) {
      return `${game.special[0].icon} i ${game.special[1].icon} detonują się 1 raz więcej.`;
    },
    effect(game) {
      game.special[0].props.detonations += 1;
      game.special[1].props.detonations += 1;
    },
    remove(game) {
      game.special[0].props.detonations -= 1;
      game.special[1].props.detonations -= 1;
    },
    price: 4,
    image: 'boom', ...COMMON
  },
  {
    name: "lvlup",
    descriptionfn(game) {
      return `Daje kartę ulepszeń dla pierwszego zniszczonego owoca (jeśli jest miejsce)`;
    },
    props: () => ({
      chosenFruit: null,
      tried: false,
      onRoundStart() {
        this.isReady = true;
        return UPGRADE_STATES.Ready;
      },
      onMove(payload) {
        const matches = payload.matches;
        //if (game.consumables.length >= game.maxConsumables) return UPGRADE_STATES.Failed;
        if (this.props.tried == true) return UPGRADE_STATES.Failed;
        console.log(matches);
        let match = matches.filter(m => m.type === TYPES.Fruit);
        const firstFruit = match[0] ?? null; //fix this
        this.props.chosenFruit = firstFruit;
        const pool = consumableList.filter(cons => cons?.getFruit?.(game)?.icon === this.props.chosenFruit.icon);
        const rc = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
        let consumable = new Consumable(rc);
        game.consumables.push(consumable);
        game.Audio.playSound('pop.mp3');
        game.GameRenderer.displayPlayerConsumables();
        game.GameRenderer.displayConsumablesCounter();
        this.props.tried = true;
        return UPGRADE_STATES.Active;
      },
      onRoundEnd() {
        this.props.tried = false;
        this.props.chosenFruit = null;
        return UPGRADE_STATES.Active;
      },
    }),
    price: 8,
    ...COMMON
  },
  {
    name: "Dice",
    descriptionfn(game) {
      if (this.props.mult && this.props.mult != null) return `Co ruch dostaje się ${Style.Mult(`X1-6 Mult`)} (Obecnie ${Style.Mult('X' + this.props.mult + " Mult")})`;
      return `Co ruch dostaje się ${Style.Mult(`X1-6 Mult`)}`;
    },
    props: () => ({
      mult: null,
      onMove() {
        this.props.mult = Math.floor(Math.random() * 6) + 1;
        return UPGRADE_STATES.Failed;
      },
      onRoundEnd() {
        this.props.mult = null;
        return UPGRADE_STATES.Active;
      },
      onScore() {
        if (this.props.mult == 1) return UPGRADE_STATES.Failed;
        game.mult *= this.props.mult;
        game.mult = Math.round(game.mult * 100) / 100;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `X${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult };
      },
    }),


    price: 7,
    ...UNCOMMON
  },
  {
    name: "Mirror",
    descriptionfn(game) {
      const neighbor = this.getUltimateNeighbor?.();

      // 1. Jeśli sąsiad jest zablokowany
      if (neighbor && this.banned?.includes(neighbor.name)) {
        return `Nie można skopiować ${neighbor.name}.`;
      }

      // 2. Wyświetlanie opisu skopiowanego ulepszenia
      if (this.mirroredUpgradeCopy) {
        return this.mirroredUpgrade.description(game);
      }

      // 3. Stan domyślny (brak sąsiada)
      return "Kopiuje ulepszenie po swojej prawej stronie.";
    },

    effect(game) {
      this.mirroredUpgrade = null;
      this.mirroredUpgradeCopy = null;
      this.mirroredProps = {};
      this.banned = ["fish", "Pożeracz"]; // Tutaj Mirror MOŻE kopiować inne Mirror (przez ultimate)

      this.getUltimateNeighbor = () => {
        const myIndex = game.upgrades.indexOf(this);
        if (myIndex === -1) return null;

        let nextIdx = myIndex + 1;
        let neighbor = game.upgrades[nextIdx];

        // Szukamy pierwszego ulepszenia, które nie jest Lustrem
        while (neighbor && neighbor.name === "Mirror") {
          nextIdx++;
          neighbor = game.upgrades[nextIdx];
          // Zabezpieczenie przed pętlą (choć przy kierunku w prawo mało prawdopodobne)
          if (nextIdx > game.upgrades.length) break;
        }
        return neighbor || null;
      };

      this.syncMirror = () => {
        const neighbor = this.getUltimateNeighbor();
        const isBanned = neighbor && this.banned.includes(neighbor.name);

        // Jeśli cel jest ten sam, nie przeliczaj (optymalizacja)
        if (neighbor === this.mirroredUpgrade) return;

        // 1. Sprzątanie: wywołujemy remove() kopii, jeśli istniała
        if (this.mirroredUpgradeCopy) {
          if (typeof this.mirroredUpgradeCopy.props.remove === "function") {
            this.mirroredUpgradeCopy.props?.remove(game);
          }
          this.mirroredUpgradeCopy = null;
        }

        this.mirroredUpgrade = neighbor;

        // 2. Jeśli pusto lub banned
        if (!neighbor || isBanned) {
          this.mirroredProps = {};
          this.props = { image: "brokenmirror" };
          return;
        }

        // 3. Tworzenie nowej kopii
        try {
          const copyUpgrade = Upgrade.Copy(neighbor);
          this.mirroredUpgradeCopy = copyUpgrade;

          // Ważne: Przenosimy triggery (onMatch itp.) do propsów lustra
          this.mirroredProps = copyUpgrade.props || {};
          this.props = { ...this.mirroredProps, image: "mirror" };

          // Jeśli kopiowane ulepszenie ma effect (np. dodaje ruchy), wywołaj go dla lustra
          if (typeof copyUpgrade.props.effect === "function") {
            copyUpgrade.props?.effect(game);
          }
        } catch (e) {
          console.error("Mirror Copy Error:", e);
          this.props = { image: "brokenmirror" };
        }
      };

      this.onUpgradesChanged = () => {
        this.syncMirror();
        return UPGRADE_STATES.Active;
      };

      this.syncMirror();
    },

    remove(game) {
      // Przy usuwaniu lustra musimy cofnąć efekty jego kopii
      if (this.mirroredUpgradeCopy && typeof this.mirroredUpgradeCopy.remove === "function") {
        this.mirroredUpgradeCopy.remove(game);
      }
      this.mirroredUpgradeCopy = null;
      this.mirroredUpgrade = null;
    },

    price: 8,
    image: "brokenmirror",
    ...RARE,
  },
  {
    name: "Adrenaline",
    descriptionfn(game) {
      return `Jeżeli zostało mniej niż 3 ruchy, ${Style.Mult(`+10 Mult`)}`
    },
    props: () => ({
      onScore() {
        if (game.moves - game.movescounter < 3) {
          game.mult += 10;
          return { state: UPGRADE_STATES.Score, message: `+10 Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      }
    })
    , price: 5,
    ...defaultimage, ...COMMON
  },
  {
    name: "Critical Hit",
    descriptionfn(game) {
      var mult = this.props.mult ?? 1;
      return `${Style.Chance(`1 na 20`)} że co kaskade dostanie się ${Style.Mult(`X3 Mult`)}, (Obecnie ${Style.Mult('X' + mult + ' Mult')})`;
    },
    props: () => ({
      mult: 1,
      onMatch(matches) {
        if (Math.random() < 0.05) {
          this.props.mult *= 3;
          this.props.mult = Math.round(this.props.mult * 100) / 100;
          return { state: UPGRADE_STATES.Active, message: `X3 Mult`, style: SCORE_ACTIONS.Info };
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (this.props.mult > 1) {
          const gained = this.props.mult;
          game.mult *= this.props.mult;
          game.mult = Math.round(game.mult * 100) / 100;
          game.GameRenderer.displayTempScore();
          return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
        return UPGRADE_STATES.Failed;
      },
      reset(){
        this.props.mult = 1;
      }
    }),
    price: 6,
    image: "critical_hit", ...COMMON
  },
  {
    name: "Pożeracz",
    descriptionfn(game) {
      var mult = this.props.mult ?? 1;
      return `Na początku rundy niszczy ulepszenie po prawej stronie i zyskuje ${Style.Mult(`+ Mult`)} ceny sprzedaży ulepszenia. (Obecnie ${Style.Mult(`+${mult} Mult`)})`;
    },
    props: () => ({
      mult: 1,
      onRoundStart() {
        const neighbor = this.getRightNeighbor();
        if (neighbor != null) {
          const gained = neighbor.sellPrice
          const index = game.upgrades.indexOf(neighbor);
          this.props.mult += gained;
          neighbor.props?.remove?.call(this, game);
          game.upgrades.splice(index, 1);
          game.GameRenderer.dissolveAndRemove(neighbor.wrapper, 1000);

          //game.GameRenderer.displayPlayerUpgrades();
          return { state: UPGRADE_STATES.Active, message: `+${gained} Mult`, style: SCORE_ACTIONS.Info };
        }
        return { state: UPGRADE_STATES.Tried, message: `Failed`, style: SCORE_ACTIONS.Failed }
      },
      onScore() {
        const gained = this.props.mult;
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
      },
      onRoundEnd() {
        this.isReady = true;
        return UPGRADE_STATES.Ready;
      },
    }),
    effect(game) {
      this.isReady = true;
      this.getRightNeighbor = () => {
        const index = game.upgrades.indexOf(this);
        if (index === -1 || index + 1 >= game.upgrades.length) return null;
        return game.upgrades[index + 1];
      }
    },
    price: 7,
    ...defaultimage, ...COMMON
  },
  {
    name: "Liczydło",
    descriptionfn(game) {
      var mult = this.props.mult ?? 1;
      return `Co 15 zniszczonych owoców ${Style.Mult(`+1 Mult`)}. (Obecnie ${Style.Mult(`${mult} Mult`)})`;
    },
    props: () => ({
      mult: 1,
      count: 0,
      onMatch(matches) {
        this.props.count += matches.length;
        var added = false;
        if (this.props.count >= 15) added = true;
        while (this.props.count >= 15) {
          this.props.count -= 15;
          this.props.mult += 1;
        }
        if (added) return UPGRADE_STATES.Active;
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        game.mult += this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult };
      },
    }),
    price: 6,
    image: 'counter', ...UNCOMMON

  },
  {
    name: "20/20",
    descriptionfn(game) {
      return `Wszystkie ulepszenia kafelków aktywują się dwukrotnie`;
    },
    props: () => ({
      onConsumableUse(consumable) {
        if (!consumable) {
          return UPGRADE_STATES.Failed;
        }
        if (consumableUpgradeBlueprints.some(b => b.name === consumable.name)) {
          return { state: UPGRADE_STATES.Tried, message: `Nie można skopiować`, style: SCORE_ACTIONS.Failed }
        }
        consumable.negative = false;
        consumable.apply(game);
        return { state: UPGRADE_STATES.Active, message: `Użyto!`, style: SCORE_ACTIONS.Info }
      },
    }),
    price: 10,
    image: 'lvlup', ...RARE

  },
  {
    name: "Empty",
    descriptionfn(game) {
      const mult = this.props?.mult ?? 1;
      return `${Style.Mult(`+X1 Mult`)} za każde nieużyte miejsce ulepszeń (Obecnie ${Style.Mult(`X${mult} Mult`)})`;
    },
    props: () => ({
      mult: 1,
      onUpgradesChanged() {
        const oldmult = this.props.mult;
        this.props.mult = game.maxUpgrades - game.upgrades.length + 1;
        if (this.props.mult != oldmult) {
          return UPGRADE_STATES.Active;
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        if (mult <= 1) return UPGRADE_STATES.Failed;
        const gained = this.props.mult;
        game.mult *= this.props.mult;
        game.mult = Math.round(game.mult * 100) / 100;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };
      },
    }),
    price: 6,
    ...UNCOMMON
  },
  {
    name: "Snowman",
    descriptionfn(game) {
      var score = this.props?.score ?? 0;
      var text = `Każda kaskada daje o ${Style.Score(`+20 pkt`)} więcej niż poprzednia, resetuje się po ruchu.`;
      if (score > 0) text += `(Obecnie ${Style.Score(`+${score} pkt`)})`;
      return text;
    },
    props: () => ({
      score: 0,
      add: 0,
      onMatch() {
        this.props.add += 20;
        this.props.score += this.props.add;
        return { state: UPGRADE_STATES.Active, message: `+${this.props.add} pkt`, style: SCORE_ACTIONS.Score };
      },
      onScore() {
        if (this.score <= 0) return UPGRADE_STATES.Failed;
        const gained = this.props.score;
        game.tempscore += this.props.score;
        game.GameRenderer.displayTempScore();
        // this.props.add = 0;
        // this.props.score = 0;
        return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
      },
      reset(){
        this.props.add = 0;
        this.props.score = 0;
      }
    }),
    price: 4,
    ...COMMON
  },
  {
    name: "Tripple",
    descriptionfn(game) {
      const score = this.props.score ?? 0;
      return `Jeżeli zrobi się tylko trójkę w kaskadzie, ${Style.Score(`+3 pkt`)} do ulepszenia. Na końcu rundy daje zebrane punkty. (Obecnie ${Style.Score(`+${score} Pkt`)})`;
    },
    props: () => ({
      score: 0,
      onMatch(payload) {
        if (game.matchesManager.isThreeLine(payload)) {
          this.props.score += 3;
          return UPGRADE_STATES.Active;
        }
        return UPGRADE_STATES.Failed;
      },
      onScore() {
        const gained = this.props.score;
        game.tempscore += this.props.score;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
      },
    }),
    price: 4,
    ...COMMON
  },
  {
    name: "Gorączka",
    descriptionfn(game) {
      return `Daje ${Style.Mult('10-20 Mult')}. ${Style.Chance(`1 na 10`)}, że zniknie na końcu rundy.`;
    },
    props: () => ({
      onScore() {
        const gained = Math.floor(Math.random() * 10) + 10;
        game.mult += gained;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
      },
      onRoundEnd() {
        if (Math.floor(Math.random() * 10) != 0) return;
        const index = game.upgrades.indexOf(this) ?? -1;
        if (index == -1) return;
        game.upgrades.splice(index, 1);
        game.GameRenderer.displayUpgradesCounter();
        game.GameRenderer.dissolveAndRemove(this.wrapper,1000);
        //game.GameRenderer.displayPlayerUpgrades();
        game.emit(GAME_TRIGGERS.onUpgradesChanged);
         return { state: UPGRADE_STATES.Active, message: `:(`, style: SCORE_ACTIONS.Info }
      },
    }),
    price: 6,
    image: 'fever',
    ...UNCOMMON
  },
  {
    name: "Dolar",
    descriptionfn(game) {
      return `Na końcu rundy daje ${Style.Money('$4')}`;
    },
    props: () => ({
      onRoundEnd() {
        game.money += 4;
        game.GameRenderer.updateMoney(4);
        return { state: UPGRADE_STATES.Active, message: `+$4`, style: SCORE_ACTIONS.Money };
      },
    }),
    price: 4,
    ...defaultimage, ...COMMON
  },
  {
    name: "Saper",
    descriptionfn(game) {
      return `${Style.Chance('1 na 5')} na każdą bombę lub dynamit, że zostanie wysadzony na początku ruchu`;
    },
    props: () => ({
      onMove(payload) {
        console.log(payload);
        let game = payload.game;
        let matches = payload.matches;
        const board = game.board;


        // 1. Bezpieczniejsze pobieranie materiałów wybuchowych (bez indexOf)
        let explosives = [];
        for (let y = 0; y < board.length; y++) {
          //console.log(board[y]);
          explosives.push(...game.matchesManager.specialMatches(board[y]));
        }
        let triggered = false;

        // 2. Zbieramy wszystkie nowe trafienia

        explosives.forEach(explosive => {
          if (Math.random() < 0.2) {
            matches.push(explosive);
            triggered = true;
          }
        });
        if (triggered)
          return { state: UPGRADE_STATES.Active, message: `BOOM!`, style: SCORE_ACTIONS.Money };
        return UPGRADE_STATES.Failed;
      }
    }),
    price: 6,
    ...COMMON
  },
  {
    name: "Karta Kredytowa",
    descriptionfn(game) {
      return `Pozwala wziąć ${Style.Money(`$10`)} długu`;
    },
    effect(game){
      game.minMoney += 10;
    },
    remove(game){
      game.minMoney -= 10;
    },
    price: 4,
    ...COMMON,
    image: 'credit'
  },/*
  {
    name: "Kosiarka",
    descriptionfn(game) {
      return `Uruchamia ponownie wszystkie ulepszenia.`;
    },
    
    props: () => ({
      canRetrigger: true,
      async onScore(payload) {      
      return { state: UPGRADE_STATES.Active, message: "ECHO!" };
      }
    }
    ),
    price: 6,
    ...COMMON
  }*/
  /*
  {
    name: "",
    descriptionfn(game){
      //ulepszenie które retriggeruje coś ale jeszcze nie wiem
    }
  }*/
];


upgradeBlueprints.forEach(upgrade => {
  upgrade.type = "Upgrade";
});
// push all blueprints into upgradesList
upgradeBlueprints.forEach(bp => upgradesList.push(bp));