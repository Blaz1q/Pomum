export const stickers=[
    {
        name: "Wieczny",
        descriptionfn(){
            return `Nie można sprzedać ulepszenia, ani go zniszczyć.`;
        },
        image: "eternal",
        effect(upgrade){
            upgrade.eternal = true;
        }
    },
    {
        name: "Cieżki",
        descriptionfn(){
            return `Zajmuje 2 miejsca.`
        },
        image: "heavy",
        effect(upgrade) {
            upgrade.slots+=1;
        }
    },
    {
        name: "Chwilowy",
        descriptionfn(){
            return `Po 5 rundach ulepszenie deaktywuje się.`
        },
        image: "perishable",
        props: ()=>({
            counter: 0,
            onRoundEnd(){
                this.counter++;
                if(this.counter>=5){
                    upgrade.active = false;
                }
            }
        })
    },
    {
        name: "Wynajem",
        descriptionfn(){
            return `Na końcu rundy zabiera $3.`;
        },
        image: "rental"
    },
    {
        name: "Bateria",
        descriptionfn(){
            return `Po 5 rundach ulepszenie aktywuje się`;
        },
        image: "battery",
        props: ()=>({
            counter: 0,
            onRoundEnd(){
                this.counter++;
                if(this.counter>=5){
                    upgrade.active = true;
                }
            }
        })
    }
];