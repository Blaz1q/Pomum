export const GAME_TRIGGERS = {
    onSpawn: "spawnTile",
    onMatch: "match",
    onRoundEnd: "roundEnd",
    onRoundStart: "roundStart",
    onMove: "move",
    onUpgradeTriggered: "upgradeTrigger",
    onScore: "score"
};
export const TYPES = {
    Fruit: "fruit",
    Bomb: "bomb",
    Dynamite: "dynamite"
};
export const MODIFIERS = {
    None: "none",
    Gold: "gold",
    Silver: "silver"
};
export const STAGES = {
    Game: "game",
    Shop: "shop"
}
export const DURATIONS = {
    ANIMATION_DURATION: 3*60,
    SWIRL_DURATION: 5*60
}
export const UPGRADE_STATES = {
    Score: 1, // When Scoring
    Failed: 0,  // Triggered with no success
    Active: 2   // Effect active
}
export const COLORS = {
    gameOver: ["#b1b1b1ff","#cfcfcfff","#e6e6e6ff"],
    shopGreens: ["#3CB371", "#45D17A", "#58E78F"],
    magicPurples : ["#B266FF", "#C080FF", "#D299FF"],
    softBlues: ["#42C6FF", "#6AD1FF", "#8DE3FF"],
}
export const GAMECOLORS = {
    warmOranges: ["#FF8080","#FFCC80","#FFE5B2"],
sunsetCorals: ["#E25A4E", "#E67262", "#EB8B7E"],
    leafyGreens: ["#3E8E41", "#5CA25A", "#77B27B"],
    skyTurquoise: ["#2095A5", "#3EB1BC", "#65C7D1"],
    mellowYellows: ["#E6C148", "#F0D472", "#F8E28F"],
    berryPinks: ["#D45A87", "#E0759C", "#E892B3"],
    duskPurples: ["#6A4FA3", "#8364B5", "#9B82C6"],
    oceanBlues: ["#2F7CC2", "#4D91CE", "#6DA6DA"],
    emberOranges: ["#D6781A", "#E08E3B", "#E8A659"],
}