import { GAME_TRIGGERS } from "../dictionary.js";

export class DragAndDropHandler {
  constructor(upgrade, gameRenderer) {
    this.upgrade = upgrade;
    this.gameRenderer = gameRenderer;
    this.wrapper = upgrade.wrapper;

    this.isDragging = false;
    this.dragStarted = false;
    
    // Pozycja myszy
    this.currentMouseX = 0;
    this.currentMouseY = 0;
    this.lastMouseX = 0;

    // Punkt uchwytu (gdzie na karcie kliknęliśmy)
    this.offsetX = 0;
    this.offsetY = 0;

    // LERP - wygładzanie ruchu
    this.lerpX = 0;
    this.lerpY = 0;
    this.lerpFactor = 0.6; // 0.1 - bardzo ciężka, 0.3 - bardzo responsywna
    this.lerpInitialized = false;

    this.currentRotation = 0;
    this.animationFrameId = null;
    this.dragThreshold = 5;
    this.lastSwapTime = 0;
    this.swapCooldown = 150;

    this._mouseMoveHandler = (e) => this.onMouseMove(e);
    this._mouseUpHandler = (e) => this.onMouseUp(e);

    this.init();
  }

  init() {
  this.wrapper.addEventListener("mousedown", (e) => {
    if (e.target.closest('button')) return;

    // --- NOWE: Przerwanie powrotu ---
    if (this.wrapper.classList.contains("returning")) {
      const style = window.getComputedStyle(this.wrapper);
      const matrix = new WebKitCSSMatrix(style.transform);
      
      // Ustalamy lerp na obecną pozycję, żeby karta nie "skoczyła"
      // Musimy jednak pamiętać, że rect.left w update() odniesie się do nowej bazy
      this.lerpX = matrix.m41;
      this.lerpY = matrix.m42;
      this.lerpInitialized = true;
      
      this.wrapper.classList.remove("returning");
      this.wrapper.style.transition = "none";
    }
    // --------------------------------

    this.isDragging = true;
    this.dragStarted = false;

    const rect = this.wrapper.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;

    this.currentMouseX = e.clientX;
    this.currentMouseY = e.clientY;
    this.lastMouseX = e.clientX;

    window.addEventListener("mousemove", this._mouseMoveHandler);
    window.addEventListener("mouseup", this._mouseUpHandler);
  });
}

  onMouseMove(e) {
    if (!this.isDragging) return;
    this.currentMouseX = e.clientX;
    this.currentMouseY = e.clientY;

    if (!this.dragStarted) {
      // Próg aktywacji przeciągania mierzymy względem pierwotnego kliknięcia
      const initialDist = Math.hypot(e.clientX - (this.currentMouseX), e.clientY - (this.currentMouseY));
      
      // Prosty check progu (używając zapasowych startX/Y jeśli potrzebujesz, 
      // ale tutaj bazujemy na ruchu od mousedown)
      if (Math.abs(e.clientX - (this.currentMouseX + this.offsetX)) > this.dragThreshold) { 
          // Uprośćmy: jeśli mysz się ruszyła o próg
      }
      
      // Dla uproszczenia logiki progu w tym modelu:
      this.activateDrag();
    }
  }

  activateDrag() {
    if (this.dragStarted) return;
    this.gameRenderer.resetAllUpgrades();
    this.dragStarted = true;
    this.wrapper.style.transition = "none";
    this.wrapper.classList.add("dragging");
    this.wrapper.style.zIndex = 1000;
    this.startUpdateLoop();
  }

  update() {
    if (!this.dragStarted) return;

    const container = this.wrapper.parentElement;
    if (!container) return;

    // 1. Pomiar pozycji "czystej"
    // Zamiast usuwać transform, używamy getBoundingClientRect() 
    // i odejmujemy od niego aktualne lerpX/Y, aby dowiedzieć się gdzie jest "baza" karty.
    const rect = this.wrapper.getBoundingClientRect();
    const baseX = rect.left - this.lerpX;
    const baseY = rect.top - this.lerpY;

    // 2. Docelowa delta względem bazy
    const targetDeltaX = (this.currentMouseX - this.offsetX) - baseX;
    const targetDeltaY = (this.currentMouseY - this.offsetY) - baseY;

    // 3. LERP (bez zmian)
    if (!this.lerpInitialized) {
        this.lerpX = targetDeltaX;
        this.lerpY = targetDeltaY;
        this.lerpInitialized = true;
    } else {
        this.lerpX += (targetDeltaX - this.lerpX) * this.lerpFactor;
        this.lerpY += (targetDeltaY - this.lerpY) * this.lerpFactor;
    }

    // 4. Rotacja (bez zmian)
    const mouseVelocityX = this.currentMouseX - this.lastMouseX;

    // Zmniejszamy mnożnik z 0.8 na ok. 0.4 i clamp z 20 na 12 stopni
    const targetRotation = Math.max(Math.min(mouseVelocityX * 0.4, 12), -12);

    // Zmniejszamy lerp rotacji (0.1 zamiast 0.5), aby karta nie drgała przy małych ruchach
    this.currentRotation += (targetRotation - this.currentRotation) * 0.7;

    // 5. Renderowanie - tylko zmienne!
    this.wrapper.style.setProperty('--drag-x', `${this.lerpX}px`);
    this.wrapper.style.setProperty('--drag-y', `${this.lerpY}px`);
    this.wrapper.style.setProperty('--drag-tilt', `${this.currentRotation}deg`);

    // 6. Logika SWAP
    const now = performance.now();
if (now - this.lastSwapTime > this.swapCooldown) {
    const target = this.getCardUnderCursor(this.currentMouseX, this.currentMouseY);

    if (target && target !== this.wrapper) {
        const container = this.wrapper.parentElement;
        const oldPositions = this.gameRenderer.getPositions(container);

        // --- KLUCZOWA POPRAWKA: Korekta Lerp ---
        const rectBefore = this.wrapper.getBoundingClientRect();
        const actualBaseBeforeX = rectBefore.left - this.lerpX;
        const actualBaseBeforeY = rectBefore.top - this.lerpY;

        this.executeReorder(container, target);

        // 2. Mierzymy pozycję po zamianie (nowa baza)
        const rectAfter = this.wrapper.getBoundingClientRect();
        const actualBaseAfterX = rectAfter.left - this.lerpX;
        const actualBaseAfterY = rectAfter.top - this.lerpY;

        // 3. Obliczamy o ile przesunęła się BAZA karty w DOM
        const diffX = actualBaseBeforeX - actualBaseAfterX;
        const diffY = actualBaseBeforeY - actualBaseAfterY;

        // 4. Korygujemy Lerp
        this.lerpX += diffX;
        this.lerpY += diffY;

        // 5. Aktualizujemy zmienne natychmiast
        this.wrapper.style.setProperty('--drag-x', `${this.lerpX}px`);
        this.wrapper.style.setProperty('--drag-y', `${this.lerpY}px`);

        // 6. Przywracamy natychmiast transformację z poprawionym lerpem, 
        // żeby uniknąć mignięcia przed następną klatką
        this.wrapper.style.setProperty('--drag-x', `${this.lerpX}px`);
        this.wrapper.style.setProperty('--drag-y', `${this.lerpY}px`);
        this.wrapper.style.setProperty('--drag-tilt', `${this.currentRotation}deg`);
        // ---------------------------------------

        // Animuj sąsiadów
        this.gameRenderer.animateReorder(oldPositions, 280, this.wrapper);
        
        this.lastSwapTime = now;
    }
}

    this.lastMouseX = this.currentMouseX;
    this.animationFrameId = requestAnimationFrame(() => this.update());
  }

  onMouseUp(e) {
    this.stopUpdateLoop();
    if (!this.isDragging) return;

    if (this.dragStarted) {
      this.wrapper.classList.remove("dragging");
      this.executeReturn(); 
    }

    this.isDragging = false;
    this.dragStarted = false;
    this.lerpInitialized = false;
    window.removeEventListener("mousemove", this._mouseMoveHandler);
    window.removeEventListener("mouseup", this._mouseUpHandler);
  }

  executeReorder(container, targetWrapper) {
    const children = [...container.children];
    const draggedIndex = children.indexOf(this.wrapper);
    const targetIndex = children.indexOf(targetWrapper);

    // Zamiana w DOM
    if (draggedIndex < targetIndex) {
      container.insertBefore(this.wrapper, targetWrapper.nextSibling);
    } else {
      container.insertBefore(this.wrapper, targetWrapper);
    }

    // Synchronizacja z tablicą w pamięci gry
    const upgrade = this.upgrade;
    if (upgrade.bought && upgrade.type === "Upgrade") {
      const movedUpgrade = this.gameRenderer.game.upgrades.splice(draggedIndex, 1)[0];
      this.gameRenderer.game.upgrades.splice(targetIndex, 0, movedUpgrade);
      this.gameRenderer.game.emit(GAME_TRIGGERS.onUpgradesChanged);
      this.gameRenderer.displayUpgradesCounter();
    }
  }


executeReturn() {
  // 1. Zapisujemy pozycję startową dla animacji
  this.wrapper.style.setProperty('--last-x', `${this.lerpX}px`);
  this.wrapper.style.setProperty('--last-y', `${this.lerpY}px`);
  this.wrapper.style.setProperty('--last-tilt', `${this.currentRotation}deg`);

  // 2. Zerujemy zmienne drag, żeby nie przeszkadzały po zakończeniu animacji
  this.wrapper.style.setProperty('--drag-x', `0px`);
  this.wrapper.style.setProperty('--drag-y', `0px`);
  this.wrapper.style.setProperty('--drag-tilt', `0deg`);

  // 3. KLUCZOWE: Najpierw zdejmujemy transform i wymuszamy przeliczenie stylów
  this.wrapper.style.transform = "none";
  void this.wrapper.offsetWidth; // To sprawia, że przeglądarka "widzi" reset

  // 4. Teraz dodajemy klasę z animacją
  this.wrapper.classList.add("returning");
  // Usuwamy transform inline zupełnie, by animacja z CSS (keyframes) mogła działać
  this.wrapper.style.transform = "";

  setTimeout(() => {
    if (!this.isDragging && this.wrapper.classList.contains("returning")) {
      this.wrapper.classList.remove("returning");
      this.wrapper.style.zIndex = "";
      
      this.currentRotation = 0;
      this.lerpX = 0;
      this.lerpY = 0;
      this.lerpInitialized = false;

      this.wrapper.style.removeProperty('--last-x');
      this.wrapper.style.removeProperty('--last-y');
      this.wrapper.style.removeProperty('--last-tilt');
    }
  }, 500); 
}

  getCardUnderCursor(x, y) {
    const container = this.wrapper.parentElement;
    if (!container) return null;

    const cards = [...container.querySelectorAll('.upgrade-wrapper:not(.dragging)')];
    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const distance = Math.hypot(x - cardCenterX, y - cardCenterY);

      // Zmniejszamy dystans aktywacji (np. 100), aby karta nie "wariowała" zbyt wcześnie
      if (distance < minDistance && distance < 80) {
        minDistance = distance;
        closestCard = card;
      }
    });
    return closestCard;
  }

  startUpdateLoop() {
    if (!this.animationFrameId) this.update();
  }

  stopUpdateLoop() {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }
}