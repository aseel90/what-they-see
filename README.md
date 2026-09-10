# What They See / ما يرونه

Mobile-first landscape social-observation game prototype.

## Prototype 0.2

The player is a photographer/editor whose framing and headlines change how a simulated city behaves.

### Play loop

1. Observe multi-character events in the city.
2. Move and resize the camera frame.
3. Capture a composition. The same event produces a different story when one actor, both actors, or the surrounding crowd is in-frame.
4. Choose how to publish: truthful, sensational, misleading, analytical, etc.
5. Watch reach, comments and consequences.
6. NPC fame, reputation, attention-seeking, anger and social behavior change based on publication history.
7. Complete seven posts and receive an ending based on Trust, Tension and Hype.

### Implemented systems

- Arabic-first RTL UI.
- Landscape 16:9 gameplay and phone rotation prompt.
- Procedurally animated characters with multiple states and accessories.
- Multi-actor event system: argument, lost wallet, helping, prank, street performance, selfie/fame.
- Camera composition analysis and three framing sizes.
- Context/truth meter calculated by visible actors.
- Branching Arabic headlines per composition.
- Reach, shares, follower growth, comments and persistent society stats.
- Persistent NPC fame/reputation/attention/anger effects.
- Consequence events seeded by prior publications.
- Dynamic missions, streaks and multiple end-of-day outcomes.
- Canvas-only renderer, no third-party runtime dependencies.

## Run locally

Serve the repository root with any static web server and open `index.html` in a landscape browser.