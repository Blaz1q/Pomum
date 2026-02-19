import { Tarot } from "./upgradeBase.js";
export class Stats {
  constructor() {
    this.destroyedTiles = [];
    this.lastUsedTarot = null;
    this.moneySpent = 0;
    this.usedTarots = 0;
  }
  updateTarot(upgrade){
    if(upgrade instanceof Tarot){
        this.lastUsedTarot = upgrade;
        this.usedTarots++;
    }
  }
  setDestroyedTiles(matches) {
    matches.forEach((match) => {
      // 1. Szukamy, czy ten owoc (po ikonie) jest już w statystykach
      const existingStat = this.destroyedTiles.find(
        (s) => s.icon === match.icon,
      );

      if (existingStat) {
        // 2. Jeśli istnieje, po prostu zwiększamy licznik
        existingStat.count += 1;
      } else {
        // 3. Jeśli to nowy owoc w tej sesji, dodajemy go do tablicy
        this.destroyedTiles.push({
          icon: match.icon,
          count: 1,
        });
      }
    });
  }
  countAllDestroyed() {
    let sum = 0;
    this.destroyedTiles.forEach((tile) => {
      sum += tile.count;
    });
    return sum;
  }
}
