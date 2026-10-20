import { NextRequest, NextResponse } from 'next/server';
import { dedupeJobs, extractSkills, safeUrl, type Job } from '@/lib/model';
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.slice(0, 120) || '';
  const url = new URL('https://jobsearch.api.jobtechdev.se/search');
  url.searchParams.set('occupation-field', 'apaJ_2ja_LuF');
  url.searchParams.set('limit', '100');
  url.searchParams.set('sort', 'pubdate-desc');
  if(q) url.searchParams.set('q', q);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000), next: { revalidate: 300 }, headers: { Accept: 'application/json' } });
    if(!response.ok) throw new Error(`公开职位源返回 ${response.status}`);
    const data = await response.json();
    if(!Array.isArray(data.hits)) throw new Error('职位源的数据格式发生变化');
    const jobs: Job[] = data.hits.filter((x: any) => !x.removed && x.occupation_field?.concept_id === 'apaJ_2ja_LuF').map((x: any) => ({
      id: `jobtech-${x.id}`, title: x.headline || 'Untitled', company: x.employer?.name || '未提供公司',
      city: x.workplace_address?.municipality || x.workplace_address?.city || 'Sweden',
      mode: x.workplace_model?.label || '办公方式未注明', description: x.description?.text || '',
      tags: extractSkills(`${x.headline} ${x.description?.text || ''}`).slice(0, 6),
      url: safeUrl(x.application_details?.url || '') || safeUrl(x.webpage_url || ''),
      published: x.publication_date || '', source: 'JobTech · Platsbanken',
    }));
    return NextResponse.json({ jobs: dedupeJobs(jobs), total: data.total?.value || jobs.length, syncedAt: new Date().toISOString() });
  } catch(e) { return NextResponse.json({ error: e instanceof Error ? e.message : '职位同步失败，请稍后重试' }, { status: 502 }); }
}
