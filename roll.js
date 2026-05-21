import { MODIFIERS, Settings, DIFFICULTY } from "./dictionary.js";
import { consumableList, consumablePacks, coupons } from "./entityData/consumablelist.js";
import { ConsumablePack } from "./entities/ConsumablePack.js";
import { Voucher } from "./entities/Voucher.js";
import { upgradesList } from "./entityData/upgradelist.js";
import { Upgrade } from "./entities/Upgrade.js";
import { stickers } from "./entityData/stickerslist.js";
import { Sticker } from "./entities/Sticker.js";
import { Consumable } from "./entities/Consumable.js";
import { createEntity } from "./utils/UpgradeFactory.js";
import { Tarot } from "./entities/Tarot.js";


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
            const r = game.shopRand();
            if (r < 0.3) {
                up.changeModifier(game, MODIFIERS.Chip);
            } else if(r>0.3&&r<0.6){
                up.changeModifier(game, MODIFIERS.Polychrome);
            } else{
                up.changeModifier(game, MODIFIERS.Mult);
            }
        }
    }
    _drawFromPool(pool, count, factoryFn) {
        const results = [];
        const poolCopy = [...pool]; // Kopia, aby nie losować dwa razy tego samego

        for (let i = 0; i < count && poolCopy.length > 0; i++) {
            const entry = this.weightedPick(poolCopy, this.game.shopRand.bind(this));
            
            // Usuwamy z kopii puli, żeby uniknąć duplikatów w jednym losowaniu
            const idx = poolCopy.indexOf(entry);
            if (idx >= 0) poolCopy.splice(idx, 1);

            // Używamy przekazanej funkcji, aby stworzyć konkretny obiekt (Upgrade/Consumable)
            results.push(factoryFn(entry));
        }
        return results;
    }
    Shop(count = 3) {
        if (this.overstock) count += 1;

        // 1. Przygotuj pulę (filtry)
        let upPool = this.game.upgradeDedupe ? 
            upgradesList.filter(up => !this.game.upgrades.some(u => u._name === up.name)) : upgradesList;
        
        let conPool = this.game.upgradeDedupe ? 
            consumableList.filter(c => !this.game.consumables.some(pc => pc._name === c.name)) : consumableList;

        const fullPool = [...upPool, ...conPool];

        // 2. Losuj używając logiki fabrykującej
        return this._drawFromPool(fullPool, count, (entry) => {
            if (entry.type === "Upgrade") {
                const up = new Upgrade(entry);
                this.Modifier(up);
                this.Stickers(up, this);
                return up;
            } else if (entry.type === "Tarot") {
                return new Tarot(entry);
            }
            return new Consumable(entry);
        });
    }
    Upgrades(count = 3) {
        let available = upgradesList;
        if (this.upgradeDedupe) {
            available = available.filter(up => !this.game.upgrades.some(u => u._name === up.name));
        }

        return this._drawFromPool(available, count, (entry) => {
            const up = new Upgrade(entry);
            this.Modifier(up);
            this.Stickers(up, this);
            return up;
        });
    }

    Consumables(count = 3) {
        let available = consumableList;
        if (this.upgradeDedupe) {
            available = available.filter(c => !this.game.consumables.some(pc => pc._name === c.name));
        }

        return this._drawFromPool(available, count, (entry) => {
            return createEntity(entry);
        });
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
    Stickers(up) {
        const game = this.game;
        if (Settings.DIFFICULTY == DIFFICULTY.NORMAL) return;
        let available = stickers.filter((sticker, index) => index < Settings.DIFFICULTY.id - 1);
        let result = [];
        available.forEach(sticker => {
            if (sticker.weight > Math.random()) {
                const isBanned = result.some(alreadyAdded =>
                    sticker?.banned?.includes(stickers.indexOf(alreadyAdded))
                );
                if (!isBanned) result.push(sticker);
            }
        });
        let finalResult = [];
        result.forEach(props => {
            finalResult.push(new Sticker(props));
        });
        up.stickers = finalResult;
        up.applyStickers(game);
    }
    Vouchers(count = 1) {
        if (!coupons || coupons.length === 0) return [];

        // Get names of already owned vouchers
        const ownedNames = new Set(this.game.coupons.map(v => v._name));

        // Filter out owned vouchers
        const available = coupons.filter(v => !ownedNames.has(v.name));

        if (available.length === 0) return []; // player owns all vouchers

        const result = [];
        for (let n = 0; n < count; n++) {
            const item = this.weightedPick(available, this.game.voucherRand.bind(this));
            let coupon = new Voucher(item);
            result.push(coupon);

        }
        return result;
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
            return item.rarity?.weight ?? 1;
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