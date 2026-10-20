import { Job } from './model';
// Fictional openings for interaction previews, never presented as live vacancies.
const rows = [
  ['Northstar', 'Senior Frontend Developer', 'Stockholm', '混合办公', ['React', 'TypeScript', 'Next.js'], 98],
  ['Forma', 'Full Stack Engineer', 'Stockholm', '混合办公', ['TypeScript', 'Node.js', 'PostgreSQL'], 96],
  ['Evergreen', 'Frontend Engineer', 'Göteborg', '远程办公', ['React', 'JavaScript', 'GraphQL'], 94],
  ['Orbit', 'Software Engineer · Platform', 'Stockholm', '混合办公', ['Python', 'AWS', 'Docker'], 92],
  ['Studio Nord', 'Creative Frontend Developer', 'Malmö', '现场办公', ['React', 'Figma', 'TypeScript'], 91],
  ['Luma', 'Full Stack Developer', 'Göteborg', '远程办公', ['Vue', 'Node.js', 'SQL'], 88],
] as const;
export const demoJobs: Job[] = rows.map((r, i) => ({ id: `demo-${i}`, company: r[0], title: r[1], city: r[2], mode: r[3], tags: [...r[4]], demoScore: r[5], source: '示例职位', published: '', url: '', demo: true,
  description: `这是用于体验 JobMatch 的虚构职位，不代表 ${r[0]} 的真实招聘。\n\nAbout the role\nBuild thoughtful digital experiences with a small, collaborative engineering team in Sweden. You will own features from idea to production and contribute to a supportive code review culture.\n\nWhat you will work on\n• Build accessible, responsive interfaces and reliable services.\n• Collaborate with product designers and engineers.\n• Improve application performance and write meaningful tests.\n\nSkills in this example\n${r[4].join(', ')}. Professional working English.\n\n请点击「同步公开职位」获取真实招聘信息。示例分数只用于展示界面。` }));
