import { Link } from "@tanstack/react-router"

export function SiteHeader({ variant = "solid" }: { variant?: "overlay" | "solid" }) {
  const onArt = variant === "overlay"
  return (
    <header className={onArt ? "absolute inset-x-0 top-0 z-30" : "border-b border-[var(--rule)] bg-[var(--paper)]/90 backdrop-blur-sm"}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link
          to="/"
          aria-label="Comic Factory"
          className={`inline-flex items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${onArt ? "focus-visible:outline-white" : "focus-visible:outline-[var(--ink)]"}`}
        >
          <img
            src="/brand/logo-nav.webp"
            alt=""
            className={`h-10 w-10 rounded-xl md:h-11 md:w-11 ${onArt ? "shadow-[3px_3px_0_rgba(0,0,0,0.35)]" : "shadow-[3px_3px_0_rgba(18,24,32,0.12)]"}`}
          />
          <span className={`landing-display-quiet text-base sm:text-lg ${onArt ? "text-white" : "text-[var(--ink)]"}`}>Comic Factory</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold md:gap-5">
          <Link to="/blog" className={onArt ? "text-white/85 transition hover:text-white" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"}>
            Blog
          </Link>
          <Link
            to="/pricing"
            className={onArt ? "text-white/85 transition hover:text-white" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"}
          >
            Pricing
          </Link>
          {onArt ? null : (
            <Link to="/app" search={{ style: undefined }} className="text-[var(--accent-deep)] hover:underline">
              Generate
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--rule)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-[var(--ink-muted)] md:flex-row md:items-start md:justify-between md:px-8">
        <div className="space-y-1">
          <p>© {new Date().getFullYear()} Comic Factory</p>
          <p>
            <a href="mailto:support@comicfactory.app" className="hover:text-[var(--ink)]">
              support@comicfactory.app
            </a>
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/blog" className="hover:text-[var(--ink)]">
            Blog
          </Link>
          <Link to="/pricing" className="hover:text-[var(--ink)]">
            Pricing
          </Link>
          <Link to="/app" search={{ style: undefined }} className="hover:text-[var(--ink)]">
            App
          </Link>
          <Link to="/privacy" className="hover:text-[var(--ink)]">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-[var(--ink)]">
            Terms
          </Link>
          <Link to="/acceptable-use" className="hover:text-[var(--ink)]">
            Acceptable Use
          </Link>
        </nav>
      </div>
    </footer>
  )
}
