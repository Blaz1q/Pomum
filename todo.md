 # Boss rework
- [X] prop based constructor
- [X] event driven bosses (np. **onSpawn**, **onMatch**)


# UI
- [ ] dodanie wyglądu przechodzenia z rundy do rundy
- [X] zmiana wyglądu lewego panelu (tam gdzie jest boss, aby pokazywał gdzie aktualnie się znajdujemy)

# Skip
- [ ] pozwala skipnąć rundę aby coś dostać
- [ ] nie można skipować bossów

# Content
- [ ] vouchery
- [X] stworzenie nowych bossów

# Grafiki
- [X] fruit tycoon
- [ ] bomby
- [ ] dynamity

# Leaderboard
- [ ] można przewijać leaderboard (nie tylko top 10)
- [ ] twoje miejsce w leaderboardzie
- [ ] twój najlepszy wynik
- [ ] leaderboard w miesiącu, roku, all time
- [ ] twoje statystyki:
    - [ ] win rate
    - [ ] liczba rozgrywek

# Optymalizacja
- [X] rework render


# Sklep z przedmiotami
 - [ ] skiny do owoców
 - [ ] obramówki do boarda
 - [ ] punkty się dostaje za

# Issues
 - [X] kupowanie tarotów nie daje przycisków
 - [ ] circular dependencies:
1) entities/ConsumablePack.js > entities/Upgrade.js
2) entityData/consumablelist.js > entityData/upgradelist.js
3) UI/RenderUI.js > entityData/consumablelist.js > entityData/upgradelist.js > main.js
4) entityData/consumablelist.js > entityData/upgradelist.js > main.js
5) entityData/upgradelist.js > main.js
6) main.js > loadshaders.js
7) entityData/consumablelist.js > entityData/upgradelist.js > main.js > roll.js
8) entityData/upgradelist.js > main.js > roll.js