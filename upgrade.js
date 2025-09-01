import { Game } from "./main.js";
import { Tile } from "./Tile.js";
import { GAME_TRIGGERS,MODIFIERS } from "./dictionary.js";
import { Style } from "./RenderUI.js";
import { RenderUI } from "./RenderUI.js";
export const upgradesList = [];
function removeTrigger(game,triggeredFunction,trigger){
    const index = game.triggers[trigger].indexOf(triggeredFunction);
    if (index > -1) game.triggers[trigger].splice(index, 1);
}

const defaultimage = {image: 'default'};
export class Upgrade {
  constructor(name,descriptionfn, effect, remove, price = 2,props = {}) {
    this.name = name;
    this.descriptionfn = descriptionfn;
    this.effect = effect; // funkcja, która modyfikuje grę
    this.remove = remove; // funkcja cofająca efekt
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
      },
      onEnd: (payload) => {
        const chance = game.calcEqualize(this.props.previousPercent);

        this.props.randomfruit.percent += this.props.previousPercent;
        game.addChancesExcept(this.props.randomfruit, -chance);
      }
    });
    game.on(GAME_TRIGGERS.onRoundStart,this.props.onStart);
    game.on(GAME_TRIGGERS.onRoundEnd,this.props.onEnd);
  },
  function(game) {
    // cofamy upgrade
    const rf = this.props.randomfruit;
    const chance = game.calcEqualize(this.props.previousPercent);

    rf.percent += this.props.previousPercent;
    game.addChancesExcept(rf, -chance);
    removeTrigger(game,this.props.onStart,GAME_TRIGGERS.onRoundStart);
    removeTrigger(game,this.props.onEnd,GAME_TRIGGERS.onRoundEnd);
  },
  8
);
const boom = new Upgrade('Boom',`Dynamit pojawia się ${Style.Chance('+2%')} częściej`,
  function(game){
    game.special[0].percent+=2;
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
      }
    });

    // rejestrujemy handler
    game.on(GAME_TRIGGERS.onMove, this.props.handler);
  },
  function(game) {
    // cofamy ruchy
    game.moves += 2;
    game.moveBox.innerHTML = game.movescounter + "/" + game.moves;

    // usuwamy handler z triggerów
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMove);
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
      }
    });
    // rejestrujemy handler
    game.on(GAME_TRIGGERS.onMove, this.props.handler);
},
  function(game) {
    // usuwamy handler z triggerów
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMove);
  },4,defaultimage);
const applelover = new Upgrade('applelover',
  `${Style.Score('+20 pkt')} za każde 🍎 (raz na kaskadę)`,
  function(game) {
    this.setProps({
      handler: (matches) => {
        // wyciągamy unikalne owoce z dopasowań
        const uniqueFruits = new Set(matches.map(m => m.fruit.icon));

        if (uniqueFruits.has("🍎")) {
          game.tempscore += 20; // tylko raz, niezależnie od ilości jabłek
        }
        game.GameRenderer.displayTempScore();
      }
    });
    game.on(GAME_TRIGGERS.onMatch, this.props.handler);
  },
  function(game) {
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMatch);
  },
  5
);
const coconutBank = new Upgrade('Coconut Bank',function(game){
  return `${Style.Chance('50%')}  ${game.fruits[4].icon} jest złotch, ${Style.Chance('-10%')} ${game.fruits[4].icon}, ${Style.Chance('+2.5%')} dla reszty`},
  function(game){
    this.setProps({
      handler: (payload) => {
        payload.forEach(fruit => {
          if(fruit.icon==game.fruits[4].icon){
            if(Math.random() < 0.50) fruit.props.modifier = MODIFIERS.Gold;
          }
          });
      }
    });
    game.fruits[4].percent -= 10;
    game.addChancesExcept(game.fruits[4],2.5);
    game.on(GAME_TRIGGERS.onSpawn,this.props.handler);
  },function(game){
    game.fruits[4].percent += 10;
    game.addChancesExcept(game.fruits[4],-2.5);
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onSpawn);
  },10,{image: 'coconutbank'}
);
const goldenFruits = new Upgrade('Golden Fruits',`${Style.Chance('+1%')}  szansa na gold`,
  function (game){
  game.goldChance += 1;
  },
  function(game){
    game.goldChance -= 1;
  },10,defaultimage
);
const silverFruits = new Upgrade('Silver Fruits',`${Style.Chance('+1%')} szansa na silver`,
  function (game){
  game.silverChance += 1;
  },
  function(game){
    game.silverChance -= 1;
  },10,defaultimage
);
const cherryBoost = new Upgrade('CherryBoost',
  () => `+15 pkt za każdą ${game.fruit[1].icon} (za każde dopasowanie)`,
  function(game) {
    this.setProps({
      handler: (matches) => {
        matches.forEach(m => {
          if (m.fruit.icon === game.fruit[1].icon) {
            game.tempscore += 15;
          }
        });
        game.GameRenderer.displayTempScore();
      }
    });
    game.on(GAME_TRIGGERS.onMatch, this.props.handler);
  },
  function(game) {
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMatch);
  },
  5
);
const luckySpin = new Upgrade('LuckySpin',
  `Na początku każdej rundy losowy owoc dostaje ${Style.Chance('+5%')} szansy (reszta równoważona, suma ${Style.Chance('100%')})`,
  function(game) {
    this.setProps({
      fruitsAfter: new Array(game.fruits.length).fill(0),
      handler: () => {
        const index = Math.floor(Math.random() * game.fruits.length);
        const fruit = game.fruits[index];

        // ile można dodać do wybranego owocu
        const maxAdd = Math.min(5, 100 - fruit.percent);
        fruit.percent += maxAdd;
        this.props.fruitsAfter[index] += maxAdd;

        // reszta procentów do odejmowania
        let remainingSubtract = maxAdd;

        // zbieramy indeksy owoców, które mogą być zmniejszone
        let others = [];
        for (let i = 0; i < game.fruits.length; i++) {
          if (i !== index && game.fruits[i].percent > 0) others.push(i);
        }

        while (remainingSubtract > 0 && others.length > 0) {
          const decrement = remainingSubtract / others.length;
          let newOthers = [];
          for (let i of others) {
            const actualSubtract = Math.min(decrement, game.fruits[i].percent);
            game.fruits[i].percent -= actualSubtract;
            this.props.fruitsAfter[i] -= actualSubtract;
            remainingSubtract -= actualSubtract;

            // jeśli owoc dalej może być zmniejszony, zostaje w puli
            if (game.fruits[i].percent > 0) newOthers.push(i);
          }
          others = newOthers;
        }

        this.props.current = fruit;
      }
    });

    game.on(GAME_TRIGGERS.onRoundStart, this.props.handler);
  },
  function(game) {
    if (this.props.current) {
      // cofamy dokładnie zmiany zapisane w fruitsAfter
      for (let i = 0; i < game.fruits.length; i++) {
        game.fruits[i].percent -= this.props.fruitsAfter[i];
      }
    }
    removeTrigger(game,this.props.handler, GAME_TRIGGERS.onRoundStart);
  },
  7,defaultimage
);
const chainReaction = new Upgrade('ChainReaction',
  `Każda kaskada daje dodatkowe ${Style.Score('+30 punktów')}`,
  function(game) {
    this.setProps({
      handler: () => {
        game.tempscore += 30;
        game.GameRenderer.displayTempScore();
      }
    });
    game.on(GAME_TRIGGERS.onMatch,this.props.handler);
  },
  function(game) {
    removeTrigger(game,this.props.handler,GAME_TRIGGERS.onMatch);
  },
  4,defaultimage
);
const battlepass = new Upgrade(
  'Battlepass',
  function(game){
    if(!this.props.isactive) return `${Style.Mult('+1 mult')}. na końcu rundy dostaje ${Style.Mult('+1 mult')}`;
    return `${Style.Mult('+1 mult')}. na końcu rundy dostaje ${Style.Mult('+1 mult')}. obecnie ${Style.Mult('+'+this.props.mult)}`;
},
function(game){
  this.setProps({
    mult: 1,
    isactive: true,
    onScore: () =>{
      game.mult+=this.props.mult;
      game.GameRenderer.displayTempScore();
    },
    onRoundEnd: () =>{
      this.props.mult+=1;
    }
  });
  game.on(GAME_TRIGGERS.onMove,this.props.onScore);
  game.on(GAME_TRIGGERS.onRoundEnd,this.props.onRoundEnd);
},function(game){
  removeTrigger(game,this.props.onScore,GAME_TRIGGERS.onScore);
  removeTrigger(game,this.props.onRoundEnd,GAME_TRIGGERS.onRoundEnd);
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
upgradesList.push(luckySpin);
upgradesList.push(battlepass);