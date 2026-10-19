import { createFileRoute } from "@tanstack/react-router"
import { AuthForm } from "~/components/auth-form"

export const Route = createFileRoute("/sign-up")({
  head: () => ({ meta: [{ title: "Create account | Comic Factory" }] }),
  component: () => <AuthForm mode="sign-up" />,
})
