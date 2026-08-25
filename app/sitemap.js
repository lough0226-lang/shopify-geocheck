export default function sitemap() {
  const baseUrl = 'https://mygeocheck.com'

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-08-25'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/check`,
      lastModified: new Date('2026-08-25'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-08-25'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-08-25'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/success`,
      lastModified: new Date('2026-08-25'),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ]
}
