console.log("Tile");
import { GAME_TRIGGERS, MODIFIERS, TYPES } from "./dictionary.js";
export class Tile {
    constructor(props = {}) {
        if (props instanceof Tile) {
            this.constructorTILE(props);
            return;
        }
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
}