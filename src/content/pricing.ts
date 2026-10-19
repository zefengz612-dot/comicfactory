export type Plan = {
  id: "free" | "pro" | "studio"
  name: string
  blurb: string
  monthlyPrice: number
  yearlyPrice: number
  creditsLabel: string
  creditsDetail: string
  pagesEstimate: string
  credits: number
  features: string[]
  cta: string
  recommended?: boolean
}

export type Pack = {
  id: string
  name: string
  price: number
  credits: number
  subscriberBonus: number
  validityMonths: number
  pagesEstimate: string
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Try a short comic end to end.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    creditsLabel: "8 credits",
    creditsDetail: "One-time starter credits",
    pagesEstimate: "About 1 page (4 panels/page) · ~4–8 images with character refs / redraws",
    credits: 8,
    features: [
      "Story to multi-panel comic",
      "Character consistency refs",
      "All art styles",
      "Export pages in browser",
      "No credit card required",
    ],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For writers shipping comics every month.",
    monthlyPrice: 29.9,
    yearlyPrice: 299,
    creditsLabel: "600 credits / month",
    creditsDetail: "Refreshes each billing cycle",
    pagesEstimate: "About 22 six-page comics / month — 132 pages · 4 panels/page · ~528 images",
    credits: 600,
    features: [
      "Everything in Free",
      "600 credits every month",
      "Character refs + redraws included",
      "Multi-page story generation",
      "Priority generation queue",
      "Commercial use of your comics",
    ],
    cta: "Upgrade to Pro",
    recommended: true,
  },
  {
    id: "studio",
    name: "Studio",
    blurb: "For classrooms, studios, and heavy creators.",
    monthlyPrice: 59.9,
    yearlyPrice: 599,
    creditsLabel: "1,200 credits / month",
    creditsDetail: "Refreshes each billing cycle",
    pagesEstimate: "About 44 six-page comics / month — 264 pages · 4 panels/page · ~1,056 images",
    credits: 1200,
    features: [
      "Everything in Pro",
      "1,200 credits every month",
      "Best for batch pages & classrooms",
      "Highest priority queue",
      "Commercial use of your comics",
      "Email support",
    ],
    cta: "Upgrade to Studio",
  },
]

export const PACKS: Pack[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29.9,
    credits: 400,
    subscriberBonus: 200,
    validityMonths: 6,
    pagesEstimate: "About 14 six-page comics — 84 pages · 4 panels/page · ~336 images",
  },
  {
    id: "creator",
    name: "Creator",
    price: 49.9,
    credits: 700,
    subscriberBonus: 350,
    validityMonths: 6,
    pagesEstimate: "About 25 six-page comics — 150 pages · 4 panels/page · ~600 images",
  },
  {
    id: "pro_pack",
    name: "Pro Pack",
    price: 69.9,
    credits: 1000,
    subscriberBonus: 500,
    validityMonths: 6,
    pagesEstimate: "About 36 six-page comics — 216 pages · 4 panels/page · ~864 images",
  },
  {
    id: "studio_pack",
    name: "Studio Pack",
    price: 99.9,
    credits: 1500,
    subscriberBonus: 750,
    validityMonths: 6,
    pagesEstimate: "About 54 six-page comics — 324 pages · 4 panels/page · ~1,296 images",
  },
]

export const PRICING_FAQ = [
  {
    question: "What is a credit?",
    answer:
      "One credit usually equals one generated image panel. Character reference portraits and redraws also use credits. Story writing uses little or no credit cost.",
  },
  {
    question: "What can I make with Free?",
    answer:
      "Free includes 8 one-time credits — enough for roughly one page (4 panels plus character refs), so you can try the story-to-page flow.",
  },
  {
    question: "Do unused credits roll over?",
    answer:
      "Monthly and yearly plan credits refresh each billing cycle and do not roll over. Free starter credits stay until you use them.",
  },
  {
    question: "Can I switch between monthly and yearly?",
    answer:
      "Yes. Yearly Pro is $299 (save vs 12 × $29.9). Yearly Studio is $599 (save vs 12 × $59.9). You can change or cancel renewal anytime before the next cycle.",
  },
  {
    question: "Can I use comics commercially?",
    answer:
      "Paid Pro and Studio subscribers may use generated comics for personal or commercial projects, subject to our terms. Free is for personal trial use.",
  },
  {
    question: "What if a panel fails to render?",
    answer:
      "If generation fails and no image is produced, we do not keep those credits. Manual redraws after a successful image still use credits.",
  },
  {
    question: "Do credit pack credits expire?",
    answer:
      "Yes. Pack credits are valid for 6 months from purchase. Unused subscription credits still refresh each billing cycle and do not roll over. Pro or Studio subscribers get +50% bonus credits on every pack at the same price.",
  },
]
