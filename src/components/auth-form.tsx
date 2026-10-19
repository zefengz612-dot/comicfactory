import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { SiteFooter, SiteHeader } from "~/components/site"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { authClient } from "~/core/auth-client"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password, callbackURL: "/app" })
        : await authClient.signUp.email({ name, email, password, callbackURL: "/app" })
    setPending(false)
    if (result.error) {
      setError(result.error.message || "Could not sign in.")
      return
    }
    await navigate({ to: "/app", search: { style: undefined } })
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">{mode === "sign-in" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Email and password via better-auth. New accounts get 8 starter credits on a fresh D1 ledger.
        </p>
        <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-3">
          {mode === "sign-up" ? (
            <label className="block text-sm font-semibold">
              Name
              <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          ) : null}
          <label className="block text-sm font-semibold">
            Email
            <Input className="mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <Input className="mt-1" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p className="text-sm text-[var(--accent-hot)]">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          {mode === "sign-in" ? (
            <Link to="/sign-up" className="font-semibold text-[var(--accent-deep)]">
              Need an account?
            </Link>
          ) : (
            <Link to="/sign-in" className="font-semibold text-[var(--accent-deep)]">
              Already have an account?
            </Link>
          )}
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
