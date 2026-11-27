import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { getCollections } from '@/lib/collections'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const routes = ['', 'blog', 'collections', 'tags'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  // Collection pages, but not the per-article copies under /collections —
  // those declare the /blog URL as canonical.
  const collectionRoutes = getCollections().map((collection) => ({
    url: `${siteUrl}/collections/${collection.slug}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...collectionRoutes, ...blogRoutes]
}
