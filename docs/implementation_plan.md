# Character System Implementation Plan

## Overview
Rebuild the character system to use local LPC assets with real-time layer compositing and a character creation UI.

## Phase 1: Build Composited Sprites for Game
Use the `_build_sprites.js` Node script (with `sharp`) to composite all animation types for default characters.

### Animations needed:
| Animation | Columns | Used in game |
|---|---|---|
| walk | 9 | ✅ Movement |
| idle | 2 | ✅ Standing |
| run | 8 | ✅ Fast movement |
| slash | 6 | ✅ Melee attack |
| thrust | 8 | ✅ Spear attack |
| shoot | 13 | ✅ Bow attack |
| spellcast | 7 | ✅ Magic |
| hurt | 6 | ✅ Taking damage |
| sit | 5 | ✅ Sitting |
| jump | 6 | ✅ Jumping |

### Layers per character (bottom to top):
1. `body/bodies/` - Base skin
2. `head/heads/human/` - Head shape
3. `head/faces/neutral/` - Face/eyes
4. `legs/pants/` - Pants (MANDATORY - no naked!)
5. `torso/clothes/longsleeve/longsleeve/` - Shirt (MANDATORY)
6. `feet/shoes/basic/` - Shoes
7. `hair/[style]/` - Hair (where available)

## Phase 2: Update MainScene.ts
- Add all combat animation types
- Use layered Phaser Container for character rendering
- Support runtime layer swapping for customized characters

## Phase 3: Rebuild AvatarCreator.svelte
- Use LOCAL sprites from `client/static/characters/`
- Show live preview by compositing layers via CSS
- Options: Hair style, Hair color, Skin color, Clothes
- Always ensure clothes are on (pants + shirt minimum)

## Available Asset Options:
### Hair Styles: flat_top_fade, xlong
### Torso (Male): longsleeve, shortsleeve, sleeveless, vest, vest_open
### Torso (Female): blouse, longsleeve, shortsleeve, corset, robe, tunic
### Legs (Male): pants, shorts, leggings, skirts
### Legs (Female): pants, skirts
### Feet (Male): boots, shoes, sandals, slippers
### Feet (Female): armour, hoofs
