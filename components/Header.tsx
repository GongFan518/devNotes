import Link from 'next/link'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import NavLink from './NavLink'
import MobileNav from './MobileNav'
import SearchButton from './SearchButton'
import { SearchProvider } from './Search'

const Header = () => {
  return (
    <header className="k-header">
      <Link href="/" className="k-brand" aria-label={siteMetadata.headerTitle}>
        <strong>{siteMetadata.headerTitle}</strong>
      </Link>

      <SearchProvider>
        <div className="k-header-right">
          <nav className="k-nav" aria-label="主导航">
            {headerNavLinks
              .filter((link) => link.href !== '/')
              .map((link) => (
                <NavLink key={link.title} href={link.href} title={link.title} />
              ))}
          </nav>
          <div className="k-tools">
            <SearchButton />
            <MobileNav />
          </div>
        </div>
      </SearchProvider>
    </header>
  )
}

export default Header
