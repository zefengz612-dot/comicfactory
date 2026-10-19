import { env } from "./env"
import { drizzle } from "drizzle-orm/d1"
import migration from "../../migrations/0001_init.sql?raw"
import * as schema from "./schema"

let ready: Promise<void> | null = null

export function database() {
  return drizzle(env.DB, { schema })
}

export async function ensureSchema() {
  ready ??= (async () => {
    const statements = migration
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean)
    for (const statement of statements) {
      await env.DB.prepare(statement).run()
    }
  })()
  await ready
}

export function now() {
  return Date.now()
}

export function id() {
  return crypto.randomUUID()
}
