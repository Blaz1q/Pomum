console.log("Tile");
import { GAME_TRIGGERS, MODIFIERS, Settings, Style, TYPES } from "../dictionary.js";
import { t } from "../entityData/translations.js";
export class Tile {
    constructor(props = {}) {
        this.url = `./images/tiles/`;
        if (props instanceof Tile) {
            this.constructorTILE(props);
            return;
        }        
        this.imagename = props.image ?? "Unknown";
        this.icon = props.icon ?? "X";
        this.type = props.type ?? "Unknown"; // "fruit", "dynamite", "bomb"
        this.x = props.x ?? -1;
        this.y = props.y ?? -1;
        this.props = {
            debuffed: false,
            detonations: props.detonations ?? 0, // default 0 unless provided
            percent: props.percent ?? 1,
            modifier: props.modifier ?? MODIFIERS.None,
            upgrade: {
                level: 1,
                mult: 0,
                score: 10,
                goldchance: 0,
                silverchance: 0
            },
            ...props
        };
    }
    constructorTILE(Tile) {
        this.icon = Tile.icon;
        this.type = Tile.type;
        this.x = Tile.x;
        this.y = Tile.y;
        this.imagename = Tile.imagename ?? "Unknown";
        this.props = {
            debuffed: Tile.props.debuffed,
            detonations: Tile.props.detonations,
            percent: Tile.props.percent,
            modifier: Tile.props.modifier,
            upgrade: {
                level: Tile.props.upgrade.level,
                mult: Tile.props.upgrade.mult,
                score: Tile.props.upgrade.score,
                goldchance: Tile.props.upgrade.goldchance,
                silverchance: Tile.props.upgrade.silverchance
            }
        };
    }
    isFruit(icon){
        return this.icon==icon||this.props.modifier==MODIFIERS.Wild;
    }
    get image(){
        return this.url+this.imagename;
    }
    get percent() {
        return this.props.percent;
    }
    get detonations() {
        if (this.type == TYPES.Bomb || this.type == TYPES.Dynamite) {
            return this.props.detonations;
        }
        return 0;
    }
    set percent(percent) {
        if (this.type == TYPES.Fruit || this.type == TYPES.Dynamite) {
            console.log("set:" + percent);
            this.props.percent = percent;
        }
    }
    set detonations(detonations) {
        if (this.type == TYPES.Dynamite || this.type == TYPES.Bomb) {
            this.props.detonations = detonations;
        }
    }
    levelUp() {
        let upgrade = this.props.upgrade;
        upgrade.level += 1;
        upgrade.mult += 0.4;
        upgrade.mult = Math.round(upgrade.mult * 100) / 100;
        upgrade.score += 2;
    }
    renderGhost(xPx, yPx, w, h) {
        const g = document.createElement("div");
        
        // 1. Content Logic (Mirroring render)
        if (this.imagename !== "Unknown"&&!Settings.OLD_FRUITS) {
            const image = new Image();
            image.src = this.image;
            image.width = 39; // Matches your render dimensions
            image.height = 39;
            g.appendChild(image);
        } else {
            g.textContent = this.icon;
        }

        // 2. Base Ghost Styles
        Object.assign(g.style, {
            position: "absolute",
            left: `${xPx}px`,
            top: `${yPx}px`,
            width: `${w}px`,
            height: `${h}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            pointerEvents: "none",
            transition: "transform 150ms ease",
            zIndex: "100"
        });

        // 3. Apply Modifier Classes (Mirroring render)
        if (this.props.modifier === MODIFIERS.Gold) g.classList.add("gold");
        if (this.props.modifier === MODIFIERS.Silver) g.classList.add("silver");
        if(this.props.modifier === MODIFIERS.Wild) g.classList.add("wild");
        if(this.props.modifier === MODIFIERS.Mult) g.classList.add("mult");
        if(this.props.modifier === MODIFIERS.Chip) g.classList.add("chip");
        if(this.props.modifier === MODIFIERS.Glass) g.classList.add("glass");
        if (this.props.debuffed) g.classList.add("debuffed");

        return g;
    }
    triggerAnimation(game,time = 300){
        console.log(this.x,this.y);
        const domTile = document.querySelector(`[data-x="${this.x}"][data-y="${this.y}"]`);
        const rendered = this.render(game);
        domTile.replaceWith(rendered);
        rendered.classList.add("triggered");
        rendered.style.animationDuration = time + "ms";
            rendered.classList.add("triggered");
            setTimeout(() => {
              rendered.classList.remove("triggered");
            }, time);
    }
    createDescription() {
        // Pobieramy dane bezpośrednio z właściwości kafra (Tile)
        const modifier = this.props.modifier;
        const upgrade = this.props.upgrade;
        const isDebuffed = this.props.debuffed;

        // Główny kontener opisu
        const container = document.createElement('div');
        container.className = 'description-wrapper';

        // 1. Sekcja TYTUŁU (Nazwa typu kafla, np. Fruit, Bomb, Dynamite)
        const title = document.createElement('div');
        title.className = 'title';
        // Zabezpieczenie na wypadek braku typu i formatowanie (np. pierwsza litera duża)
        const typeName = this.type ? this.type.charAt(0).toUpperCase() + this.type.slice(1) : "Unknown Tile";
        title.textContent = `${this.icon} (Lvl ${upgrade.level})`;
        container.appendChild(title);

        // 2. Sekcja TREŚCI (Statystyki podstawowe kafla)
        const content = document.createElement('div');
        content.className = 'content';

        const descP = document.createElement('p');
        let baseStats = `Po zniszczeniu daje<hr>${Style.Score("+"+upgrade.score+" "+t("ui.pts",Settings.LANGUAGE))}`;
        if (upgrade.mult > 0) {
            baseStats += `<hr>${Style.Mult(" +"+upgrade.mult+" Mult")}`;
        }
        baseStats +=`<hr>Szansa: ${Style.Chance(Math.round(this.props.percent*100/100) +"%")}`;
        descP.innerHTML = baseStats;
        content.appendChild(descP);
        container.appendChild(content);

        // 3. Sekcja STOPKI (Modyfikatory i Debuffy)
        const footer = document.createElement('div');
        footer.className = 'footer';

        // Obsługa Debuffa
        if (isDebuffed) {
            const debuffSpan = document.createElement('div');
            debuffSpan.className = 'type desc-debuffed';
            debuffSpan.textContent = 'Debuffed';
            
            const descDebuff = document.createElement('p');
            descDebuff.className = "content text-debuffed";
            // Funkcja t() zakładam, że jest globalna z Twojego systemu tłumaczeń
            descDebuff.innerHTML = t(`modifiers.debuffed.description`, Settings.LANGUAGE);
            footer.appendChild(debuffSpan);
            footer.appendChild(descDebuff);
            
        }

        // Obsługa Modyfikatora (Gold, Silver, Glass itp.)
        if (modifier && modifier !== MODIFIERS.None) {
            const modSpan = document.createElement('div');
            modSpan.className = `type ${modifier.toLowerCase()}`;
            modSpan.textContent = modifier;

            const descModifier = document.createElement('p');
            descModifier.className = "content";
            

            //footer.appendChild(descModifier);
            footer.appendChild(modSpan);
        }

        // Dodajemy stopkę tylko, jeśli ma jakąś zawartość
        if (footer.children.length > 0) {
            container.appendChild(footer);
        }

        return container; // Zwraca obiekt DOM
    }

    hover() {
        const container = document.getElementById("tile-hover-desc");
        if (!container) return;
        
        // Czyścimy poprzednią zawartość
        container.innerHTML = "";
        
        // Generujemy nowy opis jako element DOM i go dołączamy
        const descriptionNode = this.createDescription();
        container.appendChild(descriptionNode);
    }
    render(game){
        const Tile = this;
        const x = Tile.x;
        const y = Tile.y;
        const icon = Tile.icon;
        let element = document.createElement("div");
        let image = new Image();
        element.textContent = icon;
        if(Tile.imagename != "Unknown"&&!Settings.OLD_FRUITS){
            element.textContent = '';
            image.src = Tile.image;
            image.width = 39;
            image.height = 39;
            element.appendChild(image);
           
        }
        element.dataset.x = x;
        element.dataset.y = y;

        // kliknięcie
        element.addEventListener("click", () => game.handleClick(x, y, element));
        element.addEventListener("mouseover", ()=> this.hover());
        // przeciąganie
        element.draggable = true;
        element.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", JSON.stringify({ x, y }));

            // Pusty obrazek zamiast kafla
            const img = new Image();
            img.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
            e.dataTransfer.setDragImage(img, 0, 0);
        });

        element.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move"; // jawnie ustaw efekt
        });

        element.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation(); // <- WAŻNE
            let from = JSON.parse(e.dataTransfer.getData("text/plain"));
            game.handleDragDrop(from, { x, y });
        });
        const isGold = this.props.modifier == MODIFIERS.Gold;
        const isSilver = this.props.modifier == MODIFIERS.Silver;
        const isWild = this.props.modifier == MODIFIERS.Wild;
        const isChip = this.props.modifier == MODIFIERS.Chip;
        const isMult = this.props.modifier == MODIFIERS.Mult;
        const isGlass = this.props.modifier == MODIFIERS.Glass;
        const isDebuffed = this.props.debuffed;
        element.style.transform = "translate(0,0)";
        element.style.transition = "";
        if (isGold) {
            element.classList.add("gold");
        }
        if(isWild) {
            element.classList.add("wild");
        }
        if (isSilver) {
            element.classList.add("silver");
        }
        if(isMult){
            element.classList.add("mult");
        }
        if(isChip){
            element.classList.add("chip");
        }
        if(isGlass){
            element.classList.add("glass");
        }
        if (isDebuffed) {
            element.classList.add("debuffed")
        }
        element.classList.remove("fade");
        return element;
    }
}