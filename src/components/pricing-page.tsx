import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SiteFooter, SiteHeader } from "~/components/site"
import { Button } from "~/components/ui/button"
import { PACKS, PLANS, PRICING_FAQ } from "~/content/pricing"
import { startCheckoutFn } from "~/modules/comic/fns"

function money(amount: number) {
  return amount === 0 ? "$0" : `$${amount.toFixed(amount % 1 === 0 ? 0 : 1)}`
}

export function PricingPage() {
  const [tab, setTab] = useState<"monthly" | "yearly" | "packs">("monthly")
  const [guestId, setGuestId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  useEffect(() => {
    const key = "comic-factory-guest"
    let value = localStorage.getItem(key)
    if (!value) {
      value = crypto.randomUUID()
      localStorage.setItem(key, value)
    }
    setGuestId(value)
    const params = new URLSearchParams(window.location.search)
    if (params.get("checkout") === "cancel") setMessage("Checkout canceled. No charge was made.")
  }, [])

  async function checkout(kind: "plan" | "pack", id: string) {
    if (!guestId) return
    setPending(id)
    setMessage(null)
    const result = await startCheckoutFn({
      data: { guestId, kind, id, interval: tab === "yearly" ? "yearly" : "monthly" },
    })
    setPending(null)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    window.location.href = result.url
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Choose your plan</h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">
          Start free with a short comic. Upgrade when you need more pages, redraws, and monthly credits.
        </p>
        <div className="mt-8 inline-flex rounded-sm border border-[var(--rule)] bg-[var(--paper-2)] p-1" role="tablist">
          {(["monthly", "yearly", "packs"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={`rounded-sm px-4 py-2 text-sm font-semibold ${tab === item ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-muted)]"}`}
              onClick={() => setTab(item)}
            >
              {item === "packs" ? "Credit packs" : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        {message ? <p className="mt-4 text-sm text-[var(--accent-hot)]">{message}</p> : null}
        {tab === "packs" ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PACKS.map((pack) => (
              <article key={pack.id} className={`panel-shadow relative flex flex-col border bg-white p-5 ${pack.id === "creator" ? "border-[var(--accent)]" : "border-[var(--rule)]"}`}>
                {pack.id === "creator" ? (
                  <span className="absolute -top-3 right-4 bg-[var(--accent)] px-2 py-1 text-xs font-bold uppercase text-white">Recommended</span>
                ) : null}
                <h2 className="text-2xl font-semibold tracking-tight">{pack.name}</h2>
                <p className="mt-2 text-4xl font-semibold">{money(pack.price)}</p>
                <p className="mt-1 text-sm font-semibold">{pack.credits.toLocaleString()} credits</p>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{pack.pagesEstimate}</p>
                <p className="mt-2 text-xs text-[var(--ink-muted)]">Valid {pack.validityMonths} months. Subscribers get +{pack.subscriberBonus} bonus credits.</p>
                <Button className="mt-5" disabled={pending === pack.id} onClick={() => void checkout("pack", pack.id)}>
                  {pending === pack.id ? "Redirecting…" : "Buy now"}
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const amount = tab === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
              return (
                <article key={plan.id} className={`panel-shadow relative flex flex-col border bg-white p-6 ${plan.recommended ? "border-[var(--accent)] lg:-translate-y-2" : "border-[var(--rule)]"}`}>
                  {plan.recommended ? (
                    <span className="absolute -top-3 left-6 bg-[var(--accent)] px-2 py-1 text-xs font-bold uppercase text-white">Recommended</span>
                  ) : null}
                  <h2 className="text-2xl font-semibold tracking-tight">{plan.name}</h2>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">{plan.blurb}</p>
                  <p className="mt-4 text-5xl font-semibold">
                    {money(amount)}
                    {amount > 0 ? <span className="ml-1 text-lg font-normal text-[var(--ink-muted)]">{tab === "yearly" ? "/year" : "/month"}</span> : null}
                  </p>
                  <p className="mt-2 font-semibold">{plan.creditsLabel}</p>
                  <p className="text-sm text-[var(--ink-muted)]">{plan.creditsDetail}</p>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">{plan.pagesEstimate}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature}>· {feature}</li>
                    ))}
                  </ul>
                  {plan.id === "free" ? (
                    <Button asChild className="mt-6" variant="outline">
                      <Link to="/app" search={{ style: undefined }}>Start free</Link>
                    </Button>
                  ) : (
                    <Button className="mt-6" disabled={pending === plan.id} onClick={() => void checkout("plan", plan.id)}>
                      {pending === plan.id ? "Redirecting…" : plan.cta}
                    </Button>
                  )}
                </article>
              )
            })}
          </div>
        )}
        <div className="mx-auto mt-14 max-w-3xl divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {PRICING_FAQ.map((item) => (
            <details key={item.question} className="py-4">
              <summary className="cursor-pointer font-semibold">{item.question}</summary>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
