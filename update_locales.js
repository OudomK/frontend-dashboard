const fs = require('fs');

const addKeys = (f, k) => {
  let d = JSON.parse(fs.readFileSync(f, 'utf8'));
  Object.assign(d, k);
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
};

addKeys('locales/en.json', {
  'art.publish': 'Publish',
  'art.unpublish': 'Unpublish',
  'art.markFeatured': 'Mark as Featured',
  'art.removeFeatured': 'Remove Featured'
});

addKeys('locales/km.json', {
  'art.publish': 'បោះផ្សាយ',
  'art.unpublish': 'ឈប់បោះផ្សាយ',
  'art.markFeatured': 'ដាក់ជា Featured',
  'art.removeFeatured': 'ដកចេញពី Featured'
});

console.log('Action translations added');
