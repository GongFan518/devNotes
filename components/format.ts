import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

export type Post = CoreContent<Blog>

/** 2026-09-14T00:00:00.000Z -> 2026.09.14 */
export const dottedDate = (iso: string) => iso.slice(0, 10).replace(/-/g, '.')

/** 2026-09-14T00:00:00.000Z -> 09.14 */
export const monthDay = (iso: string) => iso.slice(5, 10).replace('-', '.')

/** 2026-09-14T00:00:00.000Z -> 2026 */
export const yearOf = (iso: string) => iso.slice(0, 4)

/** 2026-09-14T00:00:00.000Z -> 2026 年 9 月 */
export const cnMonth = (iso: string) => {
  const [, m] = iso.slice(0, 7).split('-')
  return `${iso.slice(0, 4)} 年 ${Number(m)} 月`
}

/** Days/months in Chinese, without relying on the runtime locale table. */
export const cnDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}
