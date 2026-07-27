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
  // Login as testcustomer
  const loginBody = JSON.stringify({ email: 'testcustomer@example.com', password: 'TestPassword123!' });
  const loginResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, loginBody);
  console.log('Login status:', loginResp.statusCode);
  console.log('Login body:', loginResp.body.substring(0, 200));
  console.log('Set-Cookie:', loginResp.headers['set-cookie']);
  
  const cookies = loginResp.headers['set-cookie'];
  const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
  console.log('Cookie string:', cookieStr);

  // Get shops/me
  const shopResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/shops/me',
    method: 'GET', headers: { 'Cookie': cookieStr }
  });
  console.log('\nShops/me status:', shopResp.statusCode);
  console.log('Shops/me body:', shopResp.body.substring(0, 200));

  // Create reservation
  const resBody = JSON.stringify({
    shopId: 'dummy-shop-id',
    dateTime: '2026-07-27T12:00:00Z',
    partySize: 2,
    notes: 'Test reservation'
  });
  const resResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/reservations',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookieStr }
  }, resBody);
  console.log('\nReservation status:', resResp.statusCode);
  console.log('Reservation body:', resResp.body.substring(0, 300));
}
main().catch(console.error);
