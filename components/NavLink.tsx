'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLink({ href, title }: { href: string; title: string }) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link href={href} aria-current={active ? 'page' : undefined}>
      {title}
    </Link>
  )
}
