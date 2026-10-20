import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET } from '../app/api/jobs/route';
const hit = { id: '123', headline: 'React Developer', occupation_field: { concept_id: 'apaJ_2ja_LuF' }, employer: { name: 'Example AB' }, workplace_address: { municipality: 'Stockholm' }, description: { text: 'React, TypeScript and SQL' }, webpage_url: 'https://arbetsformedlingen.se/platsbanken/annonser/123', application_details: { url: 'javascript:alert(1)' }, publication_date: '2026-10-14T10:00:00' };
test('JobTech adapter keeps IT roles, deduplicates and sanitizes links', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(new URL(String(url)).searchParams.get('occupation-field'), 'apaJ_2ja_LuF');
    return Response.json({ hits: [hit, { ...hit, id: '124' }, { ...hit, id: '125', removed: true }, { ...hit, id: '126', occupation_field: { concept_id: 'other' } }], total: { value: 4 } });
  };
  try { const response = await GET(new NextRequest('http://localhost/api/jobs')); const data = await response.json(); assert.equal(response.status, 200); assert.equal(data.jobs.length, 1); assert.equal(data.jobs[0].url, hit.webpage_url); assert.deepEqual(data.jobs[0].tags, ['React', 'TypeScript', 'SQL']); assert.equal(data.jobs[0].demo, undefined); }
  finally { globalThis.fetch = original; }
});
test('upstream outage returns an error, never fake successful jobs', async () => {
  const original = globalThis.fetch; globalThis.fetch = async () => new Response('', { status: 503 });
  try { const response = await GET(new NextRequest('http://localhost/api/jobs')); assert.equal(response.status, 502); const data = await response.json(); assert.ok(data.error); assert.equal(data.jobs, undefined); }
  finally { globalThis.fetch = original; }
});
