import { MODIFIERS, UPGRADE_RARITY, Style, GAME_TRIGGERS, UPGRADE_STATES, Settings } from "../dictionary.js";
import { t } from "../entityData/translations.js";
import { fadeInAndBalatro, initBalatroEffect } from "../utils/animate_text.js";

export class BossRenderer {
  constructor(boss, gameRenderer) {
    this.upgrade = boss; // Trzymamy pod nazwą 'upgrade', żeby metody D&D były kompatybilne
    this.gameRenderer = gameRenderer;
    this.isDragging = false;
    this.dragStarted = false;
    this.startX = 0;
    this.startY = 0;
    this.lastMouseX = 0;
    this.dragThreshold = 5;
    this._mouseMoveHandler = (e) => this.onMouseMove(e);
    this._mouseUpHandler = (e) => this.onMouseUp(e);
  }

  render() {
    this.isDragging = false;
    this.dragStarted = false;
    this.startX = 0;
    this.startY = 0;
    this.lastMouseX = 0;
    
    const boss = this.upgrade;
    boss.wrapper = document.createElement("div");
    const wrapper = boss.wrapper;
    
    this.originalZ = wrapper.style.zIndex || 0;
    wrapper.className = "boss-wrapper"; // boss-wrapper dla stylu, upgrade-wrapper dla D&D
    
    // Obsługa Z-Indexu
    wrapper.addEventListener("mouseenter", () => (wrapper.style.zIndex = 500));
    wrapper.addEventListener("mouseleave", () => (wrapper.style.zIndex = this.originalZ));

    // 1. Tło karty (Obrazek Bossa)
    const cardBackground = document.createElement("div");
    cardBackground.className = "card-background";
    const imageUrl = boss.image();
    cardBackground.style.backgroundImage = `url('${imageUrl}')`;
    cardBackground.style.setProperty('--card-img', `url('.${imageUrl}')`);

    // 2. Montaż Card Inner (Boss zazwyczaj nie ma stickerów, więc pomijamy)
    const cardInner = document.createElement("div");
    cardInner.className = "upgrade-inner";
    cardInner.appendChild(cardBackground);

    // 3. Główna karta z animacją i Parallaxem
    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.style.animationDelay = `-${Math.random() * 3}s`;
    card.appendChild(cardInner);
    this.gameRenderer.addParalax(card);

    // 4. Opis Bossa (z Twoją nową logiką pozycjonowania)
    const desc = document.createElement("div");
    desc.className = "upgrade-desc";
    desc.appendChild(this.createDescription());

    wrapper.addEventListener("mouseenter", () => {
      desc.innerHTML = "";
      desc.appendChild(this.createDescription());

      const cardRect = wrapper.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const descWidth = desc.offsetWidth;

      desc.classList.remove('pos-right', 'pos-left', 'pos-top', 'pos-bottom');

      // Logika pozioma
      if (cardRect.left < descWidth + 20) {
        desc.classList.add('pos-right');
      } else {
        desc.classList.add('pos-left');
      }

      // Logika pionowa
      if (screenHeight - cardRect.bottom < 50) {
        desc.classList.add('pos-top');
      } else if (cardRect.top < 50) {
        desc.classList.add('pos-bottom');
      }
    });

    // 5. Drag & Drop Listener
    wrapper.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.dragStarted = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastMouseX = e.clientX;
      window.addEventListener("mousemove", this._mouseMoveHandler);
      window.addEventListener("mouseup", this._mouseUpHandler);
    });

    wrapper.appendChild(card);
    wrapper.appendChild(desc);

    return wrapper;
  }

  createDescription() {
    const boss = this.upgrade;
    const container = document.createElement('div');
    container.className = 'description-wrapper';

    // Tytuł Bossa
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = boss.name;
    container.appendChild(title);
    fadeInAndBalatro(title);

    // Treść (Opis umiejętności)
    const content = document.createElement('div');
    content.className = 'content';
    const descP = document.createElement('p');
    descP.innerHTML = boss.description(this.gameRenderer.game);
    content.appendChild(descP);
    container.appendChild(content);

    return container;
  }

  // --- LOGIKA OBSŁUGI EVENTÓW (DRAG & DROP) ---
  onMouseMove(e) {
    if (!this.isDragging) return;
    this.gameRenderer.resetAllUpgrades();
    const wrapper = this.upgrade.wrapper;
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    if (!this.dragStarted && (Math.abs(deltaX) > this.dragThreshold || Math.abs(deltaY) > this.dragThreshold)) {
      wrapper.style.transition = "none";
      this.dragStarted = true;
      wrapper.classList.add("dragging");
      wrapper.style.zIndex = 1000;
    }

    if (this.dragStarted) {
      const mouseVelocity = e.clientX - this.lastMouseX;
      this.lastMouseX = e.clientX;
      this.currentRotation = Math.max(Math.min(mouseVelocity * 0.5, 20), -20);
      wrapper.style.transform = `translate(${deltaX}px, ${deltaY}px) rotateZ(${this.currentRotation}deg)`;
    }
  }

  onMouseUp(e) {

    if (!this.isDragging) return;
    console.log(this);
    const wrapper = this.upgrade.wrapper
    const wasActuallyDragged = this.dragStarted;
    this.isDragging = false;
    this.dragStarted = false;
    if (wasActuallyDragged) {
      e.stopPropagation();
      wrapper.classList.remove("dragging");

      const container = wrapper.parentElement;
      // Szukamy karty, która ma klasę drag-over
      const targetWrapper = container?.querySelector('.drag-over');

      if (targetWrapper && targetWrapper !== wrapper) {
        // Usuwamy klasę podświetlenia
        targetWrapper.classList.remove('drag-over');

        const children = [...container.children];
        const draggedIndex = children.indexOf(wrapper);
        const targetIndex = children.indexOf(targetWrapper);

        // 1. Snapshot dla animacji FLIP
        const oldPositions = this.gameRenderer.getPositions(container);

        // 2. Zamiana miejsc w DOM
        if (draggedIndex < targetIndex) {
          container.insertBefore(wrapper, targetWrapper.nextSibling);
        } else {
          container.insertBefore(wrapper, targetWrapper);
        }

        // 3. Reset stylów i odpalenie animacji reorder
        wrapper.style.transform = "";
        this.currentRotation = 0;
        this.gameRenderer.animateReorder(oldPositions);

        // 4. Aktualizacja logiki gry
        if (this.upgrade.bought&&this.upgrade.type == "Upgrade") {
          const movedUpgrade = this.gameRenderer.game.upgrades.splice(draggedIndex, 1)[0];
          this.gameRenderer.game.upgrades.splice(targetIndex, 0, movedUpgrade);
          this.gameRenderer.game.emit(GAME_TRIGGERS.onUpgradesChanged);
          this.gameRenderer.displayUpgradesCounter();
        }
      } else {
        // Brak celu -> Powrót z bouncem
        const style = window.getComputedStyle(wrapper);
        const matrix = new WebKitCSSMatrix(style.transform);
        wrapper.style.setProperty('--drag-x', `${matrix.m41}px`);
        wrapper.style.setProperty('--drag-y', `${matrix.m42}px`);
        wrapper.style.setProperty('--last-tilt', `${this.currentRotation}deg`);

        wrapper.classList.add("returning");
        setTimeout(() => {
          if (!this.isDragging) {
            wrapper.classList.remove("returning");
            wrapper.style.transform = "";
            wrapper.style.zIndex = this.originalZ;
          }
        }, 400);
      }
      window.removeEventListener("mousemove", this._mouseMoveHandler);
      window.removeEventListener("mouseup", this._mouseUpHandler);
    }
  };

  // Popup dla bossa (np. gdy jego efekt się aktywuje)
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
    const wrapper = this.upgrade.wrapper;
    if (!wrapper) return;
    
    // Odśwież opis przy każdym triggerze
    const descElement = wrapper.querySelector(".upgrade-desc");
    if (descElement) {
        descElement.innerHTML = "";
        descElement.appendChild(this.createDescription());
    }

    if (action === UPGRADE_STATES.Active || action === UPGRADE_STATES.Score) {
      wrapper.style.animationDuration = time + "ms";
      wrapper.classList.add("triggered");
      setTimeout(() => wrapper.classList.remove("triggered"), time);
    }
  }
}