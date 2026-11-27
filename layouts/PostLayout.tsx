import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { dottedDate } from '@/components/format'

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  /** Set when the article is read inside a curated collection. */
  collection?: { slug: string; title: string; position: number; total: number }
  children: ReactNode
}

export default function PostLayout({
  content,
  authorDetails,
  next,
  prev,
  collection,
  children,
}: LayoutProps) {
  const { path, slug, date, title, tags, summary } = content
  const basePath = path.split('/')[0]
  const author = authorDetails?.[0]?.name
  // Giscus only renders once its repository is configured; hide the empty block until then.
  const commentsReady =
    siteMetadata.comments?.provider &&
    (siteMetadata.comments.provider !== 'giscus' || !!process.env.NEXT_PUBLIC_GISCUS_REPO)

  return (
    <>
      <ScrollTopAndComment />
      <article className="k-article">
        <header className="k-article-head">
          <div className="k-article-meta">
            <span className="k-stamp">
              <time dateTime={date}>{dottedDate(date)}</time>
            </span>
            {author && <span className="k-byline">{author}</span>}
          </div>
          {collection && (
            <p className="k-collection-line">
              <span>合集</span>
              <Link href={`/collections/${collection.slug}`}>{collection.title}</Link>
              <span className="k-collection-pos">
                {collection.position} / {collection.total}
              </span>
            </p>
          )}
          <h1>{title}</h1>
          {summary && <p className="k-article-lede">{summary}</p>}
        </header>

        <div className="k-prose">{children}</div>

        <footer className="k-article-foot">
          {tags && tags.length > 0 && (
            <div className="k-tags">
              {tags.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>
          )}

          {(next || prev) && (
            <div className="k-prevnext">
              {prev && prev.path && (
                <div>
                  <h2>上一篇</h2>
                  <Link href={`/${prev.path}`}>{prev.title}</Link>
                </div>
              )}
              {next && next.path && (
                <div>
                  <h2>下一篇</h2>
                  <Link href={`/${next.path}`}>{next.title}</Link>
                </div>
              )}
            </div>
          )}

          <Link
            href={collection ? `/collections/${collection.slug}` : `/${basePath}`}
            className="k-back"
            aria-label={collection ? '回到合集' : '回到全部笔记'}
          >
            {collection ? '← 回到合集' : '← 回到整盒'}
          </Link>
        </footer>
      </article>

      {commentsReady && (
        <div className="k-comments" id="comment">
          <Comments slug={slug} />
        </div>
      )}
    </>
  )
}
