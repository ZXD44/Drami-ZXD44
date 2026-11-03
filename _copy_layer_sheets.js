const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BASE = __dirname;
const CHAR_DIR = path.join(BASE, 'character');
const OUT_DIR = path.join(BASE, 'client', 'static', 'characters', 'layers');

// Core animations needed for the game
const ANIMS = ['walk', 'idle', 'run'];

function findAnimFile(layerPath, anim) {
    const direct = path.join(CHAR_DIR, layerPath, `${anim}.png`);
    if (fs.existsSync(direct)) return direct;
    // Color variant subdirectory
    const subdir = path.join(CHAR_DIR, layerPath, anim);
    if (fs.existsSync(subdir) && fs.statSync(subdir).isDirectory()) {
        const files = fs.readdirSync(subdir).filter(f => f.endsWith('.png'));
        if (files.includes('white.png')) return path.join(subdir, 'white.png');
        if (files.length > 0) return path.join(subdir, files[0]);
    }
    return null;
}

function getLayerDefs(gender) {
    const common = {
        body: [{ id: 'default', path: `${gender}/body/bodies` }],
        head: [{ id: 'human', path: `${gender}/head/heads/human` }],
        face: [{ id: 'neutral', path: `${gender}/head/faces/neutral` }],
        hair: [
            { id: 'xlong', path: `${gender}/hair/xlong` },
            { id: 'flat_top_fade', path: `${gender}/hair/flat_top_fade` },
        ],
    };

    if (gender === 'male') {
        return {
            ...common,
            shirt: [
                { id: 'longsleeve', path: 'male/torso/clothes/longsleeve/longsleeve' },
                { id: 'longsleeve2', path: 'male/torso/clothes/longsleeve/longsleeve2' },
                { id: 'shortsleeve', path: 'male/torso/clothes/shortsleeve/shortsleeve' },
                { id: 'tshirt', path: 'male/torso/clothes/shortsleeve/tshirt' },
            ],
            pants: [
                { id: 'pants', path: 'male/legs/pants' },
                { id: 'shorts', path: 'male/legs/shorts/shorts' },
                { id: 'leggings', path: 'male/legs/leggings' },
            ],
            shoes: [
                { id: 'shoes_basic', path: 'male/feet/shoes/basic' },
                { id: 'boots_basic', path: 'male/feet/boots/basic' },
                { id: 'boots_fold', path: 'male/feet/boots/fold' },
                { id: 'sandals', path: 'male/feet/sandals' },
            ],
        };
    } else {
        return {
            ...common,
            shirt: [
                { id: 'longsleeve', path: 'female/torso/clothes/longsleeve/longsleeve' },
                { id: 'longsleeve2', path: 'female/torso/clothes/longsleeve/longsleeve2' },
                { id: 'shortsleeve', path: 'female/torso/clothes/shortsleeve/shortsleeve' },
                { id: 'blouse', path: 'female/torso/clothes/blouse' },
                { id: 'corset', path: 'female/torso/clothes/corset' },
            ],
            pants: [
                { id: 'pants', path: 'female/legs/pants' },
                { id: 'skirt_plain', path: 'female/legs/skirts/plain' },
                { id: 'skirt_slit', path: 'female/legs/skirts/slit' },
            ],
            shoes: [
                { id: 'shoes_basic', path: 'male/feet/shoes/basic' }, // shared from male
            ],
        };
    }
}

async function main() {
    console.log('=== Copy Full Layer Spritesheets ===\n');
    let total = 0;

    for (const gender of ['male', 'female']) {
        const gDir = path.join(OUT_DIR, gender);
        fs.mkdirSync(gDir, { recursive: true });
        const layers = getLayerDefs(gender);

        console.log(`--- ${gender.toUpperCase()} ---`);
        for (const [cat, items] of Object.entries(layers)) {
            for (const item of items) {
                for (const anim of ANIMS) {
                    const src = findAnimFile(item.path, anim);
                    const outName = `${cat}-${item.id}-${anim}.png`;
                    const outPath = path.join(gDir, outName);
                    if (src) {
                        fs.copyFileSync(src, outPath);
                        console.log(`  ✓ ${outName}`);
                        total++;
                    } else {
                        console.log(`  ✗ ${cat}-${item.id}-${anim}: not found`);
                    }
                }
            }
        }
        console.log('');
    }
    console.log(`\nDone! ${total} files copied.`);
}

main().catch(console.error);
