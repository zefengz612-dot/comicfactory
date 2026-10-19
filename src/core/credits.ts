import { env } from "./env"
import { ensureSchema, id, now } from "./db"

const SIGNUP_CREDITS = 8

export async function creditBalance(accountKey: string) {
  await ensureSchema()
  const row = await env.DB.prepare(
    `SELECT COALESCE(SUM(remaining), 0) AS balance
     FROM credit_grant
     WHERE account_key = ? AND remaining > 0 AND (expires_at IS NULL OR expires_at > ?)`,
  )
    .bind(accountKey, now())
    .first<{ balance: number }>()
  return Number(row?.balance ?? 0)
}

export async function ensureStarterCredits(accountKey: string, source = "signup") {
  await ensureSchema()
  const existing = await env.DB.prepare(
    `SELECT id FROM credit_grant WHERE account_key = ? AND source = ? LIMIT 1`,
  )
    .bind(accountKey, source)
    .first()
  if (existing) return creditBalance(accountKey)
  await env.DB.prepare(
    `INSERT INTO credit_grant (id, account_key, amount, remaining, source, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, NULL, ?)`,
  )
    .bind(id(), accountKey, SIGNUP_CREDITS, SIGNUP_CREDITS, source, now())
    .run()
  await env.DB.prepare(
    `INSERT INTO credit_ledger (id, account_key, delta, reason, comic_id, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`,
  )
    .bind(id(), accountKey, SIGNUP_CREDITS, source, now())
    .run()
  return creditBalance(accountKey)
}

export async function grantCredits(input: {
  accountKey: string
  amount: number
  source: string
  expiresAt?: number | null
  reason: string
}) {
  await ensureSchema()
  await env.DB.prepare(
    `INSERT INTO credit_grant (id, account_key, amount, remaining, source, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id(), input.accountKey, input.amount, input.amount, input.source, input.expiresAt ?? null, now())
    .run()
  await env.DB.prepare(
    `INSERT INTO credit_ledger (id, account_key, delta, reason, comic_id, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`,
  )
    .bind(id(), input.accountKey, input.amount, input.reason, now())
    .run()
  return creditBalance(input.accountKey)
}

export async function consumeCredits(accountKey: string, amount: number, reason: string, comicId?: string) {
  await ensureSchema()
  if (amount <= 0) return creditBalance(accountKey)
  const grants = await env.DB.prepare(
    `SELECT id, remaining, expires_at AS expiresAt
     FROM credit_grant
     WHERE account_key = ? AND remaining > 0 AND (expires_at IS NULL OR expires_at > ?)
     ORDER BY expires_at IS NULL, expires_at ASC, created_at ASC`,
  )
    .bind(accountKey, now())
    .all<{ id: string; remaining: number }>()
  let need = amount
  const takes: { id: string; take: number }[] = []
  for (const grant of grants.results ?? []) {
    if (need <= 0) break
    const take = Math.min(need, grant.remaining)
    takes.push({ id: grant.id, take })
    need -= take
  }
  if (need > 0) {
    const error = new Error("insufficient_credits")
    error.name = "InsufficientCredits"
    throw error
  }
  await env.DB.batch([
    ...takes.map((take) =>
      env.DB.prepare(`UPDATE credit_grant SET remaining = remaining - ? WHERE id = ?`).bind(take.take, take.id),
    ),
    env.DB.prepare(
      `INSERT INTO credit_ledger (id, account_key, delta, reason, comic_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(id(), accountKey, -amount, reason, comicId ?? null, now()),
  ])
  return creditBalance(accountKey)
}
