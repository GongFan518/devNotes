import 'css/prism.css'
import 'katex/dist/katex.css'

import { notFound } from 'next/navigation'
import { allAuthors } from 'contentlayer/generated'
import type { Authors } from 'contentlayer/generated'
import { coreContent } from 'pliny/utils/contentlayer'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import PostLayout from '@/layouts/PostLayout'
import siteMetadata from '@/data/siteMetadata'
import { getCollection, getCollections } from '@/lib/collections'

export const generateStaticParams = async () =>
  getCollections().flatMap((collection) =>
    collection.posts.map((post) => ({ slug: collection.slug, post: post.slug }))
  )

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; post: string }>
}) {
  const { slug, post: postSlug } = await params
  const collection = getCollection(slug)
  const post = collection?.posts.find((p) => p.slug === postSlug)
  if (!collection || !post) return

  return {
    title: post.title,
    description: post.summary,
    // This page is the same article read in a collection context; point search
    // engines at the canonical copy under /blog.
    alternates: { canonical: `${siteMetadata.siteUrl}/${post.path}/` },
  }
}

export default async function CollectionPostPage({
  params,
}: {
  params: Promise<{ slug: string; post: string }>
}) {
  const { slug, post: postSlug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  const index = collection.posts.findIndex((p) => p.slug === postSlug)
  if (index === -1) notFound()

  const post = collection.posts[index]
  const previous = collection.posts[index - 1]
  const following = collection.posts[index + 1]

  const prev = previous
    ? { path: `collections/${collection.slug}/${previous.slug}`, title: previous.title }
    : undefined
  const next = following
    ? { path: `collections/${collection.slug}/${following.slug}`, title: following.title }
    : undefined

  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })

  return (
    <PostLayout
      content={coreContent(post)}
      authorDetails={authorDetails}
      next={next}
      prev={prev}
      collection={{
        slug: collection.slug,
        title: collection.title,
        position: index + 1,
        total: collection.posts.length,
      }}
    >
      <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
    </PostLayout>
  )
}
