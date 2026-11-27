import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import { getCollections } from '@/lib/collections'

export const metadata = genPageMetadata({ title: '合集', description: '按主题串起来的文章' })

export default function CollectionsPage() {
  const collections = getCollections()

  return (
    <>
      <div className="k-page-head">
        <h1>合集</h1>
        <p>把散在不同标签下、但属于同一件事的文章串起来，共 {collections.length} 个</p>
      </div>

      <div className="k-grid">
        {collections.map((collection) => (
          <article key={collection.slug} className="k-card">
            <h2>
              <Link href={`/collections/${collection.slug}`}>{collection.title}</Link>
            </h2>
            <p>{collection.description}</p>
            <div className="k-card-meta">
              <span className="k-collection-count">{collection.posts.length} 篇</span>
              <span className="k-stamp k-stamp--alt">合集</span>
            </div>
          </article>
        ))}
      </div>

      {collections.length === 0 && (
        <p className="k-empty">还没有合集，去 data/collections.ts 里配一个。</p>
      )}
    </>
  )
}
