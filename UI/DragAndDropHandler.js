import { GAME_TRIGGERS } from "../dictionary.js";

export class DragAndDropHandler {
  constructor(upgrade, gameRenderer) {
    this.upgrade = upgrade;
    this.gameRenderer = gameRenderer;
    this.wrapper = upgrade.wrapper;

    this.isDragging = false;
    this.dragStarted = false;
    
    this.currentMouseX = 0;
    this.currentMouseY = 0;
    this.lastMouseX = 0;

    this.offsetX = 0;
    this.offsetY = 0;

    // LERP - wygładzanie ruchu
    this.lerpX = 0;
    this.lerpY = 0;
    this.lerpFactor = 0.3; // Teraz traktujemy to jako wartość bazową dla 60Hz
    this.lerpInitialized = false;

    // --- NOWE: Zmienne do kontroli czasu ---
    this.lastFrameTime = 0; 

    this.currentRotation = 0;
    this.animationFrameId = null;
    this.dragThreshold = 5;
    this.lastSwapTime = 0;
    this.swapCooldown = 150;

    this._mouseMoveHandler = (e) => this.onMouseMove(e);
    this._mouseUpHandler = (e) => this.onMouseUp(e);
    this.isAutoMoving = false;
    this.init();
  }

  init() {
    this.wrapper.addEventListener("mousedown", (e) => {
      if (e.target.closest('button')) return;

      if (this.wrapper.classList.contains("returning")) {
        const style = window.getComputedStyle(this.wrapper);
        const matrix = new WebKitCSSMatrix(style.transform);
        
        this.lerpX = matrix.m41;
        this.lerpY = matrix.m42;
        this.lerpInitialized = true;
        
        this.wrapper.classList.remove("returning");
        this.wrapper.style.transition = "none";
      }

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
      this.activateDrag();
    }
  }

  activateDrag() {
    if (this.dragStarted) return;
    this.gameRenderer.resetAllUpgrades();
    this.dragStarted = true;

    const rect = this.wrapper.getBoundingClientRect();
    this.baseX = rect.left - this.lerpX;
    this.baseY = rect.top - this.lerpY;

    this.wrapper.style.transition = "none";
    this.wrapper.classList.add("dragging");
    this.wrapper.style.setProperty('--trigger-scale', `1.045`);
    this.wrapper.style.zIndex = 1000;
    
    // --- NOWE: Reset czasu przed startem pętli ---
    this.lastFrameTime = performance.now();
    this.startUpdateLoop();
  }

  update() {
    if (!this.dragStarted) return;

    const container = this.wrapper.parentElement;
    if (!container) return;

    // --- NOWE: Obliczanie Delta Time ---
    const now = performance.now();
    // deltaTime to ułamek sekundy (np. ~0.016 dla 60Hz, ~0.007 dla 144Hz)
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // Zabezpieczenie przed zamrożeniem karty (np. zmiana karty w przeglądarce)
    const clampedDt = Math.min(dt, 0.1); 

    if (this.isAutoMoving) {
      const elapsed = now - this.autoMoveStartTime;
      let progress = Math.min(elapsed / this.autoMoveDuration, 1);

      const easeOutQuad = t => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      this.lerpX = this.startX + (this.autoMoveTargetX - this.startX) * easedProgress;
      this.lerpY = this.startY + (this.autoMoveTargetY - this.startY) * easedProgress;

      this.currentMouseX = this.baseX + this.lerpX;
      this.currentMouseY = this.baseY + this.lerpY;

      if (progress >= 1) {
        const wrocNaMiejsceWDOM = true; 
        this.stopAutoMove(wrocNaMiejsceWDOM);
        return;
      }
    } else {
      const targetDeltaX = (this.currentMouseX - this.offsetX) - this.baseX;
      const targetDeltaY = (this.currentMouseY - this.offsetY) - this.baseY;

      if (!this.lerpInitialized) {
          this.lerpX = targetDeltaX;
          this.lerpY = targetDeltaY;
          this.lerpInitialized = true;
      } else {
          // --- KLUCZOWA POPRAWKA LERPa ---
          // Konwertujemy tradycyjny współczynnik na niezależny od klatek za pomocą Math.exp.
          // Liczba 25 reguluje szybkość. Możesz ją zmniejszyć/zwiększyć pod swoje widzimisię.
          const frameIndependentLerp = 1 - Math.exp(-22 * clampedDt);
          
          this.lerpX += (targetDeltaX - this.lerpX) * frameIndependentLerp;
          this.lerpY += (targetDeltaY - this.lerpY) * frameIndependentLerp;
      }
    }
    
    // 4. Rotacja i prędkość myszy uniezależniona od FPS
    // mouseVelocityX mogło wariować przy wysokim Hz, bo dystans w pikselach na klatkę stawał się mikroskopijny.
    // Dzielenie przez clampedDt normalizuje prędkość "na sekundę".
    const mouseVelocityX = (this.currentMouseX - this.lastMouseX) / (clampedDt * 60 || 1);

    const targetRotation = Math.max(Math.min(mouseVelocityX * 0.4, 90), -90);

    // Dynamiczny współczynnik obrotu i tłumienia oparty o dt
    const rotationLerp = 1 - Math.exp(-25 * clampedDt);
    this.currentRotation += (targetRotation - this.currentRotation) * rotationLerp;
    
    if (Math.abs(mouseVelocityX) < 0.1) {
        // Tłumienie (damping) również przeskalowane czasowo
        this.currentRotation *= Math.pow(0.95, clampedDt * 60);
    }

    // 5. Renderowanie
    this.wrapper.style.setProperty('--drag-x', `${this.lerpX}px`);
    this.wrapper.style.setProperty('--drag-y', `${this.lerpY}px`);
    this.wrapper.style.setProperty('--drag-tilt', `${this.currentRotation}deg`);

    // 6. Logika SWAP
    if (now - this.lastSwapTime > this.swapCooldown) {
      const target = this.getCardUnderCursor(this.currentMouseX, this.currentMouseY);

      if (target && target !== this.wrapper) {
          const container = this.wrapper.parentElement;
          const oldPositions = this.gameRenderer.getPositions(container);

          const rectBefore = this.wrapper.getBoundingClientRect();
          const actualBaseBeforeX = rectBefore.left - this.lerpX;
          const actualBaseBeforeY = rectBefore.top - this.lerpY;

          this.executeReorder(container, target);

          const rectAfter = this.wrapper.getBoundingClientRect();
          const actualBaseAfterX = rectAfter.left - this.lerpX;
          const actualBaseAfterY = rectAfter.top - this.lerpY;

          const diffX = actualBaseBeforeX - actualBaseAfterX;
          const diffY = actualBaseBeforeY - actualBaseAfterY;

          this.lerpX += diffX;
          this.lerpY += diffY;

          this.baseX = actualBaseAfterX;
          this.baseY = actualBaseAfterY;
          
          this.wrapper.style.setProperty('--drag-x', `${this.lerpX}px`);
          this.wrapper.style.setProperty('--drag-y', `${this.lerpY}px`);
          this.wrapper.style.setProperty('--drag-tilt', `${this.currentRotation}deg`);

          this.gameRenderer.animateReorder(oldPositions, 280, this.wrapper);
          this.lastSwapTime = now;
      }
    }

    this.lastMouseX = this.currentMouseX;
    this.animationFrameId = requestAnimationFrame(() => this.update());
  }

  buyTransition(newContainer) {
    this.stopUpdateLoop();
    const rectBefore = this.wrapper.getBoundingClientRect();
    newContainer.appendChild(this.wrapper);
    const rectAfter = this.wrapper.getBoundingClientRect();

    this.lerpX = rectBefore.left - rectAfter.left;
    this.lerpY = rectBefore.top - rectAfter.top;
    this.lerpInitialized = true;

    this.baseX = rectAfter.left;
    this.baseY = rectAfter.top;

    this.wrapper.style.setProperty('--drag-x', `${this.lerpX}px`);
    this.wrapper.style.setProperty('--drag-y', `${this.lerpY}px`);
    this.wrapper.style.setProperty('--drag-tilt', `0deg`);
    this.wrapper.classList.remove("SelectedUpgrade");
    this.wrapper.style.setProperty('--select-y', '0px');
    this.wrapper.style.transition = "none";
    this.wrapper.classList.add("dragging"); 
    this.wrapper.style.zIndex = 1000;

    this.isAutoMoving = true;
    this.dragStarted = true;

    this.startX = this.lerpX;
    this.startY = this.lerpY;

    this.autoMoveTargetX = 0; 
    this.autoMoveTargetY = 0;

    this.autoMoveDuration = 150; 
    this.autoMoveStartTime = performance.now();

    this.lastFrameTime = performance.now(); // Reset przed pętlą
    this.startUpdateLoop();
  }

  onMouseUp(e) {
    this.stopUpdateLoop();
    if (!this.isDragging) return;

    if (this.dragStarted) {
      this.wrapper.classList.remove("dragging");
      this.wrapper.style.setProperty('--trigger-scale', `1`);
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

    if (draggedIndex < targetIndex) {
      container.insertBefore(this.wrapper, targetWrapper.nextSibling);
    } else {
      container.insertBefore(this.wrapper, targetWrapper);
    }

    const upgrade = this.upgrade;
    if (upgrade.bought && upgrade.type === "Upgrade") {
      const movedUpgrade = this.gameRenderer.game.upgrades.splice(draggedIndex, 1)[0];
      this.gameRenderer.game.upgrades.splice(targetIndex, 0, movedUpgrade);
      this.gameRenderer.game.emit(GAME_TRIGGERS.onUpgradesChanged);
      this.gameRenderer.displayUpgradesCounter();
    }
  }

  executeReturn() {
    this.wrapper.style.setProperty('--last-x', `${this.lerpX}px`);
    this.wrapper.style.setProperty('--last-y', `${this.lerpY}px`);
    this.wrapper.style.setProperty('--last-tilt', `${this.currentRotation}deg`);

    this.wrapper.style.setProperty('--drag-x', `0px`);
    this.wrapper.style.setProperty('--drag-y', `0px`);
    this.wrapper.style.setProperty('--drag-tilt', `0deg`);

    this.wrapper.style.transform = "none";
    void this.wrapper.offsetWidth; 

    this.wrapper.classList.add("returning");
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

      if (distance < minDistance && distance < 80) {
        minDistance = distance;
        closestCard = card;
      }
    });
    return closestCard;
  }

  moveTo(targetX, targetY, duration = 500) {
    if (this.isDragging) return;

    this.isAutoMoving = true;
    this.dragStarted = true;

    this.startX = this.lerpX;
    this.startY = this.lerpY;

    const rect = this.wrapper.getBoundingClientRect();
    this.baseX = rect.left - this.lerpX;
    this.baseY = rect.top - this.lerpY;

    this.offsetX = 0;
    this.offsetY = 0;
    this.autoMoveTargetX = targetX - this.baseX;
    this.autoMoveTargetY = targetY - this.baseY;

    this.autoMoveDuration = duration;
    this.autoMoveStartTime = performance.now();

    this.wrapper.style.transition = "none";
    this.wrapper.classList.add("dragging");
    this.wrapper.style.zIndex = 1000;

    this.lastFrameTime = performance.now(); // Reset przed pętlą
    this.startUpdateLoop();
  }

  stopAutoMove(shouldReturn = true) {
    if (!this.isAutoMoving) return;
    
    this.isAutoMoving = false;
    this.dragStarted = false;
    this.stopUpdateLoop();
    
    this.wrapper.classList.remove("dragging");
    
    if (shouldReturn) {
      this.executeReturn(); 
    } else {
      this.wrapper.style.zIndex = "";
    }
  }

  startUpdateLoop() {
    if (!this.animationFrameId) {
      this.lastFrameTime = performance.now(); // Pilnujemy czystego startu czasu
      this.update();
    }
  }

  stopUpdateLoop() {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }
}