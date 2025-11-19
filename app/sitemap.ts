import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Get articles for sitemap
  let articlePages: MetadataRoute.Sitemap = [];

  try {
    const response = await fetch(`${baseUrl}/api/articles?limit=1000`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      const articles = data.articles || [];

      articlePages = articles
        .filter((article: any) => article.is_published) // Only published articles
        .map((article: any) => ({
          url: `${baseUrl}/blog/${article.slug}`,
          lastModified: new Date(article.updated_at || article.published_at || article.created_at),
          changeFrequency: 'weekly' as const,
          priority: article.featured ? 0.8 : 0.6,
        }));
    }
  } catch (error) {
    console.error('Error generating article sitemap:', error);
  }

  // Get categories (if needed in future)
  // const categoryPages = [];

  return [...staticPages, ...articlePages];
}
