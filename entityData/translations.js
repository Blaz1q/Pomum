import {
  Style,
  LANGUAGE,
  DIFFICULTY,
  Settings,
  STAGES,
  MODIFIERS,
} from "../dictionary.js";
import { animateWave } from "../utils/animate_text.js";


export const translations = {
  [LANGUAGE.PL]: {
    ui: {
      buydoubleclick: 'Szybki zakup/użycie (Dwuklik)',
      reroll_shop: (data) => `Odśwież sklep ($${data?.game.shoproll ?? 4})`,
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
      getAtLeast: "Zdobądź conajmniej",
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
      points: "punktów",
      pts: "pkt",
      tilepoints: "Punkty",
      chance: "Szansa",
      goldchance: "Szansa na Gold",
      silverchance: "Szansa na Silver",
      mult: "Mnożnik",
      defaultdesc: "Zdobądź punkty aby przejść dalej!",
      chooseyourcards: (data) => `Wybierz swoje karty. Pozostało: ${data.game.BuysFromBoosterLeft}`,
      yourusername: "Podaj swój nick aby zapisać swój wynik!",
      nicktooshort: "Nick jest za krótki...",
      checking: "Sprawdzanie...",
      leaderboard: "Tablica wyników",
      position: "Poz.",
      player: "Gracz",
      tileSize: "Rozmiar kafelków",
      gameSpeed: "Prędkość gry",
      fast: "Szybka",
      slow: "Wolna",
      volume: "Głośność",
      darkMode: "Tryb ciemny",
      disableBg: "Wyłącz tło",
      oldIcons: "Stare ikony owoców"
    },
    server : {
      allowed: "Dozwolone!",
      notallowed: "Niedozwolone!",
      toosmalltoobig: "Nick jest zbyt krótki lub zbyt długi! (3-20)",
      error: "Błąd!",
      success: "Sukces!"
    },
    modifiers: {
      [MODIFIERS.Chip]: {
        name: "Chip",
        description: `Daje ${Style.Score('+50 pkt')} przy zliczaniu.`
      },
      [MODIFIERS.Negative]: {
        name: "Negatyw",
        description: `Nie zajmuje miejsca.`
      },
      [MODIFIERS.Polychrome]: {
        name: "Polychrome",
        description: `Daje ${Style.Mult('X1.5 Mult')} przy zliczaniu.`
      },
      [MODIFIERS.Mult]: {
        name: "Mult",
        description: `Daje ${Style.Mult('+10 Mult')} przy zliczaniu.`
      },
      debuffed: {
        description: `Nie daje punktów.`
      }
    },
    consumables: {
      apple: {
        name: "Jabłko",
        description: (data) => {
          const fruit = data.game.fruits[0];
          return `daje ${Style.Score("+2 punkty")}, ${Style.Mult("+0.4 mult")} do ${fruit.icon}, obecnie ${Style.Score("+" + fruit.props.upgrade.score + " punktów")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      pear: {
        name: "Gruszka",
        description: (data) => {
          const fruit = data.game.fruits[1];
          return `daje ${Style.Score("+2 punkty")}, ${Style.Mult("+0.4 mult")} do ${fruit.icon}, obecnie ${Style.Score("+" + fruit.props.upgrade.score + " punktów")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      pineapple: {
        name: "Ananas",
        description: (data) => {
          const fruit = data.game.fruits[2];
          return `daje ${Style.Score("+2 punkty")}, ${Style.Mult("+0.4 mult")} do ${fruit.icon}, obecnie ${Style.Score("+" + fruit.props.upgrade.score + " punktów")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      grape: {
        name: "Winogron",
        description: (data) => {
          const fruit = data.game.fruits[3];
          return `daje ${Style.Score("+2 punkty")}, ${Style.Mult("+0.4 mult")} do ${fruit.icon}, obecnie ${Style.Score("+" + fruit.props.upgrade.score + " punktów")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      coconut: {
        name: "Kokos",
        description: (data) => {
          const fruit = data.game.fruits[4];
          return `daje ${Style.Score("+2 punkty")}, ${Style.Mult("+0.4 mult")} do ${fruit.icon}, obecnie ${Style.Score("+" + fruit.props.upgrade.score + " punktów")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      evil_apple: {
        name: "EVIL Jabłko",
        description: (data) => {
          const fruit = data.game.fruits[0];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} reszta`;
          return `${Style.Chance("-5%")} dla ${fruit.icon} ${Style.Chance("+1.25%")} reszta`;
        }
      },
      evil_pear: {
        name: "EVIL Gruszka",
        description: (data) => {
          const fruit = data.game.fruits[1];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} reszta`;
          return `${Style.Chance("-5%")} dla ${fruit.icon} ${Style.Chance("+1.25%")} reszta`;
        }
      },
      evil_pineapple: {
        name: "EVIL Ananas",
        description: (data) => {
          const fruit = data.game.fruits[2];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} reszta`;
          return `${Style.Chance("-5%")} dla ${fruit.icon} ${Style.Chance("+1.25%")} reszta`;
        }
      },
      evil_grape: {
        name: "EVIL Winogron",
        description: (data) => {
          const fruit = data.game.fruits[3];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} reszta`;
          return `${Style.Chance("-5%")} dla ${fruit.icon} ${Style.Chance("+1.25%")} reszta`;
        }
      },
      evil_coconut: {
        name: "EVIL Kokos",
        description: (data) => {
          const fruit = data.game.fruits[4];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} reszta`;
          return `${Style.Chance("-5%")} dla ${fruit.icon} ${Style.Chance("+1.25%")} reszta`;
        }
      },

      // --- SILVER VARIANTS ---
      silver_apple: {
        name: "Silver Jabłko",
        description: (data) => `${Style.Chance("+1%")} szansa na Silver dla ${data.game.fruits[0].icon}`
      },
      silver_pear: {
        name: "Silver Gruszka",
        description: (data) => `${Style.Chance("+1%")} szansa na Silver dla ${data.game.fruits[1].icon}`
      },
      silver_pineapple: {
        name: "Silver Ananas",
        description: (data) => `${Style.Chance("+1%")} szansa na Silver dla ${data.game.fruits[2].icon}`
      },
      silver_grape: {
        name: "Silver Winogron",
        description: (data) => `${Style.Chance("+1%")} szansa na Silver dla ${data.game.fruits[3].icon}`
      },
      silver_coconut: {
        name: "Silver Kokos",
        description: (data) => `${Style.Chance("+1%")} szansa na Silver dla ${data.game.fruits[4].icon}`
      },

      // --- GOLD VARIANTS ---
      gold_apple: {
        name: "Gold Jabłko",
        description: (data) => `${Style.Chance("+1%")} szansa na Gold dla ${data.game.fruits[0].icon}`
      },
      gold_pear: {
        name: "Gold Gruszka",
        description: (data) => `${Style.Chance("+1%")} szansa na Gold dla ${data.game.fruits[1].icon}`
      },
      gold_pineapple: {
        name: "Gold Ananas",
        description: (data) => `${Style.Chance("+1%")} szansa na Gold dla ${data.game.fruits[2].icon}`
      },
      gold_grape: {
        name: "Gold Winogron",
        description: (data) => `${Style.Chance("+1%")} szansa na Gold dla ${data.game.fruits[3].icon}`
      },
      gold_coconut: {
        name: "Gold Kokos",
        description: (data) => `${Style.Chance("+1%")} szansa na Gold dla ${data.game.fruits[4].icon}`
      },
      negative: {
        name: "Negatyw",
        description: (data) => `Losowe ulepszenie staje się ${Style.Chance("Negatywne")}. (Ulepszenie nie zajmuje miejsca)`,
      },
      copy: {
        name: "Kopia",
        description: (data) => "Kopiuje losowe ulepszenie i usuwa całą resztę.",
      },
      thunder: {
        name: "Piorun",
        description: (data) => "Daje 4 losowe ulepszenia owoców (mogą się powtarzać).",
      },
      foiled: {
        name: "Foliowanie",
        description: (data) => `Losowe ulepszenie otrzymuje bonusowe ${Style.Chance(translations[LANGUAGE.EN].modifiers[MODIFIERS.Chip].name)}, ${Style.Chance(translations[LANGUAGE.EN].modifiers[MODIFIERS.Mult].name)} lub ${Style.Chance(translations[LANGUAGE.EN].modifiers[MODIFIERS.Polychrome].name)}.`,
      },
      fire: {
        name: "Ogień",
        description: (data) => `Daje gotówkę równą cenie sprzedaży wszystkich posiadanych ulepszeń (Max ${Style.Money("$40")}).`,
      },
      joker: {
        name: "Joker",
        description: `Tworzy losowe ${Style.Mult('Rare')} ulepszenie i ${Style.Highlight('zeruje pieniądze')} (Musi mieć miejsce)`
      },
      the_fool: {
        name: "Głupiec",
        description: (data) => {
          const last = data.game.stats.lastUsedTarot?.name || "Brak";
          return `Daje ostatnią użytą kartę tarota. (Ostatnia: ${last})`;
        },
      },
      death:{
        name: "Śmierć",
        description: `Zamienia losowy typ owocu ${Style.Highlight("na plaszny")} w najrzadszy owoc`
      },
      the_magician: {
        name: "Mag",
        description: (data) => "Zamienia szanse 2 losowych owoców miejscami.",
      },
      the_hierophant: {
        name: "Arcykapłan",
        description: (data) => "Daje 2 losowe karty tarota (wymaga wolnego miejsca).",
      },
      the_lovers: {
        name: "Kochankowie",
        description: (data) => `${Style.Moves("+2 ruchy")}`,
      },
      hermit: {
        name: "Pustelnik",
        description: `Podwaja pieniądze (Max ${Style.Money('$20')})`
      },
      strength: {
        name: "Siła",
        description: (data) => `Po użyciu daje ${Style.Mult("+10 Mult")}.`,
      },
      wheel_of_fortune: {
        name: "Koło Fortuny",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} na ${data.upgrade.props.max}`)} szansy, że ulepszenie otrzyma bonusowe ${Style.Chance(MODIFIERS.Chip)} lub ${Style.Chance(MODIFIERS.Polychrome)}.`,
      },
      the_hanged_man: {
        name: "Wisielec",
        description: (data) => "Niszczy 10 losowych kafelków na planszy.",
      },
      the_tower: {
        name: "Wieża",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} na ${data.upgrade.props.max}`)} szansy na całkowite przelosowanie szans wszystkich owoców.`,
      },
      the_star: {
        name: "Gwiazda",
        description: (data) => "Niszczy losowy rząd i kolumnę na planszy.",
      },
      the_moon: {
        name: "Księżyc",
        description: (data) => `Ulepsza od ${Style.Chance("1 do 20")} kafelków na ${Style.Chance(MODIFIERS.Silver)}.`,
      },
      the_sun: {
        name: "Słońce",
        description: (data) => `Ulepsza od ${Style.Chance("1 do 20")} kafelków na ${Style.Chance(MODIFIERS.Gold)}.`,
      },
    },
    bosses: {
      snake: {
        name: "Wąż",
        description: (data) => `Wszystkie ${data.game.fruits[0].icon} nie dają punktów.`,
      },
      bear: {
        name: "Niedźwiedź",
        description: (data) => `Wszystkie ${data.game.fruits[1].icon} nie dają punktów.`,
      },
      starfish: {
        name: "Rozgwiazda",
        description: (data) => `Wszystkie ${data.game.fruits[2].icon} nie dają punktów.`,
      },
      vine: {
        name: "Winorośl",
        description: (data) => `Wszystkie ${data.game.fruits[3].icon} nie dają punktów.`,
      },
      crab: {
        name: "Krab",
        description: (data) => `Wszystkie ${data.game.fruits[4].icon} nie dają punktów.`,
      },
      wave: {
        name: "Fala",
        description: (data) => {
          const fruit = data.upgrade.props.chosenFruit;
          return fruit ? `Najczęstszy owoc (${fruit.icon}) nie daje punktów.` : `Najczęstszy owoc nie daje punktów.`;
        },
      },
      needle: {
        name: "Igła",
        description: (data) => "Masz o 3 ruchy mniej w tej rundzie.",
      },
      ruler: {
        name: "Władca",
        description: (data) => `Zmniejsza ${Style.Mult("mult")} i ${Style.Score("punkty")} o ${Style.Highlight('10%')}.`,
      },
    },
    boosters: {
      pomumpack: {
        name: "Pomum pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpackbig: {
        name: "BIG Pomum pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpackmega: {
        name: "MEGA Pomum pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpackgold: {
        name: "GOLD Pomum pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpacksilver: {
        name: "SILVER Pomum pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('ulepszeń kafelków')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      upgradepack: {
        name: "Upgrade pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('ulepszeń')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      tarotpack: {
        name: "Tarot pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('tarota')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pactpack: {
        name: "Pakt pack",
        description: (data) => `Znajdują się ${Style.Highlight(data.upgrade.props.maxRoll)} karty ${Style.Highlight('Paktu')}. Możesz wybrać maksymalnie ${Style.Highlight(data.upgrade.props.maxSelect)}`
      }
    },
    vouchers: {
      upgrade_plus: {
        name: "+1 Slot",
        description: (data) => `Zwiększa miejsce na ulepszenia o 1. (Obecnie ${Style.Chance(data.game.maxUpgrades)} -> ${Style.Chance(data.game.maxUpgrades + 1)})`,
      },
      overstock: {
        name: "Nadmiar",
        description: (data) => {
          const current = data.game.shopSize || 3;
          return `Zwiększa miejsce na ulepszenia w sklepie o 1. (Obecnie ${Style.Chance(current)} -> ${Style.Chance(current + 1)})`;
        },
      },
      passage: {
        name: "Przejście",
        description: (data) => `Zwiększa możliwe ruchy w rundzie o ${Style.Moves("+1 ruch")}`,
      },
      power: {
        name: "Moc",
        description: (data) => `Ulepszone karty pojawiają się ${Style.Chance("X2")} częściej`,
      },
      salad: {
        name: "Sałatka",
        description: (data) => `Zwiększa miejsce na ulepszenia kafelków o 1. (Obecnie ${Style.Chance(data.game.maxConsumables)} -> ${Style.Chance(data.game.maxConsumables + 1)})`,
      },
      booster: {
        name: "Doładowanie",
        description: (data) => `Zwiększa miejsce na Booster Packi w sklepie o 1. (Obecnie ${Style.Chance(data.game.maxBoosters)} -> ${Style.Chance(data.game.maxBoosters + 1)})`,
      },
      discount:{
        name: "Promocja",
        description: (data) => `Daje zniżkę ${Style.Chance('25%')} do wszystkich ulepszeń ${Style.Chance('w sklepie')}`
      } 
    },
    upgrades: {
      hallucination: {
        name: "Halucynacja",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} na ${data.upgrade.props.max}`)} że po otwarciu ${Style.Highlight('Boostera')} dostanie się ${Style.Highlight('Kartę tarota')} (Jeśli jest miejsce)`
      },
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
          `Pozwala na pojawianie się w sklepie tych samych ${Style.Highlight("Ulepszeń")}, ${Style.Highlight("Kart tarota")}, ${Style.Highlight("Ulepszeń kafelków")} i ${Style.Highlight("Kart Paktu")}`,
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
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} na ${data.upgrade.props.max}`)} że za kaskade dostanie się ${Style.Money(`$20`)}`
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
        description: (data) => `Szansa ${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} na ${data.upgrade.props.max}`)} że po rundzie dostaniesz ${Style.Money("$100")}`,
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
          return `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} na ${data.upgrade.props.max}`)} że co kaskadę dostanie się ${Style.Mult(`X3 Mult`)}, (Obecnie ${Style.Mult("X" + mult + " Mult")})`;
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
          return `${Style.Mult(`+X1 Mult`)} za każde nieużyte miejsce ulepszeń. (Obecnie ${Style.Mult(`X${data.upgrade.props.calcMult()} Mult`)})`;
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
        description: (data) => `Daje ${Style.Mult("+10-20 Mult")}. ${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} na ${data.upgrade.props.max}`)}, że zniknie na końcu rundy.`,
      },
      dolar: {
        name: "Dolar",
        description: `Na końcu rundy daje ${Style.Money("$4")}.`,
      },
      saper: {
        name: "Saper",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} na każdą bombę lub dynamit, że zostanie wysadzony na początku ruchu.`,
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
      hourglass: {
        name: "Klepsydra",
        description: (data) => {
          return `Ulepszenie daje ${Style.Mult("X4 Mult")}, który spada o ${Style.Mult("-X0.5")} z każdym wykonanym ruchem. (Obecnie ${Style.Mult("X"+data.upgrade.props.mult+" Mult")})`;
        },
      },
      polariod: {
        name: "Polaroid",
        description: (data) => {
          return `Gdy sprzeda się to ulepszenie po ${data.upgrade.props.rounds} rundach, daje kopię losowego posiadanego ulepszenia (Runda ${data.upgrade.props.counter} z ${data.upgrade.props.rounds})`;
        }
      },
      consumable: {
        name: "Konsumpcjonizm",
        description: `Wszystkie ${Style.Highlight("Ulepszenia kafelków")} w sklepie są ${Style.Highlight("darmowe")}.`
      },
      tarot: {
        name: "Ezoteryka",
        description: `Wszystkie ${Style.Highlight("Karty tarota")} w sklepie są ${Style.Highlight("darmowe")}.`
      },
      giftcard: {
        name: "Karta Podarunkowa",
        description: `${Style.Highlight("Na końcu rundy")}, wszystkie posiadane karty zyskują ${Style.Money("$1")} do ceny sprzedaży.`
      },
      paytowin: {
        name: "Pay to Win",
        description: (data) =>
          `${Style.Mult("+1 Mult")} za każde wydane ${Style.Money("$10")}. (Obecnie ${Style.Mult(`+${data.upgrade.props.calcMult()} Mult`)})`
      },
      aristocrat: {
        name: "Arystokrata",
        description: (data) => 
          `Daje ${Style.Mult('X1.5 mult')} za wszystkie posiadane ulepszenia ${Style.Highlight('Uncommon')}. (Obecnie ${Style.Mult(`X${data.upgrade.props.calcMult()} Mult`)})`
      },
      clover: {
        name: "Koniczyna",
        description: `Podwaja wszystkie szanse. (np. ${Style.Chance('1 na 5')} -> ${Style.Chance('2 na 5')})`
      }
    },
    popups: {
      used: "Użyto!",
      success: "Sukces!",
      cantuse: "Nie można użyć."
    }
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
      points: "points",
      defaultdesc: "Collect points to advance!",
      pts: "pts",
      chooseyourcards: (data) => `Choose your cards. Cards left: ${data.game.BuysFromBoosterLeft}`,
      chance: "Chance",
      goldchance: "Gold chanse",
      silverchance: "Silver chance",
      mult: "Multiplier",
      tilepoints: "Points",
      yourusername: "Enter your name to submit your score!",
      nicktooshort: "Nick is too short...",
      checking: "Checking...",
      leaderboard: "Leaderboard",
      position: "Pos.",
      player: "Player",
      tileSize: "Tile size",
      gameSpeed: "Game speed",
      fast: "Fast",
      slow: "Slow",
      volume: "Volume",
      darkMode: "Dark mode",
      disableBg: "Disable background",
      oldIcons: "Old fruit icons",
      buydoubleclick: 'Fast Buy/Use (Double-click)',
    },
    server : {
      allowed: "Allowed!",
      notallowed: "Not allowed!",
      toosmalltoobig: "Username is too small or too big! (3-20)",
      error: "error",
      success: "success"
    },
    modifiers: {
      [MODIFIERS.Chip]: {
        name: "Chip",
        description: `Gives ${Style.Score('+50 pts')} when scoring.`
      },
      [MODIFIERS.Negative]: {
        name: "Negative",
        description: `Doesn't take up space.`
      },
      [MODIFIERS.Polychrome]: {
        name: "Polychrome",
        description: `Gives ${Style.Mult('X1.5 Mult')} when scoring.`
      },
      [MODIFIERS.Mult]: {
        name: "Mult",
        description: `Gives ${Style.Mult('+10 Mult')} when scoring.`
      },
      debuffed: {
        description: `Nie daje punktów.`
      }
    },
    bosses: {
      snake: {
        name: "The Snake",
        description: (data) => `All ${data.game.fruits[0].icon} give no points.`,
      },
      bear: {
        name: "The Bear",
        description: (data) => `All ${data.game.fruits[1].icon} give no points.`,
      },
      starfish: {
        name: "The Starfish",
        description: (data) => `All ${data.game.fruits[2].icon} give no points.`,
      },
      vine: {
        name: "The Vine",
        description: (data) => `All ${data.game.fruits[3].icon} give no points.`,
      },
      crab: {
        name: "The Crab",
        description: (data) => `All ${data.game.fruits[4].icon} give no points.`,
      },
      wave: {
        name: "The Wave",
        description: (data) => {
          const fruit = data.upgrade.props.chosenFruit;
          return fruit ? `Most common fruit (${fruit.icon}) gives no points.` : `Most common fruit gives no points.`;
        },
      },
      needle: {
        name: "The Needle",
        description: (data) => "3 fewer moves this round.",
      },
      ruler: {
        name: "The Ruler",
        description: (data) => `Reduces ${Style.Mult("mult")} and ${Style.Score("score")} by ${Style.Highlight('10%')}.`,
      },
      rust: {
        name: "Rust",
        description: `The most expensive owned upgrade is debuffed.`
      }
    },
    consumables: {
      apple: {
        name: "Apple",
        description: (data) => {
          const fruit = data.game.fruits[0];
          return `gives ${Style.Score("+2 points")}, ${Style.Mult("+0.4 mult")} to ${fruit.icon}, currently ${Style.Score("+" + fruit.props.upgrade.score + " points")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      pear: {
        name: "Pear",
        description: (data) => {
          const fruit = data.game.fruits[1];
          return `gives ${Style.Score("+2 points")}, ${Style.Mult("+0.4 mult")} to ${fruit.icon}, currently ${Style.Score("+" + fruit.props.upgrade.score + " points")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      pineapple: {
        name: "Pineapple",
        description: (data) => {
          const fruit = data.game.fruits[2];
          return `gives ${Style.Score("+2 points")}, ${Style.Mult("+0.4 mult")} to ${fruit.icon}, currently ${Style.Score("+" + fruit.props.upgrade.score + " points")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      grape: {
        name: "Grapes",
        description: (data) => {
          const fruit = data.game.fruits[3];
          return `gives ${Style.Score("+2 points")}, ${Style.Mult("+0.4 mult")} to ${fruit.icon}, currently ${Style.Score("+" + fruit.props.upgrade.score + " points")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      coconut: {
        name: "Coconut",
        description: (data) => {
          const fruit = data.game.fruits[4];
          return `gives ${Style.Score("+2 points")}, ${Style.Mult("+0.4 mult")} to ${fruit.icon}, currently ${Style.Score("+" + fruit.props.upgrade.score + " points")}, ${Style.Mult("+" + fruit.props.upgrade.mult + " mult")}`;
        },
      },
      evil_apple: {
        name: "EVIL Apple",
        description: (data) => {
          const fruit = data.game.fruits[0];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} to others`;
          return `${Style.Chance("-5%")} for ${fruit.icon} ${Style.Chance("+1.25%")} to others`;
        }
      },
      evil_pear: {
        name: "EVIL Pear",
        description: (data) => {
          const fruit = data.game.fruits[1];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} to others`;
          return `${Style.Chance("-5%")} for ${fruit.icon} ${Style.Chance("+1.25%")} to others`;
        }
      },
      evil_pineapple: {
        name: "EVIL Pineapple",
        description: (data) => {
          const fruit = data.game.fruits[2];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} to others`;
          return `${Style.Chance("-5%")} for ${fruit.icon} ${Style.Chance("+1.25%")} to others`;
        }
      },
      evil_grape: {
        name: "EVIL Grapes",
        description: (data) => {
          const fruit = data.game.fruits[3];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} to others`;
          return `${Style.Chance("-5%")} for ${fruit.icon} ${Style.Chance("+1.25%")} to others`;
        }
      },
      evil_coconut: {
        name: "EVIL Coconut",
        description: (data) => {
          const fruit = data.game.fruits[4];
          if (fruit.props.percent - 5 <= 0) return `${Style.Chance("-" + fruit.props.percent + "%")} ${Style.Chance(`+${data.game.calcEqualize(fruit.props.percent)}%`)} to others`;
          return `${Style.Chance("-5%")} for ${fruit.icon} ${Style.Chance("+1.25%")} to others`;
        }
      },

      // --- SILVER VARIANTS ---
      silver_apple: {
        name: "Silver Apple",
        description: (data) => `${Style.Chance("+1%")} Silver chance for ${data.game.fruits[0].icon}`
      },
      silver_pear: {
        name: "Silver Pear",
        description: (data) => `${Style.Chance("+1%")} Silver chance for ${data.game.fruits[1].icon}`
      },
      silver_pineapple: {
        name: "Silver Pineapple",
        description: (data) => `${Style.Chance("+1%")} Silver chance for ${data.game.fruits[2].icon}`
      },
      silver_grape: {
        name: "Silver Grapes",
        description: (data) => `${Style.Chance("+1%")} Silver chance for ${data.game.fruits[3].icon}`
      },
      silver_coconut: {
        name: "Silver Coconut",
        description: (data) => `${Style.Chance("+1%")} Silver chance for ${data.game.fruits[4].icon}`
      },

      // --- GOLD VARIANTS ---
      gold_apple: {
        name: "Gold Apple",
        description: (data) => `${Style.Chance("+1%")} Gold chance for ${data.game.fruits[0].icon}`
      },
      gold_pear: {
        name: "Gold Pear",
        description: (data) => `${Style.Chance("+1%")} Gold chance for ${data.game.fruits[1].icon}`
      },
      gold_pineapple: {
        name: "Gold Pineapple",
        description: (data) => `${Style.Chance("+1%")} Gold chance for ${data.game.fruits[2].icon}`
      },
      gold_grape: {
        name: "Gold Grapes",
        description: (data) => `${Style.Chance("+1%")} Gold chance for ${data.game.fruits[3].icon}`
      },
      gold_coconut: {
        name: "Gold Coconut",
        description: (data) => `${Style.Chance("+1%")} Gold chance for ${data.game.fruits[4].icon}`
      },
      negative: {
        name: "Negative",
        description: (data) => "A random upgrade becomes negative. (upgrade doesn't take up space)",
      },
      copy: {
        name: "Copy",
        description: (data) => "Copies a random upgrade and removes the rest.",
      },
      thunder: {
        name: "Thunder",
        description: (data) => "Gives 4 random fruit upgrades (can repeat).",
      },
      foiled: {
        name: "Foiled",
        description: (data) => `Random upgrade gets a bonus ${Style.Chance(translations[LANGUAGE.EN].modifiers[MODIFIERS.Chip].name)}, ${Style.Chance(translations[LANGUAGE.EN].modifiers[MODIFIERS.Mult].name)} or ${Style.Chance(translations[LANGUAGE.EN].modifiers[MODIFIERS.Polychrome].name)}.`,
      },
      fire: {
        name: "Fire",
        description: (data) => `Gives the sell price of all owned upgrades (Max ${Style.Money("$40")}).`,
      },
      joker: {
        name: "Joker",
        description: `Creates random ${Style.Mult('Rare')} upgrade and ${Style.Highlight('sets money to zero.')} (Must have room)`
      },
      the_fool: {
        name: "The Fool",
        description: (data) => {
          const last = data.game.stats.lastUsedTarot?.name || "None";
          return `Gives the last used tarot card. (Last: ${last})`;
        },
      },
      death:{
        name: "Death",
        description: `Swaps a random type of fruit ${Style.Highlight("on the board")} with the rarest one`
      },
      the_magician: {
        name: "The Magician",
        description: (data) => "Swaps the spawn chances of 2 random fruits.",
      },
      the_hierophant: {
        name: "The Hierophant",
        description: (data) => "Gives 2 random tarot cards (requires empty slots).",
      },
      the_lovers: {
        name: "The Lovers",
        description: (data) => `${Style.Moves("+2 moves")}`,
      },
      hermit: {
        name: "The Hermit",
        description: `Doubles money (Max ${Style.Money('$20')})`
      },
      strength: {
        name: "Strength",
        description: (data) => `Gives ${Style.Mult("+10 Mult")} when used.`,
      },
      wheel_of_fortune: {
        name: "Wheel of Fortune",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance for an upgrade to get bonus ${Style.Chance(MODIFIERS.Chip)} or ${Style.Chance(MODIFIERS.Polychrome)}.`,
      },
      the_hanged_man: {
        name: "The Hanged Man",
        description: (data) => "Destroys 10 random tiles on the board.",
      },
      the_tower: {
        name: "The Tower",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance to reroll chances for all fruits.`,
      },
      the_star: {
        name: "The Star",
        description: (data) => "Destroys a random row and column on the board.",
      },
      the_moon: {
        name: "The Moon",
        description: (data) => `Upgrades ${Style.Chance("1 to 20")} tiles to ${Style.Chance(MODIFIERS.Silver)}.`,
      },
      the_sun: {
        name: "The Sun",
        description: (data) => `Upgrades ${Style.Chance("1 to 20")} tiles to ${Style.Chance(MODIFIERS.Gold)}.`,
      },
    },
    boosters: {
      pomumpack: {
        name: "Pomum Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Tile Upgrade')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpackbig: {
        name: "Big Pomum Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Tile Upgrade')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpackmega: {
        name: "Mega Pomum Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Tile Upgrade')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpackgold: {
        name: "Gold Pomum Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Tile Upgrade')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pomumpacksilver: {
        name: "Silver Pomum Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Tile Upgrade')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      upgradepack: {
        name: "Upgrade Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Upgrade')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      tarotpack: {
        name: "Tarot Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Tarot')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      },
      pactpack: {
        name: "Pact Pack",
        description: (data) => `Contains ${Style.Highlight(data.upgrade.props.maxRoll)} ${Style.Highlight('Pact')} cards. You can choose up to ${Style.Highlight(data.upgrade.props.maxSelect)}`
      }
    },
    vouchers: {
      upgrade_plus: {
        name: "+1 Slot",
        description: (data) => `Increases upgrade slots by 1. (Currently ${Style.Chance(data.game.maxUpgrades)} -> ${Style.Chance(data.game.maxUpgrades + 1)})`,
      },
      overstock: {
        name: "Overstock",
        description: (data) => {
          const current = data.game.shopSize || 3;
          return `Increases shop upgrade slots by 1. (Currently ${Style.Chance(current)} -> ${Style.Chance(current + 1)})`;
        },
      },
      passage: {
        name: "Passage",
        description: (data) => `Increases moves per round by ${Style.Moves("+1 move")}`,
      },
      power: {
        name: "Power",
        description: (data) => `Upgraded tiles appear ${Style.Chance("X2")} more often`,
      },
      salad: {
        name: "Salad",
        description: (data) => `Increases tile upgrade slots by 1. (Currently ${Style.Chance(data.game.maxConsumables)} -> ${Style.Chance(data.game.maxConsumables + 1)})`,
      },
      booster: {
        name: "Booster",
        description: (data) => `Increases shop Booster Pack slots by 1. (Currently ${Style.Chance(data.game.maxBoosters)} -> ${Style.Chance(data.game.maxBoosters + 1)})`,
      },
      discount:{
        name: "Discount",
        description: (data) => `Gives ${Style.Chance('25%')} discount to all upgrades ${Style.Chance('in shop')}`
      } 

    },
    upgrades: {
      hallucination: {
        name: "Hallucination",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance when opening ${Style.Highlight('Booster packs')} for creating ${Style.Highlight('Tarot card')} (Must have room)`
      },
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
        description: `Allows the same ${Style.Highlight("Upgrades")}, ${Style.Highlight("Tarot")}, ${Style.Highlight("Consumables")} and ${Style.Highlight("Pact cards")} to appear in the shop.`,
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
        description: (data)=> `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance to get ${Style.Money(`$20`)} for a cascade`,
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
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance to get ${Style.Money("$100")} after the round.`,
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
          return `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance to get ${Style.Mult(`X3 Mult`)} per cascade, (Currently ${Style.Mult("X" + mult + " Mult")})`;
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
          return `${Style.Mult(`+X1 Mult`)} for each empty upgrade slot. (Currently ${Style.Mult(`X${data.upgrade.props.calcMult()} Mult`)})`;
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
        description: (data) => `Grants ${Style.Mult("+10-20 Mult")}. ${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance to disappear at round end.`,
      },
      dolar: {
        name: "Dollar",
        description: `Grants ${Style.Money("$4")} at the end of the round.`,
      },
      saper: {
        name: "Sapper",
        description: (data) => `${Style.Chance(`${data.upgrade.props.chance + (data.game.bonusChance ?? 0)} in ${data.upgrade.props.max}`)} chance for each bomb or dynamite to detonate at the start of a move.`,
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
      hourglass: {
        name: "Hourglass",
        description: (data) => {
          return `This upgrade gives ${Style.Mult("X4 Mult")}, which decreases by ${Style.Mult("-X0.5")} with every move. (Currently ${Style.Mult("X"+data.upgrade.props.mult+" Mult")})`;
        },
      },
      polariod: {
        name: "Polaroid",
        description: (data) => {
          return `When selling this upgrade after ${data.upgrade.props.rounds} rounds, grants a copy of a random owned upgrade (Round ${data.upgrade.props.counter} of ${data.upgrade.props.rounds})`;
        }
      },
      consumable: {
        name: "Consumerism",
        description: `All ${Style.Highlight("Tile Upgrades")} in the shop are ${Style.Highlight("free")}.`
      },
      tarot: {
        name: "Esoterica",
        description: `All ${Style.Highlight("Tarot Cards")} in the shop are ${Style.Highlight("free")}.`
      },
      giftcard: {
        name: "Gift Card",
        description: `${Style.Highlight("At the end of the round")}, all owned cards gain ${Style.Money("$1")} to their sell price.`
      },
      paytowin: {
        name: "Pay to Win",
        description: (data) =>
          `${Style.Mult("+1 Mult")} for every ${Style.Money("$10")} spent. (Currently ${Style.Mult(`+${data.upgrade.props.calcMult()} Mult`)})`
      },
      aristocrat: {
        name: "Aristocrat",
        description: (data) => 
          `Gives ${Style.Mult('X1.5 mult')} for every owned ${Style.Highlight('Uncommon')} upgrade. (Currently ${Style.Mult(`X${data.upgrade.props.calcMult()} Mult`)})`
      },
      clover: {
        name: "Clover",
        description: `Doubles every chance. (eg. ${Style.Chance('1 in 5')} -> ${Style.Chance('2 in 5')})`
      }
    },
    popups: {
      used: "Used!",
      success: "Success!",
      cantuse: "Can't be used."
    }
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
    const anim = el.getAttribute("data-animate") ?? null;
    
    el.innerHTML = t(key, Settings.LANGUAGE, data);
    if(anim){
      switch(anim){
        case "wave":
          {
            animateWave(el);
          } 
          break;  
      }
    }
  });
}
