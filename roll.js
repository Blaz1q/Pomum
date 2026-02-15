import { UPGRADE_RARITY, MODIFIERS } from "./dictionary.js";
import { vouchers, consumablePacks } from "./consumable.js";
import { ConsumablePack } from "./upgradeBase.js";

export class Roll {
    constructor(game) {
        this.game = game;
    }
    Modifier(up, bonus = { negative: 0, modifier: 0 }) {
        let negativeBonus = this.game.bonusPercentage.negative;
        let modifierBonus = this.game.bonusPercentage.modifier;
        if (bonus?.negative > 0) {
            negativeBonus = bonus.negative;
        }
        if (bonus?.modifier) {
            modifierBonus = bonus.modifier;
        }
        if (game.shopRand() < (0.0075 + negativeBonus)) {
            up.changeNegative(game, true);
        }
        if (game.shopRand() < (0.05 + modifierBonus)) {
            if (game.shopRand() < 0.5) {
                up.changeModifier(game, MODIFIERS.Chip);
            } else {
                up.changeModifier(game, MODIFIERS.Mult);
            }
        }
    }
    tileModifier(tile) {
        let modifier = MODIFIERS.None;
        const goldChance = tile.props.upgrade.goldchance ?? 0;
        const silverChance = tile.props.upgrade.silverchance ?? 0;

        const isSilver = game.rand() * 100 < silverChance;
        const isGold = game.rand() * 100 < goldChance;

        if (isSilver) modifier = MODIFIERS.Silver;
        if (isGold) modifier = MODIFIERS.Gold; // gold nadpisuje silver jeśli oba trafione
        return modifier;
    }
    Vouchers(count = 1) {
        if (!vouchers || vouchers.length === 0) return [];

        // Get names of already owned vouchers
        const ownedNames = new Set(this.game.coupons.map(v => v.name));

        // Filter out owned vouchers
        const available = vouchers.filter(v => !ownedNames.has(v.name));

        if (available.length === 0) return []; // player owns all vouchers

        // Shuffle and pick `count` vouchers
        const shuffled = [...available].sort(() => this.game.voucherRand() - 0.5);
        return shuffled.slice(0, count);
    }
    ConsumablePacks(count = 2) {
        const game = this.game;
        console.log(consumablePacks.length);
        if (!consumablePacks.length) return [];
        const result = [];
        for (let n = 0; n < count; n++) {

            const item = this.weightedPick(consumablePacks, this.game.boosterRand.bind(this));
            let pack = new ConsumablePack(item);
            result.push(pack);
        }
        console.log(result);
        return result;
    }
    weightedPick = (list, rng) => {
        const getWeight = item => {
            return UPGRADE_RARITY[item.rarity?.name] ?? 1;
        };

        const total = list.reduce((sum, item) => sum + getWeight(item), 0);
        let roll = rng() * total;

        for (const item of list) {
            roll -= getWeight(item);
            if (roll <= 0) return item;
        }

        return list[list.length - 1];
    }
}