import { createFileRoute } from "@tanstack/react-router"
import { readMedia } from "~/modules/comic/server"

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat ?? ""
        const response = await readMedia(key)
        return response ?? new Response("Not found", { status: 404 })
      },
    },
  },
})
