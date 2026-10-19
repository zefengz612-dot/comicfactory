import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { SiteFooter, SiteHeader } from "~/components/site"
import { POSTS } from "~/content/posts"

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS.find((item) => item.slug === params.slug)
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Blog"} | Comic Factory` },
      { name: "description", content: loaderData?.description ?? "Comic Factory blog" },
      { property: "og:title", content: `${loaderData?.title ?? "Blog"} | Comic Factory` },
      { property: "og:description", content: loaderData?.description ?? "Comic Factory blog" },
      { property: "og:site_name", content: "Comic Factory" },
    ],
  }),
  component: function PostPage() {
    const post = Route.useLoaderData()
    return (
      <div>
        <SiteHeader />
        <article className="mx-auto max-w-3xl px-5 py-12">
          <Link to="/blog" className="text-sm font-semibold text-[var(--accent-deep)]">
            Blog
          </Link>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{post.title}</h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <div className="mt-8 space-y-4 text-lg leading-relaxed">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
        <SiteFooter />
      </div>
    )
  },
})
