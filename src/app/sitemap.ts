import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 86400; // Cache and revalidate sitemap every 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://biodata99.com'
  
  const staticRoutes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/edit', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/biodata-templates', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/muslim-biodata-format', changeFrequency: 'daily' as const, priority: 0.85 },
    { path: '/marathi-biodata-maker', changeFrequency: 'daily' as const, priority: 0.85 },
    { path: '/how-it-works', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/faqs', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/about-us', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/contact-us', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/privacy-policy', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/refund-policy', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/terms-conditions', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/blog', changeFrequency: 'daily' as const, priority: 0.8 },
  ]

  const mappedStatic = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        slug: true,
        updatedAt: true,
        language: true,
      },
    })

    const dynamicRoutes = posts.flatMap((post) => {
      const lastMod = post.updatedAt ? new Date(post.updatedAt) : new Date();

      const routes = [
        {
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: lastMod,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }
      ];

      return routes;
    })

    return [...mappedStatic, ...dynamicRoutes]
  } catch (error) {
    console.error("Error generating sitemap dynamic routes:", error)
    return mappedStatic
  }
}
