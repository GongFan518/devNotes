import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content

  return (
    <>
      <div className="k-page-head">
        <h1>关于</h1>
        <p>这个盒子是谁在管</p>
      </div>

      <div className="k-about">
        <aside className="k-about-side">
          {avatar ? (
            <Image src={avatar} alt={name} width={264} height={264} />
          ) : (
            <div className="k-avatar-fallback" aria-hidden="true">
              {name.slice(0, 1)}
            </div>
          )}
          <strong>{name}</strong>
          {occupation && <p>{occupation}</p>}
          {company && <p>{company}</p>}
          <div className="k-about-social">
            <SocialIcon kind="mail" href={`mailto:${email}`} size={5} />
            <SocialIcon kind="github" href={github} size={5} />
            <SocialIcon kind="linkedin" href={linkedin} size={5} />
            <SocialIcon kind="x" href={twitter} size={5} />
            <SocialIcon kind="bluesky" href={bluesky} size={5} />
          </div>
        </aside>

        <div className="k-prose">{children}</div>
      </div>
    </>
  )
}
