import { GAME_TRIGGERS,MODIFIERS } from "./dictionary.js";
import { Style } from "./RenderUI.js";
import { RenderUI } from "./RenderUI.js";
import { Upgrade } from "./upgradeBase.js";
export const upgradesList = [];
function removeTrigger(game, triggeredFunction, trigger, upgrade) {
  console.log(trigger);
  game.triggers[trigger] = game.triggers[trigger].filter(
    h => !(h.handler === triggeredFunction && h.upgrade === upgrade)
  );
}

const defaultimage = {image: 'default'};
const applehater = new Upgrade('AppleHater',function(game){return `${Style.Chance('-4%')} ${game.fruits[0].icon}, ${Style.Chance('+1%')} reszta`}, function(game){
  const apple = game.fruits[0]; 
    apple.percent -= 1;
  if(apple.percent<0) apple.percent = 0;
  game.addChancesExcept(apple,0.5);
},function(game){
    const apple = game.fruits[0]; 
    apple.percent += 1;
  game.addChancesExcept(apple,-0.5);
},4,defaultimage);
const stockmarket = new Upgrade('StockMarket',
  function(game) {
    // nazwa upgrade – generowana dynamicznie, ale dopiero po wylosowaniu w apply()
    if (!this.props.randomfruit) return `${Style.Chance('-100%')} dla losowego owoca, reszta dostanie równo podzielone procenty. zmienia się co rundę.`;
    return `${Style.Chance('-100%')} ${this.props.randomfruit.icon}, +${Style.Chance(game.calcEqualize(this.props.previousPercent).toString()+"%")} reszta`;
  },
  function(game) {
    this.setProps({
      randomfruit: null,
      previousPercent: null,
      onStart: (payload) => {
        this.props.randomfruit = game.fruits[Math.floor(Math.random() * game.fruits.length)]; 
        this.props.previousPercent = this.props.randomfruit.percent;
        game.equalizeChancesExcept(this.props.randomfruit);
        this.props.randomfruit.percent = 0;
        return true;
      },
      onEnd: (payload) => {
        const chance = game.calcEqualize(this.props.previousPercent);

        this.props.randomfruit.percent += this.props.previousPercent;
        game.addChancesExcept(this.props.randomfruit, -chance);
        this.props.randomfruit= null;
        return true;
      }
    });
    game.on(GAME_TRIGGERS.onRoundStart,this.props.onStart,this);
    game.on(GAME_TRIGGERS.onRoundEnd,this.props.onEnd,this);
  },
  function(game) {
    removeTrigger(game,this.props.onStart,GAME_TRIGGERS.onRoundStart,this);
    removeTrigger(game,this.props.onEnd,GAME_TRIGGERS.onRoundEnd,this);
  },
  8
);
const boom = new Upgrade('Boom',`Dynamit pojawia się ${Style.Chance('+2%')} częściej`,
  function(game){
    game.special[0].percent+=2;
    return true;
  },
  function(game){
    game.special[0].percent+=-2;
  },2
);
const boomber = new Upgrade('Boomber',
  `${Style.Score('+50 punktów')} za ruch, ${Style.Moves('-2 ruchy')}`,
  function(game) {
    // odejmujemy ruchy od gracza
    game.moves -= 2;
    game.moveBox.innerHTML = game.movescounter + "/" + game.moves;

    // zapisujemy handler w props, żeby później można go było usunąć
    this.setProps({
      handler: (payload) => {
        game.tempscore += 50;
        game.GameRenderer.displayScore();
        return true;
      }
    });

    // rejestrujemy handler
    game.on(GAME_TRIGGERS.onMove, this.props.handler,this);
  },
  function(game) {
    // cofamy ruchy
    game.moves += 2;
    game.moveBox.innerHTML = game.movescounter + "/" + game.moves;

    // usuwamy handler z triggerów
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMove,this);
  },4,{image: 'boom'}
);
const tetris = new Upgrade('tetris',`${Style.Moves('+4 ruchy')}`,function(game){
    game.moves+=4;
},function(game){
    game.moves-=4;
},4);
const mult = new Upgrade('Mult',`${Style.Mult('+1 mult')}`,function(game){
    this.setProps({
      handler: (payload) => {
        game.mult+=1;
        game.GameRenderer.displayTempScore();
        return true;
      }
    });
    // rejestrujemy handler
    game.on(GAME_TRIGGERS.onMove, this.props.handler,this);
},
  function(game) {
    // usuwamy handler z triggerów
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMove,this);
  },4,defaultimage);
const applelover = new Upgrade('applelover',
  `${Style.Mult('+1 mult')} za każde 🍎 (raz na kaskadę)`,
  function(game) {
    this.setProps({
      handler: (matches) => {
        // wyciągamy unikalne owoce z dopasowań
        const uniqueFruits = new Set(matches.map(m => m.fruit.icon));

        if (uniqueFruits.has("🍎")) {
          game.mult += 1; // tylko raz, niezależnie od ilości jabłek
        }
        game.GameRenderer.displayTempScore();
        return uniqueFruits.has("🍎");
      }
    });
    game.on(GAME_TRIGGERS.onMatch, this.props.handler,this);
  },
  function(game) {
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMatch,this);
  },
  5
);
const coconutBank = new Upgrade('Coconut Bank',function(game){
  return `${Style.Chance('+50%')} aby ${game.fruits[4].icon} był złoty, ${Style.Chance('-10%')} ${game.fruits[4].icon}, ${Style.Chance('+2.5%')} dla reszty`},
  function(game){
    game.fruits[4].props.upgrade.goldchance += 50;
    game.fruits[4].percent -= 10;
    game.addChancesExcept(game.fruits[4],2.5);
  },function(game){
    game.fruits[4].percent += 10;
    game.fruits[4].props.upgrade.goldchance -= 50;
    game.addChancesExcept(game.fruits[4],-2.5);
  },10,{image: 'coconutbank'}
);
const goldenFruits = new Upgrade('Golden Fruits',`${Style.Chance('+1%')}  szansa na gold`,
  function (game){
  game.goldChance += 1;
  return true;
  },
  function(game){
    game.goldChance -= 1;
  },10,defaultimage
);
const silverFruits = new Upgrade('Silver Fruits',`${Style.Chance('+1%')} szansa na silver`,
  function (game){
  game.silverChance += 1;
  return true;
  },
  function(game){
    game.silverChance -= 1;
  },10,{image: 'metalplate'}
);
const grapeInterest = new Upgrade('GrapeInterest',
  function(game){
    if(!this.props.isactive) return `Każda ${game.fruits[3].icon} daje ${Style.Score('+5 pkt')}, na końcu rundy zyskuje kolejne +5`;
    return `Każda ${game.fruits[3].icon} daje ${Style.Score('+'+this.props.value+' pkt')}`;
  },
  function(game){
    this.setProps({
      value: 5,
      isactive: true,
      handler: (matches) => {
        let found = false;
        matches.forEach(m => {
          if(m.fruit.icon === game.fruits[3].icon) {
            game.tempscore += this.props.value;
            found = true;
          }
        });
        game.GameRenderer.displayTempScore();
        return found;
      },
      onRoundEnd: () => {
        this.props.value += 5;
        return true;
      }
    });
    game.on(GAME_TRIGGERS.onMatch,this.props.handler,this);
    game.on(GAME_TRIGGERS.onRoundEnd,this.props.onRoundEnd,this);
  },
  function(game){
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMatch,this);
    removeTrigger(game,this.props.onRoundEnd,GAME_TRIGGERS.onRoundEnd,this);
  },6,defaultimage
);
const chainReaction = new Upgrade('ChainReaction',
  `Każda kaskada daje dodatkowe ${Style.Score('+30 punktów')}`,
  function(game) {
    this.setProps({
      handler: () => {
        game.tempscore += 30;
        game.GameRenderer.displayTempScore();
        return true;
      }
    });
    game.on(GAME_TRIGGERS.onMatch,this.props.handler,this);
  },
  function(game) {
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMatch,this);
  },
  4,defaultimage
);
const battlepass = new Upgrade(
  'Battlepass',
  function(game){
    if(!this.props.isactive) return `${Style.Mult('+1 mult')}. na końcu rundy dostaje ${Style.Mult('+1 mult')}`;
    return `${Style.Mult('+1 mult')}. na końcu rundy dostaje ${Style.Mult('+1 mult')}. obecnie ${Style.Mult('+'+this.props.mult+' mult')}`;
},
function(game){
  this.setProps({
    mult: 1,
    isactive: true,
    onScore: () =>{
      game.mult+=this.props.mult;
      game.GameRenderer.displayTempScore();
      return true;
    },
    onRoundEnd: () =>{
      this.props.mult+=1;
      return true;
    }
  });
  game.on(GAME_TRIGGERS.onMove,this.props.onScore,this);
  game.on(GAME_TRIGGERS.onRoundEnd,this.props.onRoundEnd,this);
},function(game){
  removeTrigger(game,this.props.onScore,GAME_TRIGGERS.onMove,this);
  removeTrigger(game,this.props.onRoundEnd,GAME_TRIGGERS.onRoundEnd,this);
},8
);
upgradesList.push(applehater);
upgradesList.push(stockmarket);
upgradesList.push(boom);
upgradesList.push(boomber);
upgradesList.push(tetris);
upgradesList.push(mult);
upgradesList.push(applelover);
upgradesList.push(coconutBank);
upgradesList.push(silverFruits);
upgradesList.push(goldenFruits);
upgradesList.push(chainReaction);
upgradesList.push(grapeInterest);
upgradesList.push(battlepass);