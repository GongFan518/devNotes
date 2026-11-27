import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: '标签', description: '这个盒子里的话题' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])

  return (
    <>
      <div className="k-page-head">
        <h1>标签</h1>
        <p>按话题翻卡片，共 {sortedTags.length} 个</p>
      </div>

      <div className="k-card" style={{ paddingTop: 30, paddingBottom: 30 }}>
        {sortedTags.length === 0 ? (
          <p className="k-empty">还没有标签。</p>
        ) : (
          <ul className="k-tagcloud">
            {sortedTags.map((t) => (
              <li key={t}>
                <Link href={`/tags/${slug(t)}`} aria-label={`查看标签 ${t}`}>
                  {t}
                  <em className="k-count">{tagCounts[t]}</em>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
