import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dedupeJobs, emptyProfile, hasSkill, isJobRecommended, isRecommended, keywordMatch, mergeSyncedJobs, safeUrl, type Match, type State } from '../lib/model';
import { demoJobs } from '../lib/demo';

test('unsafe application links cannot become clickable', () => {
  for(const url of ['javascript:alert(1)', 'data:text/html,hi', '/relative', 'not a url']) assert.equal(safeUrl(url), '');
  assert.equal(safeUrl('https://example.com/jobs/1'), 'https://example.com/jobs/1');
});
test('deduplication ignores case and whitespace but keeps different cities', () => {
  const first = demoJobs[0];
  assert.equal(dedupeJobs([first, { ...first, id: '2', company: ` ${first.company.toUpperCase()} ` }, { ...first, id: '3', city: 'Malmö' }]).length, 2);
});
test('skill matching does not match Java inside JavaScript or Go inside ongoing', () => {
  assert.equal(hasSkill('JavaScript developer', 'Java'), false);
  assert.equal(hasSkill('ongoing career', 'Go'), false);
  assert.equal(hasSkill('Java and Go developer', 'Java'), true);
});
test('punctuation-based technical skills work correctly', () => {
  for(const skill of ['C++', 'C#', '.NET', 'Next.js', 'Node.js']) assert.equal(hasSkill(`We need ${skill}, SQL.`, skill), true, skill);
});
test('keyword scores measure coverage and never certify hard requirements', () => {
  const match = keywordMatch({ ...emptyProfile, skills: 'React, TypeScript, Next.js' }, demoJobs[0]);
  assert.equal(match.score, 100);
  assert.equal(match.hardRequirements, 'unknown');
  assert.equal(isRecommended(match), false);
});
test('empty resume cannot earn keyword matches', () => {
  const match = keywordMatch(emptyProfile, demoJobs[0]);
  assert.equal(match.score, 0);
  assert.equal(match.matched.length, 0);
});
test('missing skill evidence is not reported as zero eligibility', () => {
  const match = keywordMatch(emptyProfile, { ...demoJobs[0], title: 'Architect', tags: [], description: 'Team leadership' });
  assert.equal(match.score, null);
  assert.equal(isRecommended(match), false);
});
test('only an AI score >=90 with passing hard requirements is recommended', () => {
  const match: Match = { score: 90, kind: 'ai', hardRequirements: 'pass', reason: '', matched: [], missing: [] };
  assert.equal(isRecommended(match), true);
  assert.equal(isRecommended({ ...match, score: 89 }), false);
  assert.equal(isRecommended({ ...match, hardRequirements: 'unknown' }), false);
  assert.equal(isRecommended({ ...match, hardRequirements: 'fail' }), false);
  assert.equal(isRecommended({ ...match, score: null }), false);
});
test('all demonstration jobs are explicitly marked and cannot link to real applications', () => {
  assert.ok(demoJobs.every(job => job.demo && job.source === '示例职位' && !job.url));
});
test('sync preserves IDs of tracked jobs when public source has a duplicate', () => {
  const job = { ...demoJobs[0], id: 'manual-1', demo: false, source: '手动添加' };
  const state: State = { version: 1, jobs: [job], saved: [job.id], applications: [{ jobId: job.id, stage: 'applied', date: '', note: '', followUp: '' }], skipped: [], matches: {}, profile: emptyProfile, lastSync: '' };
  const result = mergeSyncedJobs(state, [{ ...job, id: 'jobtech-123', source: 'JobTech' }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, job.id);
});
test('saved demos cannot enter real recommendations after synchronization', () => {
  assert.equal(isJobRecommended(demoJobs[0], undefined, true), true);
  assert.equal(isJobRecommended(demoJobs[0], undefined, false), false);
});
