import {
  Style,
  LANGUAGE,
  DIFFICULTY,
  Settings,
  STAGES,
} from "../dictionary.js";

export const translations = {
  [LANGUAGE.PL]: {
    ui: {
      reroll_shop: (data) => `Odświerz sklep ($${data?.game.shoproll ?? 4})`,
      buy: "Kup",
      use: "Użyj",
      sell: "Sprzedaj",
      buyanduse: "Kup i użyj",
      startGame: "Rozpocznij",
      collection: "Kolekcja",
      settings: "Ustawienia",
      difficulty: "Poziom trudności",
      normal: "Normalny",
      eternal: "Wieczny",
      perishable: "Chwilowy",
      battery: "Bateria",
      rental: "Wynajem",
      heavy: "Ciężki",
      getAtLeast: "Zdobądź",
      score: "Wynik",
      yourScore: "Twój wynik",
      round: "runda",
      moves: "ruchy",
      info: "Informacje",
      close: "Zamknij",
      continue: "Kontynuuj",
      game_over: "Koniec gry",
      win: "Wygrana!",
      new_game: "Nowa gra",
    },
    consumables: {
      
    },
    boosters: {

    },
    vouchers: {

    },
    upgrades: {
      applehater: {
        name: "AppleHater",
        description: (data) => {
          return `Jeżeli ${data.game.fruits[0].icon} w kaskadzie nie zostanie zniszczone, ${Style.Score("+60 punktów")}`;
        },
      },
      battlepass: {
        name: "Battlepass",
        description: (data) =>
          `Na końcu rundy to ulepszenie dostaje ${Style.Mult("+1 mult")}. (Obecnie ${Style.Mult("+" + data.upgrade.props.mult + " mult")})`,
      },
      highfive: {
        name: "High Five",
        description: `Gdy zniszczy się ${Style.Highlight("pięć")} kafelków w linii, ${Style.Mult("X2 mult")}`,
      },
      broke: {
        name: "Broke",
        description: `Jeżeli ma się mniej niż ${Style.Money("$6")}, ${Style.Score("+250 punktów")}`,
      },
      robber: {
        name: "Robber",
        description: (data) =>
          `Daje ${Style.Mult("mult")} za ${Style.Highlight("cenę sprzedaży")} wszystkich kupionych ulepszeń. (Obecnie ${Style.Mult(`+${data.upgrade.props.calcMult()} mult`)}).`,
      },
      stockmarket: {
        name: "Giełda",
        description: (data) => {
          if (!data.upgrade.props.randomfruit)
            return `${Style.Chance("-100%")} ${Style.Highlight(`dla losowego owoca`)} , reszta dostanie równo podzielone procenty. ${Style.Highlight(`zmienia się co rundę.`)}`;
          return `${Style.Chance("-100%")} ${data.upgrade.props.randomfruit.icon}, ${Style.Chance("+" + data.game.calcEqualize(data.upgrade.props.previousPercent).toString() + "%")} reszta`;
        },
      },
      boom: {
        name: "Bum",
        description: `Dynamit pojawia się ${Style.Chance("+2%")} częściej`,
      },
      bomber: {
        name: "Bomber",
        description: `${Style.Score("+250 pkt")} za ruch, ${Style.Moves("-2 ruchy")}`,
      },
      tetris: {
        name: "Tetris",
        description: `${Style.Moves("+4 ruchy")}`,
      },
      mult: {
        name: "Mnożnik",
        description: `${Style.Mult("+4 mult")}`,
      },
      applelover: {
        name: "AppleLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} za każde ${data.game.fruits[0].icon} na kaskadę.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Obecnie ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      pearlover: {
        name: "PearLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} za każde ${data.game.fruits[1].icon} na kaskadę.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Obecnie ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      pineapplelover: {
        name: "PineappleLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} za każde ${data.game.fruits[2].icon} na kaskadę.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Obecnie ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      grapelover: {
        name: "GrapeLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} za każde ${data.game.fruits[3].icon} na kaskadę.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Obecnie ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      coconutlover: {
        name: "CoconutLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} za każde ${data.game.fruits[4].icon} na kaskadę.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Obecnie ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      coconutbank: {
        name: "Kokosowy Bank",
        description: (data) => {
          const fruitIcon = data.game.fruits[4].icon;
          if (
            !data.upgrade.props.previousPercent ||
            data.upgrade.props.previousPercent === -1
          )
            return `${Style.Chance("+50%")} aby ${fruitIcon} był złoty, ${Style.Chance("-10%")} ${fruitIcon}, ${Style.Chance("+2.5%")} dla reszty`;
          return `${Style.Chance("+50%")} aby ${fruitIcon} był złoty, ${Style.Chance(`-${data.upgrade.props.previousPercent}%`)} ${fruitIcon}, ${Style.Chance(`+${data.upgrade.props.previousPercent / (data.game.fruits.length - 1)}`)} dla reszty`;
        },
      },
      goldenfruits: {
        name: "Złote Owoce",
        description: `${Style.Chance("+5%")} szansa na gold`,
      },
      silverfruits: {
        name: "Srebrne Owoce",
        description: `${Style.Chance("+2%")} szansa na silver`,
      },
      grapeinterest: {
        name: "Winogronowy Zysk",
        description: (data) => {
          let wynik = data.upgrade.props.score
            ? ` (Obecnie ${Style.Score(`+${data.upgrade.props.score} pkt`)})`
            : "";
          return (
            `Każda ${data.game.fruits[3].icon} daje ${Style.Score(`+${data.upgrade.props.value ?? 5} pkt`)}, na końcu rundy ulepsza się o ${Style.Score("+10 pkt")}.` +
            wynik
          );
        },
      },
      chainreaction: {
        name: "Reakcja Łańcuchowa",
        description: (data) => {
          const desc = `Każda kaskada daje dodatkowe ${Style.Score("+30 pkt")}`;
          return data.upgrade.props.score && data.upgrade.props.score > 0
            ? desc +
                `, (obecnie ${Style.Score(`+${data.upgrade.props.score}`)})`
            : desc;
        },
      },
      circus: {
        name: "Cyrk",
        description:
          "Pozwala na pojawianie się w sklepie tych samych ulepszeń.",
      },
      fossil: {
        name: "Skamielina",
        description: (data) => {
          if (data.upgrade.props.chosenFruit) {
            return `Gdy zostanie zniszczony ${data.upgrade.props.chosenFruit.icon}, ${Style.Mult(`X1.5 Mult`)}`;
          }
          return `Gdy zostanie zniszczony najrzadszy owoc, ${Style.Mult(`X1.5 Mult`)}`;
        },
      },
      madness: {
        name: "Szaleństwo",
        description: (data) =>
          `Gdy podczas kaskady zrobi się tylko trójkę ${Style.Mult(`+X1 Mult`)}, po turze wraca do oryginalnej wartości. (Obecnie ${Style.Mult(`X${data.upgrade.props.mult}`)})`,
      },
      zdrapka: {
        name: "Zdrapka",
        description: `${Style.Chance(`1 na 20`)} że za kaskadę dostanie się ${Style.Money(`$20`)}`,
      },
      "6pak": {
        name: "6pak",
        description: (data) => {
          let value = data.upgrade.props.mult ?? 1;
          return `Jeżeli podczas rundy zrobi się co najmniej szóstkę, ${Style.Mult(`+X2 Mult`)} do ulepszenia. (Obecnie ${Style.Mult(`X${value} Mult`)})`;
        },
      },
      moneymaker: {
        name: "Money Maker",
        description: (data) => {
          const currentGain = data.game.money * 3;
          if (data.upgrade.bought)
            return `Co kaskadę daje ${Style.Score("+3X pkt")} ${Style.Highlight("za posiadane")} ${Style.Money("$")}. (Obecnie ${Style.Score(`+${currentGain} pkt`)} co kaskadę, ${Style.Score(`+${data.upgrade.props.score} pkt`)})`;
          return `Co kaskadę daje ${Style.Score("+3X pkt")} ${Style.Highlight("za posiadane")} ${Style.Money("$")}. (Obecnie ${Style.Score(`+${currentGain} pkt`)} co kaskadę)`;
        },
      },
      fish: {
        name: "Ryba",
        description: (data) =>
          `Co rundę cena sprzedaży zwiększa się o ${Style.Money(`$3`)}. (Obecnie ${Style.Money("$" + data.upgrade.props.sellPrice)})`,
      },
      tuttifrutti: {
        name: "Tutti Frutti",
        description: (data) => {
          const fruit = data.upgrade.props?.chosenFruit;
          if (data.upgrade.bought && fruit)
            return `Za ${fruit.icon}, ${Style.Score(`+20 pkt`)}, obecnie ${Style.Score(`${data.upgrade.props.score ?? 0} pkt`)}`;
          return `Za zniszczony pierwszy owoc w rundzie dostaje ${Style.Score(`+20 pkt`)}. Owoc resetuje się na koniec rundy.`;
        },
      },
      fruittycoon: {
        name: "Magnat Owocowy",
        description: `Na koniec rundy, ${Style.Money("+$1")} za każdy ulepszony owoc w grze.`,
      },
      jackpot: {
        name: "Jackpot",
        description: `Szansa ${Style.Chance("1 na 100")} że po rundzie dostaniesz ${Style.Money("$100")}`,
      },
      collector: {
        name: "Kolekcjoner",
        description: (data) => {
          const collected = data.upgrade.props?.collected;
          const score = data.upgrade.props?.score;
          const collectedIcons =
            collected && collected.size > 0 ? [...collected].join(" ") : "0";
          const baseDesc = `Jeżeli zniszczysz każdy rodzaj owocu w rundzie, ${Style.Score("+200 pkt")} za kaskadę.`;

          if (score && score > 0 && data.upgrade.bought) {
            return `${baseDesc} (Zniszczono: ${collectedIcons}/${data.game.fruits.length}), (Obecnie ${Style.Score(`+${score} pkt`)})`;
          }
          if (
            collected &&
            data.game.stage !== STAGES.Shop &&
            data.upgrade.bought
          ) {
            return `${baseDesc} (Zniszczono: ${collectedIcons}/${data.game.fruits.length})`;
          }
          return baseDesc;
        },
      },
      boom_double: {
        // Klucz dla "BOOM!!"
        name: "BOOM!!",
        description: (data) =>
          `${Style.Chance(`+1%`)} dla ${data.game.special[1].icon}`,
      },
      boom_question: {
        // Klucz dla "Boom?"
        name: "Boom?",
        description: (data) =>
          `${data.game.special[0].icon} i ${data.game.special[1].icon} detonują się 1 raz więcej.`,
      },
      lvlup: {
        name: "Awans",
        description:
          "Daje kartę ulepszeń dla pierwszego zniszczonego owocu (jeśli jest miejsce).",
      },
      dice: {
        name: "Kostka",
        description: `Co ruch dostaje się ${Style.Mult(`X1-6 Mult`)}`,
      },
      mirror: {
        name: "Lustro",
        description: (data) => {
          const neighbor = data.upgrade.getUltimateNeighbor?.();
          if (neighbor && data.upgrade.banned?.includes(neighbor.name)) {
            return `Nie można skopiować ${neighbor.name}.`;
          }
          if (data.upgrade.mirroredUpgradeCopy) {
            return data.upgrade.mirroredUpgrade.description(data.game);
          }
          return "Kopiuje ulepszenie po swojej prawej stronie.";
        },
      },
      adrenaline: {
        name: "Adrenalina",
        description: `Jeżeli zostało mniej niż 3 ruchy, ${Style.Mult(`+10 Mult`)}`,
      },
      criticalhit: {
        name: "Cios Krytyczny",
        description: (data) => {
          const mult = data.upgrade.props.mult ?? 1;
          return `${Style.Chance(`1 na 20`)} że co kaskadę dostanie się ${Style.Mult(`X3 Mult`)}, (Obecnie ${Style.Mult("X" + mult + " Mult")})`;
        },
      },
      pozeracz: {
        name: "Pożeracz",
        description: (data) => {
          const mult = data.upgrade.props.mult ?? 1;
          return `Na początku rundy niszczy ulepszenie ${Style.Highlight("po swojej prawej stronie")} i zyskuje ${Style.Mult(`mult`)} ${Style.Highlight("2X ceny sprzedaży")} ulepszenia. (Obecnie ${Style.Mult(`+${mult} Mult`)})`;
        },
      },
      liczydlo: {
        name: "Liczydło",
        description: (data) => {
          const mult = data.upgrade.props.mult ?? 1;
          return `Co 15 zniszczonych owoców ${Style.Mult(`+1 Mult`)}. (Obecnie ${Style.Mult(`+${mult} Mult`)})`;
        },
      },
      2020: {
        name: "20/20",
        description: "Wszystkie ulepszenia kafelków aktywują się dwukrotnie.",
      },
      empty: {
        name: "Pustka",
        description: (data) => {
          const mult = data.upgrade.props?.mult ?? 1;
          return `${Style.Mult(`+X1 Mult`)} za każde nieużyte miejsce ulepszeń. (Obecnie ${Style.Mult(`X${mult} Mult`)})`;
        },
      },
      snowman: {
        name: "Bałwan",
        description: (data) => {
          const score = data.upgrade.props?.score ?? 0;
          let text = `Każda kaskada daje o ${Style.Score(`+20 pkt`)} więcej niż poprzednia, resetuje się po ruchu.`;
          if (score > 0) text += ` (Obecnie ${Style.Score(`+${score} pkt`)})`;
          return text;
        },
      },
      tripple: {
        name: "Trójka",
        description: (data) => {
          const score = data.upgrade.props.score ?? 0;
          return `Jeżeli zrobi się tylko trójkę w kaskadzie, ${Style.Score(`+3 pkt`)} do ulepszenia. Na końcu rundy daje zebrane punkty. (Obecnie ${Style.Score(`+${score} Pkt`)})`;
        },
      },
      goraczka: {
        name: "Gorączka",
        description: `Daje ${Style.Mult("10-20 Mult")}. ${Style.Chance(`1 na 10`)}, że zniknie na końcu rundy.`,
      },
      dolar: {
        name: "Dolar",
        description: `Na końcu rundy daje ${Style.Money("$4")}.`,
      },
      saper: {
        name: "Saper",
        description: `${Style.Chance("1 na 5")} na każdą bombę lub dynamit, że zostanie wysadzony na początku ruchu.`,
      },
      kartakredytowa: {
        name: "Karta Kredytowa",
        description: `Pozwala wziąć ${Style.Money(`$10`)} długu.`,
      },
      wrozka: {
        name: "Wróżka",
        description: (data) =>
          `Za każdą użytą kartę tarota w grze ${Style.Mult(`+1 Mult`)}. (Obecnie ${Style.Mult(`+${data.game.stats.usedTarots} Mult`)})`,
      },
      lody: {
        name: "Lody",
        description: (data) =>
          `Daje ${Style.Score(`+${data.upgrade.props.score} pkt`)}. Co rundę punkty zmniejszają się o ${Style.Score(`-20 pkt`)}.`,
      },
      wampir: {
        name: "Wampir",
        description: (data) =>
          `Za każdy zniszczony ulepszony kafelek ${Style.Mult(`+X0.1 Mult`)}. Kafelek traci swoje ulepszenie. (Obecnie ${Style.Mult(`X${data.upgrade.props.mult} Mult`)})`,
      },
      kosiarka: {
        name: "Kosiarka",
        description: "Uruchamia ponownie wszystkie ulepszenia.",
      },
      demencja: {
        name: "Demencja",
        description: () => {
          const count = Style.Chance("3 razy");
          return `Pierwsze ulepszenie… ono… aktywuje się… ${count}. Tak, ${count}… ${Style.Chance("chyba…?")}`;
        },
      },
      razor: {
        name: "Żyletka",
        description: "Losowy rząd zostaje zniszczony przy pierwszym ruchu.",
      },
    },
  },
  [LANGUAGE.EN]: {
    ui: {
      reroll_shop: (data) => `Reroll shop ($${data?.game.shoproll ?? 4})`,
      buy: "Buy",
      use: "Use",
      sell: "Sell",
      buyanduse: "Buy and use",
      startGame: "Start Game",
      collection: "Collection",
      settings: "Settings",
      difficulty: "Difficulty",
      normal: "Normal",
      eternal: "Eternal",
      perishable: "Perishable",
      battery: "Battery",
      rental: "Rental",
      heavy: "Heavy",
      getAtLeast: "Get at least",
      score: "Score",
      yourScore: "Your score",
      round: "round",
      moves: "moves",
      info: "Info",
      close: "Close",
      continue: "Continue",
      game_over: "Game over",
      win: "You win!",
      new_game: "New game",
    },
    consumables: {
      
    },
    boosters: {

    },
    vouchers: {

    },
    upgrades: {
      applehater: {
        name: "AppleHater",
        description: (data) => {
          return `If ${data.game.fruits[0].icon} in cascade isn't broken, ${Style.Score("+60 points")}`;
        },
      },
      battlepass: {
        name: "Battlepass",
        description: (data) =>
          `At the end of round this upgrade gets ${Style.Mult("+1 mult")}. (Currently ${Style.Mult("+" + (data.upgrade.props.mult ?? 3) + " mult")})`,
      },
      highfive: {
        name: "High Five",
        description: `Upon destroying ${Style.Highlight("five")} tiles in a line, ${Style.Mult("X2 mult")}`,
      },
      broke: {
        name: "Broke",
        description: `If you have less than ${Style.Money("$6")}, ${Style.Score("+250 points")}`,
      },
      robber: {
        name: "Robber",
        description: (data) =>
          `Gives ${Style.Mult("mult")} for ${Style.Highlight("sell price")} of all owned upgrades. (Currently ${Style.Mult(`+${data.upgrade.props.calcMult()} mult`)}).`,
      },
      stockmarket: {
        name: "Stock Market",
        description: (data) => {
          if (!data.upgrade.props.randomfruit)
            return `${Style.Chance("-100%")} ${Style.Highlight(`for a random fruit`)}, the rest will get equally divided percentages. ${Style.Highlight(`changes every round.`)}`;
          return `${Style.Chance("-100%")} ${data.upgrade.props.randomfruit.icon}, ${Style.Chance("+" + data.game.calcEqualize(data.upgrade.props.previousPercent).toString() + "%")} the rest`;
        },
      },
      boom: {
        name: "Boom",
        description: `Dynamite appears ${Style.Chance("+2%")} more often`,
      },
      bomber: {
        name: "Bomber",
        description: `${Style.Score("+250 pts")} per move, ${Style.Moves("-2 moves")}`,
      },
      tetris: {
        name: "Tetris",
        description: `${Style.Moves("+4 moves")}`,
      },
      mult: {
        name: "Mult",
        description: `${Style.Mult("+4 mult")}`,
      },
      applelover: {
        name: "AppleLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} for each ${data.game.fruits[0].icon} in a cascade.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Currently ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      pearlover: {
        name: "PearLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} for each ${data.game.fruits[1].icon} in a cascade.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Currently ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      pineapplelover: {
        name: "PineappleLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} for each ${data.game.fruits[2].icon} in a cascade.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Currently ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      grapelover: {
        name: "GrapeLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} for each ${data.game.fruits[3].icon} in a cascade.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Currently ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      coconutlover: {
        name: "CoconutLover",
        description: (data) => {
          const desc = `${Style.Mult("+1 mult")} for each ${data.game.fruits[4].icon} in a cascade.`;
          return data.upgrade.props.mult !== 0
            ? desc +
                ` (Currently ${Style.Mult(`+${data.upgrade.props.mult} mult`)})`
            : desc;
        },
      },
      coconutbank: {
        name: "Coconut Bank",
        description: (data) => {
          const fruitIcon = data.game.fruits[4].icon;
          if (
            !data.upgrade.props.previousPercent ||
            data.upgrade.props.previousPercent === -1
          )
            return `${Style.Chance("+50%")} for ${fruitIcon} to be golden, ${Style.Chance("-10%")} ${fruitIcon}, ${Style.Chance("+2.5%")} for the rest`;
          return `${Style.Chance("+50%")} for ${fruitIcon} to be golden, ${Style.Chance(`-${data.upgrade.props.previousPercent}%`)} ${fruitIcon}, ${Style.Chance(`+${data.upgrade.props.previousPercent / (data.game.fruits.length - 1)}`)} for the rest`;
        },
      },
      goldenfruits: {
        name: "Golden Fruits",
        description: `${Style.Chance("+5%")} chance for gold`,
      },
      silverfruits: {
        name: "Silver Fruits",
        description: `${Style.Chance("+2%")} chance for silver`,
      },
      grapeinterest: {
        name: "Grape Interest",
        description: (data) => {
          let wynik = data.upgrade.props.score
            ? ` (Currently ${Style.Score(`+${data.upgrade.props.score} pts`)})`
            : "";
          return (
            `Each ${data.game.fruits[3].icon} gives ${Style.Score(`+${data.upgrade.props.value ?? 5} pts`)}, upgrades by ${Style.Score("+10 pts")} at the end of round.` +
            wynik
          );
        },
      },
      chainreaction: {
        name: "Chain Reaction",
        description: (data) => {
          const desc = `Each cascade gives an additional ${Style.Score("+30 pts")}`;
          return data.upgrade.props.score && data.upgrade.props.score > 0
            ? desc +
                `, (currently ${Style.Score(`+${data.upgrade.props.score}`)})`
            : desc;
        },
      },
      circus: {
        name: "Circus",
        description: "Allows the same upgrades to appear in the shop.",
      },
      fossil: {
        name: "Fossil",
        description: (data) => {
          if (data.upgrade.props.chosenFruit) {
            return `When ${data.upgrade.props.chosenFruit.icon} is destroyed, ${Style.Mult(`X1.5 Mult`)}`;
          }
          return `When the rarest fruit is destroyed, ${Style.Mult(`X1.5 Mult`)}`;
        },
      },
      madness: {
        name: "Madness",
        description: (data) =>
          `When a cascade results in only a three-of-a-kind, ${Style.Mult(`+X1 Mult`)}; resets to original value after the turn. (Currently ${Style.Mult(`X${data.upgrade.props.mult}`)})`,
      },
      zdrapka: {
        name: "Scratch Card",
        description: `${Style.Chance(`1 in 20`)} chance to get ${Style.Money(`$20`)} for a cascade`,
      },
      "6pak": {
        name: "6-Pack",
        description: (data) => {
          let value = data.upgrade.props.mult ?? 1;
          return `If you get at least a six-of-a-kind during the round, ${Style.Mult(`+X2 Mult`)} to this upgrade. (Currently ${Style.Mult(`X${value} Mult`)})`;
        },
      },
      moneymaker: {
        name: "Money Maker",
        description: (data) => {
          const currentGain = data.game.money * 3;
          if (data.upgrade.bought)
            return `Every cascade gives ${Style.Score("+3X pts")} ${Style.Highlight("per owned")} ${Style.Money("$")}. (Currently ${Style.Score(`+${currentGain} pts`)} per cascade, ${Style.Score(`+${data.upgrade.props.score} pts`)})`;
          return `Every cascade gives ${Style.Score("+3X pts")} ${Style.Highlight("per owned")} ${Style.Money("$")}. (Currently ${Style.Score(`+${currentGain} pts`)} per cascade)`;
        },
      },
      fish: {
        name: "Fish",
        description: (data) =>
          `The sell price increases by ${Style.Money(`$3`)} every round. (Currently ${Style.Money("$" + data.upgrade.props.sellPrice)})`,
      },
      tuttifrutti: {
        name: "Tutti Frutti",
        description: (data) => {
          const fruit = data.upgrade.props?.chosenFruit;
          if (data.upgrade.bought && fruit)
            return `For ${fruit.icon}, ${Style.Score(`+20 pts`)}, currently ${Style.Score(`${data.upgrade.props.score ?? 0} pts`)}`;
          return `Grants ${Style.Score(`+20 pts`)} for the first type of fruit destroyed in a round. Resets at round end.`;
        },
      },
      fruittycoon: {
        name: "Fruit Tycoon",
        description: `At the end of the round, ${Style.Money("+$1")} for each upgraded fruit in the game.`,
      },
      jackpot: {
        name: "Jackpot",
        description: `${Style.Chance("1 in 100")} chance to get ${Style.Money("$100")} after the round.`,
      },
      collector: {
        name: "Collector",
        description: (data) => {
          const collected = data.upgrade.props?.collected;
          const score = data.upgrade.props?.score;
          const collectedIcons =
            collected && collected.size > 0 ? [...collected].join(" ") : "0";
          const baseDesc = `If you destroy every type of fruit in a round, ${Style.Score("+200 pts")} per cascade.`;

          if (score && score > 0 && data.upgrade.bought) {
            return `${baseDesc} (Destroyed: ${collectedIcons}/${data.game.fruits.length}), (Currently ${Style.Score(`+${score} pts`)})`;
          }
          if (
            collected &&
            data.game.stage !== STAGES.Shop &&
            data.upgrade.bought
          ) {
            return `${baseDesc} (Destroyed: ${collectedIcons}/${data.game.fruits.length})`;
          }
          return baseDesc;
        },
      },
      boom_double: {
        name: "BOOM!!",
        description: (data) =>
          `${Style.Chance(`+1%`)} for ${data.game.special[1].icon}`,
      },
      boom_question: {
        name: "Boom?",
        description: (data) =>
          `${data.game.special[0].icon} and ${data.game.special[1].icon} detonate 1 more time.`,
      },
      lvlup: {
        name: "Lvl Up",
        description:
          "Grants an upgrade card for the first destroyed fruit (if there's space).",
      },
      dice: {
        name: "Dice",
        description: `Each move grants ${Style.Mult(`X1-6 Mult`)}`,
      },
      mirror: {
        name: "Mirror",
        description: (data) => {
          const neighbor = data.upgrade.getUltimateNeighbor?.();
          if (neighbor && data.upgrade.banned?.includes(neighbor.name)) {
            return `Cannot copy ${neighbor.name}.`;
          }
          if (data.upgrade.mirroredUpgradeCopy) {
            return data.upgrade.mirroredUpgrade.description(data.game);
          }
          return "Copies the upgrade to its right.";
        },
      },
      adrenaline: {
        name: "Adrenaline",
        description: `If there are fewer than 3 moves left, ${Style.Mult(`+10 Mult`)}`,
      },
      criticalhit: {
        name: "Critical Hit",
        description: (data) => {
          const mult = data.upgrade.props.mult ?? 1;
          return `${Style.Chance(`1 in 20`)} chance to get ${Style.Mult(`X3 Mult`)} per cascade, (Currently ${Style.Mult("X" + mult + " Mult")})`;
        },
      },
      pozeracz: {
        name: "Devourer",
        description: (data) => {
          const mult = data.upgrade.props.mult ?? 1;
          return `At the start of the round, destroys the upgrade ${Style.Highlight("to its right")} and gains ${Style.Mult(`mult`)} equal to ${Style.Highlight("2X its sell price")}. (Currently ${Style.Mult(`+${mult} Mult`)})`;
        },
      },
      liczydlo: {
        name: "Abacus",
        description: (data) => {
          const mult = data.upgrade.props.mult ?? 1;
          return `Every 15 fruits destroyed grants ${Style.Mult(`+1 Mult`)}. (Currently ${Style.Mult(`+${mult} Mult`)})`;
        },
      },
      2020: {
        name: "20/20",
        description: "All tile upgrades trigger twice.",
      },
      empty: {
        name: "Empty",
        description: (data) => {
          const mult = data.upgrade.props?.mult ?? 1;
          return `${Style.Mult(`+X1 Mult`)} for each empty upgrade slot. (Currently ${Style.Mult(`X${mult} Mult`)})`;
        },
      },
      snowman: {
        name: "Snowman",
        description: (data) => {
          const score = data.upgrade.props?.score ?? 0;
          let text = `Each cascade gives ${Style.Score(`+20 pts`)} more than the previous one, resets after the move.`;
          if (score > 0) text += ` (Currently ${Style.Score(`+${score} pts`)})`;
          return text;
        },
      },
      tripple: {
        name: "Triple",
        description: (data) => {
          const score = data.upgrade.props.score ?? 0;
          return `If only a three-of-a-kind is made in a cascade, ${Style.Score(`+3 pts`)} added to this upgrade. Grants total points at round end. (Currently ${Style.Score(`+${score} Pts`)})`;
        },
      },
      goraczka: {
        name: "Fever",
        description: `Grants ${Style.Mult("10-20 Mult")}. ${Style.Chance(`1 in 10`)} chance to disappear at round end.`,
      },
      dolar: {
        name: "Dollar",
        description: `Grants ${Style.Money("$4")} at the end of the round.`,
      },
      saper: {
        name: "Sapper",
        description: `${Style.Chance("1 in 5")} chance for each bomb or dynamite to detonate at the start of a move.`,
      },
      kartakredytowa: {
        name: "Credit Card",
        description: `Allows you to go ${Style.Money(`$10`)} into debt.`,
      },
      wrozka: {
        name: "Fortune Teller",
        description: (data) =>
          `For every Tarot card used in the game, gain ${Style.Mult(`+1 Mult`)}. (Currently ${Style.Mult(`+${data.game.stats.usedTarots} Mult`)})`,
      },
      lody: {
        name: "Ice Cream",
        description: (data) =>
          `Grants ${Style.Score(`+${data.upgrade.props.score} pts`)}. Points decrease by ${Style.Score(`-20 pts`)} every round.`,
      },
      wampir: {
        name: "Vampire",
        description: (data) =>
          `For every upgraded tile destroyed, gain ${Style.Mult(`+X0.1 Mult`)}. The tile loses its upgrade. (Currently ${Style.Mult(`X${data.upgrade.props.mult} Mult`)})`,
      },
      kosiarka: {
        name: "Lawnmower",
        description: "Retriggers all upgrades.",
      },
      demencja: {
        name: "Dementia",
        description: () => {
          const count = Style.Chance("3 times");
          return `The first upgrade... it... activates... ${count}. Yes, ${count}... ${Style.Chance("I think...?")}`;
        },
      },
      razor: {
        name: "Razor",
        description: "A random row is destroyed on the first move.",
      },
    },
  },
};
export const t = (path, lang, data = null) => {
  // Rozbijamy ścieżkę 'ui.buy' na ['ui', 'buy'] i szukamy w obiekcie
  const keys = path.split(".");
  let translation = translations[lang];

  for (const key of keys) {
    if (translation[key]) {
      translation = translation[key];
    } else {
      return path; // Zwraca ścieżkę, jeśli tłumaczenie nie istnieje (ułatwia debugowanie)
    }
  }

  // Jeśli tłumaczenie jest funkcją (jak w Twoich opisach), wywołujemy ją z danymi
  return typeof translation === "function" ? translation(data) : translation;
};
export function changeLanguage(data = null) {
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = t(key, Settings.LANGUAGE,data);
  });
}
