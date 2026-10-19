import { createFileRoute } from "@tanstack/react-router"
import { AuthForm } from "~/components/auth-form"

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign in | Comic Factory" }] }),
  component: () => <AuthForm mode="sign-in" />,
})
