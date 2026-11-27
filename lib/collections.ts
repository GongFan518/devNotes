import { allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'
import collections, { type CollectionConfig } from '@/data/collections'

export interface ResolvedCollection extends Omit<CollectionConfig, 'posts'> {
  posts: Blog[]
}

const bySlug = new Map(allBlogs.map((post) => [post.slug, post]))
const byTitle = new Map(allBlogs.map((post) => [post.title, post]))

function resolvePost(key: string): Blog | undefined {
  return bySlug.get(key) ?? byTitle.get(key)
}

/**
 * Resolve the hand-written config into real posts.
 * A key that matches nothing is a typo, not a crash: warn and skip it.
 */
export function getCollections(): ResolvedCollection[] {
  return collections.map((collection) => {
    const posts = collection.posts
      .map((key) => {
        const post = resolvePost(key)
        if (!post) {
          console.warn(
            `[collections] 合集「${collection.title}」里找不到文章：${key}（应填 slug 或完整标题）`
          )
        }
        return post
      })
      .filter((post): post is Blog => !!post && post.draft !== true)

    return {
      slug: collection.slug,
      title: collection.title,
      description: collection.description,
      imgSrc: collection.imgSrc,
      posts,
    }
  })
}

export function getCollection(slug: string): ResolvedCollection | undefined {
  return getCollections().find((collection) => collection.slug === slug)
}
