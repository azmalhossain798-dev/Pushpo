# Pushpo engagement review — 2026-10-21

Research and design recommendations only. No game code, balance, assets or deployed files changed. Proposed timings are playtest hypotheses, not measured retention results.

## Diagnosis from the current implementation

Pushpo has a distinctive location, an adult supernatural protagonist, a mysterious golden fish, a living city and a clear revenge story. Its current repeatable activity is walk → use Sight → hold Attack / dodge → earn points → unlock a boss. Environment variety currently exceeds gameplay variety.

Evidence: `pushpo-demo/dist/engine-v3.mjs` defines fixed 35-damage strikes on a 0.4-second cooldown, four active enemies, two simultaneous attackers and a 235-unit player speed. Regular enemies move at 76–105 units and bosses at 105–122. Bosses differ numerically but share chase, windup and circular strike logic. `game-v3.mjs` supports holding Attack and has no run upgrade selection. `README.md` documents health carried across chapters, no kill healing, timer resets, and full restart on defeat. This is a source/design assessment; no fresh hands-on playtest or retention study was performed.

Likely friction:
- Holding the same attack remains effective; limited incentive to discover combinations or timing.
- Bigger boss health bars extend an encounter without introducing a different problem to solve.
- Random positions vary the route more than the strategy.
- Sight is primarily an identification/cooldown action rather than a developing signature mechanic.
- Points separate the player from story beats; there are few discoveries between thresholds.
- A large city and sparse confirmed threats can create uneventful travel.
- Three separate 15-minute chapter windows permit a long session, with no saved story progress and no recovery from accumulated damage.

## Comparisons: verified mechanics and lessons for Pushpo

| Reference | What its official description establishes | Gap in Pushpo / adaptation |
| --- | --- | --- |
| [10 Minutes Till Dawn — developer's browser game](https://flanne.itch.io/10-minutes-till-dawn) | Short sessions and selectable upgrades that create different builds each run. | Different enemy positions do not create a different Pushpo build. Offer a small, synergistic fish-power selection. |
| [Brotato — developer/publisher store listing](https://store.steampowered.com/app/1942280/Brotato/) | 20–90-second waves, build customization and shopping between waves. | Pushpo needs frequent changes of situation and reward. Borrow the rhythm of encounters and choices without adding hordes to the civilian city. |
| [Hades — developer/publisher store listing](https://store.steampowered.com/app/1145360/Hades/) | Boon choices, story revealed across attempts and permanent progression. | Failure can still uncover a memory or unlock a new option; bosses should test learned combat skills. |
| [Streets of Rogue — developer/publisher store listing](https://store.steampowered.com/app/512900/Streets_of_Rogue/) | A functioning city, missions and different solutions using traits, items and the environment. | Pushpo's NPCs mostly provide atmosphere. Let a few existing residents offer useful intel, services and routes. |
| [Vampire Survivors — developer site](https://poncle.games/vampire-survivors) | Survival runs and gold spent on upgrades for later attempts. | Give runs an arc of growing capability and a useful outcome even when the player loses. Keep Pushpo's targeted combat identity. |

These are design comparisons, not proof that copying a mechanic will improve retention.

## Ranked suggestions

| Rank | Change | Concrete first version | Expected contribution | Relative scope |
| --- | --- | --- | --- | --- |
| 1 | More expressive combat | A three-hit sequence using the same Attack button, a brief stagger on its finisher, and a perfect-dodge counter. Add short hit-stop, clear reactions and layered impact audio, with reduced-motion support. | Timing and mastery replace stationary attack repetition. | Medium |
| 2 | Choices during the run | Start with six fish blessings; offer three at a time. Examples: a counter sends a golden wave; a dash leaves a slowing wake; Sight reveals tracks; the combo finisher has a wider arc. Favor changed behavior over small stat percentages. | Players can try a different combination next run. | Medium |
| 3 | Strong opening and encounter pacing | Teach movement, Sight, one dodge and one counter through a brief first encounter. Test first upgrade at 30–45 seconds and a meaningful encounter/discovery every 20–40 seconds; preserve the four-enemy/two-attacker cap. | Players reach the interesting part quickly and have fewer empty walks. | Medium |
| 4 | Distinct enemy and boss tactics | Regular archetypes: lunging attacker, blocking opponent and ranged threat, independent of crime label. Sumon uses a telegraphed charge with recovery; Hafizur controls space with sweeps; Sohel feints and changes tempo at half health. | Each fight asks a different question; health is not the main difficulty increase. | Large |
| 5 | Investigation between point gates | Keep the 150 additional combat-point requirement after Sumon. Attach small clue discoveries to progress: a witness lead, a memory fragment, a named hideout. Use Sight to follow short supernatural tracks or reveal evidence. | Combat advances a mystery instead of only filling a meter. | Medium |
| 6 | Risk-and-reward opportunities | Optional 30–60-second events: intercept a fleeing confirmed target, protect a witness or defeat an elite. State the reward beforehand; allow declining. Rewards can be a blessing choice or a clue. | Creates memorable decisions and varied local objectives. | Medium |
| 7 | Useful city interactions | Reuse a tea seller for intel, a pharmacy for one limited bandage per chapter, and a resident for a shortcut. Keep most civilian activity ambient. No healing on kills. | The Dhaka setting affects the player's plan and offers recovery choices. | Medium |
| 8 | Better retry structure | Save completed story chapters locally in Story mode. Preserve full-reset pressure in Challenge mode. Save discovered memories and unlock alternative starting blessings; avoid unlimited permanent damage inflation. | Failure costs less repetition and the next attempt offers something new. | Medium |
| 9 | Fight readability and sound | Reduce decoration contrast near combat, improve enemy silhouettes and telegraphs, provide directional danger cues and distinct ready/hit/dodge sounds. Preserve Pushpo's approved appearance. | Helps phone players understand danger and appreciate successful actions. | Small–medium |
| 10 | Replay challenges after the core works | Seeded challenge runs, personal bests and clear objectives such as perfect-dodge mastery or finding all clues. | Provides goals beyond the first story completion. | Small–medium |

The proposed recovery, save and mission systems change existing rules and need a design choice before implementation. Preserve supernatural-confirmed identities, civilian protection, the adult character, no graphic assault depiction and the fish's unknown identity.

## Suggested first experiment

Build a five-minute section inside the existing district: one short introduction, three enemy behaviors, six blessings, two optional events and a redesigned Sumon encounter. Keep the current 15-minute upper limit while targeting a first boss encounter around minutes 3–5. The timings must be tuned against the existing scoring requirement rather than silently changing it.

Example sequence: arrive at Mirpur 10 → sense a disturbance → reveal a confirmed offender → dodge and counter → choose a blessing → follow a witness clue → decide whether to intercept an optional elite → combine powers → confront Sumon. Save his completed chapter in the proposed Story mode.

Start implementation in this order: combat response and timing → one meaningful upgrade choice → encounter pacing → Sumon's unique pattern → a short clue chain. Expand only after that section is enjoyable.

## Validation before expanding

Compare the current demo with the experiment using 5–10 fresh players on phones and desktop. Ask whether they know the next goal and can explain why they took damage. Record first meaningful encounter, first upgrade, idle travel, damage readability, chapter completion and voluntary immediate replay. Ask what they want to try differently next time. Use local opt-in test logs; do not add production analytics for this review. A small test reveals problems and preferences; it does not prove population-wide retention gains.

The desired result is a player who can say what they learned, what combination they want to try, and which mystery they want to uncover next. Additional map size, larger enemy counts, multiplayer and daily reward systems should wait until that core experience works.
