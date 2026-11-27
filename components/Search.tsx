'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { dottedDate } from '@/components/format'

type Doc = {
  title: string
  summary?: string
  date: string
  tags?: string[]
  path: string
}

const MAX_RESULTS = 8

// Written by contentlayer into public/ (see siteMetadata.search.kbarConfig).
const INDEX_URL = '/search.json'

const SearchContext = createContext<{ openSearch: () => void } | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const openSearch = useCallback(() => setIsOpen(true), [])

  // ⌘K / Ctrl+K toggles the dialog from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      {isOpen && <SearchDialog onClose={() => setIsOpen(false)} />}
    </SearchContext.Provider>
  )
}

export function SearchTrigger({ children, label }: { children: ReactNode; label: string }) {
  const ctx = useContext(SearchContext)
  return (
    <button aria-label={label} onClick={() => ctx?.openSearch()}>
      {children}
    </button>
  )
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [docs, setDocs] = useState<Doc[] | null>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch(INDEX_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Doc[]) => {
        if (!cancelled) setDocs(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setDocs([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const results = useMemo(() => {
    if (!docs) return []
    const q = query.trim().toLowerCase()
    const pool = q
      ? docs.filter((doc) =>
          [doc.title, doc.summary ?? '', (doc.tags ?? []).join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(q)
        )
      : docs
    return pool.slice(0, MAX_RESULTS)
  }, [docs, query])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    const node = listRef.current?.children[active] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = useCallback(
    (doc?: Doc) => {
      if (!doc) return
      onClose()
      router.push(`/${doc.path}`)
    },
    [onClose, router]
  )

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(results[active])
    }
  }

  return (
    <div className="k-searchmodal">
      <button
        type="button"
        className="k-searchmodal-backdrop"
        aria-label="关闭搜索"
        tabIndex={-1}
        onClick={onClose}
      />
      <div className="k-searchbox" role="dialog" aria-modal="true" aria-label="搜索文章">
        <div className="k-searchbox-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="搜标题、摘要或标签"
            aria-label="搜索关键词"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>ESC</kbd>
        </div>

        <div className="k-searchbox-body">
          {docs === null ? (
            <p className="k-empty">正在翻卡片…</p>
          ) : results.length === 0 ? (
            <p className="k-empty">没有找到相关的卡片。</p>
          ) : (
            <ul className="k-searchresults" ref={listRef}>
              {results.map((doc, i) => (
                <li key={doc.path}>
                  <Link
                    href={`/${doc.path}`}
                    className={i === active ? 'is-active' : undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={onClose}
                  >
                    <span className="k-sr-top">
                      <span className="k-sr-title">{doc.title}</span>
                      <span className="k-sr-date">{dottedDate(doc.date)}</span>
                    </span>
                    {doc.summary && <span className="k-sr-sum">{doc.summary}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="k-searchbox-foot">
          <span>↑↓ 选择</span>
          <span>↵ 打开</span>
          <span>esc 关闭</span>
        </div>
      </div>
    </div>
  )
}
