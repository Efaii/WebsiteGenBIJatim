const api = process.env.API_URL ?? 'http://localhost:5000';

const checks = [
  ['/health', 200],
  ['/ready', 200],
];

const request = async (path, options = {}) => {
  const response = await fetch(`${api}${path}`, options);
  const body = await response.json().catch(() => null);
  return { response, body };
};

for (const [path, expected] of checks) {
  const { response, body } = await request(path);
  if (response.status !== expected) throw new Error(`${path}: expected ${expected}, got ${response.status}`);
  if (!body?.data || !body?.meta?.requestId) throw new Error(`${path}: invalid response envelope`);
  console.log(`PASS ${path}`);
}

const { response: proker, body: prokerBody } = await request('/api/commissariats/proker');
if (!proker.ok) throw new Error(`/api/commissariats/proker: ${proker.status}`);
const prokerData = Array.isArray(prokerBody?.data) ? prokerBody.data : prokerBody;
if (!Array.isArray(prokerData) || prokerData.length === 0) throw new Error('/api/commissariats/proker returned no seeded records');
console.log('PASS /api/commissariats/proker');

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
if (!username || !password) throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required for the CMS smoke flow');
const login = await request('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ username, password }),
});
if (!login.response.ok) throw new Error(`/api/v1/auth/login: ${login.response.status}`);
const cookie = login.response.headers.get('set-cookie')?.split(';', 1)[0];
if (!cookie) throw new Error('CMS login did not issue an HttpOnly session cookie');
console.log('PASS /api/v1/auth/login');

const cms = await request('/api/v1/news/cms', { headers: { cookie } });
if (!cms.response.ok) throw new Error(`/api/v1/news/cms: ${cms.response.status}`);
console.log('PASS authenticated CMS read');

const logout = await request('/api/v1/auth/logout', { method: 'POST', headers: { cookie } });
if (!logout.response.ok) throw new Error(`/api/v1/auth/logout: ${logout.response.status}`);
const revoked = await request('/api/v1/news/cms', { headers: { cookie } });
if (revoked.response.status !== 401) throw new Error(`revoked CMS session returned ${revoked.response.status}`);
console.log('PASS session revocation and logout');
