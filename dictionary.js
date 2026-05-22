export const GAME_TRIGGERS = {
    onSpawn: "spawnTile",
    onMatch: "match",
    onRoundEnd: "roundEnd",
    onRoundStart: "roundStart",
    onMove: "move",
    onUpgradeTriggered: "upgradeTriggered",
    onScore: "score",
    onUpgradesChanged: "UpgradesChanged",
    onConsumableUse: "ConsumableUse",
    onRetrigger: 'Retrigger',
    onReset: 'Reset',
    onBoosterBuy: 'BoosterBuy',
    onShopSpawn: 'ShopSpawn',
    onBuy: 'Buy'
};
export const TYPES = {
    Fruit: "fruit",
    Bomb: "bomb",
    Dynamite: "dynamite",
    Upgrade: "Upgrade",
    Consumable: "Consumable",
    Booster: "ConsumablePack",
    Voucher: "Voucher"
};
export const PRIORITY = {
    REPEAT: 0,
    NORMAL: 1,
    RETRIGGER: 2,
    BOSS: 3
}
export const MODIFIERS = {
    None: "none",
    Gold: "gold",
    Silver: "silver",
    Chip: "chip",
    Negative: "negative",
    Polychrome: "polychrome",
    Mult: "mult"
};
export const STAGES = {
    Game: "game",
    Shop: "shop",
    Boss: "boss"
}
export const SCORE_ACTIONS = {
    Mult: 'mult',
    XMult: 'xmult',
    Score: 'score',
    Money: 'money',
    Info: 'upgradeinfo',
    Failed: 'failed',
}
export const DURATIONS = {
    ANIMATION_DURATION: 3 * 60,
    SWIRL_DURATION: 5 * 60
}
export const UPGRADE_STATES = {
    Score: 1, // When Scoring
    Failed: 0,  // Triggered with no success
    Active: 2,   // Effect active
    Ready: 3,    // Upgrade is ready to do something
    Tried: 4     // Tried but failed.
}
export const DIFFICULTY = {
    NORMAL: {name: "ui.normal", id: 1},
    ETERNAL: {name: "ui.eternal", id: 2},
    HEAVY: {name: "ui.heavy", id: 3},
    BATTERY: {name: "ui.battery", id: 4},
    PERISHABLE: {name: "ui.perishable", id: 5},
    RENTAL: {name: "ui.rental", id: 6}
}
export const LANGUAGE = {
    PL: "PL-pl",
    EN: "EN-en"
}
export const UPGRADE_RARITY = {
    Common: { 
        display: 'Common', 
        weight: 20, 
        class: 'common' 
    },
    Uncommon: { 
        display: 'Uncommon', 
        weight: 11, 
        class: 'uncommon' 
    },
    Rare: { 
        display: 'Rare', 
        weight: 6, 
        class: 'rare' 
    },
    ConsumableCommon: { 
        display: 'Common', 
        weight: 1, 
        class: 'common' 
    },
    ConsumableRare: { 
        display: 'Rare', 
        weight: 0.7, 
        class: 'rare' 
    },
    PomumPackCommon: { 
        display: 'Common', 
        weight: 1, 
        class: 'common' 
    },
    PomumPackRare: { 
        display: 'Rare', 
        weight: 0.4, 
        class: 'rare' 
    },
    None: { 
        display: 'none', 
        weight: 0, 
        class: 'none' 
    }
};
// export const UPGRADE_RARITY = {
//     Common: { name: `Common`, display: `Common` },
//     Uncommon: { name: `Uncommon`, display: `Uncommon` },
//     Rare: { name: `Rare`, display: `Rare` },
//     ConsumableCommon: { name: `ConsumableCommon`, display: `Common` },
//     ConsumableRare: { name: `ConsumableRare`, display: `Rare` },
//     None: { name: 'none', display: 'none' },
//     PomumPackCommon: { name: `PomumPackCommon`, display: `none` },
//     PomumPackRare: { name: `PomumPackRare`, display: `none` }
// }
export const COLORS = {
    boss: {
        light: ["#737373ff", "#888888ff", "#a3a3a3ff"],
        dark: ["#4A4A4A", "#5C5C5C", "#707070"],
    },
    gameOver: {
        light: ["#b1b1b1ff", "#cfcfcfff", "#e6e6e6ff"],
        dark: ["#6E6E6E", "#858585", "#9C9C9C"],
    },
    gameWon: {
        light: ["#FFD700", "#FFDF33", "#FFEA70"],
        dark: ["#B8860B", "#D4A017", "#E6B800"], 
    },
    shopGreens: {
        light: ["#3CB371", "#45D17A", "#58E78F"],
        dark: ["#2E8B57", "#2FAE68", "#35C978"],
    },
    magicPurples: {
        light: ["#B266FF", "#C080FF", "#D299FF"],
        dark: ["#8A3DCC", "#9B4FE0", "#AD63F2"],
    },
    softBlues: {
        light: ["#42C6FF", "#6AD1FF", "#8DE3FF"],
        dark: ["#1E9ED6", "#2BB2E8", "#3CC6F5"],
    }
}
let darkModeMql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
export var Settings = {
    MIN_FALL_MS: 150,
    FALL_MS: 350,
    EMIT_TIMING_MS: 350,
    MIN_EMIT_MS: 150,
    DARK_MODE: darkModeMql && darkModeMql.matches,
    CELL_PX: 50,
    FADE_MS: 300,
    VOLUME: 1,
    PLAY_SOUND: true,
    LOW_GRAPHICS: false,
    OLD_FRUITS: false,
    LANGUAGE: LANGUAGE.PL,
    DIFFICULTY: DIFFICULTY.NORMAL,
    DOUBLECLICK: false,
}
export const GAMECOLORS = {
    warmOranges: {
        light: ["#FF8080", "#FFCC80", "#FFE5B2"],
        dark: ["#B34747", "#B38A47", "#C2A066"],
    },
    sunsetCorals: {
        light: ["#E25A4E", "#E67262", "#EB8B7E"],
        dark: ["#A63E35", "#B34A3E", "#C05A4C"],
    },
    leafyGreens: {
        light: ["#3E8E41", "#5CA25A", "#77B27B"],
        dark: ["#2C6B2F", "#3E7C3E", "#4F8C4F"],
    },
    skyTurquoise: {
        light: ["#2095A5", "#3EB1BC", "#65C7D1"],
        dark: ["#176D78", "#1F8894", "#2CA3AD"],
    },
    mellowYellows: {
        light: ["#E6C148", "#F0D472", "#F8E28F"],
        dark: ["#B3932F", "#C2A33F", "#D1B252"],
    },
    berryPinks: {
        light: ["#D45A87", "#E0759C", "#E892B3"],
        dark: ["#9E3E63", "#B24A72", "#C05A82"],
    },
    duskPurples: {
        light: ["#6A4FA3", "#8364B5", "#9B82C6"],
        dark: ["#4C3878", "#5B4690", "#6A55A8"],
    },
    oceanBlues: {
        light: ["#2F7CC2", "#4D91CE", "#6DA6DA"],
        dark: ["#1E5A91", "#2569A8", "#2E78BF"],
    },
    emberOranges: {
        light: ["#D6781A", "#E08E3B", "#E8A659"],
        dark: ["#A35412", "#B8651F", "#CC772B"],
    }
}
export class Style {
    static addClass(c,text){
        return `<b class='${c}'>${text}</b>`
    }
    static Mult(text) {
        return this.addClass('mult',text);
    }
    static XMult(text) {
        return this.addClass('xmult',text);
    }
    static Score(text) {
        return this.addClass('score',text);
    }
    static Moves(text) {  
        return this.addClass('moves',text);
    }
    static Chance(text) {
        return this.addClass("chance",text);
    }
    static Money(text) {
        return this.addClass('money',text);
    }
    static Highlight(text){
        return this.addClass('highlight',text);
    }
}