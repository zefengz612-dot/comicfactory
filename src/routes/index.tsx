import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "~/components/landing"

const title = "AI Comic Generator Online - Story to Comic | Comic Factory"
const description =
  "AI comic generator online: paste a story, keep characters consistent, and export multi-panel comic pages in your browser."

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content: "ai comic generator,ai comic maker,comic maker,comic book generator,comic strip generator,online ai comic generator,story to comic",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:site_name", content: "Comic Factory" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
  component: LandingPage,
})
