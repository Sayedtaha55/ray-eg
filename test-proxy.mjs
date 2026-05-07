fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
}).then(r => {
  console.log('Status:', r.status, 'CT:', r.headers.get('content-type'));
  return r.text();
}).then(t => console.log('Body:', t.substring(0, 300))).catch(e => console.error(e.message));
