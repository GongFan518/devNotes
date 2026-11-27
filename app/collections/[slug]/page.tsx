import Link from '@/components/Link'
import PostCard from '@/components/PostCard'
import { notFound } from 'next/navigation'
import { genPageMetadata } from 'app/seo'
import { getCollection, getCollections } from '@/lib/collections'

export const generateStaticParams = async () => getCollections().map((c) => ({ slug: c.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) return genPageMetadata({ title: '合集' })
  return genPageMetadata({ title: collection.title, description: collection.description })
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  return (
    <>
      <div className="k-page-head">
        <h1>{collection.title}</h1>
        <p>
          {collection.posts.length} 篇 · {collection.description}
        </p>
      </div>

      {collection.posts.length === 0 ? (
        <p className="k-empty">这个合集里还没有文章。</p>
      ) : (
        <div className="k-grid k-grid--ordered">
          {collection.posts.map((post, i) => (
            <PostCard
              key={post.slug}
              post={post}
              index={i + 1}
              href={`/collections/${collection.slug}/${post.slug}`}
            />
          ))}
        </div>
      )}

      <Link href="/collections" className="k-back">
        ← 所有合集
      </Link>
    </>
  )
}
