import { Upgrade } from "../entities/Upgrade.js";
import { Consumable } from "../entities/Consumable.js";
import { SCORE_ACTIONS, Style, TYPES } from "../dictionary.js";
import { upgradesList } from "./upgradelist.js";
import {
  GAME_TRIGGERS,
  MODIFIERS,
  UPGRADE_RARITY,
  STAGES,
} from "../dictionary.js";
import { Stats } from "../utils/Stats.js";
import { Tarot } from "../entities/Tarot.js";
import { transformsExecRgx } from "../libs/animejs/core/consts.js";
import { Tile } from "../entities/Tile.js";
export const consumableList = [];
const pomumpackItems = [];
function desc(fruit) {
  return `daje ${Style.Score("+2 punkty")}, ${Style.Mult("+0.4 mult")} do ${fruit.icon}, obecnie ${Style.Score("+" + fruit.props.upgrade.score + " punktów")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
}
function add(fruit) {
  fruit.levelUp();
}
const consumableBlueprints = [];
const consumableLvlUp = [];
const consumbaleEvil = [];
consumableLvlUp.push(
  {
    name: "Jabłko",
    id: "apple",
    descriptionfn(game) {
      return desc(game.fruits[0]);
    },
    effect(game) {
      add(game.fruits[0]);
    },
    price: 3,
    image: "lvlup_apple",
    getFruit(game) {
      return game.fruits[0];
    },
  },
  {
    name: "Gruszka",
    id: "pear",
    descriptionfn(game) {
      return desc(game.fruits[1]);
    },
    effect(game) {
      add(game.fruits[1]);
    },
    price: 3,
    image: "lvlup_pear",
    getFruit(game) {
      return game.fruits[1];
    },
  },
  {
    name: "Ananas",
    id: "pineapple",
    descriptionfn(game) {
      return desc(game.fruits[2]);
    },
    effect(game) {
      add(game.fruits[2]);
    },
    price: 3,
    image: "lvlup_pineapple",
    getFruit(game) {
      return game.fruits[2];
    },
  },
  {
    name: "Winogron",
    id: "grape",
    descriptionfn(game) {
      return desc(game.fruits[3]);
    },
    effect(game) {
      add(game.fruits[3]);
    },
    price: 3,
    image: "lvlup_grape",
    getFruit(game) {
      return game.fruits[3];
    },
  },
  {
    name: "Kokos",
    id: "coconut",
    descriptionfn(game) {
      return desc(game.fruits[4]);
    },
    effect(game) {
      add(game.fruits[4]);
    },
    price: 3,
    image: "lvlup_coconut",
    getFruit(game) {
      return game.fruits[4];
    },
  },
);
consumbaleEvil.push(
  {
    name: "EVIL Jabłko",
    id: "evil_apple",
    descriptionfn(game) {
      return evildesc(game.fruits[0], game);
    },
    effect(game) {
      evilfunc(game, game.fruits[0]);
    },
    price: 3,
    image: "devil_apple",
    getFruit(game) {
      return game.fruits[0];
    },
  },
  {
    name: "EVIL Gruszka",
    id: "evil_pear",
    descriptionfn(game) {
      return evildesc(game.fruits[1], game);
    },
    effect(game) {
      evilfunc(game, game.fruits[1]);
    },
    price: 3,
    image: "devil_pear",
    getFruit(game) {
      return game.fruits[1];
    },
  },
  {
    name: "EVIL Winogron",
    id: "evil_grape",
    descriptionfn(game) {
      return evildesc(game.fruits[3], game);
    },
    effect(game) {
      evilfunc(game, game.fruits[3]);
    },
    price: 3,
    image: "devil_grape",
    getFruit(game) {
      return game.fruits[3];
    },
  },
  {
    name: "EVIL Ananas",
    id: "evil_pineapple",
    descriptionfn(game) {
      return evildesc(game.fruits[2], game);
    },
    effect(game) {
      evilfunc(game, game.fruits[2]);
    },
    price: 3,
    image: "devil_pineapple",
    getFruit(game) {
      return game.fruits[2];
    },
  },
  {
    name: "EVIL Kokos",
    id: "evil_coconut",
    descriptionfn(game) {
      return evildesc(game.fruits[4], game);
    },
    effect(game) {
      evilfunc(game, game.fruits[4]);
    },
    price: 3,
    image: "devil_coconut",
    getFruit(game) {
      return game.fruits[4];
    },
  },
);
const consumableSilverBlueprints = [
  {
    id: "silver_apple",
    name: "Silver Jabłko",
    descriptionfn(game) {
      return silverDesc(game.fruits[0]);
    },
    effect(game) {
      silverFunc(game, game.fruits[0]);
    },
    price: 3,
    image: "lvlup_apple_silver",
    getFruit(game) {
      return game.fruits[0];
    },
  },
  {
    name: "Silver Gruszka",
    id: "silver_pear",
    descriptionfn(game) {
      return silverDesc(game.fruits[1]);
    },
    effect(game) {
      silverFunc(game, game.fruits[1]);
    },
    price: 3,
    image: "lvlup_pear_silver",
    getFruit(game) {
      return game.fruits[1];
    },
  },
  {
    name: "Silver Winogron",
    id: "silver_grape",
    descriptionfn(game) {
      return silverDesc(game.fruits[3]);
    },
    effect(game) {
      silverFunc(game, game.fruits[3]);
    },
    price: 3,
    image: "lvlup_grape_silver",
    getFruit(game) {
      return game.fruits[3];
    },
  },
  {
    name: "Silver Ananas",
    id: "silver_pineapple",
    descriptionfn(game) {
      return silverDesc(game.fruits[2]);
    },
    effect(game) {
      silverFunc(game, game.fruits[2]);
    },
    price: 3,
    image: "lvlup_pineapple_silver",
    getFruit(game) {
      return game.fruits[2];
    },
  },
  {
    name: "Silver Kokos",
    id: "silver_coconut",
    descriptionfn(game) {
      return silverDesc(game.fruits[4]);
    },
    effect(game) {
      silverFunc(game, game.fruits[4]);
    },
    price: 3,
    image: "lvlup_coconut_silver",
    getFruit(game) {
      return game.fruits[4];
    },
  },
];
export const consumableUpgradeBlueprints = [
  {
    name: "Negative",
    descriptionfn(game) {
      return "losowy upgrade staje się negative.";
    },
    effect(game) {
      if (game.upgrades.length == 0) return;
      let upgrades = game.upgrades.filter(
        (upgrade) => upgrade.negative != true,
      );
      if (upgrades.length == 0) return;
      let index = Math.floor(Math.random() * upgrades.length);
      upgrades[index].negative = true;
      game.maxUpgrades += 1;
      game.GameRenderer.displayUpgradesCounter();
      upgrades[index].UpgradeRenderer.update();
      //game.GameRenderer.updateUpgrade(game.upgrades.indexOf());
      game.Audio.playSound("foil_reverse.mp3");
    },
    price: 8,
    image: "negative",
  },
  {
    name: "Copy",
    descriptionfn(game) {
      return "Kopiuje losowe ulepszenie, usuwa reszte.";
    },
    effect(game) {
      if (game.upgrades.length == 0) return;
      let index = Math.floor(Math.random() * game.upgrades.length);
      let copy = game.upgrades[index];
      const newUpgrade = Upgrade.Copy(copy);
      console.log(newUpgrade);
      [...game.upgrades].forEach((upgrade) => {
        if(upgrade!=copy){
          upgrade.remove(game);
          upgrade.destroy(game);
        }
      });
      game.upgrades.push(newUpgrade);
      newUpgrade.apply(game);
      game.GameRenderer.displayPlayerUpgrades();
      game.GameRenderer.displayUpgradesCounter();
    },
    price: 8,
    image: "copy",
  },
  {
    name: "Thunder",
    descriptionfn(game) {
      return `Daje 4 losowe ulepszenia owoców. (Mogą się powtarzać)`;
    },
    effect(game) {
      const filter = [
        ...consumableLvlUp,
        ...consumableGoldBlueprints,
        ...consumableSilverBlueprints,
      ];
      for (var i = 0; i < 4; i++) {
        const picked = Math.floor(Math.random() * filter.length);
        const con = filter[picked];
        const consumable = new Consumable(con);
        consumable.negative = true;
        game.consumables.push(consumable);
      }
      game.maxConsumables += 4;
      game.Audio.playSound("foil_reverse.mp3");
      game.GameRenderer.displayPlayerConsumables();
      game.GameRenderer.displayConsumablesCounter();
    },
    price: 8,
    image: "thunder",
  },
  {
    name: "Foiled",
    descriptionfn(game) {
      return `Losowe ulepszenie dostaje bonusowe ${Style.Chance(MODIFIERS.Chip)}, ${Style.Chance(MODIFIERS.Polychrome)} lub ${Style.Chance(MODIFIERS.Mult)}`;
    },
    effect(game) {
      if (game.upgrades.length == 0) return;
      let index = Math.floor(Math.random() * game.upgrades.length);
      let upgrade = game.upgrades[index];
      const r = Math.random();
            if (r < 0.3) {
                upgrade.modifier = MODIFIERS.Chip;
            } else if(r>0.3&&r<0.6){
                upgrade.modifier = MODIFIERS.Polychrome;
            } else{
                upgrade.modifier = MODIFIERS.Mult;
            }
      upgrade.addSpecial(game);
      upgrade.UpgradeRenderer.update();
      //game.GameRenderer.updateUpgrade(index);
      game.Audio.playSound("foil.mp3");
    },
    price: 8,
    image: "foiled",
  },
  {
    name: "Fire",
    descriptionfn(game) {
      return `Daje cenę sprzedarzy kupionych ulepszeń. (Max ${Style.Money(`$40`)})`;
    },
    effect(game) {
      let money = 0;
      game.upgrades.forEach((upgrade) => {
        money += upgrade.sellPrice;
      });
      if (money > 40) money = 40;
      game.money += money;
      game.GameRenderer.updateMoney(money);
    },
    price: 8,
    image: "fire",
  },
];
const consumableGoldBlueprints = [
  {
    name: "Gold Jabłko",
    id: "gold_apple",
    descriptionfn(game) {
      return goldDesc(game.fruits[0]);
    },
    effect(game) {
      goldFunc(game, game.fruits[0]);
    },
    price: 3,
    image: "lvlup_apple_gold",
    getFruit(game) {
      return game.fruits[0];
    },
  },
  {
    name: "Gold Gruszka",
    id: "gold_pear",
    descriptionfn(game) {
      return goldDesc(game.fruits[1]);
    },
    effect(game) {
      goldFunc(game, game.fruits[1]);
    },
    price: 3,
    image: "lvlup_pear_gold",
    getFruit(game) {
      return game.fruits[1];
    },
  },
  {
    name: "Gold Winogron",
    id: "gold_grape",
    descriptionfn(game) {
      return goldDesc(game.fruits[3]);
    },
    effect(game) {
      goldFunc(game, game.fruits[3]);
    },
    price: 3,
    image: "lvlup_grape_gold",
    getFruit(game) {
      return game.fruits[3];
    },
  },
  {
    name: "Gold Ananas",
    id: "gold_pineapple",
    descriptionfn(game) {
      return goldDesc(game.fruits[2]);
    },
    effect(game) {
      goldFunc(game, game.fruits[2]);
    },
    price: 3,
    image: "lvlup_pineapple_gold",
    getFruit(game) {
      return game.fruits[2];
    },
  },
  {
    name: "Gold Kokos",
    id: "gold_coconut",
    descriptionfn(game) {
      return goldDesc(game.fruits[4]);
    },
    effect(game) {
      goldFunc(game, game.fruits[4]);
    },
    price: 3,
    image: "lvlup_coconut_gold",
    getFruit(game) {
      return game.fruits[4];
    },
  },
];
const tarotCards = [
  {
      name: "Głupiec",
      id: "the_fool",
      descriptionfn(game){
        let ostatnia="Brak";
        if(game.stats.lastUsedTarot?.name){
          ostatnia=game.stats.lastUsedTarot.name;
        }
        return `Daje ostatnią użytą kartę tarota. (Ostania: ${ostatnia})`;
      },
        canUse(){
            let extra = this.bought ? 1 : 0;
            console.log(extra);
            return game.stats.usedTarots!=0&&game.stats.lastUsedTarot?.name!=this.name&&game.consumables.length < game.maxConsumables+extra;
        },
        effect(){
          const used_blueprint = tarotCards.filter((tarot) => tarot.name==game.stats?.lastUsedTarot?.name);
          let newTarot = new Tarot(used_blueprint[0]);
          newTarot.bought = true;
          game.consumables.push(newTarot);
          game.GameRenderer.displayPlayerConsumables();
          game.GameRenderer.displayConsumablesCounter();
        },
      price: 4,
      image: 'fool',
    },
  {
    name: "Mag",
    id: "the_magician",
    descriptionfn(game) {
      return `Zamienia szanse 2 losowych owoców.`;
    },
    effect(game) {
      let index = Math.floor(Math.random() * game.fruits.length);
      let index2 = Math.floor(Math.random() * game.fruits.length);
      while (index == index2) {
        index2 = Math.floor(Math.random() * game.fruits.length);
      }
      let temp = game.fruits[index].percent;
      game.fruits[index].percent = game.fruits[index2].percent;
      game.fruits[index2].percent = temp;
      this.message = { text: `${game.fruits[index].icon}🔁${game.fruits[index2].icon}`, style: SCORE_ACTIONS.Money };
    },
    price: 4,
    image: "magician",
  }, /*
    {
        name: "Arcykapłanka"
    },
    {
        name: "Cesarzowa",
        descriptionfn(game){
            return ``
        }
    },
    {
        name: "Cesarz",
        descriptionfn(game){
            return `Zmienia 10 kafelków na losowe ulepszone kafelki.`;
        }
    },
    */
    {
        name: "Arcykapłan",
        id: "the_hierophant",
        descriptionfn(game){
            return `Daje 2 losowe karty tarota. (Musi mieć miejsce)`;
        },
        canUse(){
            let extra = this.bought ? 1 : 0;
            return game.consumables.length<game.maxConsumables+extra;
        },
        effect(game){
          console.log(game.consumables.length);
          let extra = this.bought ? 1 : 0;
          console.log(extra)
          const currentMax = game.maxConsumables + (extra);
          
          // 2. Liczymy, ile faktycznie możemy dodać kart (max 2, ale nie więcej niż wolne sloty)
          const availableSlots = currentMax - game.consumables.length;
          const cardsToAdd = Math.min(2, Math.max(0, availableSlots));
          
          // 3. Dodajemy karty
          for (let i = 0; i < cardsToAdd; i++) {
            const filter = tarotCards.filter((tarot) => tarot.name !== this.name);
            
            if (filter.length > 0&&game.consumables.length < currentMax) {
              const picked = Math.floor(Math.random() * filter.length);
              const tarotTemplate = filter[picked];
              
              const newTarot = new Tarot(tarotTemplate);
              newTarot.bought = true;
              game.consumables.push(newTarot);
            }
          }
          game.GameRenderer.displayPlayerConsumables();
          game.GameRenderer.displayConsumablesCounter();
        },
        price: 4,
        image: "hierophant",
    },
  {
    name: "Kochankowie",
    id: "the_lovers",
    descriptionfn(game) {
      return `${Style.Moves('+2 ruchy')}`;
    },
    effect(game) {
      game.movescounter -= 2;
      game.GameRenderer.displayMoves();
    },
    canUse(game) {
      return game.stage != STAGES.Shop && game.locked == false;
    },
    price: 4,
    image: "lovers",
  },/*
    {
        name: "Powóz"
    },*/
  {
    name: "Siła",
    id: "strength",
    descriptionfn(game) {
      return `Po użyciu daje ${Style.Mult("+10 Mult")}`;
    },
    effect(game) {
      game.mult += 10;
      game.GameRenderer.displayTempScore();
    },
    canUse(game) {
      return game.stage != STAGES.Shop && game.locked == false;
    },
    price: 4,
    image: "strength",
  } /*
    {
        name: "Pustelnik",
        descriptionfn(game){
            return `Daje tyle $, ile złotych kafelków na planszy. (max. $20)`;
        }
    },*/,
  {
    name: "Fortuna",
    id: "wheel_of_fortune",
    descriptionfn(game) {
      return `${Style.Chance("1 na 4")} że ulepszenie dostaje bonusowe ${Style.Chance(MODIFIERS.Chip)}, lub ${Style.Chance(MODIFIERS.Mult)}`;
    },
    effect(game) {
      if (Math.random() >= 0.25) {
        this.message = { text: ":(", style: SCORE_ACTIONS.Info };
        //this.UpgradeRenderer.createPopup(":(",SCORE_ACTIONS.Info);
        return;
      }
      let index = Math.floor(Math.random() * game.upgrades.length);
      let upgrade = game.upgrades[index];
      if (Math.random() < 0.5) {
        upgrade.modifier = MODIFIERS.Chip;
      } else {
        upgrade.modifier = MODIFIERS.Mult;
      }
      upgrade.addSpecial(game);
      upgrade.UpgradeRenderer.update();
      //game.GameRenderer.updateUpgrade(index);
      this.message = { text: "popups.success", style: SCORE_ACTIONS.Money, translation: true };
      //this.UpgradeRenderer.createPopup("Sukces!",SCORE_ACTIONS.Money);
    },
    canUse(game) {
      return game.upgrades.length>0;
    },
    price: 4,
    image: "fortuna",
  },
  /*{
        name: "Sprawiedliwość"
    },*/
  {
    name: "Szubieniczyk",
    id: "the_hanged_man",
    descriptionfn(game) {
      return `Niszczy 10 losowych kafelków na planszy.`;
    },
    effect(game) {
      let matches = [];
      let usedCoords = new Set(); // Przechowujemy klucze tekstowe (np. "2,5")
      let results = []; // Tablica wynikowa ze współrzędnymi

      while (results.length < 10) {
        let x = Math.floor(Math.random() * game.matrixsize);
        let y = Math.floor(Math.random() * game.matrixsize);
        let key = `${x},${y}`;

        if (!usedCoords.has(key)) {
          usedCoords.add(key);
          results.push({ x, y });
        }
      }

      // Mapujemy wyniki na format oczekiwany przez silnik (z danymi o owocu)
      results.forEach(pos => {
        matches.push(game.board[pos.x][pos.y]);
      });

      // Przekazujemy tablicę obiektów do procesowania
      game.matchesManager.processMatches(matches);
    },
    canUse(game) {
      return game.stage != STAGES.Shop && game.locked == false;
    },
    price: 4,
    image: "hanged_man",
  },
  {
    id: "death",
    name: "Śmierć",
    descriptionfn(game){
      return `Zamienia losowy owoc ${Style.Highlight("na plaszny")} w najrzadszy owoc`
    },
    effect(game){
      const minPercent = Math.min(...game.fruits.map(f => f.percent));
      const lowestFruits = game.fruits.filter(f => f.percent === minPercent);
      const choice = lowestFruits[Math.floor(Math.random() * lowestFruits.length)];
      let boardFruits = game.matchesManager.getUniqueFruitsFromBoard().filter(f=>f.icon!=choice.icon);
      let randomBoard = boardFruits[Math.floor(Math.random() * boardFruits.length)];
      console.log(choice);
      console.log(randomBoard);
      for (let y = 0; y < game.matrixsize; y++) {
        for (let x = 0; x < game.matrixsize; x++) {
          if(game.board[y][x].icon==randomBoard.icon){
            game.board[y][x]; 
            //console.log(tile);
            game.board[y][x] = new Tile({
                        icon: choice.icon, type: TYPES.Fruit,
                        x: x,
                        y: y,
                        image: choice.imagename,
                        modifier: MODIFIERS.None,
                        debuffed: choice.props.debuffed,
                        upgrade: { ...choice.props.upgrade }
                    });
            game.board[y][x].triggerAnimation(game);
          }
        }
      }
      let matches = game.matchesManager.findMatches();
      if(matches.length>0){
        game.matchesManager.processMatches(matches);
      }
      this.message = { text: `${randomBoard.icon}🔁${choice.icon}`, style: SCORE_ACTIONS.Money };
    },
    canUse(game) {
      return game.stage != STAGES.Shop && game.locked == false;
    },
    price: 4,
    image: "death"
  },
  /*
    
    {
        name: "Umiarkowanie"
    },
    {
        name: "Diabeł"
    },
    */ {
    name: "Wieża",
    id: "the_tower",
    descriptionfn(game) {
      return `${Style.Chance(`1 na 5`)} na losowanie szans wszystkich owoców.`;
    },
    effect(game) {
      console.log(this);
      if (Math.random() >= 0.2) {
        this.message = { text: ":(", style: SCORE_ACTIONS.Info };
        return;
      }
      let percent = 100;
      game.fruits.forEach((fruit) => {
        const result = Math.random() * percent;
        fruit.props.percent = result;
        percent -= result;
      });
      this.message = { text: "popups.success", style: SCORE_ACTIONS.Money, translation: true };
      //this.UpgradeRenderer.createPopup("Sukces!",SCORE_ACTIONS.Money);
    },
    price: 4,
    image: "tower",
  },
  {
    name: "Gwiazda",
    id: "the_star",
    descriptionfn(game) {
      return `Niszczy losowy rząd i kolumnę na planszy.`;
    },
    effect(game) {
      let cords = {
        x: Math.floor(Math.random() * game.matrixsize),
        y: Math.floor(Math.random() * game.matrixsize),
      };
      let matches = [];
      for (var i = 0; i < game.matrixsize; i++) {
        matches.push(game.board[cords.x][i]);
        matches.push(game.board[i][cords.y]);
      }
      game.matchesManager.processMatches(matches);
    },
    canUse(game) {
      return game.stage != STAGES.Shop && game.locked == false;
    },
    price: 4,
    image: "gwiazda",
  },
    {
        name: "Księżyc",
        id: "the_moon",
        descriptionfn(){
          return `Ulepsza od ${Style.Chance(`1 do 20`)} kafelków na ${Style.Chance(MODIFIERS.Silver)}`;
        },
        effect(game){
          let usedCoords = new Set(); // Przechowujemy klucze tekstowe (np. "2,5")
          let results = []; // Tablica wynikowa ze współrzędnymi
          let randomnum = Math.floor(Math.random() * 20) + 1;
          while (results.length < randomnum) {
            let x = Math.floor(Math.random() * game.matrixsize);
            let y = Math.floor(Math.random() * game.matrixsize);
            let key = `${x},${y}`;

            if (!usedCoords.has(key)) {
              usedCoords.add(key);
              results.push({ x, y });
            }
          }
          results.forEach(coords => {
            const tile = game.board[coords.x][coords.y];
            tile.props.modifier = MODIFIERS.Silver;
            tile.triggerAnimation(game);
          });
        },
        canUse(game) {
        return game.stage != STAGES.Shop && game.locked == false;
      },
      price: 4,
      image: "moon",
    },
    {
        name: "Słońce",
        id: "the_sun",
        descriptionfn(){
          return `Ulepsza od ${Style.Chance(`1 do 20`)} kafelków na ${Style.Chance(MODIFIERS.Gold)}`;
        },
        effect(game){
          let usedCoords = new Set(); // Przechowujemy klucze tekstowe (np. "2,5")
          let results = []; // Tablica wynikowa ze współrzędnymi
          let randomnum = Math.floor(Math.random() * 20) + 1;
          while (results.length < randomnum) {
            let x = Math.floor(Math.random() * game.matrixsize);
            let y = Math.floor(Math.random() * game.matrixsize);
            let key = `${x},${y}`;

            if (!usedCoords.has(key)) {
              usedCoords.add(key);
              results.push({ x, y });
            }
          }
          results.forEach(coords => {
            const tile = game.board[coords.x][coords.y];
            tile.props.modifier = MODIFIERS.Gold;
            tile.triggerAnimation(game);
          });
        },
        canUse(game) {
        return game.stage != STAGES.Shop && game.locked == false;
      },
      price: 4,
      image: "sun",
    }
    /*
    {
        name: "Sędzia"
    },
    {
        name: "Świat"
    }
        */,
];
function silverDesc(fruit) {
  return `${Style.Chance(`+1.5%`)} szansa na Silver dla ${fruit.icon}`;
}
function silverFunc(game, fruit) {
  game.fruits[game.fruits.indexOf(fruit)].props.upgrade.silverchance += 1.5;
}
function goldDesc(fruit) {
  return `${Style.Chance(`+1%`)} szansa na Gold dla ${fruit.icon}`;
}
function goldFunc(game, fruit) {
  game.fruits[game.fruits.indexOf(fruit)].props.upgrade.goldchance += 1;
}
function evildesc(fruit) {
  if (fruit.props.percent - 5 <= 0) {
    return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${game.calcEqualize(fruit.props.percent)}%`)} reszta`;
  }
  return `${Style.Chance("-5%")} dla ${fruit.icon} ${Style.Chance("+1.25%")} reszta`;
}
function evilfunc(game, fruit) {
  if (fruit.props.percent - 5 <= 0) {
    game.equalizeChancesExcept(fruit);
    fruit.props.percent -= fruit.props.percent;
  } else {
    fruit.props.percent -= 5;
    game.addChancesExcept(fruit, 1.25);
  }
}
export const coupons = [
  {
   name: "+1",
   id: "upgrade_plus",
    descriptionfn(game) {
      return `Zwiększa miejsce na ulepszenia o 1. (Obecnie ${Style.Chance(game.maxUpgrades)} -> ${Style.Chance(game.maxUpgrades + 1)})`;
    },
    effect(game) {
      game.maxUpgrades += 1;
      game.GameRenderer.displayUpgradesCounter();
      game.emit(GAME_TRIGGERS.onUpgradesChanged);
    },
    price: 10,
    image: "upgradeplus",
  },
  {
  name: "Overstock",
  descriptionfn(game) {
    // dynamiczny opis, by zawsze pokazywał aktualny stan sklepu
    const current = game.shopSize || 3;
    return `Zwiększa miejsce na ulepszenia w sklepie o 1. (Obecnie ${Style.Chance(current)} -> ${Style.Chance(current + 1)})`;
  },
  effect(game) {
    game.shopSize+=1;
  },
  price: 10,
  image: "overstock",
},
{
  name: "Przejście",
  id: "passage",
  descriptionfn(game) {
    return `Zwiększa możliwe ruchy w rundzie o ${Style.Moves(`+1 ruch`)}`;
  },
  effect(game) {
    game.moves += 1;
    game.GameRenderer.displayMoves();
  },
  price: 10,
  image: "moves",
},
{
  name: "Moc",
  id: "power",
  descriptionfn(game) {
    return `Ulepszone karty pojawiają się ${Style.Chance(`X2`)} częściej`;
  },
  effect(game) {
    game.bonusPercentage.modifier += 0.05;
  },
  price: 10,
  image: "power",
},
{
  name: "Sałatka",
  id: "salad",
  descriptionfn(game) {
    return `Zwiększa miejsce na ulepszenia kafelków o 1. (Obecnie ${Style.Chance(game.maxConsumables)} -> ${Style.Chance(game.maxConsumables + 1)})`;
  },
  effect(game) {
    game.maxConsumables += 1;
    game.GameRenderer.displayConsumablesCounter();
  },
  price: 10,
  image: "consumableplus",
},
{
  name: "Booster",
  descriptionfn(game) {
    return `Zwiększa miejsce na BoosterPacki w sklepie o 1. (Obecnie ${Style.Chance(game.maxBoosters)} -> ${Style.Chance(game.maxBoosters + 1)})`
  },
  effect(game) {
    game.maxBoosters += 1;
  },
  price: 10,
  image: "default_coupon",
}
];
consumableBlueprints.push(...consumableLvlUp, ...consumbaleEvil);
consumbaleEvil.forEach((consumable) => {
  consumable.type = "Consumable";
  consumable.rarity = UPGRADE_RARITY.ConsumableCommon;
});
consumableLvlUp.forEach((consumable) => {
  consumable.type = "Consumable";
  consumable.rarity = UPGRADE_RARITY.ConsumableCommon;
});
consumableBlueprints.forEach((consumable) => {
  consumable.type = "Consumable";
  consumable.rarity = UPGRADE_RARITY.ConsumableCommon;
});
consumableGoldBlueprints.forEach((consumable) => {
  consumable.type = "Consumable";
  consumable.rarity = UPGRADE_RARITY.ConsumableCommon;
});
consumableSilverBlueprints.forEach((consumable) => {
  consumable.type = "Consumable";
  consumable.rarity = UPGRADE_RARITY.ConsumableCommon;
});
consumableUpgradeBlueprints.forEach((consumable) => {
  consumable.type = "Pact";
  consumable.rarity = UPGRADE_RARITY.ConsumableRare;
});
tarotCards.forEach((card) => {
  card.type = "Tarot";
  card.rarity = UPGRADE_RARITY.ConsumableCommon;
});
pomumpackItems.push(...consumableBlueprints);
consumableList.push(
  ...consumableBlueprints,
  ...consumableGoldBlueprints,
  ...consumableSilverBlueprints,
  ...consumableUpgradeBlueprints,
  ...tarotCards,
);
export const consumablePacks = [
  {
    name: "Pomumpack",
    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: pomumpackItems,
    price: 4,
    props: {
      maxSelect: 1,
      maxRoll: 3,
    },
    image: "pomumpack", // Dodane domyślne wartości
  },
  {
    name: "Pomumpack BIG",
    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: pomumpackItems,
    price: 6,
    props: {
      maxSelect: 1,
      maxRoll: 4,
    },
    image: "pomumpackbig",
  },
  {
    name: "Pomumpack MEGA",
    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: pomumpackItems,
    price: 8,
    props: { 
      maxSelect: 2,
      maxRoll: 5,
    },
    image: "pomumpackmega",
  },
  {
    name: "Pomumpack GOLD",
    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: consumableGoldBlueprints,
    price: 4,
    props: {
      maxSelect: 1,
      maxRoll: 3,
    },
    image: "pomumpack_gold",
  },
  {
    name: "Pomumpack SILVER",
    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: consumableSilverBlueprints,
    price: 4,
    props: {
      maxSelect: 1,
      maxRoll: 3,
    },
    image: "pomumpack_silver",
  },
  {
    name: "Upgradepack",
    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('ulepszeń')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: upgradesList,
    price: 4,
    props: {
      maxSelect: 1,
      maxRoll: 3,
    },
    image: "pomumpackupgrade",
  },
  {
    name: "Tarot Pack",

    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('tarota')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: tarotCards,
    price: 4,
    props: {
      maxSelect: 1,
      maxRoll: 3,
    },
    image: "tarot_pack",
  },
  {
    name: "Pact Pack",
    descriptionfn() {
      return `Znajdują się ${Style.Highlight(this.props.maxRoll)} karty ${Style.Highlight('paktu')}. Możesz wybrać maksymalnie ${Style.Highlight(this.props.maxSelect)}`;
    },
    consumables: consumableUpgradeBlueprints,
    price: 4,
    props: {
      maxSelect: 1,
      maxRoll: 3,
    },
    image: "arcana_pack",
    rarity: UPGRADE_RARITY.PomumPackRare
  }
];