import Link from '@/components/Link'
import { slug } from 'github-slugger'
import { dottedDate, type Post } from '@/components/format'

interface Props {
  post: Post
  /** Homepage highlights the newest card. */
  lead?: boolean
  /** 1-based position, shown when the list is an ordered collection. */
  index?: number
  /** Override the destination (e.g. read the post inside a collection). */
  href?: string
}

export default function PostCard({ post, lead = false, index, href }: Props) {
  const to = href ?? `/blog/${post.slug}`

  return (
    <article className={lead ? 'k-card k-lead' : 'k-card'}>
      {lead && <span className="k-card-flag">最新</span>}
      {typeof index === 'number' && (
        <span className="k-card-index">{String(index).padStart(2, '0')}</span>
      )}
      <h2>
        <Link href={to}>{post.title}</Link>
      </h2>
      <p>{post.summary}</p>
      <div className="k-card-meta">
        <span className="k-tags">
          {post.tags?.map((tag) => (
            <Link key={tag} href={`/tags/${slug(tag)}`}>
              #{tag}
            </Link>
          ))}
        </span>
        <span className="k-stamp">{dottedDate(post.date)}</span>
      </div>
    </article>
  )
}
