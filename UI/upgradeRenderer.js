import { MODIFIERS, UPGRADE_RARITY, Style, GAME_TRIGGERS, UPGRADE_STATES, Settings, TYPES } from "../dictionary.js";
import { t } from "../entityData/translations.js";
import { fadeInAndBalatro, initBalatroEffect, clearAnimation } from "../utils/animate_text.js";
import { DragAndDropHandler } from "./DragAndDropHandler.js";
export class UpgradeRenderer {
  constructor(upgrade, gameRenderer) {
    this.upgrade = upgrade;
    this.gameRenderer = gameRenderer;
    this.dragHandler = null;
    this.selectedTimer = null;
    this.lastParams = null;
    this.boundClickHandler = this.handleClick.bind(this);
    this.boundDblClickHandler = this.handleDblClick.bind(this);
  }
  areParamsEqual(newParams, oldParams) {
  if (!oldParams) return false;

    // Porównujemy tylko proste typy, które sterują UI
    return (
      newParams.bought === oldParams.bought &&
      newParams.displayPrice === oldParams.displayPrice &&
      newParams.displayButtons === oldParams.displayButtons &&
      newParams.free === oldParams.free &&
      // Jeśli origin istnieje, porównaj jego ID lub typ zamiast całego obiektu
      newParams.origin?.type === oldParams.origin?.type &&
      newParams.origin?.id === oldParams.origin?.id
    );
  }
  handleClick(e) {
  if (this.selectionBlocked) return;
  if (this.dragHandler?.dragStarted) return;
  this.displayButtons();
}

handleDblClick(e) {
  e.stopPropagation();
  if (this.selectionBlocked) return;
  
  if (Settings.DOUBLECLICK == true) {
    if (this.dragHandler?.dragStarted) return;

    const wrapper = this.upgrade.wrapper;
    const buttonsContainer = wrapper?.querySelector(".consumable-buttons");
    if (!buttonsContainer) return;

    if (!this.bought) {
      const buyBtn = buttonsContainer.querySelector('button[data-i18n="ui.buy"]');
      if (buyBtn) {
        buyBtn.click();
      }
    } else {
      const useBtn = buttonsContainer.querySelector('button[data-i18n="ui.use"]');
      if (useBtn) {
        useBtn.click();
      }
    }
  }
}
  render(params) {
    const upgrade = this.upgrade;
    if(this.areParamsEqual(params,this.lastParams)){
      return upgrade.wrapper;
    }
    this.bought = upgrade.bought ?? false;
    let displayPrice = params.displayPrice ?? true;
    let displayButtons = params.displayButtons ?? true;
    this.lastParams = params;
    console.log("rendering upgrade: "+this.upgrade._name);
    upgrade.wrapper = null;
    upgrade.wrapper = document.createElement("div");
    const wrapper = upgrade.wrapper;
    this.originalZ = wrapper.style.zIndex || 0;
    this.dragHandler = new DragAndDropHandler(this.upgrade, this.gameRenderer);
    wrapper.addEventListener("mouseenter", () => (wrapper.style.zIndex = 500));
    wrapper.addEventListener("mouseleave", () => {
        // Jeśli nie przeciągamy, przywracamy z-index
        if (!this.dragHandler?.isDragging) wrapper.style.zIndex = this.originalZ;
    });


    wrapper.className = "upgrade-wrapper";
    wrapper.dataset.type = upgrade.type;
    if (this.bought) wrapper.classList.add("bought");
    if (upgrade.isReady) wrapper.classList.add("ready");
    if (params.free) upgrade.price = 0;

    // 1. Tło karty (To tutaj trafia obrazek i grayscale/invert)
    const cardBackground = document.createElement("div");
    cardBackground.className = "card-background";
    const imageUrl = upgrade.image();
    cardBackground.style.backgroundImage = `url('${imageUrl}')`;
    // Dodajemy zmienną dla maski:
    cardBackground.style.setProperty('--card-img', `url('.${imageUrl}')`);

    // 2. Kontener na naklejki (Osobno, by nie dziedziczyć filtrów)
    const stickersContainer = document.createElement("div");
    stickersContainer.className = "sticker-container";
    if (upgrade.stickers) {
      upgrade.stickers.forEach(sticker => {
        stickersContainer.appendChild(sticker.render());
      });
    }

    // Logika klas wizualnych
    let classes = [];
    if (upgrade.negative){
      classes.push("negative");
      classes.push("metalic-shine");
    } 
    if (upgrade.modifier == MODIFIERS.Chip) {
      classes.push("chip-foil");
    }
    else if (upgrade.modifier == MODIFIERS.Polychrome) {
      classes.push("holo");
      classes.push("shine");
    }
    else if(upgrade.modifier === MODIFIERS.Mult){
      classes.push("mult");
    }
    if (upgrade?.active === false) classes.push("inactive");

    // Nakładamy klasy na tło, a nie na cały kontener inner
    classes.forEach(cls => cardBackground.classList.add(cls));

    if (classes.length > 0) {
      if (!this.bought) {
        wrapper.classList.add("triggered");
        const sound = upgrade.negative ? "foil_reverse.mp3" : "foil.mp3";
        this.gameRenderer.game.Audio.playSound(sound);
        this.gameRenderer.game.Audio.playSound("tick.mp3");

        setTimeout(() => wrapper.classList.remove("triggered"), 300);
      }
    }
    switch (upgrade?.type) {
      case "ConsumablePack":
        cardBackground.classList.add("booster-foil");
        break;
      case "Voucher":
        cardBackground.classList.add("metalic-shine");
        break;
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
    desc.appendChild(this.createDescription());



    wrapper.addEventListener("mouseenter", () => {
      const cardRect = wrapper.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const descWidth = desc.offsetWidth;
      const descHeight = desc.offsetHeight;

      desc.classList.remove('pos-right', 'pos-left', 'pos-top', 'pos-bottom');

      if (cardRect.left < descWidth + 20) {
        desc.classList.add('pos-right');
      } else {
        desc.classList.add('pos-left');
      }

      if (screenHeight - cardRect.bottom < 50) {
        desc.classList.add('pos-top');
      } else if (cardRect.top < 50) {
        desc.classList.add('pos-bottom');
      }
      const titleEl = desc.querySelector(".title");
      if (titleEl) {
        fadeInAndBalatro(titleEl);
      }
      this.updateDescription();
    });
    if (displayPrice) wrapper.appendChild(priceEl);
    wrapper.appendChild(card);
    wrapper.appendChild(desc);
    if (displayButtons) wrapper.appendChild(this.createButtons(params));

    // if (this.dragHandler) {
    //     this.dragHandler.stopUpdateLoop();
    // }
    
    

    // 3. Obsługa kliknięcia (Twoja logika Balatro-style menu)
    if (displayButtons) {
      wrapper.addEventListener("click", this.boundClickHandler);
      wrapper.addEventListener("dblclick", this.boundDblClickHandler);
    }
    
    return wrapper;
  }
  updateDescription() {
    const wrapper = this.upgrade.wrapper;
    if (!wrapper) return;
    if (!wrapper.matches(":hover")) return; // nie renderuj gdy nie jest widoczne
    const descContainer = wrapper.querySelector(".upgrade-desc");
    if (!descContainer) return;

    const upgrade = this.upgrade;

    // 2. Aktualizacja TREŚCI (content)
    const contentP = descContainer.querySelector(".upgrade-desc .content p");
      if (contentP) {
        const newHtml = upgrade.description(this.gameRenderer.game);
        
        // Warunek 1: Aktualizuj tylko wtedy, gdy treść się RÓŻNI
        if (contentP.innerHTML !== newHtml) {
          
          // Warunek 2: Przed usunięciem starych elementów, wyczyść ich animacje!
          if (typeof clearAnimation === "function") {
            contentP.querySelectorAll("b, span, i, div").forEach(el => {
              clearAnimation(el);
            });
          }
          
          contentP.innerHTML = newHtml;
        }
      }

    // 3. Aktualizacja STOPKI (Modyfikatory i Rzadkość)
    const footer = descContainer.querySelector(".footer");
    if (footer) {
      
      // --- Obsługa Rzadkości ---
      let rarityDiv = footer.querySelector(".rarity");
      if (upgrade.rarity !== UPGRADE_RARITY.None) {
        if (!rarityDiv) {
          rarityDiv = document.createElement('div');
          footer.insertBefore(rarityDiv, footer.firstChild); // Wrzucamy na początek stopki
        }
        rarityDiv.className = `rarity ${upgrade.rarity.class}`;
        rarityDiv.textContent = upgrade.rarity.display;
      } else if (rarityDiv) {
        rarityDiv.remove();
      }

      // --- Obsługa Negatywności (.desc-negative) ---
      let negSpan = footer.querySelector(".desc-negative");
      let negDesc = footer.querySelector('[data-i18n="modifiers.negative.description"]');
      
      if (upgrade.negative === true) {
        if (!negDesc) {
          negDesc = document.createElement('p');
          negDesc.className = "content";
          negDesc.dataset.i18n = `modifiers.negative.description`;
          footer.appendChild(negDesc);
        }
        if (!negSpan) {
          negSpan = document.createElement('div');
          negSpan.className = 'type desc-negative';
          negSpan.textContent = 'Negative';
          footer.appendChild(negSpan);
        }
        negDesc.innerHTML = t(`modifiers.negative.description`, Settings.LANGUAGE);
      }

      // --- Obsługa Modyfikatora (Foil, Holo, Mult itp.) ---
      // Szukamy elementu modyfikatora, ignorując klasę .desc-negative
      let modSpan = footer.querySelector(".type:not(.desc-negative)");
      // Szukamy opisu modyfikatora (wykluczając opis negative)
      let modDesc = footer.querySelector('.content:not([data-i18n="modifiers.negative.description"])');

      if (upgrade.modifier !== MODIFIERS.None) {
        if (!modSpan) {
          modSpan = document.createElement('div');
          footer.appendChild(modSpan);
        }
        modSpan.className = `type ${upgrade.modifier}`;
        modSpan.textContent = upgrade.modifier;
        modSpan.dataset.i18n = `modifiers.${upgrade.modifier}.name`;

        if (!modDesc) {
          modDesc = document.createElement('p');
          modDesc.className = "content";
          footer.appendChild(modDesc);
        }
        modDesc.dataset.i18n = `modifiers.${upgrade.modifier}.description`;
        modDesc.innerHTML = t(`modifiers.${upgrade.modifier}.description`, Settings.LANGUAGE);
      } else {
        if (modSpan) {
          modSpan.remove();
        }
        if (modDesc) {
          modDesc.remove();
        }
      }
    }

    // 4. Odpalenie animacji dla tytułu (tylko jeśli zaszła potrzeba i jest hover)
  }
  updateWrapper(params) {
  const upgrade = this.upgrade;
  const wrapper = upgrade.wrapper;

  if (!wrapper) return this.render(params); // Jeśli nie ma wrappera, zrób pełny render
  const mergedParams = { ...this.lastParams, ...params };
  console.log("Updating upgrade UI: " + upgrade._name);

  // 1. Aktualizacja ceny
  const priceEl = wrapper.querySelector(".upgrade-price");
  if (priceEl) {
    priceEl.textContent = `$${params.bought ? upgrade.sellPrice : upgrade.price}`;
  }

  // 2. Aktualizacja opisu (desc)
  this.updateDescription();

  // 3. Aktualizacja klas (bought, ready)
  wrapper.classList.toggle("bought", params.bought ?? false);
  wrapper.classList.toggle("ready", upgrade.isReady ?? false);

  // 4. Aktualizacja tła (modyfikatory: Foil, Holo itp.)
  const cardBackground = wrapper.querySelector(".card-background");
  if (cardBackground) {
    // Lista klas modyfikatorów do odświeżenia
    const modClasses = ["chip-foil", "holo", "shine", "negative", "inactive","mult"];
    cardBackground.classList.remove(...modClasses);
    console.log("mod:"+upgrade.modifier);
    if (upgrade.negative){
          cardBackground.classList.add("negative");
    cardBackground.classList.add("metalic-shine");
    } 
    if (upgrade.modifier === MODIFIERS.Chip) cardBackground.classList.add("chip-foil");
    else if (upgrade.modifier === MODIFIERS.Polychrome) {
      cardBackground.classList.add("holo");
      cardBackground.classList.add("shine");
    }
    else if(upgrade.modifier === MODIFIERS.Mult){
      cardBackground.classList.add("mult");
    }
    if (upgrade.active === false) cardBackground.classList.add("inactive");
  }

  // 5. Aktualizacja przycisków (jeśli stan "bought" się zmienił)
  if (this.lastParams?.bought !== mergedParams.bought) {
      const oldButtons = wrapper.querySelector(".consumable-buttons");
      if (oldButtons) oldButtons.remove();
      if (mergedParams.displayButtons !== false) {
        wrapper.appendChild(this.createButtons(mergedParams)); // Przekazujemy merged
      }
    } else {
      this.refreshAllButtons();
    }

    // Re-inicjalizacja drag Handlera, jeśli jakimś cudem został wyczyszczony (np. przez cleanup)
    if (!this.dragHandler) {
      this.dragHandler = new DragAndDropHandler(this.upgrade, this.gameRenderer);
    }

  // Zapisujemy zmergowany stan na przyszłość
  this.lastParams = { ...mergedParams };
  return wrapper;
}
  createDescription() {
    const upgrade = this.upgrade;

    // Tworzymy główny kontener
    const container = document.createElement('div');
    container.className = 'description-wrapper';

    // 1. Sekcja TYTUŁU
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = upgrade.name;
    container.appendChild(title);

    // Inicjujemy animację od razu (bo element już istnieje w pamięci)
   // fadeInAndBalatro(title);

    // 2. Sekcja TREŚCI
    const content = document.createElement('div');
    content.className = 'content';

    const descP = document.createElement('p');
    // Wstrzykujemy Twój HTML z tagami <b>
    descP.innerHTML = upgrade.description(this.gameRenderer.game);

    // ZBIERAMY WSZYSTKIE ELEMENTY DO ANIMACJI
    // Szukamy <b>, <span>, <i> i innych tagów, które mogą być w opisie

    content.appendChild(descP);
    container.appendChild(content);

    // 3. Sekcja STOPKI (Footer)
    const footer = document.createElement('div');
    footer.className = 'footer';

    // Rzadkość
    if (upgrade.rarity !== UPGRADE_RARITY.None) {
      const rarityDiv = document.createElement('div');
      rarityDiv.className = `rarity ${upgrade.rarity.class}`;
      rarityDiv.textContent = upgrade.rarity.display;

      footer.appendChild(rarityDiv);
    }

    // Negatywność
    if (upgrade.negative === true) {
      const negSpan = document.createElement('div');
      negSpan.className = 'type desc-negative';
      negSpan.textContent = 'Negative';
      const descModifier = document.createElement('p');
      // Wstrzykujemy Twój HTML z tagami <b>
      descModifier.className = "content";
      descModifier.innerHTML = t(`modifiers.negative.description`,Settings.LANGUAGE);
      descModifier.dataset.i18n = `modifiers.negative.description`;
      footer.appendChild(descModifier);
      footer.appendChild(negSpan);
      
    }

    // Modyfikator
    if (upgrade.modifier !== MODIFIERS.None) {
      const modSpan = document.createElement('div');
      modSpan.className = `type ${upgrade.modifier}`;
      modSpan.textContent = upgrade.modifier;
      modSpan.dataset.i18n = `modifiers.${upgrade.modifier}.name`;
      const descModifier = document.createElement('p');
      // Wstrzykujemy Twój HTML z tagami <b>
      descModifier.className = "content";
      descModifier.innerHTML = t(`modifiers.${upgrade.modifier}.description`,Settings.LANGUAGE);
      descModifier.dataset.i18n = `modifiers.${upgrade.modifier}.description`;
      footer.appendChild(descModifier);
      footer.appendChild(modSpan);
      
    }

    container.appendChild(footer);

    return container; // Zwracamy obiekt DOM, a nie string!
  }
  clearTimer(){
    clearTimeout(this.selectedTimer);
    this.selectedTimer = null;
  }
  displayButtons() {
    if(this.dragHandler?.isDragging) return;
    
    const wrapper = this.upgrade.wrapper;
    // Sprawdzamy obecność klasy zamiast czytania stringa transform
    const isAlreadyActive = wrapper.classList.contains("SelectedUpgrade");
    if (this.selectedTimer) {
        this.clearTimer();
    }
    this.gameRenderer.resetAllUpgrades();

    let game = this.gameRenderer.game;
    if (!isAlreadyActive) {
      requestAnimationFrame(() => {
        this.selectedTimer = setTimeout(() => {
          if(this.upgrade.wrapper.classList.contains("SelectedUpgrade")){
            this.displayButtons();
          }
        }, 10000);
        // Zamiast stylu inline transform, ustawiamy zmienną
        wrapper.style.transition = "transform 0.05s ease-out";
        wrapper.style.setProperty('--select-y', '-20px');
        wrapper.classList.add("SelectedUpgrade");

        game.Audio.playSound("select.mp3");
        
        const buttonsContainer = wrapper.querySelector(".consumable-buttons");
        if (buttonsContainer) {
          buttonsContainer.style.display = "flex";
          buttonsContainer.style.opacity = "1";
        }
        this.refreshAllButtons();
      });
    } else {
      this.clearTimer();
      game.Audio.playSound("deselect.mp3");
      // Reset zmiennej przy odkliknięciu
      wrapper.style.setProperty('--select-y', '0px');
    }
}
  createBuyButton(params) {
    const upgrade = this.upgrade;
    const wrapper = upgrade.wrapper;
    let game = this.gameRenderer.game;
    const btnBuy = document.createElement("button");
    btnBuy.dataset.i18n = "ui.buy";
    btnBuy.textContent =  t(btnBuy.dataset.i18n,Settings.LANGUAGE);
    btnBuy.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log(game);
      console.log("buy?");
      let success = false;
      if (upgrade.canBuy(game) == false) {
        return false;
      }
      // const shopWrapper = wrapper;
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
        if (game.shopitems) {
            const index = game.shopitems.indexOf(upgrade);
            if (index > -1) {
              game.shopitems.splice(index, 1);
              console.log(`Usunięto ${upgrade._name} z shopitems po zakupie.`);
            }
          }
        this.clearTimer();
        if (upgrade.type == TYPES.Voucher) {
          this.removeButtons();
          game.GameRenderer.dissolveAndRemove(wrapper, 1000);
        } else if(upgrade.type==TYPES.Booster){
          game.GameRenderer.fadeOutAndRemove(wrapper);
        }
        //shopWrapper.remove();
      }
      //this.refreshBuyButtons();
    });
    return btnBuy;
  }
  createUseButton() {
    const upgrade = this.upgrade;
    const btnUse = document.createElement("button");
    btnUse.dataset.i18n = "ui.use";
    btnUse.textContent =  t(btnUse.dataset.i18n,Settings.LANGUAGE);
    btnUse.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("using");
      upgrade.wrapper.classList.add("used");
      console.log(upgrade);
      this.gameRenderer.game.useConsumable(upgrade);
      //this.cleanup();
      //this.fadeOutAndRemove(wrapper);
    });
    return btnUse;
  }
  createBuyAndUseButton(params) {
    const upgrade = this.upgrade;
    const wrapper = upgrade.wrapper;
    const btnBuyUse = document.createElement("button");
    btnBuyUse.dataset.i18n = "ui.buyanduse";
    btnBuyUse.textContent =  t(btnBuyUse.dataset.i18n,Settings.LANGUAGE);
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
        upgrade.wrapper.classList.add("used");
        this.clearTimer();
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
    btnSell.dataset.i18n = "ui.sell";
    btnSell.textContent =  t(btnSell.dataset.i18n,Settings.LANGUAGE);
    btnSell.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!upgrade.canSell(game)) {
        game.GameRenderer.notEnoughSpace(
          document.getElementById("player-upgrades-container"),
        );
        return false;
      }
      if (this.gameRenderer.game.sell(upgrade)) {
        //this.refreshBuyButtons();
        this.clearTimer();
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
      (b) => b.textContent.trim().toLowerCase() === t("ui.buy",Settings.LANGUAGE).toLowerCase(),
    );
    const btnUse = allBtns.find(
      (b) => b.textContent.trim().toLowerCase() === t("ui.use",Settings.LANGUAGE).toLowerCase(),
    );
    const btnBuyAndUse = allBtns.find(
      (b) => b.textContent.trim().toLowerCase() === t("ui.buyanduse",Settings.LANGUAGE).toLowerCase(),
    );
    const btnSell = allBtns.find(
      (b) => b.textContent.trim().toLowerCase() === t("ui.sell",Settings.LANGUAGE).toLowerCase(),
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
    if (btnSell) {
      if (!canSell) {
        btnSell.classList.add("disabled");
      }
    }
  }
  createPopup(text,props = {style:"mult", duration: 400, translation: false } ) {
    console.log(text);
    console.log(props);
    const style = props.style;
    const duration = props?.duration ?? 400;
    const translation = props.translation;
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
    square.classList.add("popup");
    square.classList.add(style);
    //console.log(style);
    square.style.transform = `rotate(${(Math.random() * 20 - 10).toFixed(2)}deg)`; // small random tilt

    // Create text
    const label = document.createElement("div");
    label.className = "upgrade-popup-text";
    label.textContent = text;
    if(translation==true){
      const finaltext = t(text,Settings.LANGUAGE,{up: this.upgrade});
      console.log(finaltext)
      label.textContent = finaltext;
    }
    

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
      setTimeout(() => popup.remove(), duration - 50);
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
    this.updateWrapper({bought: true, origin: null,tick: false});
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
  update(params = { bought: true, origin: null,tick: true }) {
    if (this.dragHandler?.isDragging) return;
    const upgrade = this.upgrade;
    if (!upgrade) return;

    // Zamiast render() i replaceWith(), używamy updateWrapper()
    this.updateWrapper(params);
    
    // Opcjonalnie: wyzwalasz efekt wizualny przy aktualizacji
    if(params?.tick==true){
      this.trigger(300);
      this.gameRenderer.game.Audio.playSound("tick.mp3");
    }
  }
  cleanup() {
    console.log("calling cleanup on:"+this.upgrade._name);
    const wrapper = this.upgrade.wrapper;
    if (wrapper) {
    // 1. Czyścimy stan wizualny (na wypadek, gdyby karta była wysunięta)
    this.clearTimer();
    wrapper.style.setProperty('--select-y', '0px');
    wrapper.classList.remove("SelectedUpgrade");

    // 2. Klonujemy element – to automatycznie i permanentnie USUWA wszystkie event listenery (click, dblclick, mouseenter itd.)
    wrapper.removeEventListener("click", this.boundClickHandler);
    wrapper.removeEventListener("dblclick", this.boundDblClickHandler);
  }

    // 3. Czyszczenie referencji obiektowych
    this.dragHandler = null;
    if (this.selectedTimer) {
        clearTimeout(this.selectedTimer);
        this.selectedTimer = null;
    }
    this.lastParams = null;
}
  removeButtons() {
    const wrapper = this.upgrade.wrapper;
    const buttonsContainer = wrapper.querySelector(".consumable-buttons");
    buttonsContainer.innerHTML = "";
  }
  applyDragEvents() {
    /*
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
  */
  }

}