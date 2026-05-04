import { Consumable } from "../entities/Consumable.js";
import { ConsumablePack } from "../entities/ConsumablePack.js";
import { Tarot } from "../entities/Tarot.js";
import { Upgrade } from "../entities/Upgrade.js";
import { Voucher } from "../entities/Voucher.js";

export function createEntity(blueprint){
    if(!blueprint||blueprint.type==null) throw new Error("Blueprint is null or has no type.");
    switch(blueprint.type){
        case "Upgrade": 
            return new Upgrade(blueprint);
        case "Tarot": 
            return new Tarot(blueprint);
        case "Consumable": 
            return new Consumable(blueprint);
        case "ConsumablePack":
            return new ConsumablePack(blueprint);
        case "Voucher":
            return new Voucher(blueprint);
        default:
            throw new Error(`Unknown upgrade type: ${blueprint.type}`);
    }
}