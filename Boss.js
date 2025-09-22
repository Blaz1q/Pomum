export class Boss{
    constructor(name,description,effect,remove, props = {}){
        this.name = name;
        this.descriptionfn = description;
        this.effect = effect;
        this.remove = remove;
        this.moneyreward = props.moneyreward ?? 10;
        this.props = props;
    }
    description(game){
        if (typeof this.descriptionfn === "function") {
        return this.descriptionfn.call(this,game);
        }
        return this.descriptionfn;
    }
    apply(game) {
        this.effect.call(this, game); // this wewnątrz effect wskazuje na instancję
    }
    revert(game){
        this.remove.call(this,game);
    }
}
const BossBlueprints = [
    {
        name: "Snake",
        description(game){
            return `Wszystkie ${game.fruits[0].icon} są zdebuffowane`;
        },
        effect(game){
            game.fruits[0].props.debuffed = true;
        },
        revert(game){
            game.fruits[0].props.debuffed = false;
        }
    },
    {
        name: "Bear",
        description(game){
            return `Wszystkie ${game.fruits[1].icon} są zdebuffowane`;
        },
        effect(game){
            game.fruits[1].props.debuffed = true;
        },
        revert(game){
            game.fruits[1].props.debuffed = false;
        }
    },
    {
        name: "Sponge",
        description(game){
            return `Wszystkie ${game.fruits[2].icon} są zdebuffowane`;
        },
        effect(game){
            game.fruits[2].props.debuffed = true;
        },
        revert(game){
            game.fruits[2].props.debuffed = false;
        }
    },
    {
        name: "Vine",
        description(game){
            return `Wszystkie ${game.fruits[3].icon} są zdebuffowane`;
        },
        effect(game){
            game.fruits[3].props.debuffed = true;
        },
        revert(game){
            game.fruits[3].props.debuffed = false;
        }
    },
    {
        name: "Crab",
        description(game){
            return `Wszystkie ${game.fruits[4].icon} są zdebuffowane`;
        },
        effect(game){
            game.fruits[4].props.debuffed = true;
        },
        revert(game){
            game.fruits[4].props.debuffed = false;
        }
    },
    {
        name: "Wave",
        description(game){
            if(this.props.chosenFruit!=null)
                return `Najczęstrzy owoc (${this.props.chosenFruit.icon}) jest zdebuffowany.`;
            return `Najczęstrzy owoc jest zdebuffowany.`
        },
        effect(game){
            const fruit = game.getTopFruit();
            this.props.chosenFruit = fruit;
            fruit.props.debuffed = true;
        },
        revert(game){
            this.props.chosenFruit.props.debuffed = false;
        }
    }
];