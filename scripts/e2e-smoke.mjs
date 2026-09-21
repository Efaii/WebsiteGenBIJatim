import XLSX from '@e965/xlsx';

const api = process.env.API_URL ?? 'http://127.0.0.1:5000';
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const backupEvidenceId = process.env.BACKUP_EVIDENCE_ID;
if (!username || !password) throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required.');
if (!backupEvidenceId) throw new Error('BACKUP_EVIDENCE_ID is required for the E2E import evidence chain.');

const request = async (path, options = {}) => {
  const response = await fetch(`${api}${path}`, options);
  const body = await response.json().catch(() => null);
  return { response, body };
};
const expectStatus = (result, status, label) => {
  if (result.response.status !== status) throw new Error(`${label}: expected ${status}, got ${result.response.status}: ${JSON.stringify(result.body)}`);
  return result.body?.data ?? result.body;
};

for (const path of ['/health', '/ready']) {
  const check = await request(path);
  expectStatus(check, 200, path);
  if (!check.body?.data || !check.body?.meta?.requestId) throw new Error(`${path} response envelope is invalid.`);
}
const login = await request('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) });
expectStatus(login, 200, 'CMS login');
const cookie = login.response.headers.get('set-cookie')?.split(';', 1)[0];
if (!cookie) throw new Error('CMS login did not issue a session cookie.');
if (!/;\s*httponly/i.test(login.response.headers.get('set-cookie') ?? '')) throw new Error('CMS session cookie is not HttpOnly.');
console.log('PASS readiness and ADMIN_GLOBAL login');

const masters = expectStatus(await request('/api/v1/masters'), 200, 'canonical masters');
const commissariat = masters[0];
const period = commissariat?.periods?.[0];
const division = period?.divisions?.[0];
if (!commissariat || !period || !division) throw new Error('E2E seed did not provide commissariat, period, and division masters.');
console.log('PASS canonical master reads');

const programDraft = expectStatus(await request('/api/v1/programs', { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ commissariatId: commissariat.id, periodId: period.id, divisionId: division.id, title: `E2E Program ${Date.now()}`, divisi: division.name, dateIso: '2026-10-01', format: 'Hybrid', description: 'E2E CMS program description', objectives: ['Validate CMS workflow'] }) }), 200, 'program create');
expectStatus(await request(`/api/v1/programs/${programDraft.id}/transition`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'SUBMITTED' }) }), 200, 'program submit');
expectStatus(await request(`/api/v1/programs/${programDraft.id}/transition`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED' }) }), 200, 'program approve');
const artifactForm = new FormData();
artifactForm.append('kind', 'proposal');
artifactForm.append('file', new Blob([new TextEncoder().encode('%PDF-1.7\nprivate proposal')], { type: 'application/pdf' }), 'proposal.pdf');
const artifact = expectStatus(await request(`/api/v1/programs/${programDraft.id}/artifacts`, { method: 'POST', headers: { cookie }, body: artifactForm }), 200, 'program artifact upload');
const artifactDownload = await request(`/api/v1/programs/${programDraft.id}/artifacts/${artifact.id}`, { headers: { cookie } });
if (!artifactDownload.response.ok || artifactDownload.body) throw new Error('Approved Program Kerja private artifact was not downloadable.');
console.log('PASS Program Kerja CMS lifecycle and private artifact access');

const rows = Array.from({ length: 101 }, (_, index) => ({ komisariat: commissariat.name, nama: `E2E Member ${index}`, jabatan: 'Staff', divisi: division.name, prodi: 'Teknik Informatika' }));
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'ALL');
const xlsx = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
const upload = new FormData();
upload.append('commissariatId', commissariat.id);
upload.append('periodId', period.id);
upload.append('file', new Blob([xlsx], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'e2e-membership.xlsx');
const preview = expectStatus(await request('/api/v1/membership-imports/preview', { method: 'POST', headers: { cookie }, body: upload }), 200, 'membership preview');
if (preview.totalRows !== 101) throw new Error(`Expected 101 preview rows, got ${preview.totalRows}`);
const rejectedLargeCommit = await request('/api/v1/membership-imports/commit', { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ previewId: preview.previewId }) });
expectStatus(rejectedLargeCommit, 400, 'large import guard');
const committed = expectStatus(await request('/api/v1/membership-imports/commit', { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ previewId: preview.previewId, confirmLargeImport: true, backupEvidenceId }) }), 200, 'membership commit');
expectStatus(await request(`/api/v1/membership-imports/${committed.previewId}/submit`, { method: 'POST', headers: { cookie } }), 200, 'membership submit');
expectStatus(await request(`/api/v1/membership-imports/${committed.previewId}/approve`, { method: 'POST', headers: { cookie } }), 200, 'membership approve');
const memberships = expectStatus(await request(`/api/v1/memberships?commissariatId=${commissariat.id}&periodId=${period.id}`), 200, 'public memberships');
if (memberships.length < 101 || memberships.some((item) => item.publicationStatus || item.password || item.sourceFileHash)) throw new Error('Membership public projection is empty or exposes private fields.');
console.log('PASS Membership preview/commit/submit/approve/publication and large-import evidence guard');

const programs = await request('/api/commissariats/proker');
const programList = Array.isArray(programs.body) ? programs.body : programs.body?.data;
if (!programs.response.ok || !programList?.length) throw new Error('Program kerja public list is unavailable or empty.');
const programDetail = await request(`/api/commissariats/proker/${programList[0].id}`);
if (!programDetail.response.ok) throw new Error(`Program kerja public detail returned ${programDetail.response.status}.`);
console.log('PASS Program kerja public list and detail');

const cover = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const newsForm = new FormData();
newsForm.append('title', `E2E News ${Date.now()}`);
newsForm.append('excerpt', 'E2E public excerpt');
newsForm.append('content', 'E2E public content');
newsForm.append('category', 'EDUKASI');
newsForm.append('cover', new Blob([cover], { type: 'image/jpeg' }), 'e2e.jpg');
const draft = expectStatus(await request('/api/v1/news', { method: 'POST', headers: { cookie }, body: newsForm }), 200, 'News create');
const stagedCmsNews = expectStatus(await request('/api/v1/news/cms', { headers: { cookie } }), 200, 'staged CMS News read');
const stagedAsset = stagedCmsNews.find((item) => item.id === draft.id)?.coverAssets?.[0];
if (!stagedAsset?.storageKey?.startsWith('staged/')) throw new Error('News draft did not create a private staged artifact.');
if ((await request(`/uploads/${stagedAsset.storageKey}`)).response.status !== 404) throw new Error('Staged News artifact was publicly accessible before publication.');
expectStatus(await request(`/api/v1/news/${draft.id}/transition`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'SUBMITTED' }) }), 200, 'News submit');
expectStatus(await request(`/api/v1/news/${draft.id}/transition`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED' }) }), 200, 'News approve');
const published = expectStatus(await request(`/api/v1/news/${draft.id}/transition`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'PUBLISHED' }) }), 200, 'News publish');
const publicNews = expectStatus(await request(`/api/v1/news/${published.slug}`), 200, 'public News projection');
if (!publicNews.coverImage?.startsWith('/uploads/news/')) throw new Error('Published News did not expose a public cover projection.');
if ((await request(publicNews.coverImage)).response.status !== 200) throw new Error('Published News cover is not served from public storage.');
if ((await request('/private/uploads/news')).response.status !== 404) throw new Error('Private storage root was publicly mounted.');
console.log('PASS News create-to-publish, public projection, and private artifact denial');

expectStatus(await request('/api/v1/auth/logout', { method: 'POST', headers: { cookie } }), 200, 'logout');
if ((await request('/api/v1/news/cms', { headers: { cookie } })).response.status !== 401) throw new Error('Revoked CMS session remained usable.');
console.log('PASS logout and session revocation');
