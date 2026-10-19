import { createFileRoute } from "@tanstack/react-router"
import { LegalPage } from "~/components/legal"

export const Route = createFileRoute("/acceptable-use")({
  head: () => ({
    meta: [
      { title: "Acceptable Use Policy | Comic Factory" },
      { name: "description", content: "What is and is not allowed when generating comics with Comic Factory." },
      { property: "og:title", content: "Acceptable Use Policy | Comic Factory" },
      { property: "og:description", content: "What is and is not allowed when generating comics with Comic Factory." },
      { property: "og:site_name", content: "Comic Factory" },
    ],
  }),
  component: () => (
    <LegalPage title="Acceptable Use Policy">
      <p>Comic Factory is for family-friendly stories. Do not submit sexual content, including NSFW or nude scenes.</p>
      <p>
        Do not use the generator to create sexual content involving minors, to harass a real person, or to infringe
        someone else's copyright. We can refuse a generation and close an account that keeps breaking these rules.
      </p>
    </LegalPage>
  ),
})
