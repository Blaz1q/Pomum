import { SCORE_ACTIONS, UPGRADE_STATES } from "../dictionary.js";

export const stickers=[
    {
        name: "Wieczny",
        descriptionfn(){
            return `Nie można sprzedać ulepszenia, ani go zniszczyć.`;
        },
        image: "eternal",
        effect(upgrade){
            upgrade.eternal = true;
        },
        weight: 0.1
    },
    {
        name: "Cieżki",
        descriptionfn(){
            return `Zajmuje 2 miejsca.`
        },
        image: "heavy",
        effect(upgrade) {
            upgrade.slots+=1;
        },
        weight: 0.2,
    },
    {
        name: "Chwilowy",
        descriptionfn: () => `Po 5 rundach ulepszenie deaktywuje się.`,
        image: "perishable",
        props: () => ({
            counter: 0,
            onRoundEnd() {
                this.counter++;
                if (this.counter >= 1&&this.upgrade.active) {
                    // Korzystamy z wstrzykniętych referencji
                    this.upgrade.deapply(this.game);
                    this.upgrade.active = false;
                    this.upgrade.UpgradeRenderer.update();
                    return { state: UPGRADE_STATES.Active, message: `Naura`, style: SCORE_ACTIONS.Info };
                }
            }
        }),
        weight: 0.2,
    },
    {
        name: "Wynajem",
        descriptionfn(){
            return `Na końcu rundy zabiera $3.`;
        },
        image: "rental",
        props: () => ({
            onRoundEnd() {
                this.game.money -= 3;
                this.game.GameRenderer.updateMoney(-3);
                return { state: UPGRADE_STATES.Active, message: `-$3`, style: SCORE_ACTIONS.Money };
            }
        }),
        weight: 0.4,
    },
    {
        name: "Bateria",
        descriptionfn(){
            return `Po 5 rundach ulepszenie aktywuje się`;
        },
        image: "battery",
        effect(upgrade){
            upgrade.deapply(game);
            upgrade.active = false;
            //upgrade.UpgradeRenderer.update();
        },
        props: ()=>({
            counter: 0,
            onRoundEnd(){
                this.counter++;
                if(this.counter>=1&&!this.upgrade.active){
                    this.upgrade.active = true;
                    this.upgrade.apply(this.game);
                    this.upgrade.UpgradeRenderer.update()
                }
            }
        }),
        weight: 0.3
    }
];