import { consumableList } from "./consumable.js";
import { Upgrade, ConsumablePack, Consumable } from "./upgradeBase.js";
import { animate, Animator } from "./loadshaders.js";
import {
  Style,
  COLORS,
  GAMECOLORS,
  DURATIONS,
  STAGES,
  MODIFIERS,
  GAME_TRIGGERS,
  UPGRADE_STATES,
  UPGRADE_RARITY_NAME,
} from "./dictionary.js";
import { rollBoss } from "./Boss.js";
import { upgradesList } from "./upgrade.js";
export class RenderUI {
  constructor(game) {
    this.game = game;
    this.moneyBox = document.getElementById("money");
    this.movesBox;
    this.scoreBox;
  }
  displayMoves() {
    this.game.moveBox.innerHTML =
      this.game.movescounter + "/" + this.game.moves;
  }
  displayMoney() {
    const moneyBox = this.moneyBox;

    const start = this.prevMoney ?? 0;
    const end = this.game.money;
    this.prevMoney = end;
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
    this.game.roundBox.innerHTML = this.game.round;
  }
  displayScore() {
    const roundScoreBox = document.getElementById("roundscore");
    const totalScoreBox = document.getElementById("score");

    const newRoundScore = this.game.calcRoundScore();
    const newTotalScore = this.game.score;

    const oldRoundScore = parseInt(roundScoreBox.innerHTML) || 0;
    const oldTotalScore = parseInt(totalScoreBox.innerHTML) || 0;

    const animateNumber = (element, start, end) => {
      if (start === end) return;

      const duration = 250; // ms
      const startTime = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const value = Math.round(start + (end - start) * eased);
        element.innerHTML = value;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // końcowy "pop"
          element.classList.remove("pop-anim");
          void element.offsetWidth;
          element.classList.add("pop-anim");
        }
      };

      requestAnimationFrame(animate);
    };

    animateNumber(roundScoreBox, oldRoundScore, newRoundScore);
    animateNumber(totalScoreBox, oldTotalScore, newTotalScore);
  }

  displayTempScore() {
    const scoreBox = this.game.tempscoreBox;
    const multBox = this.game.multBox;

    const newScore = this.game.tempscore;
    const newMult = this.game.mult;

    const oldScore = scoreBox.innerHTML;
    const oldMult = multBox.innerHTML;

    // Aktualizacja wartości
    scoreBox.innerHTML = newScore;
    multBox.innerHTML = newMult;

    // Funkcja dodająca animację "podskoku"
    const addPopAnimation = (element) => {
      element.classList.remove("pop-anim");
      void element.offsetWidth;
      element.classList.add("pop-anim");
    };

    // Jeśli zmienił się score — animacja
    if (oldScore != newScore) {
      addPopAnimation(scoreBox);
    }

    // Jeśli zmienił się mult — animacja
    if (oldMult != newMult) {
      addPopAnimation(multBox);
    }
  }
  displayUpgradesCounter() {
    document.getElementById("upgrades-counter").innerHTML =
      `(${this.game.upgrades.length}/${this.game.maxUpgrades})`;
  }
  displayConsumablesCounter() {
    document.getElementById("consumables-counter").innerHTML =
      `(${this.game.consumables.length}/${this.game.maxConsumables})`;
  }
  displayBoosterPacks() {
    const boosterPack = document.getElementById("boosterpack-container");
    boosterPack.innerHTML = "";
    boosterPack.appendChild(
      this.displayUpgrades(this.game.roll.ConsumablePacks(2), {
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
    document.getElementById("booster-amount").innerHTML =
      "Wybierz swoje karty. Pozostało: " + this.game.BuysFromBoosterLeft;
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
      wrapper.style.transform = "translateY(0)";
      wrapper.classList.remove("SelectedUpgrade");
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
    const tileContainer = document.getElementById("tiles");
    tileContainer.innerHTML = "";

    tiles.forEach((tile) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("tile");
      wrapper.textContent = tile.icon;
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
                <p><span class="chance">Szansa:</span> ${tile.percent ?? 0}</p>
                <p><span class="mult">Mult:</span> ${tile.props?.upgrade?.mult ?? 0}</p>
                <p><span class="score">Punkty:</span> ${tile.props?.upgrade?.score ?? 0}</p>
                <p><span class="chance">Gold Chance:</span> ${tile.props?.upgrade?.goldchance ?? 0}%</p>
                <p><span class="chance">Silver Chance:</span> ${tile.props?.upgrade?.silverchance ?? 0}%</p>
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
  animateReorder(oldPositions, duration = 280) {
    // FLIP: oldPositions is array [{ el, top, left }]
    return new Promise((resolve) => {
      if (!oldPositions || oldPositions.length === 0) return resolve();

      const animated = [];
      oldPositions.forEach(({ el, top, left }) => {
        if (!el || !document.body.contains(el)) return; // removed from DOM
        const newRect = el.getBoundingClientRect();
        const dx = left - newRect.left;
        const dy = top - newRect.top;

        if (dx === 0 && dy === 0) return;

        // prepare invert
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        // force layout
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;

        // schedule play
        requestAnimationFrame(() => {
          el.style.transition = `transform ${duration}ms cubic-bezier(.2,.9,.25,1)`;
          el.style.transform = "";
        });

        animated.push(el);
      });

      if (animated.length === 0) return resolve();

      // wait for all transitions to end (or timeout)
      let remaining = animated.length;
      const cleanup = () => {
        animated.forEach((a) => {
          a.style.transition = "";
          a.style.transform = "";
        });
        resolve();
      };

      const onEnd = (ev) => {
        const target = ev.currentTarget;
        target.removeEventListener("transitionend", onEnd);
        remaining--;
        if (remaining <= 0) cleanup();
      };

      animated.forEach((a) => {
        a.addEventListener("transitionend", onEnd);
      });

      // safety timeout
      setTimeout(() => {
        // remove listeners and clear transforms
        animated.forEach((a) => a.removeEventListener("transitionend", onEnd));
        cleanup();
      }, duration + 120);
    });
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
      upgrade.UpgradeRenderer.applyDragEvents();
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
    shopEl.appendChild(
      this.displayUpgrades(this.game.rollUpgrades(), { bought: false }),
    );
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
    const wrapper = document.createElement("div");
    wrapper.className = "boss-wrapper";
    const cardInner = document.createElement("div");
    cardInner.className = "upgrade-inner";
    cardInner.style.backgroundImage = `url('${boss.image}')`;

    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.style.animationDelay = `-${Math.random() * 3}s`;
    card.appendChild(cardInner);
    this.addParalax(card);
    // Description
    const desc = document.createElement("div");
    desc.className = "upgrade-desc";
    desc.innerHTML = `<h1>${boss.name}</h1><p>${boss.description(this.game)}</p>`;
    wrapper.appendChild(card);
    wrapper.appendChild(desc);
    return wrapper;
  }

  displayUpgrades(upgrades, params = { bought: false, origin: null }) {
    console.log(params.origin);

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
  gameOver() {
    document.getElementById("game-over").style.display = "flex";
    animate.animateColors(COLORS.gameOver, DURATIONS.ANIMATION_DURATION);
    animate.smoothRotateTo(-1, DURATIONS.SWIRL_DURATION);
    let upgrades = document.getElementById("final-upgrades");
    upgrades.innerHTML = "";
    upgrades.appendChild(
      this.displayUpgrades(this.game.upgrades, {
        displayPrice: false,
        displayButtons: false,
      }),
    );
    document.getElementById("seed").innerHTML = this.game.seed;
    document.getElementById("final-score").innerHTML = this.game.round;
  }
  addParalax(card) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the card
      const y = e.clientY - rect.top; // y position within the card

      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;

      // rotation
      const rotateY = ((x - halfWidth) / halfWidth) * 10; // max ±20°
      const rotateX = ((halfHeight - y) / halfHeight) * 15; // max ±15°
      card.style.transform = `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

      // dynamic shadow
      const shadowX = -((x - halfWidth) / halfWidth) * 10; // horizontal shadow offset
      const shadowY = -((y - halfHeight) / halfHeight) * 10; // vertical shadow offset
      const blur = 0; // blur radius
      const shadowColor = "rgba(0,0,0,0.35)";
      card.style.filter = `drop-shadow(${shadowX}px ${shadowY}px ${blur}px ${shadowColor})`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });

    card.addEventListener("mouseenter", () => {
      card.style.transition = "transform 0.2s ease, filter 0.2s ease"; // shorter transition when starting hover
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
    const isTooExpensive = this.game.money + this.game.minMoney < 4;
    if (isTooExpensive) rerollButton.classList.add("disabled");
    else rerollButton.classList.remove("disabled");
  }
}