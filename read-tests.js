const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/Dream/ray-eg-1/testsprite_tests/tmp/test_results.json', 'utf8'));
console.log('=== TC009 ===');
console.log(data[8].code);
console.log('\n=== TC004 ===');
console.log(data[3].code);
