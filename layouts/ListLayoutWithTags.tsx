'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import PostCard from '@/components/PostCard'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname
    .replace(/^\//, '')
    .replace(/\/page\/\d+\/?$/, '')
    .replace(/\/$/, '')
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <nav className="k-pagination" aria-label="分页">
      {prevPage ? (
        <Link
          href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
          rel="prev"
        >
          ← 前一张
        </Link>
      ) : (
        <button disabled>← 前一张</button>
      )}
      <span>
        {currentPage} / {totalPages}
      </span>
      {nextPage ? (
        <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
          后一张 →
        </Link>
      ) : (
        <button disabled>后一张 →</button>
      )}
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts
  const onAllPosts = pathname.startsWith('/blog')

  return (
    <>
      <div className="k-page-head">
        <h1>{title}</h1>
        <p>
          共 {displayPosts.length} 张卡片
          {pagination && pagination.totalPages > 1
            ? `，第 ${pagination.currentPage} / ${pagination.totalPages} 页`
            : ''}
        </p>
      </div>

      <div className="k-withrail">
        <aside className="k-rail">
          <h2>索引</h2>
          <ul>
            <li>
              {onAllPosts ? (
                <span aria-current="page">全部笔记</span>
              ) : (
                <Link href="/blog">全部笔记</Link>
              )}
            </li>
            {sortedTags.map((t) => {
              const isCurrent = decodeURI(pathname.split('/tags/')[1] ?? '') === slug(t)
              return (
                <li key={t}>
                  {isCurrent ? (
                    <span aria-current="page">
                      {t}
                      <em className="k-count">{tagCounts[t]}</em>
                    </span>
                  ) : (
                    <Link href={`/tags/${slug(t)}`} aria-label={`查看标签 ${t}`}>
                      {t}
                      <em className="k-count">{tagCounts[t]}</em>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </aside>

        <div>
          {displayPosts.length === 0 ? (
            <p className="k-empty">这个标签下还没有卡片。</p>
          ) : (
            <div className="k-grid">
              {displayPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          )}
        </div>
      </div>
    </>
  )
}
