import type { ReactNode } from "react"
import { SiteFooter, SiteHeader } from "~/components/site"

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-3xl space-y-4 px-5 py-12 text-[15px] leading-relaxed">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {children}
        <p className="text-sm text-[var(--ink-muted)]">
          Questions: <a href="mailto:support@comicfactory.app">support@comicfactory.app</a>
        </p>
      </article>
      <SiteFooter />
    </div>
  )
}
