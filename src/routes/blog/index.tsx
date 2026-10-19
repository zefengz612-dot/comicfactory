import { Link, createFileRoute } from "@tanstack/react-router"
import { SiteFooter, SiteHeader } from "~/components/site"
import { POSTS } from "~/content/posts"

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | Comic Factory" },
      { name: "description", content: "Guides on how to generate comics with AI, story-to-comic workflows, and tips for Comic Factory." },
      { property: "og:title", content: "Blog | Comic Factory" },
      { property: "og:description", content: "Guides on how to generate comics with AI, story-to-comic workflows, and tips for Comic Factory." },
      { property: "og:site_name", content: "Comic Factory" },
    ],
  }),
  component: function BlogIndex() {
    return (
      <div>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-5 py-12">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Blog</h1>
          <p className="mt-3 text-[var(--ink-muted)]">Guides for turning stories into comics with AI.</p>
          <div className="mt-8 space-y-6">
            {POSTS.map((post) => (
              <article key={post.slug} className="border-b border-[var(--rule)] pb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                  {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-[var(--accent-deep)]">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{post.description}</p>
              </article>
            ))}
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  },
})
