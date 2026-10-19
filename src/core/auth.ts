import { env } from "./env"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { ensureStarterCredits } from "./credits"
import { database, ensureSchema } from "./db"
import * as schema from "./schema"

export async function getAuth(request?: Request) {
  await ensureSchema()
  const origin = request ? new URL(request.url).origin : env.APP_URL || "http://127.0.0.1:43123"
  return betterAuth({
    appName: env.APP_NAME || "Comic Factory",
    secret: env.AUTH_SECRET || "local-dev-auth-secret-comic-factory-new-32chars",
    baseURL: origin,
    trustedOrigins: [origin],
    emailAndPassword: {
      enabled: true,
    },
    database: drizzleAdapter(database(), {
      provider: "sqlite",
      schema,
    }),
    plugins: [tanstackStartCookies()],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await ensureStarterCredits(`user:${user.id}`, "signup")
          },
        },
      },
    },
  })
}

export async function readSession(request: Request) {
  const auth = await getAuth(request)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return null
  return session.user
}
