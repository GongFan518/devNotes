import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { dottedDate } from '@/components/format'

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PostSimple({ content, next, prev, children }: LayoutProps) {
  const { path, slug, date, title } = content
  const basePath = path.split('/')[0]

  return (
    <>
      <ScrollTopAndComment />
      <article className="k-article">
        <header className="k-article-head">
          <div className="k-article-meta">
            <span className="k-stamp">
              <time dateTime={date}>{dottedDate(date)}</time>
            </span>
          </div>
          <h1>{title}</h1>
        </header>

        <div className="k-prose">{children}</div>

        <footer className="k-article-foot">
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
          <Link href={`/${basePath}`} className="k-back" aria-label="回到全部笔记">
            ← 回到整盒
          </Link>
        </footer>
      </article>

      {siteMetadata.comments?.provider &&
        (siteMetadata.comments.provider !== 'giscus' || !!process.env.NEXT_PUBLIC_GISCUS_REPO) && (
          <div className="k-comments" id="comment">
            <Comments slug={slug} />
          </div>
        )}
    </>
  )
}
