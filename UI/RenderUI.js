import { consumableList, consumablePacks, coupons } from "../entityData/consumablelist.js";
import { Upgrade } from "../entities/Upgrade.js";
import { animate, Animator } from "../loadshaders.js";
import {
  Style,
  COLORS,
  GAMECOLORS,
  DURATIONS,
  STAGES,
  MODIFIERS,
  GAME_TRIGGERS,
  UPGRADE_STATES,
  Settings,
  DIFFICULTY,
  LANGUAGE,
} from "../dictionary.js";
import { rollBoss } from "../entities/Boss.js";
import { upgradesList } from "../entityData/upgradelist.js";
import { Consumable } from "../entities/Consumable.js";
import { Voucher } from "../entities/Voucher.js";
import { ConsumablePack } from "../entities/ConsumablePack.js";
import { animateWave, clearAnimation, firstplace, initBalatroEffect, scaleText, secondplace, thirdplace } from "../utils/animate_text.js";
import { translations,changeLanguage, t } from "../entityData/translations.js";
import { compareScores, getLeaderboard } from "../utils/leaderboard.js";
export class RenderUI {
  constructor(game) {
    this.game = game;
    this.moneyBox = document.getElementById("money");
    this.movesBox;
    this.scoreBox;
  }
  displayMoves() {
    this.game.moveBox.innerHTML = this.game.moves - this.game.movescounter;
  }
  displayMoney() {
    clearAnimation(document.getElementById("money"));
    const moneyBox = this.moneyBox;

    const start = this.prevMoney ?? 0;
    const end = this.game.money;
    this.prevMoney = end;
    if(start==end) return;
    const formatMoney = (val) => {
        const isNegative = val < 0;
        const absoluteValue = Math.abs(val);
        return isNegative ? `-$${absoluteValue}` : `$${absoluteValue}`;
      };
    const animateNumber = (element, start, end) => {
      if (start === end) {
        element.innerHTML = formatMoney(end);
        return;
      }
      
      const duration = 250;
      const startTime = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        const value = Math.round(start + (end - start) * eased);
        element.innerHTML = formatMoney(value);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.classList.remove("money-pop");
          void element.offsetWidth;
          element.classList.add("money-pop");
        }
      };

      requestAnimationFrame(animate);

      setTimeout(() => {
        initBalatroEffect(document.getElementById("money"));
      },300);
    };

    animateNumber(moneyBox, start, end);

    
  }
  updateMoney(ammount) {
    let moneyContainer = document.getElementsByClassName("moneycontainer")[0];
    if (ammount == 0) {
      return;
    }
    let char = "";
    if (ammount < 0) {
      this.game.stats.moneySpent-=ammount;
      char = "-";
      moneyContainer.classList.add("lost");
    } else {
      char = "+";
      moneyContainer.classList.add("earned");
    }
    ammount = Math.abs(ammount);
    this.moneyBox.innerHTML = char + "$" + ammount;
    setTimeout(() => {
      this.displayMoney();
      moneyContainer.classList.remove("lost");
      moneyContainer.classList.remove("earned");
    }, 300);
  }
  notEnoughMoney() {
    let moneyContainer = document.getElementsByClassName("moneycontainer")[0];
    moneyContainer.classList.add("notEnough");
    setTimeout(() => {
      moneyContainer.classList.remove("notEnough");
    }, 400);
  }
  notEnoughSpace(container) {
    container.classList.add("notEnough");
    setTimeout(() => {
      container.classList.remove("notEnough");
    }, 400);
  }
  displayRound() {
    const title = document.getElementById("round-title");
    const desc = document.getElementById("debuff-desc");
    clearAnimation(title);
    clearAnimation(desc);
    clearAnimation(this.game.roundBox);
    if(this.game.stage!=STAGES.Boss){
      title.innerHTML = t("ui.round",Settings.LANGUAGE)+" "+this.game.round;
      desc.innerHTML = t("ui.defaultdesc",Settings.LANGUAGE);
    }
    else{
      title.innerHTML = this.game.nextBoss.name;
      desc.innerHTML =  this.game.nextBoss.description(this.game);
      
    }
    
    this.game.roundBox.innerHTML = this.game.round+" / 20";
    initBalatroEffect(title);
    initBalatroEffect(desc);
    initBalatroEffect(this.game.roundBox);
  }
  formatNumber(num) {
    if (num < 1e9) {
      return Math.floor(num).toLocaleString('pl-PL');; // Standard display for smaller numbers
    }
    // toExponential(2) gives exactly 2.98e+30 style
    return num.toExponential(2).replace("+", ""); 
  }
displayScore() {
    const roundScoreBox = document.getElementById("roundscore");
    const totalScoreBox = document.getElementById("score");

    const newRoundScore = this.game.calcRoundScore();
    const newTotalScore = this.game.score;

    // 1. Używamy zmiennych pomocniczych w klasie zamiast czytania z HTML.
    // Jeśli te zmienne nie istnieją, inicjalizujemy je zerem.
    this.lastDisplayedRound = this.lastDisplayedRound || 0;
    this.lastDisplayedTotal = this.lastDisplayedTotal || 0;

    const animateNumber = (element, start, end, key) => {
        // 2. Bardzo ważne: jeśli różnica jest zerowa, nie rób nic.
        if (Math.abs(start - end) < 0.1) {
            element.innerHTML = this.formatNumber(end);
            return;
        }

        const duration = 250;
        const startTime = performance.now();

        const animate = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentValue = start + (end - start) * eased;
            element.innerHTML = this.formatNumber(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 3. Aktualizujemy "ostatnią wartość" po zakończeniu animacji
                this[key] = end; 
                
                element.classList.remove("pop-anim");
                void element.offsetWidth;
                element.classList.add("pop-anim");
            }
        };

        requestAnimationFrame(animate);
    };

    // Odpalamy animację przekazując klucz pod którym zapiszemy nową wartość
    animateNumber(roundScoreBox, this.lastDisplayedRound, newRoundScore, 'lastDisplayedRound');
    animateNumber(totalScoreBox, this.lastDisplayedTotal, newTotalScore, 'lastDisplayedTotal');
}
fitText(container) {
    if (!container) return;

    const text = container.dataset.lastValue || "0";
    const parent = container.parentElement;
    if (!parent) return;

    const signWidth = parent.querySelector('.multiply-sign')?.offsetWidth || 40;
    
    // 1. Pobieramy padding z CSS (żeby nie wpisywać go na sztywno w JS)
    // getComputedStyle pobierze realną wartość, nawet jeśli zmienisz ją w CSS
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const totalPadding = paddingLeft + paddingRight;

    // 2. Obliczamy dostępną szerokość bazy (flexbox)
    // Odejmujemy znak X i marginesy między elementami (40)
    const baseWidth = (parent.clientWidth - signWidth - 40) / 2;

    // 3. Odejmujemy padding od maxWidth, aby tekst miał mniej miejsca
    const maxWidth = baseWidth - totalPadding;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    let fontSize = 64; 
    
    while (fontSize > 8) {
        context.font = `bold ${fontSize}px "Jersey 25", sans-serif`;
        const metrics = context.measureText(text);
        
        // Jeśli tekst z tym fontem mieści się w maxWidth (już bez paddingu)
        if (metrics.width <= maxWidth) {
            break; 
        }
        fontSize -= 1;
    }

    container.style.fontSize = fontSize + 'px';
}
displayTempScore() {
    const scoreBox = this.game.tempscoreBox;
    const multBox = this.game.multBox;

    const newScore = this.game.tempscore;
    const newMult = Math.round(this.game.mult * 100) / 100;
    this.game.mult = newMult;

    // 1. Formatujemy nowe wartości
    const formattedScore = this.formatNumber(newScore).toString();
    const formattedMult = (newMult >= 1e6 ? this.formatNumber(newMult) : newMult).toString();

    // 2. PORÓWNANIE: Używamy dataset, aby przechowywać "czystą" wartość bez tagów span
    // scoreBox.dataset.lastValue to nasz własny "podręczny" schowek
    const scoreChanged = scoreBox.dataset.lastValue !== formattedScore;
    const multChanged = multBox.dataset.lastValue !== formattedMult;
    
    clearAnimation(scoreBox);
    clearAnimation(multBox);
    if (scoreChanged) {
        // Zapisujemy nową czystą wartość do schowka
        scoreBox.dataset.lastValue = formattedScore;
        // Wstawiamy czysty tekst (to usunie stare spany przed ponownym splitText)
        scoreBox.textContent = formattedScore; 
        this.fitText(scoreBox);
        scaleText(scoreBox);
    }

    if (multChanged) {
        multBox.dataset.lastValue = formattedMult;
        multBox.textContent = formattedMult;
        this.fitText(multBox);
        scaleText(multBox);
    }
}
  displayUpgradesCounter() {
    let counter =0;
    this.game.upgrades.forEach(upgrade => {
        counter+=upgrade.slots;
    });
    document.getElementById("upgrades-counter").innerHTML =
      `(${counter}/${this.game.maxUpgrades})`;
  }
  displayConsumablesCounter() {
    document.getElementById("consumables-counter").innerHTML =
      `(${this.game.consumables.length}/${this.game.maxConsumables})`;
  }
  displayBoosterPacks() {
    const boosterPack = document.getElementById("boosterpack-container");
    boosterPack.innerHTML = "";
    boosterPack.appendChild(
      this.displayUpgrades(this.game.roll.ConsumablePacks(this.game.maxBoosters), {
        bought: false,
      }),
    );
  }
  displayCoupons() {
    const coupon = document.getElementById("voucher-container");
    coupon.innerHTML = "";
    coupon.appendChild(
      this.displayUpgrades(this.game.roll.Vouchers(1), { bought: false }),
    );
  }
  OpenBoosterPack(boosterPack) {
    console.log(boosterPack);
    animate.animateColors(COLORS.magicPurples, DURATIONS.ANIMATION_DURATION);
    const consumableContainer = document.getElementById(
      "consumables-container",
    );
    consumableContainer.innerHTML = "";
    consumableContainer.appendChild(
      this.displayUpgrades(boosterPack.roll(this.game), {
        bought: false,
        free: true,
        origin: boosterPack,
      }),
    );
    this.displayBoosterAmmount();
    this.displayTiles();
    this.dispalyTileOverlay();
    this.hideShop();
  }
  displayBoosterAmmount() {
    clearAnimation(document.getElementById("booster-amount"));
    document.getElementById("booster-amount").innerHTML = t("ui.chooseyourcards",Settings.LANGUAGE,{game:this.game});
      animateWave(document.getElementById("booster-amount"));
  }
  showMenu() {
    document.getElementById("menu").style.display = "flex";
    animate.animateColors(COLORS.magicPurples, DURATIONS.ANIMATION_DURATION);
    animate.smoothRotateTo(-1, DURATIONS.SWIRL_DURATION);
  }
  hideMenu() {
    document.getElementById("menu").style.display = "none";
  }
  hideGame() {
    document.getElementById("body").style.display = "none";
  }
  showGameContainer() {
    document.getElementsByClassName("game")[0].style.display = "flex";
  }
  hideGameContainer() {
    document.getElementsByClassName("game")[0].style.display = "none";
  }
  showGame() {
    //this.refreshUseButtons();
    document.getElementById("body").style.display = "grid";
    if (this.game.stage != STAGES.Boss) {
      const palettes = Object.values(GAMECOLORS);
      const randomPalette =
        palettes[Math.floor(Math.random() * palettes.length)];
      animate.animateColors(randomPalette, DURATIONS.ANIMATION_DURATION);
      animate.smoothRotateTo(0.5, DURATIONS.SWIRL_DURATION);
    } else {
      animate.animateColors(COLORS.boss, DURATIONS.ANIMATION_DURATION);
      animate.smoothRotateTo(-2, DURATIONS.SWIRL_DURATION);
    }
  }
  resetAllUpgrades() {
    // Pobieramy wszystkie wrappery z DOM
    const allWrappers = document.querySelectorAll(".SelectedUpgrade");

    allWrappers.forEach((wrapper) => {
      // Resetujemy transformację do pozycji początkowej
      wrapper.classList.remove("SelectedUpgrade");
      wrapper.style.setProperty('--select-y', '0px');
      // Opcjonalnie: resetujemy też przyciski consumable, jeśli je wcześniej pokazałeś
      const buttons = wrapper.querySelector(".consumable-buttons");
      if (buttons) {
        buttons.style.opacity = "0";
        buttons.style.display = "none";
      }
    });
  }
  hideShop() {
    let shop = document.getElementById("shop");
    shop.style.display = "none";
  }
  showShop() {
    animate.animateColors(COLORS.shopGreens, DURATIONS.ANIMATION_DURATION);
    animate.smoothRotateTo(1, DURATIONS.SWIRL_DURATION);
    let shop = document.getElementById("shop");
    shop.style.display = "grid";
  }
  dispalyTileOverlay() {
    let container = document.getElementById("upgrade-tiles");
    container.style.display = "flex";
  }
  hideTileOverlay() {
    let container = document.getElementById("upgrade-tiles");
    container.style.display = "none";
  }
  displayTiles() {
    const tiles = this.game.fruits;
    const special = this.game.special;
    const tileContainer = document.getElementById("tiles");
    tileContainer.innerHTML = "";
    const alltiles = [...tiles,...special]; 
    alltiles.forEach((tile) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("tile");
      if(tile.imagename!="Unknown"){
        let img = new Image();
        img.src = tile.image;
        wrapper.appendChild(img);
      }else{
        wrapper.textContent = tile.icon;
      }
      
      wrapper.style.position = "relative"; // needed for tooltip positioning

      // Tooltip element (like upgrade-desc)
      const desc = document.createElement("div");
      desc.className = "upgrade-desc";
      desc.innerHTML = `<h1>${tile.name}</h1><p>${tile.description ?? ""}</p>`; // placeholder
      wrapper.appendChild(desc);

      // Show tooltip on hover
      wrapper.addEventListener("mouseenter", () => {
        desc.innerHTML = `
                <p><b>Level:</b> ${tile.props?.upgrade?.level ?? "-"}</p>
                <p><span data-i18n="ui.chance" class="chance">${t("ui.chance",Settings.LANGUAGE)}:</span> ${tile.percent ?? 0}</p>
                <p><span data-i18n="ui.mult" class="mult">${t("ui.mult",Settings.LANGUAGE)}:</span> ${tile.props?.upgrade?.mult ?? 0}</p>
                <p><span data-i18n="ui.tilepoints" class="score">${t("ui.tilepoints",Settings.LANGUAGE)}:</span> ${tile.props?.upgrade?.score ?? 0}</p>
                <p><span data-i18n="ui.goldchance" class="chance">${t("ui.goldchance",Settings.LANGUAGE)}:</span> ${tile.props?.upgrade?.goldchance ?? 0}%</p>
                <p><span data-i18n="ui.silverchance" class="chance">${t("ui.silverchance",Settings.LANGUAGE)}:</span> ${tile.props?.upgrade?.silverchance ?? 0}%</p>
            `;
        desc.style.opacity = "1";
      });
      wrapper.addEventListener("mouseleave", () => {
        desc.style.opacity = "0";
      });

      tileContainer.appendChild(wrapper);
    });
  }
  displayPlayerConsumables() {
    const container = document.getElementById("player-consumables-container");
    if (!container) return;

    const oldPositions = this.getPositions(container);

    container.innerHTML = "";
    const fragment = this.displayUpgrades(this.game.consumables, {
      bought: true,
    });
    this.game.consumables.forEach(consumable => {
      consumable.UpgradeRenderer.applyDragEvents();
    });

    container.appendChild(fragment);

    this.animateReorder(oldPositions);

    this.displayConsumablesCounter();
  }
animateReorder(oldPositions, duration = 300, excludedEl = null) {
  return new Promise((resolve) => {
    if (!oldPositions || oldPositions.length === 0) return resolve();

    const animated = [];
    
    oldPositions.forEach(({ el, top, left }) => {
      if (!el || !document.body.contains(el) || el === excludedEl) return;

      const newRect = el.getBoundingClientRect();
      const dx = left - newRect.left;
      const dy = top - newRect.top;

      if (dx === 0 && dy === 0) return;

      // --- KLUCZOWA POPRAWKA ---
      // Musimy upewnić się, że karta nie ma żadnych śmieciowych zmiennych drag
      // które mogłyby wpłynąć na obliczenia pozycji startowej.
      el.style.setProperty('--drag-x', '0px');
      el.style.setProperty('--drag-y', '0px');
      el.style.setProperty('--drag-tilt', '0deg');

      el.style.transition = "none";
      // Ustawiamy sztywny transform na start (Invert)
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      
      el.offsetHeight; // Force reflow

      requestAnimationFrame(() => {
        el.style.transition = `transform ${duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        // Wracamy do zera (Play)
        el.style.transform = "translate(0, 0)";
      });

      animated.push(el);
    });

    if (animated.length === 0) return resolve();

    let remaining = animated.length;
    const onEnd = (ev) => {
      if (ev.propertyName !== 'transform') return;
      
      const target = ev.currentTarget;
      target.removeEventListener("transitionend", onEnd);
      
      // --- SPRZĄTANIE ---
      // Po zakończeniu animacji usuwamy styl inline transform, 
      // aby karta znów słuchała zmiennych CSS (var(--drag-x) itd.)
      target.style.transition = "";
      target.style.transform = ""; 
      
      remaining--;
      if (remaining <= 0) resolve();
    };

    animated.forEach((a) => {
      a.addEventListener("transitionend", onEnd);
    });

    setTimeout(() => {
      animated.forEach((a) => {
        if (a.style.transform !== "") {
           a.style.transition = "";
           a.style.transform = "";
        }
      });
      resolve();
    }, duration + 50);
  });
}
  displayStatistics() {
    const statsContainers = document.querySelectorAll(".stats");
    statsContainers.forEach(container => {
        // Wstawiamy wygenerowany HTML do środka elementu
        container.innerHTML = "";
        // Generujemy nowy wrapper i dodajemy go jako dziecko
        container.appendChild(this.renderStats());
    });
}
  renderStats(){
    const wrapper = document.createElement("div");
    let zniszczone_owoce = document.createElement("p");
    zniszczone_owoce.innerHTML = "Zniszczone owoce: <b>"+this.game.stats.countAllDestroyed()+"</b>";
    let najczesciej_zniszczony = document.createElement("p");
    const bestStat = this.game.stats.destroyedTiles.reduce((prev, current) => {
      return (prev.count > current.count) ? prev : current;
    });
    najczesciej_zniszczony.innerHTML = "Najczęściej zniszczony: <b>"+bestStat.icon+"</b>";
    wrapper.appendChild(zniszczone_owoce);
    wrapper.appendChild(najczesciej_zniszczony);
    return wrapper;
  }
  getPositions(container) {
    return [...container.children].map((el) => {
      const rect = el.getBoundingClientRect();
      return { el, top: rect.top, left: rect.left };
    });
  }
  displayPlayerUpgrades() {
    const container = document.getElementById("player-upgrades-container");
    if (!container) return;

    // 1) capture positions BEFORE re-render
    const oldPositions = this.getPositions(container);

    // 2) normal re-render
    container.innerHTML = "";
    const fragment = this.displayUpgrades(this.game.upgrades, { bought: true });

    this.game.upgrades.forEach(upgrade => {
      // Upewnij się, że każda karta dostaje SWÓJ własny render 
      // i nie współdzieli stanu draga ze starą wersją ze sklepu
      upgrade.UpgradeRenderer.isDragging = false;
      upgrade.UpgradeRenderer.dragStarted = false;
  });
    container.appendChild(fragment);

    // 3) animate from old → new
    this.animateReorder(oldPositions);

    // update the counter
    this.displayUpgradesCounter();
  }
  getPlayerUpgrades(upgradeid) {
    return document.querySelectorAll(
      "#player-upgrades-container .upgrade-wrapper.bought",
    )[upgradeid];
  }
  displayCollection() {
    const collection = document.getElementsByClassName("scroll")[0];
    document.getElementById("collection").classList.remove("hidden");
    if (collection.children.length != 0) return;
    collection.innerHTML = "";
    upgradesList.forEach((blueprint) => {
      //console.log(blueprint);
      const up = new Upgrade(blueprint);
      collection.appendChild(
        this.displayUpgrades([up], {
          displayPrice: false,
          displayButtons: false,
        }),
      );
    });
    consumableList.forEach((blueprint) => {
      //console
      const up = new Consumable(blueprint);
      collection.appendChild(
        this.displayUpgrades([up], {
          displayPrice: false,
          displayButtons: false,
        })
      );
    });
    coupons.forEach((blueprint)=> {
      const up = new Voucher(blueprint);
      collection.appendChild(
        this.displayUpgrades([up], {
          displayPrice: false,
          displayButtons: false,
        })
      );
    })
    consumablePacks.forEach((blueprint) => {
      const up = new ConsumablePack(blueprint);
      collection.appendChild(
        this.displayUpgrades([up], {
          displayPrice: false,
          displayButtons: false,
        })
      );
    });
  }
  triggerBoss() {
    const bossContainer = document.getElementById("boss-container");
    const upgradecard = bossContainer.children[0];
    upgradecard.classList.add("triggered");
    this.game.Audio.playSound("tick.mp3");
    setTimeout(() => {
      upgradecard.classList.remove("triggered");
    }, 300);
  }
  displayUpgradesInShop() {
    const shopEl = document.getElementById("upgrades-container");
    shopEl.innerHTML = "";
    if (this.game.shopitems) {
        this.game.shopitems.forEach(upgrade => {
            if (upgrade.UpgradeRenderer) {
                upgrade.UpgradeRenderer.cleanup();
            }
        });
    }
    this.game.shopitems = this.game.rollUpgrades();
    shopEl.appendChild(
      this.displayUpgrades(this.game.shopitems, { bought: false }),
    );
    this.game.emit(GAME_TRIGGERS.onShopSpawn, this.game.shopitems);
  }
  displayBossInGame() {
    const bossContainer = document.getElementById("boss-container");
    bossContainer.innerHTML = "";
    this.game.nextBoss = rollBoss(this.game);
    bossContainer.appendChild(this.displayBoss(this.game.nextBoss));
  }
  displayBossCounter() {
    const counter = document.getElementById("bosscounter");
    if (this.game.stage == STAGES.Boss) counter.innerHTML = 0;
    else counter.innerHTML = 3 - (this.game.round % 4) + 1;
  }
  displayBoss(boss) {
    console.log(boss);
    if(!boss.UpgradeRenderer){
      boss.initRenderer(this.game);
    }
    return boss.UpgradeRenderer.render({ bought: false,displayPrice: false, origin: null });
  }

  displayUpgrades(upgrades, params = { bought: false, origin: null }) {
    //console.log(params.origin);

    let full = document.createDocumentFragment();

    if (params.origin && params.origin.type == "ConsumablePack") {
      this.game.BuysFromBoosterLeft = params.origin.props.maxSelect;
    }
    upgrades.forEach((up) => {
      if (!up.UpgradeRenderer) {
        up.initRenderer(this.game);
      }
      up.UpgradeRenderer.render(params);
      const wrapper = up.wrapper;
      full.appendChild(wrapper);
    });

    return full;
  }
  gameWon(){
    document.getElementById("game-won").style.display = "flex";
    animate.animateColors(COLORS.gameWon, DURATIONS.ANIMATION_DURATION);
    animate.smoothRotateTo(-1, DURATIONS.SWIRL_DURATION);
    this.displaySeed();
    this.displayStatistics();
    //document.getElementById("final-score").innerHTML = this.game.round;
  }
  displaySeed(){
    const seeds = document.querySelectorAll(".seed");
    seeds.forEach(seed => {
        seed.textContent = this.game.seed;
    });
  }
  gameOver() {
    document.getElementById("game-over").style.display = "flex";
    animate.animateColors(COLORS.gameOver, DURATIONS.ANIMATION_DURATION);
    animate.smoothRotateTo(-1, DURATIONS.SWIRL_DURATION);
    let upgrades = document.getElementById("final-upgrades");
    this.displayStatistics();
    upgrades.innerHTML = "";
    upgrades.appendChild(
      this.displayUpgrades(this.game.upgrades, {
        displayPrice: false,
        displayButtons: false,
      }),
    );
    this.displaySeed();
    document.getElementById("final-score").innerHTML = this.game.round;
  }
addParalax(card) {
  card.addEventListener("mousemove", (e) => {
    // Force animation to stay off while moving
    card.style.animation = "none";
    card.style.transition = "none";

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;

    const rotateY = ((x - halfWidth) / halfWidth) * 10;
    const rotateX = ((halfHeight - y) / halfHeight) * 15;
    const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;

      card.style.setProperty('--shine-x', `${shineX}`);
      card.style.setProperty('--shine-y', `${shineY}`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    const shadowX = -((x - halfWidth) / halfWidth) * 10;
    const shadowY = -((y - halfHeight) / halfHeight) * 10;
    card.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 0px rgba(0,0,0,0.3))`;
  });

  card.addEventListener("mouseleave", () => {
    const duration = 1000;
    
    // Włączamy transition dla zmiennych i transformacji
    card.style.transition = `
        transform ${duration}ms ease-out, 
        filter ${duration}ms ease-out, 
        --shine-x ${duration}ms ease-out, 
        --shine-y ${duration}ms ease-out
    `;
    
    // Ustawiamy wartości docelowe (zgodne z 0% klatką animacji CSS)
    card.style.setProperty('--shine-x', `0`);
    card.style.setProperty('--shine-y', `0`);
    card.style.transform = `perspective(1000px) rotateX(10deg) rotateY(-15deg)`;
    card.style.filter = `drop-shadow(4px 10px 0px rgba(0, 0, 0, 0.35))`;

    if (card.parallaxTimeout) clearTimeout(card.parallaxTimeout);

    card.parallaxTimeout = setTimeout(() => {
        if (!card.matches(':hover')) {
            // Zdejmujemy transition, żeby animacja @keyframes mogła płynnie przejąć kontrolę
            card.style.transition = "none"; 
            card.style.animation = "skewCard 6s infinite ease-in-out";
            
            // Zamiast usuwać właściwości natychmiast, pozwalamy animacji nadpisać je naturalnie
            // Jeśli shine-sync używa background-position, to nadpisze ono zmienne inline
            // ALE: Twoja animacja CSS shine-sync powinna też używać tych samych zmiennych 
            // lub po prostu usuwamy style po krótkiej chwili:
            setTimeout(() => {
                card.style.removeProperty('--shine-x');
                card.style.removeProperty('--shine-y');
            }, 50);
        }
    }, duration);
});
}
  fadeInAndShow(wrapper, duration = 150) {
    if (!wrapper) return;

    // Ensure wrapper is not display:none
    wrapper.style.display = wrapper.style.display || "flex";

    // Measure natural width
    wrapper.style.maxWidth = "none";
    wrapper.style.opacity = "0";

    const rect = wrapper.getBoundingClientRect();
    const fullWidth = rect.width;

    // Set collapsed start state
    wrapper.style.maxWidth = "0";

    // Apply transitions
    wrapper.style.transition = `
        opacity ${duration}ms cubic-bezier(.2,.9,.25,1),
        max-width ${duration}ms cubic-bezier(.2,.9,.25,1)
    `;

    // Kick animation
    requestAnimationFrame(() => {
      wrapper.style.opacity = "1";
      wrapper.style.maxWidth = fullWidth + "px";
    });

    // Clean up after animation (optional)
    setTimeout(() => {
      wrapper.style.overflow = "";
      wrapper.style.maxWidth = "none"; // restore natural sizing
    }, duration);
  }

  async dissolveAndRemove(wrapper, duration = 600) {

    if (!wrapper) return;
    this.game.Audio.playSound("burn.mp3");
    await new Promise(resolve => setTimeout(resolve, 300));
    // 1. Lock layout - przygotowanie wymiarów (z Twojego 1. kodu)
    const rect = wrapper.getBoundingClientRect();
    const computed = getComputedStyle(wrapper);
    wrapper.style.width = rect.width + "px";
    wrapper.style.maxWidth = rect.width + "px";
    if (!computed.marginRight || computed.marginRight === "0px") {
      wrapper.style.marginRight = "1.5em";
    }

    // 2. Dynamiczne tworzenie filtra SVG dla tej konkretnej karty
    // Zapobiega to błędom, gdy palimy kilka kart jednocześnie
    const filterId = `burn-${Math.random().toString(36).substr(2, 9)}`;
    const svgHtml = `
      <svg style="position: absolute; width: 0; height: 0;">
        <filter id="${filterId}">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -15" result="mask" />
          <feComposite operator="in" in="SourceGraphic" in2="mask" />
        </filter>
      </svg>
    `;
    document.body.insertAdjacentHTML('beforeend', svgHtml);
    const filterElement = document.getElementById(filterId);
    const colorMatrix = filterElement.querySelector('feColorMatrix');

    // 3. Konfiguracja przejść CSS
    wrapper.style.transition = `
        opacity ${duration}ms ease-in,
        max-width ${duration}ms cubic-bezier(.2,.9,.25,1),
        margin-right ${duration}ms cubic-bezier(.2,.9,.25,1),
        transform ${duration}ms ease-out,
        filter ${duration}ms linear
    `;

    // 4. Logika animacji "wypalania"
    let startTime = null;
    const animateBurn = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      // Przesuwamy próg od -15 (widoczne) do -45 (całkowicie zjedzone)
      const threshold = -15 - (progress * 30);
      colorMatrix.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 ${threshold}`);

      if (progress < 1) {
        requestAnimationFrame(animateBurn);
      }
    };

    // 5. Odpalenie całości
    requestAnimationFrame((timestamp) => {
      animateBurn(timestamp);

      wrapper.style.filter = `url(#${filterId}) drop-shadow(0 0 15px rgba(255, 100, 0, 0.8))`;
      wrapper.style.opacity = "0";
      wrapper.style.maxWidth = "0";
      wrapper.style.marginRight = "0";
      wrapper.style.transform = "scale(1.1) translateY(-30px) rotate(8deg)";
    });

    // 6. Sprzątanie
    setTimeout(() => {
      if (wrapper?.parentElement) {
        wrapper.parentElement.removeChild(wrapper);
      }
      // Usuwamy też definicję filtra z DOM
      filterElement.parentElement.remove();
    }, duration);
  }
  fadeOutAndRemove(wrapper, duration = 100) {
    //console.log(wrapper);
    if (!wrapper) return;
    // Lock computed size so the transition has a stable starting point
    const rect = wrapper.getBoundingClientRect();
    const computed = getComputedStyle(wrapper);
    wrapper.style.width = rect.width + "px";
    wrapper.style.maxWidth = rect.width + "px";
    wrapper.style.opacity = "1";

    if (!computed.marginRight || computed.marginRight === "0px") {
      wrapper.style.marginRight = "1.5em"; // match your normal gap
    }
    // Apply transitions
    wrapper.style.transition = `
        opacity ${duration}ms cubic-bezier(.2,.9,.25,1),
        max-width ${duration}ms cubic-bezier(.2,.9,.25,1),
        margin-right ${duration}ms cubic-bezier(.2,.9,.25,1)
    `;

    // Start the animation in the next frame
    requestAnimationFrame(() => {
      wrapper.style.opacity = "0";
      wrapper.style.maxWidth = "0";
      wrapper.style.marginRight = "0";
    });

    // Remove after animation completes
    setTimeout(() => {
      if (wrapper?.parentElement) {
        wrapper.parentElement.removeChild(wrapper);
      }
    }, duration);
  }
  updateRerollButton() {
    const rerollButton = document.querySelectorAll(".shopbutton")[0];
    rerollButton.textContent = t("ui.reroll_shop",Settings.LANGUAGE,{game: this.game});
    const isTooExpensive = this.game.money + this.game.minMoney < this.game.shoproll;
    if (isTooExpensive) rerollButton.classList.add("disabled");
    else rerollButton.classList.remove("disabled");
  }
}
function showCollection() {
    game.GameRenderer.displayCollection();
}
function hideCollection() {
    document.getElementById("collection").classList.add("hidden");
}
function toggleLowGraphics(){
    let val = document.getElementById("graphicsToggle").checked;
    Settings.LOW_GRAPHICS = val;
    const canv = document.getElementById("glcanvas");
    if(Settings.LOW_GRAPHICS){
      canv.width = 1;
      canv.height = 1;
    }
    else{
      canv.width = window.innerWidth;
      canv.height = window.innerHeight;
    }
}
function toggledoubleclick(){
    let val = document.getElementById("doubleclick").checked;
    Settings.DOUBLECLICK = val;
}
function togglePotatoPc(){
  document.body.classList.contains("potatopc") ? document.body.classList.remove("potatopc") : document.body.classList.add("potatopc")
}
function toggleOldFruits(){
    let val = document.getElementById("oldFruits").checked;
    Settings.OLD_FRUITS = val;
}
function showSettings() {
    document.getElementById("darkToggle").checked = Settings.DARK_MODE;
    document.getElementById("graphicsToggle").checked = Settings.LOW_GRAPHICS;
    document.getElementById("oldFruits").checked = Settings.OLD_FRUITS;
    document.getElementById("settingsPanel").style.display = "flex";
}
function hideSettings() {
    document.getElementById("settingsPanel").style.display = "none";
}
function toggleSound() {
    let val = document.getElementById("VolumeButton").checked;
    Settings.PLAY_SOUND = val;
}
function toggleDarkMode() {
    let val = document.getElementById("darkToggle").checked;
    Settings.DARK_MODE = val;
    if (Settings.DARK_MODE) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
    }
    if (game.GameRenderer.currentColor) {
        animate.animateColors(game.GameRenderer.currentColor, DURATIONS.ANIMATION_DURATION);
    } else {
        animate.animateColors(COLORS.magicPurples, DURATIONS.ANIMATION_DURATION);
    }
}
function showInfo() {
    game.GameRenderer.displayTiles();
    document.getElementById("info-container").style.display = "flex";
}
function hideInfo() {
    document.getElementById("info-container").style.display = "none";
}

// Zakładając, że Twoje Settings.DIFFICULTY przechowuje index (liczbę)
function setdifficulty(action) {
    // 1. Zamieniamy obiekt w tablicę, żeby móc operować na indeksach
    const diffArray = Object.values(DIFFICULTY);
    
    // 2. Znajdujemy obecny indeks szukając obiektu, który ma to samo ID
    let currentIndex = diffArray.findIndex(d => d.id === Settings.DIFFICULTY.id);
    
    // 3. Zmieniamy indeks (z zapętleniem)
    if (action === '-') {
        currentIndex = (currentIndex - 1 + diffArray.length) % diffArray.length;
    } else {
        currentIndex = (currentIndex + 1) % diffArray.length;
    }
    
    // 4. Przypisujemy CAŁY obiekt z powrotem do Settings
    Settings.DIFFICULTY = diffArray[currentIndex];
    
    // 5. Aktualizujemy UI
    clearAnimation(document.getElementById("poziom_trudnosci"));
    const label = document.getElementById("poziom_trudnosci");
    if (label) {
        label.innerText = t(Settings.DIFFICULTY.name,Settings.LANGUAGE);
        
        // Dodanie animacji "pop" (którą masz w SCSS) dla lepszego feedbacku
        label.classList.remove('pop-anim');
        void label.offsetWidth; // Magiczna linijka resetująca animację
        label.classList.add('pop-anim');
    }
    animateWave(document.getElementById("poziom_trudnosci"));
}
function changeLang(){
    if(Settings.LANGUAGE == LANGUAGE.PL){
        Settings.LANGUAGE = LANGUAGE.EN;
    }
    else{
        Settings.LANGUAGE = LANGUAGE.PL;
    }
    game.GameRenderer.displayRound();
    changeLanguage({game: game});
}
function showLeaderBoard(){
  displayLeaderboard();
}
async function displayLeaderboard() {
  const container = document.getElementById("leaderboard");
  const listContainer = document.getElementById("leaderboard-data");
  
  container.classList.remove("hidden");
  // Loader pasujący do szerokości tabeli (4 kolumny)
  listContainer.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Ładowanie...</td></tr>";

  try {
    const result = await getLeaderboard();
    console.log(result);
    if (!result || !Array.isArray(result)) {
      listContainer.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Błąd danych</td></tr>";
      return;
    }

    const filteredData = Object.values(result.reduce((acc, current) => {
      const nick = current.nickname;
      if (!acc[nick] || compareScores(current.score, acc[nick].score) > 0) {
        acc[nick] = { ...current };
      }
      return acc;
    }, {}));

    const top10 = filteredData
      .sort((a, b) => compareScores(b.score, a.score)) // Odwrócone a i b dla malejącego
      .slice(0, 10);

    // --- GENEROWANIE TABELI ---
    listContainer.innerHTML = ""; // Czyścimy loader

    // 1. Dodajemy nagłówki (Header)
    const headerTr = document.createElement("tr");
    headerTr.innerHTML = `
      <th data-i18n="ui.position">${t("ui.position",Settings.LANGUAGE)}</th>
      <th data-i18n="ui.player">${t("ui.player",Settings.LANGUAGE)}</th>
      <th data-i18n="ui.score">${t("ui.score",Settings.LANGUAGE)}</th>
      <th data-i18n="ui.round">${t("ui.round",Settings.LANGUAGE)}</th>
    `;
    listContainer.appendChild(headerTr);
    function formatScientific(scoreStr) {
      const s = String(scoreStr).toLowerCase();
      
      // Jeśli nie ma 'e', traktujemy jak zwykłą liczbę
      if (!s.includes('e')) {
          const num = Number(s);
          return num.toLocaleString();
      }
      
      const [m, e] = s.split('e');
      const exponent = parseInt(e);
      const mantissa = parseFloat(m);

      // Jeśli wykładnik jest mniejszy niż 10, pokazujemy normalną liczbę
      if (exponent < 10) {
          // Obliczamy realną wartość: mantysa * 10^wykładnik
          const realValue = mantissa * Math.pow(10, exponent);
          return Math.floor(realValue).toLocaleString();
      }
      
      // Dla dużych liczb: mantysa do 4 miejsc po przecinku + potęga
      // Używamy toFixed(4), ale parseFloat na końcu usunie zbędne zera na końcu (np. 1.2500 -> 1.25)
      const formattedMantissa = parseFloat(mantissa.toFixed(4));
      
      return `${formattedMantissa}e${exponent}`;
  }
    // 2. Dodajemy wiersze z danymi
    let i=0;
    if (top10.length === 0) {
        const emptyTr = document.createElement("tr");
        emptyTr.innerHTML = `<td colspan='4' style='text-align:center;'>${t("ui.noscores",Settings.LANGUAGE)}</td>`;
        listContainer.appendChild(emptyTr);
    } else {
        top10.forEach((element, index) => {
          const tr = document.createElement("tr");
          const td1 = document.createElement("td");
          td1.textContent = `${index + 1}`;
          const td2 = document.createElement("td");
          td2.innerHTML = `<strong>${escapeHTML(element.nickname)}</strong>`;
          const td3 = document.createElement("td");
          td3.textContent = `${formatScientific(element.score).toLocaleString()}`;
          const td4 = document.createElement("td");
          td4.textContent = `${element.round}`;
          if(i==0){
            firstplace(td2);
          }else if(i==1){
            secondplace(td2);
          }else if(i==2){
            thirdplace(td2);
          }
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tr.appendChild(td4);
          i++;
          listContainer.appendChild(tr);
        });
    }

  } catch (error) {
    console.error(error);
    listContainer.innerHTML = `<tr><td colspan='4' style='text-align:center;'>${t("server.error",Settings.LANGUAGE)}}</td></tr>`;
  }
}
// Pomocnicza funkcja do bezpiecznego wyświetlania nicków (ochrona przed XSS)
function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}
function formatScientific(scoreStr) {
    const s = String(scoreStr).toLowerCase();
    
    // Jeśli nie ma 'e', traktujemy jak zwykłą liczbę
    if (!s.includes('e')) {
        const num = Number(s);
        return num.toLocaleString();
    }
    
    const [m, e] = s.split('e');
    const exponent = parseInt(e);
    const mantissa = parseFloat(m);

    // Jeśli wykładnik jest mniejszy niż 10, pokazujemy normalną liczbę
    if (exponent < 10) {
        // Obliczamy realną wartość: mantysa * 10^wykładnik
        const realValue = mantissa * Math.pow(10, exponent);
        return Math.floor(realValue).toLocaleString();
    }
    
    // Dla dużych liczb: mantysa do 4 miejsc po przecinku + potęga
    // Używamy toFixed(4), ale parseFloat na końcu usunie zbędne zera na końcu (np. 1.2500 -> 1.25)
    const formattedMantissa = parseFloat(mantissa.toFixed(4));
    
    return `${formattedMantissa} × 10^${exponent}`;
}
function hideLeaderBoard(){
  document.getElementById("leaderboard").classList.add("hidden");
}
window.toggledoubleclick = toggledoubleclick;
window.showLeaderBoard = showLeaderBoard;
window.hideLeaderBoard = hideLeaderBoard;
window.changelang = changeLang;
window.toggleOldFruits = toggleOldFruits;
window.showSettings = showSettings;
window.hideSettings = hideSettings;
window.toggleDarkMode = toggleDarkMode;
window.toggleLowGraphics = toggleLowGraphics;
window.toggleSound = toggleSound;
window.showInfo = showInfo;
window.hideInfo = hideInfo;
window.showCollection = showCollection;
window.hideCollection = hideCollection;
window.setdifficulty = setdifficulty;
window.translations = translations;
window.togglePotatoPc = togglePotatoPc;