import Link from '@/components/Link'
import PostCard from '@/components/PostCard'
import siteMetadata from '@/data/siteMetadata'
import { cnMonth, type Post } from '@/components/format'

export default function Home({ posts }: { posts: Post[] }) {
  const latest = posts[0]?.date ?? new Date().toISOString()

  return (
    <>
      <section className="k-hero">
        <h1>一盒卡片</h1>
        <div>
          <p>把每天想到的事抄在卡片上，攒够一盒就是一本。技术写得多一些，偶尔也有几句闲话。</p>
          <div className="k-hero-rule" />
          <div className="k-hero-sig">
            <span>— {siteMetadata.title}</span>
            <span>{posts.length} 张</span>
            <span>更新到 {cnMonth(latest)}</span>
          </div>
        </div>
      </section>

      <div className="k-grid">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} lead={i === 0} />
        ))}
      </div>

      <div className="k-home-foot">
        <Link href="/blog">倒出整盒</Link>
        <span>·</span>
        <Link href="/tags">按标签翻</Link>
        <span>·</span>
        <Link href="/about">关于这个盒子</Link>
      </div>
    </>
  )
}
