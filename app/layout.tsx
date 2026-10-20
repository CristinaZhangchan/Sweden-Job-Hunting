import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'JobMatch — 找到属于你的下一站', description: '你的瑞典 IT 求职工作台。发现机会，管理简历，跟进每一次申请。' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="zh-CN"><body>{children}</body></html>; }
