import { createFileRoute } from "@tanstack/react-router"
import { PricingPage } from "~/components/pricing-page"

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | Comic Factory" },
      {
        name: "description",
        content: "Comic Factory pricing: Free 8 credits (about 1 page), Pro $29.9/mo with 600 credits, Studio $59.9/mo with 1,200 credits. Monthly or yearly.",
      },
      { property: "og:title", content: "Pricing | Comic Factory" },
      {
        property: "og:description",
        content: "Comic Factory pricing: Free 8 credits (about 1 page), Pro $29.9/mo with 600 credits, Studio $59.9/mo with 1,200 credits. Monthly or yearly.",
      },
      { property: "og:site_name", content: "Comic Factory" },
    ],
  }),
  component: PricingPage,
})
