export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/report/'],
    },
    sitemap: 'https://mygeocheck.com/sitemap.xml',
  }
}
