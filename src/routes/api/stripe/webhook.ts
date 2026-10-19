import { createFileRoute } from "@tanstack/react-router"
import { handleStripeWebhook } from "~/modules/comic/server"

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return await handleStripeWebhook(request)
        } catch (error) {
          const message = error instanceof Error ? error.message : "Webhook failed"
          return new Response(message, { status: 400 })
        }
      },
    },
  },
})
