export type Stage = 'applied' | 'interview' | 'rejected' | 'offer';
export type Job = {
  id: string; title: string; company: string; city: string; mode: string;
  tags: string[]; description: string; url: string; source: string;
  published: string; demo?: boolean; demoScore?: number;
};
export type Profile = {
  name: string; role: string; city: string; remote: boolean; skills: string;
  english: string; swedish: string; permit: string; years: string;
  education: string; resume: string; tex: string; fileName: string;
};
export type Application = { jobId: string; stage: Stage; date: string; followUp: string; note: string };
export type Match = { score: number | null; reason: string; matched: string[]; missing: string[]; kind: 'keywords' | 'ai'; hardRequirements: 'pass' | 'fail' | 'unknown' };
export type State = { version: 1; jobs: Job[]; saved: string[]; skipped: string[]; applications: Application[]; profile: Profile; matches: Record<string, Match>; lastSync: string };
export const emptyProfile: Profile = { name: '', role: 'Frontend Developer', city: 'Stockholm', remote: true, skills: '', english: '', swedish: '', permit: '', years: '', education: '', resume: '', tex: '', fileName: '' };
export const stages: { id: Stage; label: string; color: string }[] = [
  { id: 'applied', label: '已投递', color: '#537a9b' }, { id: 'interview', label: '面试中', color: '#c28b3d' },
  { id: 'offer', label: '收到 Offer', color: '#31836a' }, { id: 'rejected', label: '已结束', color: '#92938e' },
];
export function safeUrl(value: string): string {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function dedupeJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter(job => { const key = [job.company, job.title, job.city].map(x => x.trim().toLowerCase()).join('|'); if (seen.has(key)) return false; seen.add(key); return true; });
}
export function mergeSyncedJobs(current: State, incoming: Job[]): Job[] {
  // Keep stable IDs for saved jobs and applications when another source describes the same opening.
  const retained = current.jobs.filter(job => job.source === '手动添加' || current.saved.includes(job.id) || current.applications.some(a => a.jobId === job.id));
  const latest = new Map(incoming.map(job => [job.id, job]));
  return dedupeJobs([...retained.map(job => latest.get(job.id) || job), ...incoming]);
}
export const knownSkills = ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Node.js', 'Python', 'Java', 'C++', 'C#', '.NET', 'SQL', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Figma', 'GraphQL', 'Terraform', 'Git', 'Go', 'Vue', 'Angular'];
export function hasSkill(text: string, skill: string): boolean {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9+#])`, 'i').test(text);
}
export function extractSkills(text: string) { return knownSkills.filter(skill => hasSkill(text, skill)); }
export function keywordMatch(profile: Profile, job: Job): Match {
  const skills = extractSkills(`${job.title} ${job.description} ${job.tags.join(' ')}`);
  const text = `${profile.skills} ${profile.resume}`;
  const matched = skills.filter(skill => hasSkill(text, skill));
  const missing = skills.filter(skill => !hasSkill(text, skill));
  return { score: skills.length ? Math.round(matched.length / skills.length * 100) : null,
    reason: skills.length ? `简历覆盖了 ${matched.length}/${skills.length} 个职位技能关键词。这不是综合匹配分；语言、学历、年限和工作许可仍需核实。` : '未识别到足够的技能关键词，请阅读职位原文。',
    matched, missing, kind: 'keywords', hardRequirements: 'unknown' };
}
export function isRecommended(match?: Match) { return Boolean(match && match.kind === 'ai' && match.hardRequirements === 'pass' && match.score !== null && match.score >= 90); }
export function isJobRecommended(job: Job, match: Match | undefined, demoMode: boolean) {
  return job.demo ? demoMode && (job.demoScore || 0) >= 90 : isRecommended(match);
}
