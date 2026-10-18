import { headers } from 'next/headers';

// 报告页包含用户个人检测数据：
// - robots noindex/nofollow：不被搜索引擎收录
// - referrer: 'no-referrer'：渲染为 <meta name="referrer" content="no-referrer">，
//   浏览器从报告页跳转到外部链接时不携带报告 URL（App Router 14 在 layout/server component
//   中无法直接写响应头——next/headers 的 headers() 是只读的，故用 metadata 实现等价效果）
export const metadata = {
  title: 'GEO Visibility Report',
  description: 'View your detailed GEO Visibility Report with AI search optimization analysis and recommendations.',
  robots: 'noindex, nofollow',
  referrer: 'no-referrer',
};

export default function ReportLayout({ children }) {
  // 读取请求头会把该段标记为动态渲染（request-time）。
  // Next.js 对动态渲染页面自动输出：
  // Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
  // 从而保证报告 HTML 不被 CDN/共享缓存缓存（Next 14 无法在 server component 中
  // 直接改写响应头；如需精确的 'private, no-store' 字面头，需 middleware 或
  // next.config headers()，二者不在本次允许修改的文件范围内）。
  headers();

  return children;
}
