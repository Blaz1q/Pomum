import { GAME_TRIGGERS,MODIFIERS,TYPES } from "./dictionary.js";
export class Tile {
    constructor(icon, type = TYPES.Fruit, props = {}) {
        this.icon = icon;
        this.type = type; // "fruit", "dynamite", "bomb"
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
    get percent(){
        return this.props.percent;
    }
    get detonations(){
        if(this.type==TYPES.Bomb||this.type==TYPES.Dynamite){
            return this.props.detonations;
        }
        return 0;
    }
    set percent(percent){
        if(this.type==TYPES.Fruit||this.type==TYPES.Dynamite){
            console.log("set:"+percent);
            this.props.percent = percent;
        }
    }
    set detonations(detonations){
        if(this.type==TYPES.Dynamite||this.type==TYPES.Bomb){
            this.props.detonations = detonations;
        }
    }
}