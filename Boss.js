export class Boss{
    constructor(name,description,effect,remove, props = {}){
        this.name = name;
        this.descriptionfn = description;
        this.effect = effect;
        this.remove = remove;
        this.moneyreward = props.moneyreward ?? 5;
        this.props = props;
        this.image = `./images/bosses/${props.image ? props.image.toLowerCase() : 'default'}.png`
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
        descriptionfn(game){
            return `Wszystkie ${game.fruits[0].icon} są zdebuffowane`;
        },
        effect(game){
            game.fruits[0].props.debuffed = true;
        },
        revert(game){
            game.fruits[0].props.debuffed = false;
        },
        props: {image: 'snake'}
    },
    {
        name: "Bear",
        descriptionfn(game){
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
        descriptionfn(game){
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
        descriptionfn(game){
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
        descriptionfn(game){
            return `Wszystkie ${game.fruits[4].icon} są zdebuffowane`;
        },
        effect(game){
            game.fruits[4].props.debuffed = true;
        },
        revert(game){
            game.fruits[4].props.debuffed = false;
        },
        props: {image: 'crab'}
    },
    {
        name: "Wave",
        descriptionfn(game){
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
export function rollBoss(game){
    let available = BossBlueprints.filter(c => 
            !game.bosses.some(boss => boss.name === c.name)
    );
    const pool = [...available];

    // Fisher–Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = new Boss(pool[0].name, pool[0].descriptionfn, pool[0].effect, pool[0].revert, pool[0].props);
    return picked;
}