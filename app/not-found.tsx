import Link from '@/components/Link'

export default function NotFound() {
  return (
    <div className="k-404">
      <strong>404</strong>
      <div>
        <h1>这张卡片不在这儿</h1>
        <p>可能被抽走了，或者本来就没写过。回到盒子里再翻翻。</p>
        <Link href="/" className="k-btn">
          回到首页
        </Link>
      </div>
    </div>
  )
}
