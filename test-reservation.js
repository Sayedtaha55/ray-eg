const http = require('http');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Login
  const loginResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/auth/dev-merchant-login',
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, '{}');
  const loginData = JSON.parse(loginResp.body);
  const token = loginData.accessToken;
  console.log('Token:', token ? 'OK' : 'MISSING');

  // Create reservation
  const reservationBody = JSON.stringify({
    shopId: 'dummy-shop-id',
    startTime: '2026-07-27T12:00:00Z',
    endTime: '2026-07-27T13:00:00Z',
    guests: 2,
    notes: 'Test reservation'
  });
  const resResp = await makeRequest({
    hostname: '127.0.0.1', port: 4000, path: '/api/v1/reservations',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, reservationBody);
  console.log('Reservation status:', resResp.statusCode);
  console.log('Reservation body:', resResp.body);
}
main().catch(console.error);
