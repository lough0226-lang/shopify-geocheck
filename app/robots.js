export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/report/'],
      },
      // AI retrieval/search crawlers — explicitly allow (critical for GEO)
      {
        userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot'],
        allow: '/',
        disallow: ['/api/', '/report/'],
      },
      {
        userAgent: ['Claude-SearchBot', 'ClaudeBot'],
        allow: '/',
        disallow: ['/api/', '/report/'],
      },
      {
        userAgent: ['PerplexityBot', 'Perplexity-User'],
        allow: '/',
        disallow: ['/api/', '/report/'],
      },
      {
        userAgent: ['Google-Extended', 'CCBot', 'Bytespider', 'AppleBot-Extended', 'anthropic-ai'],
        allow: '/',
        disallow: ['/api/', '/report/'],
      },
      // Good known bots
      {
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot'],
        allow: '/',
        disallow: ['/api/', '/report/'],
      },
    ],
    sitemap: 'https://mygeocheck.com/sitemap.xml',
    host: 'https://mygeocheck.com',
  }
}
