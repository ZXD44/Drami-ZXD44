
const fs = require('fs');
const path = require('path');

// Read the main metadata file
const content = fs.readFileSync('./item-metadata.js', 'utf8');

// Mock window object
const window = {};

// Evaluate the content to populate window.itemMetadata
try {
  eval(content);
} catch (e) {
  console.error("Error evaluating item-metadata.js", e);
  process.exit(1);
}

const itemMetadata = window.itemMetadata;
const items = {};

// Categories we WANT to keep (EQUIPMENT)
const includedCategories = [
  'arms', 'feet', 'legs', 'torso', 'shoulders', 'wrists', 
  'weapon', 'beards', 'hair', 'hat', 'headwear', 'neck', 
  'backpack', 'cape', 'dress', 'quiver', 'shield', 'bauldron', 'tool'
];

// Items we WANT to EXCLUDE (BODY PARTS)
const excludedPrefixes = ['body', 'shadow', 'wound', 'tail', 'wings', 'prosthesis', 'special', 'skeleton', 'zombie', 'lizard'];

Object.keys(itemMetadata).forEach(key => {
  const meta = itemMetadata[key];
  const typeName = meta.type_name;
  
  // Check if it's in an included category OR the key starts with an included category
  const isInIncluded = includedCategories.some(cat => key.startsWith(cat) || typeName === cat);
  
  // Double check it's not in excluded
  const isExcluded = excludedPrefixes.some(p => key === p || key.startsWith(p + '_') || typeName === p);
  
  if (isInIncluded && !isExcluded) {
    items[key] = meta;
  }
});

fs.writeFileSync('equipment-metadata.js', 'window.equipmentMetadata = ' + JSON.stringify(items, null, 2) + ';');
console.log('Successfully extracted equipment to equipment-metadata.js');
console.log('Total items extracted: ' + Object.keys(items).length);
