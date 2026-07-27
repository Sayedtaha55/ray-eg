const http = require('http');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Dev merchant login
  const loginResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/auth/dev-merchant-login',
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, '{}');
  const loginData = JSON.parse(loginResp.body);
  const token = loginData.token;
  console.log('Token:', token ? 'OK' : 'MISSING');

  // Get shop
  const shopResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/shops/me',
    method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
  });
  const shopData = JSON.parse(shopResp.body);
  const shopId = shopData.id;
  console.log('Shop ID:', shopId);

  // Create offer with 'name' field (as test does)
  const offerBody = JSON.stringify({
    name: 'Special Summer Sale',
    description: '20% off all products in our store!',
    discount: 20,
    shopId: shopId
  });
  const offerResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/offers',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, offerBody);
  console.log('\nOffer status:', offerResp.statusCode);
  console.log('Offer body:', offerResp.body.substring(0, 400));
}
main().catch(console.error);
