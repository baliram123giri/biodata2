import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://biodata99.com'
  
  const routes = [
    '',
    '/edit',
    '/templates',
    '/how-it-works',
    '/faqs',
    '/about-us',
    '/contact-us',
    '/privacy-policy',
    '/refund-policy',
    '/terms-conditions',
    '/blog',
    '/blog/how-to-write-matrimonial-biodata',
    '/blog/significance-of-cultural-symbols-marriage-biodata',
    '/blog/matrimonial-biodata-photo-tips',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/edit' || route.startsWith('/blog') ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : route === '/edit' ? 0.9 : route.startsWith('/blog') ? 0.8 : 0.7,
  }))
}
