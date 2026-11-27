/**
 * 合集配置。
 *
 * 一个合集就是「我挑出来的一组文章」，可以跨标签，顺序完全由你决定——
 * 页面上的顺序、以及从这里点进文章后底部的上一篇/下一篇，都按这个数组来。
 *
 * posts 里每一项可以填：
 *   - 文章文件名（slug），例如 'on-writing-slowly'
 *   - 或者文章标题，例如 '关于写得慢这件事'
 * 两种都行，认不出来会在终端里警告并跳过（不会把整页搞挂）。
 *
 * 顺序就是你在数组里写的顺序。想调整阅读顺序，直接拖动这几行字符串即可。
 */

export interface CollectionConfig {
  /** URL 段：/collections/<slug>，建议用英文短词 */
  slug: string
  /** 合集名 */
  title: string
  /** 一到两句话说清这组文章的共同点 */
  description: string
  /** 可选封面，放 public/static/images/ 下，写 '/static/images/xxx.png' */
  imgSrc?: string
  /** 按显示顺序排列，填 slug 或标题 */
  posts: string[]
}

const collections: CollectionConfig[] = [
  {
    slug: 'rebuilds',
    title: '重写的现场',
    description: '那些先做错、再改对的东西。跨 React、CSS 和构建配置，共同点是都被返工过一次。',
    posts: [
      '把 React 的状态从组件里搬出来',
      'CSS Grid 重做首页的三次尝试',
      '一个 fetch 没写 cache，线上多了三千次请求',
    ],
  },
  {
    slug: 'slow-writing',
    title: '写得慢的人',
    description: '关于写、关于记笔记、关于深夜里为了一个色值折腾四十分钟。',
    posts: [
      '关于写得慢这件事',
      '把笔记从云端搬回本地',
      '在深夜调一个 CSS 变量',
      'TypeScript 类型体操的边际收益',
    ],
  },
]

export default collections
