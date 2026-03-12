console.log("Tile");
import { GAME_TRIGGERS, MODIFIERS, Settings, TYPES } from "../dictionary.js";
export class Tile {
    constructor(props = {}) {
        if (props instanceof Tile) {
            this.constructorTILE(props);
            return;
        }
        this.url = `./images/tiles/`;
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
        this.imagename = Tile.imagename;
        console.log(Tile);
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
        if (this.props.debuffed) g.classList.add("debuffed");

        return g;
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
        const isDebuffed = this.props.debuffed;
        element.style.transform = "translate(0,0)";
        element.style.transition = "";
        if (isGold) {
            element.classList.add("gold");
        }
        if (isSilver) {
            element.classList.add("silver");
        }
        if (isDebuffed) {
            element.classList.add("debuffed")
        }
        element.classList.remove("fade");
        return element;
    }
}