export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/report/', '/my-reports'],
      },
      // AI retrieval/search crawlers — explicitly allow (critical for GEO)
      {
        userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot'],
        allow: '/',
        disallow: ['/api/', '/report/', '/my-reports'],
      },
      {
        userAgent: ['Claude-SearchBot', 'ClaudeBot'],
        allow: '/',
        disallow: ['/api/', '/report/', '/my-reports'],
      },
      {
        userAgent: ['PerplexityBot', 'Perplexity-User'],
        allow: '/',
        disallow: ['/api/', '/report/', '/my-reports'],
      },
      {
        userAgent: ['Google-Extended', 'CCBot', 'Bytespider', 'AppleBot-Extended', 'anthropic-ai'],
        allow: '/',
        disallow: ['/api/', '/report/', '/my-reports'],
      },
      // Good known bots
      {
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot'],
        allow: '/',
        disallow: ['/api/', '/report/', '/my-reports'],
      },
    ],
    sitemap: 'https://mygeocheck.com/sitemap.xml',
    host: 'https://mygeocheck.com',
  }
}
