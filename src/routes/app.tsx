import { createFileRoute } from "@tanstack/react-router"
import { Studio } from "~/components/studio"

export const Route = createFileRoute("/app")({
  validateSearch: (search: Record<string, unknown>) => ({
    style: typeof search.style === "string" ? search.style : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create Comic | Comic Factory" },
      { name: "description", content: "Paste a story, lock character references, and generate multi-panel comic pages." },
    ],
  }),
  component: function AppPage() {
    const { style } = Route.useSearch()
    return <Studio initialStyle={style} />
  },
})
