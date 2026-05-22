console.log("Boss");
import {
  LANGUAGE,
  PRIORITY,
  SCORE_ACTIONS,
  Settings,
  Style,
  UPGRADE_STATES,
} from "../dictionary.js";
import { BossRenderer } from "../UI/bossRenderer.js";
import { UpgradeBase } from "./upgradeBase.js";
export class Boss extends UpgradeBase {
  constructor(props = {}) {
    super(props);
    this.type = "Boss";
    this.url = "./images/bosses/";
    this.active = true;
    this.moneyreward = props.moneyreward ?? 5;
    this.priority = PRIORITY.BOSS;
  }
  translation() {
    const lang = Settings.LANGUAGE || LANGUAGE.PL;
    return translations[lang]?.bosses?.[this.id];
  }
  apply(game) {
    this.props?.effect?.call(this, game); // this wewnątrz effect wskazuje na instancję
  }
  remove(game) {
    this.props?.remove?.call(this, game);
  }
  initRenderer(game) {
    this.UpgradeRenderer = new BossRenderer(this, game.GameRenderer);
  }
}
const BossBlueprints = [
  {
    name: "Snake",
    descriptionfn(game) {
      return `Wszystkie ${game.fruits[0].icon} nie dają punktów`;
    },
    effect(game) {
      game.fruits[0].props.debuffed = true;
    },
    remove(game) {
      game.fruits[0].props.debuffed = false;
    },
    image: "snake",
  },
  {
    name: "Bear",
    descriptionfn(game) {
      return `Wszystkie ${game.fruits[1].icon} nie dają punktów`;
    },
    effect(game) {
      game.fruits[1].props.debuffed = true;
    },
    remove(game) {
      game.fruits[1].props.debuffed = false;
    },
    image: "bear",
  },
  {
    name: "Starfish",
    descriptionfn(game) {
      return `Wszystkie ${game.fruits[2].icon} nie dają punktów`;
    },
    effect(game) {
      game.fruits[2].props.debuffed = true;
    },
    remove(game) {
      game.fruits[2].props.debuffed = false;
    },
    image: "starfish",
  },
  {
    name: "Vine",
    descriptionfn(game) {
      return `Wszystkie ${game.fruits[3].icon} nie dają punktów`;
    },
    effect(game) {
      game.fruits[3].props.debuffed = true;
    },
    remove(game) {
      game.fruits[3].props.debuffed = false;
    },
    image: "vine",
  },
  {
    name: "Crab",
    descriptionfn(game) {
      return `Wszystkie ${game.fruits[4].icon} nie dają punktów`;
    },
    effect(game) {
      game.fruits[4].props.debuffed = true;
    },
    remove(game) {
      game.fruits[4].props.debuffed = false;
    },
    image: "crab",
  },
  {
    name: "Wave",
    descriptionfn(game) {
      if (this.props.chosenFruit != null)
        return `Najczęstszy owoc (${this.props.chosenFruit.icon}) nie dają punktów.`;
      return `Najczęstszy owoc nie daje punktów.`;
    },
    effect(game) {
      const fruit = game.getTopFruit();
      this.props.chosenFruit = fruit;
      fruit.props.debuffed = true;
    },
    remove(game) {
      this.props.chosenFruit.props.debuffed = false;
      this.props.chosenFruit = null;
    },
    image: "wave",
  },
  {
    name: "Needle",
    descriptionfn(game) {
      return "3 ruchy mniej.";
    },
    effect(game) {
      this.props.removedMoves = 3;
      game.moves -= this.props.removedMoves;
      game.GameRenderer.displayMoves();
    },
    remove(game) {
      game.moves += this.props.removedMoves;
      game.GameRenderer.displayMoves();
    },
    moneyreward: 12,
    image: "default",
  },
  {
    name: "Ruler",
    descriptionfn(game) {
      return `Zmiejsza ${Style.Mult("mult")} i ${Style.Score("punkty")} o ${Style.Highlight("10%")}`;
    },
    props: () => ({
      onScore() {
        game.mult *= 0.9;
        game.tempscore *= 0.9;
        game.GameRenderer.displayTempScore();
        return {
          state: UPGRADE_STATES.Score,
          message: "-10%",
          style: SCORE_ACTIONS.Info,
        };
      },
    }),
    image: "default",
  },
  {
    name: "Rust",
    descriptionfn(game) {
      return `Twoje ulepszenie o najwyższej cenie zostaje zablokowane`;
    },
    effect(game) {
      // Zakładam, że masz tablicę aktywnych upgrade'ów
      const mostExpensive = [...game.upgrades].sort(
        (a, b) => b.price - a.price,
      )[0];
      if (mostExpensive) {
        this.props.disabledUpgrade = mostExpensive;
        mostExpensive.active = false; // Twoja logika sprawdzania czy upgrade działa
        mostExpensive.UpgradeRenderer.update();
      }
    },
    remove(game) {
      if (this.props.disabledUpgrade) {
        this.props.disabledUpgrade.active = true;
        this.props.disabledUpgrade.UpgradeRenderer.update();
      }
    },
    image: "default",
  }
//   {
//     name: "Greed",
//     descriptionfn(game) {
//       return `Tracisz 1% Multa za każdy $1 (max 20%)`;
//     },
//     props: () => ({
//       onScore() {
//         let penalty =  Math.max(0.8 , Math.round(1 - game.money * 0.01));
//         game.mult *= penalty;
//         game.GameRenderer.displayTempScore();
//         return {
//           state: UPGRADE_STATES.Score,
//           message: `-${(1 - penalty)*100}%`,
//           style: SCORE_ACTIONS.Info,
//         };
//       },
//     }),
//     image: "default",
//   },
  // {
  //     name: "window",
  //     descriptionfn(game){
  //         return `Kafelki na ${Style.Highlight("ścianach planszy")} nie dają punktów`;
  //     },
  //     props: () => ({
  //         onSpawn(){

  //         }
  //     })
  // }
];
export function rollBoss(game) {
  // Filter out bosses already in the game
  let available = BossBlueprints.filter(
    (c) => !game.bosses.some((boss) => boss._name === c.name),
  );

  // If no unused bosses left, fall back to full pool
  if (available.length === 0) {
    available = [...BossBlueprints];
  }

  const pool = [...available];

  // Fisher–Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(game.bossRand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick first boss from shuffled pool
  const blueprint = pool[0];
  return new Boss(blueprint);
}
