import { MODIFIERS, UPGRADE_RARITY_NAME, Style, GAME_TRIGGERS, UPGRADE_STATES } from "../dictionary.js";
export class UpgradeRenderer {
  constructor(upgrade, gameRenderer) {
    this.upgrade = upgrade;
    this.gameRenderer = gameRenderer;
  }
  render(params) {
    const upgrade = this.upgrade;
    let bought = params.bought ?? false;
    let displayPrice = params.displayPrice ?? true;
    let displayButtons = params.displayButtons ?? true;
    
    upgrade.wrapper = document.createElement("div");
    const wrapper = upgrade.wrapper;
    const originalZ = wrapper.style.zIndex || 0;

    wrapper.addEventListener("mouseenter", () => (wrapper.style.zIndex = 500));
    wrapper.addEventListener("mouseleave", () => (wrapper.style.zIndex = originalZ));
    
    if (displayButtons) {
        wrapper.addEventListener("click", () => this.displayButtons(wrapper, upgrade));
    }

    wrapper.className = "upgrade-wrapper";
    wrapper.dataset.type = upgrade.type;
    if (bought) wrapper.classList.add("bought");
    if (upgrade.isReady) wrapper.classList.add("ready");
    if (params.free) upgrade.price = 0;

    // 1. Tło karty (To tutaj trafia obrazek i grayscale/invert)
    const cardBackground = document.createElement("div");
    cardBackground.className = "card-background";
    cardBackground.style.backgroundImage = `url('${upgrade.image()}')`;

    // 2. Kontener na naklejki (Osobno, by nie dziedziczyć filtrów)
    const stickersContainer = document.createElement("div");
    stickersContainer.className = "sticker-container";
    if(upgrade.stickers){
        upgrade.stickers.forEach(sticker => {
            stickersContainer.appendChild(sticker.render());
        });
    }

    // Logika klas wizualnych
    let classes = [];
    if (upgrade.negative) classes.push("negative");
    if (upgrade.modifier !== MODIFIERS.None) classes.push("holo");
    if (upgrade?.active === false) classes.push("inactive");

    // Nakładamy klasy na tło, a nie na cały kontener inner
    classes.forEach(cls => cardBackground.classList.add(cls));

    if (classes.length > 0) {
        if (!bought) {
            wrapper.classList.add("triggered");
            const sound = upgrade.negative ? "foil_reverse.mp3" : "foil.mp3";
            this.gameRenderer.game.Audio.playSound(sound);
            this.gameRenderer.game.Audio.playSound("tick.mp3");

            setTimeout(() => wrapper.classList.remove("triggered"), 300);
        }
    }

    // 3. Montaż Card Inner
    const cardInner = document.createElement("div");
    cardInner.className = "upgrade-inner";
    cardInner.appendChild(cardBackground); // Tło jako pierwszy potomek
    cardInner.appendChild(stickersContainer); // Naklejki na wierzchu

    // Reszta bez zmian...
    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.style.animationDelay = `-${Math.random() * 3}s`;
    card.appendChild(cardInner);
    this.gameRenderer.addParalax(card);

    const priceEl = document.createElement("div");
    priceEl.className = "upgrade-price";
    priceEl.textContent = `$${params.bought ? upgrade.sellPrice : upgrade.price}`;

    const desc = document.createElement("div");
    desc.className = "upgrade-desc";
    desc.innerHTML = this.createDescription();
    wrapper.addEventListener("mouseenter", () => { desc.innerHTML = this.createDescription(); });

    if (displayPrice) wrapper.appendChild(priceEl);
    wrapper.appendChild(card);
    wrapper.appendChild(desc);
    if (displayButtons) wrapper.appendChild(this.createButtons(params));

    return wrapper;
}
  createDescription() {
    const upgrade = this.upgrade;
    let description = `<h1>${upgrade.name}</h1>`;
    if (upgrade.negative == true) {
      description += `<p>${Style.Chance("negative")}</p>`;
    }
    description += `<p>${upgrade.description(this.gameRenderer.game)}</p>`;
    if (upgrade.modifier != MODIFIERS.None) {
      description += `<p>${Style.Chance(upgrade.modifier)}</p>`;
    }
    if (upgrade.rarity != UPGRADE_RARITY_NAME.None) {
      description += `<p>${Style.Money(upgrade.rarity.display)}</p>`;
    }

    return description;
  }
  displayButtons() {
    // 1. Sprawdzamy, czy ten konkretny wrapper jest już "podniesiony"
    // Sprawdzamy styl inline lub (lepiej) konkretną wartość transformacji
    const wrapper = this.upgrade.wrapper;
    const isAlreadyActive = wrapper.style.transform === "translateY(-20px)";

    // 2. Najpierw resetujemy absolutnie wszystkie wrappery
    this.gameRenderer.resetAllUpgrades();

    // 3. Jeśli wrapper NIE był aktywny, to go podnosimy.
    // Jeśli BYŁ aktywny, to po prostu zostaje zresetowany (efekt zamknięcia).
    let game = this.gameRenderer.game;
    if (!isAlreadyActive) {
      requestAnimationFrame(() => {
        wrapper.style.transition = "transform 0.05s ease-out";
        wrapper.style.transform = "translateY(-20px)";
        wrapper.classList.add("SelectedUpgrade");
        
        game.Audio.playSound("select.mp3")
        const buttonsContainer = wrapper.querySelector(".consumable-buttons");

        if (buttonsContainer) {
          buttonsContainer.style.display = "flex";
          buttonsContainer.style.transition = "opacity 0.2s ease";
          buttonsContainer.style.opacity = "1";
        }
        this.refreshAllButtons();
        // Pobieramy wszystkie przyciski wewnątrz kontenera do tablicy
      });
    }else{
      game.Audio.playSound("deselect.mp3")
    }
  }
  createBuyButton(params) {
    const upgrade = this.upgrade;
    const wrapper = upgrade.wrapper;
    let game = this.gameRenderer.game;
    const btnBuy = document.createElement("button");
    btnBuy.textContent = "Kup";
    btnBuy.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log(game);
      console.log("buy?");
      let success = false;
      if (upgrade.canBuy(game) == false) {
        return false;
      }
      success = game.buy(upgrade);
      console.log(success);
      if (success && params.origin && params.origin.type == "ConsumablePack") {
        game.BuysFromBoosterLeft--;
        game.GameRenderer.displayBoosterAmmount();
      }
      if (
        params.origin &&
        params.origin.type == "ConsumablePack" &&
        game.BuysFromBoosterLeft <= 0
      ) {
        const container = document.getElementById("consumables-container");
        Array.from(container.children).forEach(child => {
          game.GameRenderer.fadeOutAndRemove(child, 100);
        });
        return;
      }
      if (success) {
        if(upgrade.type=="Voucher"){
          this.removeButtons();
          game.GameRenderer.dissolveAndRemove(wrapper, 1000);
        }else{
          game.GameRenderer.fadeOutAndRemove(wrapper);
        }
        
      }
      //this.refreshBuyButtons();
    });
    return btnBuy;
  }
  createUseButton() {
    const upgrade = this.upgrade;
    const btnUse = document.createElement("button");
    btnUse.textContent = "Użyj";
    btnUse.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("using");
      console.log(upgrade);
      this.gameRenderer.game.useConsumable(upgrade);
      //this.fadeOutAndRemove(wrapper);
    });
    return btnUse;
  }
  createBuyAndUseButton(params) {
    const upgrade = this.upgrade;
    const wrapper = upgrade.wrapper;
    const btnBuyUse = document.createElement("button");
    btnBuyUse.textContent = "Kup i Użyj";
    btnBuyUse.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("using");
      console.log(upgrade);
      let success = this.gameRenderer.game.buyanduse(upgrade);

      if (success && params.origin && params.origin.type == "ConsumablePack") {
        this.gameRenderer.game.BuysFromBoosterLeft--;
        this.gameRenderer.displayBoosterAmmount();
      }
      if (
        params.origin &&
        params.origin.type == "ConsumablePack" &&
        this.gameRenderer.game.BuysFromBoosterLeft <= 0
      ) {
        const container = document.getElementById("consumables-container");
        Array.from(container.children).forEach(child => {
          if (child != wrapper) this.gameRenderer.fadeOutAndRemove(child, 100);
        });
        //return;
      }
      if (success) {
        this.removeButtons();
        this.gameRenderer.dissolveAndRemove(wrapper, 1000);
        //wrapper.remove();
      } else {
        //this.gameRenderer.game.GameRenderer.notEnoughMoney();
      }
    });
    return btnBuyUse;
  }
  createSellButton() {
    const upgrade = this.upgrade;
    const wrapper = upgrade.wrapper;
    const btnSell = document.createElement("button");
    btnSell.textContent = "Sprzedaj";
    btnSell.addEventListener("click", (e) => {
      e.stopPropagation();
      if(!upgrade.canSell(game)){
          game.GameRenderer.notEnoughSpace(
            document.getElementById("player-upgrades-container"),
          );
          return false;
      } 
      if (this.gameRenderer.game.sell(upgrade)) {
        //this.refreshBuyButtons();
        game.GameRenderer.fadeOutAndRemove(wrapper);
        //wrapper.remove();
      }
    });
    return btnSell;
  }
  createButtons(params = { bought: false, origin: null }) {
    if (params.origin && params.origin.type == "ConsumablePack") {
      this.gameRenderer.game.BuysFromBoosterLeft = params.origin.props.maxSelect;
    }
    const upgrade = this.upgrade;
    const wrapper = upgrade.wrapper;
    const btnRow = document.createElement("div");
    btnRow.className = "consumable-buttons";
    if (params.bought === false) {
      const btnBuy = this.createBuyButton(params);
      btnRow.appendChild(btnBuy);

      if (upgrade instanceof Consumable) {
        const btnBuyUse = this.createBuyAndUseButton(params);
        btnRow.appendChild(btnBuyUse);
      }
    } else {
      if (upgrade instanceof Consumable) {
        const btnUse = this.createUseButton(upgrade);
        btnRow.appendChild(btnUse);
      }
      const btnSell = this.createSellButton(wrapper, upgrade);
      btnRow.appendChild(btnSell);
    }
    return btnRow;
  }
  refreshAllButtons() {
    const wrapper = this.upgrade.wrapper;
    const upgrade = this.upgrade;
    const buttonsContainer = wrapper.querySelector(".consumable-buttons");
    const allBtns = Array.from(buttonsContainer.querySelectorAll("button"));

    // Szukamy konkretnych przycisków na podstawie ich tekstu (trim() usuwa zbędne spacje)
    const btnBuy = allBtns.find(
      (b) => b.textContent.trim().toLowerCase() === "kup",
    );
    const btnUse = allBtns.find(
      (b) => b.textContent.trim().toLowerCase() === "użyj",
    );
    const btnBuyAndUse = allBtns.find(
      (b) => b.textContent.trim().toLowerCase() === "kup i użyj",
    );
    const btnSell = allBtns.find(
      (b) => b.textContent.trim().toLowerCase() === "sprzedaj",
    );
    // Bezpieczne usuwanie klasy (używamy ?. aby uniknąć błędów, jeśli przycisk nie zostanie znaleziony)
    btnBuy?.classList.remove("disabled");
    btnUse?.classList.remove("disabled");
    btnBuyAndUse?.classList.remove("disabled");
    btnSell?.classList.remove("disabled");
    const hasSpace = upgrade.hasSpace(game);
    const hasMoney = upgrade.hasMoney(game);
    const canSell = upgrade.canSell(game);
    let canUse = true;
    if (upgrade instanceof Consumable) {
      canUse = upgrade.canUse(game);
    }
    if (btnBuy) {
      if (!hasSpace || !hasMoney) {
        btnBuy.classList.add("disabled");
      }
    }
    if (btnBuyAndUse) {
      if (!hasMoney || !canUse) {
        btnBuyAndUse?.classList.add("disabled");
      }
    }
    if (btnUse) {
      if (!canUse) {
        btnUse.classList.add("disabled");
      }
    }
    if(btnSell){
      if(!canSell){
        btnSell.classList.add("disabled");
      }
    }
  }
  createPopup(text, style = "mult",duration = 400) {
    const targetElement = this.upgrade.wrapper;
    if (!targetElement) return;
    //console.log("adding!!");
    //console.log(text);
    // Create popup container (relative to card)
    const popup = document.createElement("div");
    popup.className = "upgrade-popup-container";

    // Create square (background)
    const square = document.createElement("div");
    square.className = "upgrade-popup-square";
    square.classList.add(style);
    //console.log(style);
    square.style.transform = `rotate(${(Math.random() * 20 - 10).toFixed(2)}deg)`; // small random tilt

    // Create text
    const label = document.createElement("div");
    label.className = "upgrade-popup-text";
    label.textContent = text;

    // Assemble
    popup.appendChild(square);
    popup.appendChild(label);

    // Add directly inside the upgrade card’s container
    targetElement.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => {
      popup.style.opacity = "1";
    });

    // Fade out & remove
    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), duration-50);
    }, duration);
  }
  trigger(time, action = UPGRADE_STATES.Active) {
    const upgrade = this.upgrade;
    const delay = 0;
    console.log(`upgrade trigger: ${upgrade.name}`, performance.now());
    const gameupgrades = this.gameRenderer.game.upgrades;
    const index = gameupgrades.indexOf(upgrade);
    if (index < 0) return;
    let upgradecard = upgrade.wrapper;
    //let upgradecard = this.getPlayerUpgrades(index);
    const descElement = upgradecard.querySelector(".upgrade-desc");
    descElement.innerHTML = this.createDescription();

    const upgradePrice = upgradecard.querySelector(".upgrade-price");
    upgradePrice.innerHTML = "$" + upgrade.sellPrice;
    switch (action) {
      case UPGRADE_STATES.Active:
      case UPGRADE_STATES.Score:
        {
          setTimeout(() => {
            upgradecard.style.animationDuration = time + "ms";
            upgradecard.classList.add("triggered");

            //this.createPopup(`Wot?`, upgradecard);

            setTimeout(() => {
              upgradecard.classList.remove("triggered");
              upgradecard.classList.remove("ready"); // remove ready if ready
              upgrade.isReady = false;
            }, time);
          }, delay);
        }
        break;
      case UPGRADE_STATES.Ready:
        {
          upgradecard.classList.add("ready");
        }
        break;
      case UPGRADE_STATES.Tried:
        {
          upgradecard.classList.remove("ready");
        }
        break;
    }
  }
  update(params = { bought: true, origin: null }) {

    const upgrade = this.upgrade;
    if (!upgrade) return;

    const oldWrapper = upgrade.wrapper;
    if (!oldWrapper) return;

    const newWrapper = this.render(params);
    this.applyDragEvents();

    oldWrapper.replaceWith(newWrapper);
    this.trigger(300);
    this.gameRenderer.game.Audio.playSound("tick.mp3");
  }
  removeButtons(){
    const wrapper = this.upgrade.wrapper;
    const buttonsContainer = wrapper.querySelector(".consumable-buttons");
    buttonsContainer.innerHTML = "";
  }
  applyDragEvents() {
    const wrapper = this.upgrade.wrapper;
    wrapper.draggable = true;

    wrapper.addEventListener("dragstart", (e) => {
      const container = wrapper.parentElement;
      if (!container) return;
      e.dataTransfer.setData(
        "text/plain",
        [...container.children].indexOf(wrapper),
      );
      wrapper.classList.add("dragging");
    });

    wrapper.addEventListener("dragend", () => {
      wrapper.classList.remove("dragging");
      wrapper.style.transform = "";
    });

    wrapper.addEventListener("dragover", (e) => {
      e.preventDefault();
      wrapper.classList.add("drag-over");
    });

    wrapper.addEventListener("dragleave", () => {
      wrapper.classList.remove("drag-over");
    });

    wrapper.addEventListener("drop", (e) => {
      e.preventDefault();
      wrapper.classList.remove("drag-over");

      const container = wrapper.parentElement;
      if (!container) return;

      const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
      const targetIndex = [...container.children].indexOf(wrapper);
      if (draggedIndex === targetIndex) return;

      const draggedElement = container.children[draggedIndex];

      // 1️⃣ FIRST — snapshot original card positions
      const oldPositions = this.gameRenderer.getPositions(container);

      // --- reorder in the DOM ---
      if (draggedIndex < targetIndex) {
        container.insertBefore(
          draggedElement,
          container.children[targetIndex + 1] || null,
        );
      } else {
        container.insertBefore(draggedElement, container.children[targetIndex]);
      }

      // 2️⃣ LAST → INVERT → PLAY — animate to new places
      this.gameRenderer.animateReorder(oldPositions);

      // Update upgrade list
      const movedUpgrade = this.gameRenderer.game.upgrades.splice(draggedIndex, 1)[0];
      this.gameRenderer.game.upgrades.splice(targetIndex, 0, movedUpgrade);

      this.gameRenderer.game.emit(GAME_TRIGGERS.onUpgradesChanged);
      this.gameRenderer.displayUpgradesCounter();
    });
  }
}