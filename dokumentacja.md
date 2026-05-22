```mermaid 
stateDiagram-v2
    [*] --> Game
    [*] --> loadShaders
    [*] --> UpgradeBase
    Game --> Stats
    Game --> sound
    Game --> Matches
    UpgradeBase --> Upgrade
    UpgradeBase --> Consumables
    Consumables --> Tarot
    Tarot --> Pact
    UpgradeBase --> Boosters
    UpgradeBase --> Vouchers
    UpgradeBase --> UpgradeRenderer
    UpgradeRenderer --> DragAndDrop
    Game --> TriggerManager
    TriggerManager --> Queue/PriorityQueue
    Game --> random
    Game --> RenderUI
    RenderUI --> animate_text
    Game --> roll
```