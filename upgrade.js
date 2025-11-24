console.log("Upgrade");
import { Consumable, Upgrade } from "./upgradeBase.js";
import { GAME_TRIGGERS, MODIFIERS, SCORE_ACTIONS, STAGES, TYPES, UPGRADE_RARITY, UPGRADE_RARITY_NAME, UPGRADE_STATES } from "./dictionary.js";
import { Style } from "./RenderUI.js";
import { consumableList, consumableUpgradeBlueprints } from "./consumable.js";


export const upgradesList = [];

const defaultimage = { image: "default" };
const COMMON = {rarity: UPGRADE_RARITY_NAME.Common};
const UNCOMMON = {rarity: UPGRADE_RARITY_NAME.Uncommon};
const RARE = {rarity: UPGRADE_RARITY_NAME.Rare};
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
            const gained = this.props.score;
            this.props.score = 0;
            
            return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
          }
          return UPGRADE_STATES.Failed;
        }
      });
      
    },
    remove(game) {
      
    },
    price: 4,
    props:COMMON
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
          return {state: UPGRADE_STATES.Active, message: `-100% ${this.props.randomfruit.icon}`,style: SCORE_ACTIONS.Info};
        },
        onRoundEnd: () => {
          const chance = game.calcEqualize(this.props.previousPercent);
          this.props.randomfruit.percent += this.props.previousPercent;
          game.addChancesExcept(this.props.randomfruit, -chance);
          this.props.randomfruit = null;
          return UPGRADE_STATES.Failed;
        }
      });
      
    },
    remove(game) {
      if(this.props.randomfruit){
        const chance = game.calcEqualize(this.props.previousPercent);
          this.props.randomfruit.percent += this.props.previousPercent;
          game.addChancesExcept(this.props.randomfruit, -chance);
          this.props.randomfruit = null;
      }
    },
    price: 8,
    props: UNCOMMON
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
    props: COMMON
  },

  {
    name: "Bomber",
    descriptionfn: `${Style.Score("+250 punktów")} za ruch, ${Style.Moves("-2 ruchy")}`,
    effect(game) {
      game.moves -= 2;
      game.GameRenderer.displayMoves();
      this.setProps({
        onScore: () => {
          game.tempscore += 250;
          game.GameRenderer.displayScore();
          return { state: UPGRADE_STATES.Score, message: "+250 pkt", style: SCORE_ACTIONS.Score };
        }
      });
      
    },
    remove(game) {
      game.moves += 2;
      game.GameRenderer.displayMoves();
      
    },
    price: 4,
    props: { image: "boom",...COMMON }
  },

  {
    name: "tetris",
    descriptionfn: `${Style.Moves("+4 ruchy")}`,
    effect(game) {
      game.moves += 4;
      game.GameRenderer.displayMoves();
    },
    remove(game) {
      game.moves -= 4;
      game.GameRenderer.displayMoves();
    },
    price: 4,
    props: COMMON
  },

  {
    name: "Mult",
    descriptionfn: `${Style.Mult("+4 mult")}`,
    effect(game) {
      this.setProps({
        onScore: () => {
          game.mult += 4;
          game.GameRenderer.displayTempScore();
          return { state: UPGRADE_STATES.Score, message: "+4 Mult", style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game) {
      
    },
    price: 4,
    props: COMMON
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
          const mult = this.props.mult;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game) {
      
    },
    price: 5,
    props: { mult: 0,...COMMON }
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
          const mult = this.props.mult;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game) {
      
    },
    price: 5,
    props: { mult: 0, image: 'default',...COMMON }
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
          const mult = this.props.mult;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game) {
      
    },
    price: 5,
    props: { mult: 0, image: 'default',...COMMON }
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
          const mult = this.props.mult;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game) {
      
    },
    price: 5,
    props: { mult: 0, image: 'default',...COMMON}
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
          const mult = this.props.mult;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          this.props.mult = 0;
          return { state: UPGRADE_STATES.Score, message: `+${mult} Mult`, style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game) {
      
    },
    price: 5,
    props: { mult: 0, image: 'default',...COMMON }
  },
  {
    name: "Coconut Bank",
    descriptionfn(game) {
      if (!this.props.previousPercent || this.props.previousPercent == -1) 
        return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance("-10%")} ${game.fruits[4].icon}, ${Style.Chance("+2.5%")} dla reszty`;
      return `${Style.Chance("+50%")} aby ${game.fruits[4].icon} był złoty, ${Style.Chance(`-${this.props.previousPercent}%`)} ${game.fruits[4].icon}, ${Style.Chance(`+${this.props.previousPercent/(game.fruits.length-1)}`)} dla reszty`;
    },
    effect(game) {
      this.reset = (game)=>{
        game.fruits[4].percent += this.props.previousPercent;
        game.fruits[4].props.upgrade.goldchance -= 50;
        game.addChancesExcept(game.fruits[4], -this.props.previousPercent / (game.fruits.length - 1)); 
      }
      this.setProps({
        previousPercent: -1,
        applied: false,
        onRoundStart: () => {
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
        onRoundEnd: () => {
          this.reset(game);
          this.props.applied = false;
          return UPGRADE_STATES.Failed;
        }
      });
    },
    remove(game) {
      if(this.props?.applied==true){
        this.reset(game);
      }
    },
    price: 10,
    props: { image: "coconutbank",...UNCOMMON }
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
    props: {image: 'goldenfruits',...COMMON}
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
    props: { image: "metalplate",...COMMON }
  },

  {
    name: "GrapeInterest",
    descriptionfn(game) {
      if (!this.props.isactive) return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+10 pkt")}`;
      return `Każda ${game.fruits[3].icon} daje ${Style.Score("+5 pkt")}, na końcu rundy zyskuje kolejne ${Style.Score("+10 pkt")} (Obecnie ${Style.Score(`+${this.props.value} pkt`)}, ${Style.Score(`+${this.props.score} pkt do wyniku`)})`;
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
          const gained = this.props.score;
          game.tempscore += this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
        },
        onRoundEnd: () => {
          this.props.value += 10;
          return UPGRADE_STATES.Active;
        }
      });
      
    },
    remove(game) {
      
    },
    price: 6,
    props: {image: 'grapeinterest',...UNCOMMON}
  },

  {
    name: "ChainReaction",
    descriptionfn(game) {
      if (this.score&&this.score>0) return `Każda kaskada daje dodatkowe ${Style.Score("+30 punktów")}, (obecnie ${Style.Score(`+${this.props.score}`)})`;
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
          let messagescore = this.props.score;
          game.tempscore += this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return {state: UPGRADE_STATES.Score,message: `+${messagescore} pkt`, style: SCORE_ACTIONS.Score};
        }
      });
      
    },
    remove(game) {
      
    },
    price: 4,
    props: { score: 0,...COMMON }
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
          return {state: UPGRADE_STATES.Score, message: `+${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult};
        
        },
        onRoundEnd: () => {
          this.props.mult += 1;
          return UPGRADE_STATES.Active;
        }
      });
      
    },
    remove(game) {
      
    },
    price: 8,
    props: {mult:1,...COMMON}
  },

  {
    name: "High Five",
    descriptionfn: `Gdy zrobi się piątke, ${Style.Mult("X2 mult")}`,
    effect(game) {
      this.setProps({
        mult: 0,
        onMatch: (payload) => {
          if (payload && game.isFiveLine(payload)){
            this.props.mult+=2;
            return {state: UPGRADE_STATES.Active, message: `+X2 Mult`, style: SCORE_ACTIONS.Mult} ;
          } return UPGRADE_STATES.Failed;
        },
        onScore: () => {
          if (this.props.mult>0) {
            let messagemult = this.props.mult;
            game.mult *= this.props.mult;
            game.GameRenderer.displayTempScore();
            this.props.mult = 0;
            return {state: UPGRADE_STATES.Score,message: `X${messagemult} Mult`,style: SCORE_ACTIONS.Mult};
          }
          return UPGRADE_STATES.Failed;
        }
      });
      
    },
    remove(game) {
      
    },
    price: 6,
    props: { image: "highfive",...UNCOMMON }
  },

  {
    name: "broke",
    descriptionfn: `Jeżeli ma się mniej niż $6, ${Style.Score("+250 punktów")}`,
    effect(game) {
      this.setProps({
        onScore: () => {
          let hasMoney = game.money < 6;
          if (hasMoney) {
            game.tempscore += 250;
            return { state: UPGRADE_STATES.Score, message: "+250 pkt", style: SCORE_ACTIONS.Score };
          }
          return UPGRADE_STATES.Failed;
        }
      });
      
    },
    remove(game) {
      
    },
    price: 6,
    props: {...defaultimage,...COMMON}
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
          return { state: UPGRADE_STATES.Score, message: `+${this.props.sellPriceMult} Mult`, style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game) {
      
    },
    price: 4,
    props: UNCOMMON
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
    props: RARE
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
            const gained = Math.round(this.props.mult * 100) / 100;
            game.mult *= this.props.mult;
            game.mult = Math.round(game.mult * 100) / 100;
            this.props.mult = 1;
            return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };
          }
          return UPGRADE_STATES.Failed;
        }
      });
      
    },
    remove(game) {
      
    },
    price: 10,
    props: UNCOMMON
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
          const gained = this.props.mult;
          game.mult*=this.props.mult;
          game.mult = Math.round(game.mult * 100) / 100;
          game.GameRenderer.displayTempScore();
          this.props.mult = 1;
          return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };
        }
      });
      
    },
    remove(game){
      
    },
    price: 8,
    props: {image: 'default', mult: 1,...UNCOMMON}
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
            return {state:UPGRADE_STATES.Active,message: `+$20`, style:SCORE_ACTIONS.Money};
          } 
          return UPGRADE_STATES.Failed;
        }
      });
      
    },
    remove(game){
      
    },
    price: 8,
    props: UNCOMMON
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
          return { state: UPGRADE_STATES.Score, message: `X${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult };

        },
        onRoundEnd: () => {
          this.props.found = false;
          return UPGRADE_STATES.Active;
        }
      });
      
    },
    remove(game){
      
    },
    price: 8,
    props: {image: '6pak',...RARE}
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
            const gained = this.props.score;
            game.tempscore+=this.props.score;
            game.GameRenderer.displayTempScore();
            this.props.score = 0;
            return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };

        }
      });
      
    },
    remove(game){
      
    },
    price: 4,
    props: {image: 'moneymaker',...COMMON}
  },
  {
    name: "fish",
    descriptionfn(game){
      return `co rundę cena sprzedarzy zwiększa się o ${Style.Money(`$3`)}. (Obecnie ${Style.Money('$'+this.sellPrice)})`;
    },
    effect(game){
      this.setProps({
        sellPrice: 3,
        onRoundEnd: () => {
          this.props.sellPrice+=3;
          this.sellPrice=this.props.sellPrice;
          return {state: UPGRADE_STATES.Active,message: `Upgrade!`,style: SCORE_ACTIONS.Money};
        }
      });
      
    },
    remove(game){
      
    },
    price: 6,
    props: COMMON
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
          const gained = this.props.score;
          game.tempscore+=this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };

        }
      });
      
    },
    remove(game){
      
    },
    price: 6,
    props: {...defaultimage,...COMMON}
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
        
      },
      remove(game) {  },
      price: 8,
      props: {...defaultimage,...UNCOMMON}
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
          return {state:UPGRADE_STATES.Active,message: `+$100`, style:SCORE_ACTIONS.Money};
          
        }
        return UPGRADE_STATES.Failed;
      }
    });
    
  },
  remove(game) {  },
  price: 10,
  props: {...defaultimage,...COMMON}
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
          const gained = this.props.score;
          game.tempscore += this.props.score;
          game.GameRenderer.displayTempScore();
          this.props.score = 0;
          return { state: UPGRADE_STATES.Score, message: `+${gained} pkt`, style: SCORE_ACTIONS.Score };
      },
      onRoundEnd: () => {
        this.props.collected.clear();
        return UPGRADE_STATES.Active;
      }
    });
    
  },
  remove(game) {  },
  price: 9,
  props: {...defaultimage,...COMMON}
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
  },
  price: 4,
  props: {image: 'boom',...COMMON}
},
{
  name: "Boom?",
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
  props: {image: 'boom',...COMMON}
},
{
  name: "lvlup",
  descriptionfn(game){
    return `Daje kartę ulepszeń dla pierwszego zniszczonego owoca (jeśli jest miejsce)`;
  },
  effect(game){
    this.setProps({
      chosenFruit: null,
      onRoundStart: ()=>{
        this.isReady = true;
        return UPGRADE_STATES.Ready;
      },
      onMove: (matches)=>{
        if(game.consumables.length>=game.maxConsumables) return UPGRADE_STATES.Failed;
        if(this.props.chosenFruit!=null) return UPGRADE_STATES.Failed;
        console.log(matches);
        let match = matches.filter(m => m.fruit.type === TYPES.Fruit);
        const firstFruit = match[0]?.fruit ?? null; //fix this
        this.props.chosenFruit = firstFruit;
        const pool = consumableList.filter(cons => cons?.props?.getFruit?.(game)?.icon === this.props.chosenFruit.icon);
        const rc = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
        let consumable = new Consumable(rc.name,rc.description,rc.effect,rc.price,rc.props);
        game.consumables.push(consumable);
        game.Audio.playSound('pop.mp3');
        game.GameRenderer.displayPlayerConsumables();
        game.GameRenderer.displayConsumablesCounter();
        return UPGRADE_STATES.Active;  
      },
      onRoundEnd: ()=>{
        this.props.chosenFruit = null;
        return UPGRADE_STATES.Active;
      }
    });
    
  },
  remove(game){
     
  },
  price: 8,
  props: COMMON
},
{
  name: "Dice",
  descriptionfn(game){
    if(this.props.mult&&this.props.mult!=null)  return `Co ruch dostaje się ${Style.Mult(`X1-6 Mult`)} (Obecnie ${Style.Mult('X'+this.props.mult+" Mult")})`;
    return `Co ruch dostaje się ${Style.Mult(`X1-6 Mult`)}`;
  },
  effect(game){
    this.setProps({
      mult: null,
      onMove: ()=>{
        this.props.mult = Math.floor(Math.random()*6)+1;
        return UPGRADE_STATES.Active; 
      },
      onRoundEnd: ()=>{
        this.props.mult = null;
        return UPGRADE_STATES.Active;
      },
      onScore: ()=>{
        if(this.props.mult==1) return UPGRADE_STATES.Failed;
        game.mult *= this.props.mult;
        game.mult = Math.round(game.mult * 100) / 100;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `X${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult };
      }
    });
    
  },
  remove(game){
    
  },
  price: 7,
  props: UNCOMMON
},
{ name: "Mirror",
  descriptionfn(game) {
    if (this?.mirroredUpgradeCopy)
      return this.mirroredUpgradeCopy.description(game);
    return "Kopiuje ulepszenie po swojej prawej stronie.";
  },

  effect(game) {
    this.mirroredUpgrade = null;
    this.mirroredUpgradeCopy = null;
    this.mirroredProps = {};
    this.lastNeighbor = null;
    this.applied = false;

    // --- Find neighbor to the right ---
    this.getRightNeighbor = () => {
      const index = game.upgrades.indexOf(this);
      if (index === -1 || index + 1 >= game.upgrades.length) return null;
      return game.upgrades[index + 1];
    };
    this.getUltimateNeighbor = () => {
      let neighbor = game.upgrades[game.upgrades.indexOf(this) + 1];
      const visited = new Set();
      while (neighbor && neighbor.name === "Mirror" && !visited.has(neighbor)) {
        visited.add(neighbor);
        neighbor = game.upgrades[game.upgrades.indexOf(neighbor) + 1];
      }
      return neighbor || null;
    };

    // --- Determine if this mirror is the "owner" of a chain ---
    this.isOwner = () => {
      const ultimateNeighbor = this.getUltimateNeighbor();
      const myIndex = game.upgrades.indexOf(this);
      for (let i = 0; i < myIndex; i++) {
        const u = game.upgrades[i];
        if (u.name === "Mirror" && u.getUltimateNeighbor?.() === ultimateNeighbor) {
          return false; // a mirror before me already owns it
        }
      }
      return true;
    };

    // --- Build a fresh independent copy of the neighbor ---
    this.buildCopy = (source) => {
  if (!source) return null;
  const copyBp = upgradesList.find(up => up.name === source.name);
  if (!copyBp) return null;

  const copyUpgrade = new Upgrade(
    copyBp.name,
    copyBp.descriptionfn,
    copyBp.effect,
    copyBp.remove,
    copyBp.price,
    deepClone(copyBp.props ?? {})
  );

  if (typeof copyUpgrade.effect === "function") {
    copyUpgrade.effect(game);
    console.log("applied");
  }
  
  for (const key in source.props) {
    const val = source.props[key];
    if (typeof val !== "function") {
      copyUpgrade.props[key] = deepClone(val);
    }
  }
  copyUpgrade.bought = true;
  console.log("BuildCopy:");
  console.log(copyUpgrade);
  return copyUpgrade;
};

// --- Helper: Deep clone supporting Set, Map, Array, Object ---
function deepClone(obj, visited = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (visited.has(obj)) return visited.get(obj);

  if (obj instanceof Set) {
    const newSet = new Set();
    visited.set(obj, newSet);
    for (const item of obj) newSet.add(deepClone(item, visited));
    return newSet;
  }

  if (obj instanceof Map) {
    const newMap = new Map();
    visited.set(obj, newMap);
    for (const [k, v] of obj) newMap.set(deepClone(k, visited), deepClone(v, visited));
    return newMap;
  }

  if (Array.isArray(obj)) {
    const arr = [];
    visited.set(obj, arr);
    for (const item of obj) arr.push(deepClone(item, visited));
    return arr;
  }

  const cloned = {};
  visited.set(obj, cloned);
  for (const key in obj) {
    cloned[key] = deepClone(obj[key], visited);
  }
  return cloned;
}

    // --- Synchronize the mirror ---
    this.syncMirror = () => {
      const neighbor = this.getUltimateNeighbor();
      if(neighbor===this.mirroredUpgrade) return;
      // Remove previous copy if target changed
      if (this.mirroredUpgradeCopy && neighbor !== this.mirroredUpgrade) {
        if (typeof this.mirroredUpgradeCopy.remove === "function") {
          this.mirroredUpgradeCopy.remove(game);
          this.mirroredUpgradeCopy = null;
        }
        this.lastNeighbor = neighbor;
        console.log("removed");
      }
      this.mirroredUpgrade = neighbor;
      console.log("neighbor: ");
      console.log(neighbor);
      if (!neighbor) {
        this.mirroredUpgrade = null;
        this.mirroredProps = {};
        this.props = { image: "brokenmirror" };
        return;
      }

      // Just copy the neighbor — even if it's a Mirror
      const copyUpgrade = this.buildCopy(neighbor);
      console.log("kopia: ");
      console.log(copyUpgrade);
      this.mirroredUpgradeCopy = copyUpgrade;
      this.mirroredProps = copyUpgrade.props;
      this.props = { ...this.mirroredProps, image: "mirror" };
    };

    // --- When upgrades layout changes ---
    this.onUpgradesChanged = () => {
      this.syncMirror();
      return UPGRADE_STATES.Active;
    };

    // --- Initial sync ---
    this.syncMirror();
  },

  remove(game) {
    if (this.mirroredUpgrade && typeof this.mirroredUpgrade.remove === "function") {
      this.mirroredUpgrade.remove(game);
    }
    this.mirroredUpgrade = null;
    this.mirroredProps = {};
    this.props = { image: "brokenmirror" };
  },

  price: 8,
  props: { image: "brokenmirror",...RARE },
},
{ name: "Adrenaline",
  descriptionfn(game){
    return `Jeżeli zostało mniej niż 3 ruchy, ${Style.Mult(`+10 Mult`)}`
  },
  effect(game){
    this.setProps({
      onScore: ()=>{
        if(game.moves-game.movescounter<3){
        game.mult+=10;
        return { state: UPGRADE_STATES.Score, message: `+10 Mult`, style: SCORE_ACTIONS.Mult };
      }
      return UPGRADE_STATES.Failed;
    }
    });
  },
  remove(game){},
  price: 5,
  props: {...defaultimage,...COMMON}
},
{ name: "Critical Hit",
  descriptionfn(game){
    var mult = this.props.mult ?? 1;
    return `${Style.Chance(`1 na 20`)} że co kaskade dostanie się ${Style.Mult(`X3 Mult`)}, (Obecnie ${Style.Mult('X'+mult+' Mult')})`;
  },
  effect(game){
      this.setProps({
        mult: 1,
        onMatch: (matches)=>{
          if(Math.random()<0.05){
            this.props.mult *= 3;
            this.props.mult = Math.round(this.props.mult * 100) / 100;
            return { state: UPGRADE_STATES.Active, message: `X3 Mult`, style: SCORE_ACTIONS.Info };
          }
          return UPGRADE_STATES.Failed;
        },
        onScore: ()=>{
          if(this.props.mult>1){
            const gained = this.props.mult;
            game.mult *= this.props.mult;
            game.mult = Math.round(game.mult * 100) / 100;
            game.GameRenderer.displayTempScore();
            this.props.mult = 1;
            return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };
          }
          return UPGRADE_STATES.Failed;
        }
      });
  },
  remove(game){},
  price: 6,
  props: {...defaultimage,...COMMON}
},
{ name: "Soul Eater",
  descriptionfn(game){
    var mult = this.props.mult ?? 1;
    return `Na początku rundy niszczy ulepszenie po prawej stronie i zyskuje ${Style.Mult(`+Mult ceny sprzedarzy`)} ulepszenia. (Obecnie ${Style.Mult(`+${mult} Mult`)})`;
  },
  effect(game){
    this.isReady = true;
    this.getRightNeighbor = () => {
      const index = game.upgrades.indexOf(this);
      if (index === -1 || index + 1 >= game.upgrades.length) return null;
      return game.upgrades[index + 1];
    };
    this.setProps({
      mult: 1,
      onRoundStart: () => {
        const neighbor = this.getRightNeighbor();
        if(neighbor!=null){
          const gained = neighbor.sellPrice
          const index = game.upgrades.indexOf(neighbor);
          this.props.mult += gained;
          neighbor.remove(game);
          game.upgrades.splice(index, 1);
          game.GameRenderer.displayPlayerUpgrades();
          return { state: UPGRADE_STATES.Active, message: `+${gained} Mult`, style: SCORE_ACTIONS.Info };
        }
        return {state: UPGRADE_STATES.Tried, message: `Failed`, style: SCORE_ACTIONS.Failed}
      },
      onScore: ()=>{
          const gained = this.props.mult;
          game.mult += this.props.mult;
          game.GameRenderer.displayTempScore();
          return { state: UPGRADE_STATES.Score, message: `+${gained} Mult`, style: SCORE_ACTIONS.Mult };
        },
        onRoundEnd : ()=>{
          this.isReady = true;
          return UPGRADE_STATES.Ready;
        }
    });
},
remove(game){},
price: 7,
props: {...defaultimage,...COMMON }
},
{ name: "counter",
  descriptionfn(game){
    var mult = this.props.mult ?? 1;
    return `Co 15 zniszczonych owoców ${Style.Mult(`+1 Mult`)}. (Obecnie ${Style.Mult(`${mult} Mult`)})`;
  },
  effect(game){
    this.setProps({
      mult: 1,
      count: 0,
      onMatch: (matches) => {
        this.props.count+=matches.length;
        var added = false;
        if(this.props.count>=15) added = true;
        while(this.props.count>=15){
          this.props.count-=15;
          this.props.mult+=1;
        }
        if(added) return UPGRADE_STATES.Active;
        return UPGRADE_STATES.Failed;
      },
      onScore: ()=>{
        game.mult+=this.props.mult;
        game.GameRenderer.displayTempScore();
        return { state: UPGRADE_STATES.Score, message: `+${this.props.mult} Mult`, style: SCORE_ACTIONS.Mult };
      }
    });
  },
  remove(game){

  },
  price: 6,
  props: {...defaultimage,...UNCOMMON}

},
{ name: "20/20",
  descriptionfn(game){
    return `Wszystkie ulepszenia kafelków aktywują się dwukrotnie`;
  },
  effect(game){
    this.setProps({
      onConsumableUse: (consumable)=>{
        if(!consumable){
          return UPGRADE_STATES.Failed;
        }
        if(consumableUpgradeBlueprints.some(b => b.name === consumable.name)){
          return {state: UPGRADE_STATES.Tried, message: `Nie można skopiować`, style: SCORE_ACTIONS.Failed}
        }
        consumable.negative = false;
        consumable.apply(game);
        return {state: UPGRADE_STATES.Active, message: `Użyto!`, style: SCORE_ACTIONS.Info}
      }
    });
  },
  remove(game){

  },
  price: 10,
  props: {image: 'lvlup',...RARE}

},
{
  name: "Empty",
  descriptionfn(game){
    const mult = this.props?.mult ?? 1;
    return `${Style.Mult(`+X1 Mult`)} za każde nieużyte miejsce ulepszeń (Obecnie ${Style.Mult(`X${mult} Mult`)})`;
  },
  effect(game){
    this.setProps({
      mult: 1,
      onUpgradesChanged: () => {
        const oldmult = this.props.mult;
        this.props.mult = game.maxUpgrades - game.upgrades.length + 1;
        if(this.props.mult!=oldmult){
          return UPGRADE_STATES.Active;
        }
        return UPGRADE_STATES.Failed;
      },
      onScore: () => {
        if(mult<=1)  return UPGRADE_STATES.Failed;
          const gained = this.props.mult;
          game.mult *= this.props.mult;
          game.mult = Math.round(game.mult * 100) / 100;
          game.GameRenderer.displayTempScore();
          return { state: UPGRADE_STATES.Score, message: `X${gained} Mult`, style: SCORE_ACTIONS.Mult };  
      }
    });
  },
  remove(){

  },
  price: 6,
  props: {...defaultimage,...UNCOMMON}
}
];

  
upgradeBlueprints.forEach(upgrade => {
  upgrade.type="Upgrade";
});
// push all blueprints into upgradesList
upgradeBlueprints.forEach(bp => upgradesList.push(bp));

