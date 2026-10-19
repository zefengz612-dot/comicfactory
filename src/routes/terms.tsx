import { createFileRoute } from "@tanstack/react-router"
import { LegalPage } from "~/components/legal"

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Comic Factory" },
      { name: "description", content: "Terms governing use of Comic Factory, including content rules, billing, and refunds." },
      { property: "og:title", content: "Terms of Service | Comic Factory" },
      { property: "og:description", content: "Terms governing use of Comic Factory, including content rules, billing, and refunds." },
      { property: "og:site_name", content: "Comic Factory" },
    ],
  }),
  component: () => (
    <LegalPage title="Terms of Service">
      <p>
        Comic Factory turns stories you submit into comic pages. You keep the rights you already had in your story. You
        are responsible for having permission to use the text and any names you paste in.
      </p>
      <p>
        Free starter credits are for a personal trial. Paid Pro and Studio use, once checkout is live, may cover
        personal or commercial projects. Credits are consumed when an image is produced. A failed render should not keep
        the credit. Subscription credits refresh each cycle and do not roll over. Pack credits expire six months after
        purchase.
      </p>
      <p>The service can change, pause, or refuse a story that breaks the acceptable use rules.</p>
    </LegalPage>
  ),
})
