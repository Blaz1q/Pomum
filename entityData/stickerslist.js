export const stickers=[
    {
        name: "Wieczny",
        descriptionfn(){
            return `Nie można sprzedać ulepszenia, ani go zniszczyć.`;
        },
        image: "eternal"
    },
    {
        name: "Cieżki",
        descriptionfn(){
            return `Zajmuje 2 miejsca.`
        },
        image: "heavy"
    },
    {
        name: "Chwilowy",
        descriptionfn(){
            return `Po 5 rundach ulepszenie deaktywuje się.`
        },
        image: "perishable"
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
        image: "battery"
    }
];