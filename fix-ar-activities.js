const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'i18n/locales/ar.json');
const data = JSON.parse(fs.readFileSync(arPath, 'utf8'));

data.business.activities = {
  fashion: 'Fashion & Clothing',
  restaurant: 'Restaurant',
  retail: 'Retail',
  electronics: 'Electronics',
  health: 'Health & Medicine',
  service: 'Services',
  gallery: 'Gallery',
  pos: 'POS',
  products: 'Products',
  medicines: 'Medicines',
  invoices: 'Invoices'
};

fs.writeFileSync(arPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated ar.json activities');
