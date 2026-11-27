import { allBlogs } from 'contentlayer/generated'
import { slug } from 'github-slugger'

/**
 * 标签在 URL 里是小写化的 slug（CSS → css、Next.js → nextjs），
 * 但显示的应该是作者当初写的写法。这里从文章原始 tags 里找回它。
 *
 * 找不到（比如标签刚被删掉、只剩旧链接）时退回 slug 本身。
 */
export function getTagLabel(tagSlug: string): string {
  for (const post of allBlogs) {
    for (const tag of post.tags ?? []) {
      if (slug(tag) === tagSlug) return tag
    }
  }
  return tagSlug
}
