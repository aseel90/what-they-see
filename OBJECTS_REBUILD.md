# Objects Rebuild

This branch intentionally preserves `main` and replaces the camera loop with an object-seeding social simulation.

## Core rule
The player drags an object onto any living peep. There are no post-action dialogue choices. The society reacts autonomously through proximity, imitation, group identity, amplification, fear, protection and retaliation.

## Current object graph
- Hat: fashion / conformity. Can spread socially.
- Flower: empathy / cross-group bonds. Can pass from one peep to another and can de-escalate an armed peep.
- Coin: status / inequality / envy. Stacking coins on one peep makes the gap more visible.
- Badge: explicit group identity based on the original circle/square body types. Same-type peers recruit; opposite-type encounters increase tension.
- Megaphone: periodically amplifies whatever the holder currently represents (fashion, kindness, status, identity or force).
- Baton: seeds threat and can cause an actual assault when tension is high enough.
- Shield: unlocks after the first assault. It can stop a strike, but also encourages group clustering.

## Systemic outcomes
The simulation can currently end in social collapse, a high-cohesion care network, mass conformity, class stratification, segregation, or an armed truce. These are state-derived rather than selected by the player.

## Original character art
Prototype character art is loaded from the pinned Nicky Case `ncase/wbwwb` commit `7c68c7e44e66b5be95ebd07d22391de707090397`.

Nicky Case states in the upstream README that his code and art are released to the public domain under CC0. This branch only reuses the character art sheets needed for the prototype. It does not copy the upstream sounds; the current sound feedback is generated with Web Audio.

Upstream repository: `https://github.com/ncase/wbwwb`
