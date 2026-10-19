import { createFileRoute } from "@tanstack/react-router"
import { LegalPage } from "~/components/legal"

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Comic Factory" },
      { name: "description", content: "How Comic Factory collects, uses, and protects your data." },
      { property: "og:title", content: "Privacy Policy | Comic Factory" },
      { property: "og:description", content: "How Comic Factory collects, uses, and protects your data." },
      { property: "og:site_name", content: "Comic Factory" },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy">
      <p>
        Comic Factory stores the account you create, the stories you submit, generated pages, and a credit ledger so the
        product can run. Guest tries are tied to a random id kept in your browser.
      </p>
      <p>
        We do not sell stories. Payment details stay with Stripe when checkout is enabled. Sign-in uses email and a
        password hash. Server logs may include request timing and error text, not the full comic unless a generation
        fails and we need the prompt to debug.
      </p>
      <p>You can stop using the product and ask support to delete an account. The production domain placeholder is comicfactory.app.</p>
    </LegalPage>
  ),
})
