import { env } from "~/core/env"
import { getRequest } from "@tanstack/react-start/server"
import { readSession } from "~/core/auth"
import { consumeCredits, creditBalance, ensureStarterCredits, grantCredits } from "~/core/credits"
import { ensureSchema, id, now } from "~/core/db"
import { getComicObject, putComicObject } from "~/core/storage"
import { PACKS, PLANS } from "~/content/pricing"
import { paletteFor, renderCharacterSvg, renderPageSvg, renderPanelSvg } from "./render"
import { getLayout, getStyle } from "./styles"
import { planComic, type ComicPlan } from "./story"

const GUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type Account = {
  key: string
  name: string
  email: string | null
  guest: boolean
}

type CharacterRow = {
  id: string
  name: string
  description: string
  image_key: string | null
  markup: string | null
}

type PanelRow = {
  id: string
  page_index: number
  panel_index: number
  caption: string
  speech: string
  instructions: string
  image_key: string | null
  markup: string | null
}

type ComicRow = {
  id: string
  title: string
  story: string
  style_id: string
  layout_id: string
  page_count: number
  captions: number
  status: string
}

function request() {
  return getRequest()
}

export async function resolveAccount(guestId: string): Promise<Account> {
  await ensureSchema()
  const user = await readSession(request())
  if (user) {
    const key = `user:${user.id}`
    await ensureStarterCredits(key, "signup")
    return { key, name: user.name, email: user.email, guest: false }
  }
  if (!GUEST_ID.test(guestId)) throw new Error("Refresh the page and try again.")
  const key = `guest:${guestId}`
  await ensureStarterCredits(key, "starter")
  return { key, name: "Guest", email: null, guest: true }
}

function mediaUrl(key: string | null) {
  return key ? `/api/media/${key}` : ""
}

function presentCharacter(row: CharacterRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: mediaUrl(row.image_key),
  }
}

function presentPanel(row: PanelRow) {
  return {
    id: row.id,
    pageIndex: row.page_index,
    panelIndex: row.panel_index,
    caption: row.caption,
    speech: row.speech,
    instructions: row.instructions,
    imageUrl: row.markup || row.image_key ? mediaUrl(row.image_key) : "",
  }
}

async function loadComic(accountKey: string, comicId: string) {
  const comic = await env.DB.prepare(`SELECT * FROM comic WHERE id = ? AND account_key = ?`)
    .bind(comicId, accountKey)
    .first<ComicRow>()
  if (!comic) throw new Error("That comic is not on this account.")
  const characters = await env.DB.prepare(
    `SELECT * FROM character_ref WHERE comic_id = ? ORDER BY created_at ASC`,
  )
    .bind(comicId)
    .all<CharacterRow>()
  const panels = await env.DB.prepare(
    `SELECT * FROM panel WHERE comic_id = ? ORDER BY page_index ASC, panel_index ASC`,
  )
    .bind(comicId)
    .all<PanelRow>()
  return {
    comic,
    characters: characters.results ?? [],
    panels: panels.results ?? [],
  }
}

function presentComic(loaded: Awaited<ReturnType<typeof loadComic>>, credits: number) {
  const pages = new Map<number, ReturnType<typeof presentPanel>[]>()
  for (const panel of loaded.panels) {
    const list = pages.get(panel.page_index) ?? []
    list.push(presentPanel(panel))
    pages.set(panel.page_index, list)
  }
  return {
    credits,
    comic: {
      id: loaded.comic.id,
      title: loaded.comic.title,
      story: loaded.comic.story,
      styleId: loaded.comic.style_id,
      layoutId: loaded.comic.layout_id,
      pageCount: loaded.comic.page_count,
      captions: loaded.comic.captions === 1,
      status: loaded.comic.status,
      characters: loaded.characters.map(presentCharacter),
      pages: [...pages.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([index, panels]) => ({ index, panels })),
    },
  }
}

async function storeMarkup(markup: string) {
  const key = `${crypto.randomUUID()}.svg`
  try {
    await putComicObject(key, markup, "image/svg+xml")
  } catch {
    // The panel row keeps the SVG if R2 is unavailable.
  }
  return { key, markup }
}

async function storeRaster(prompt: string) {
  if (!env.IMAGE_API_KEY) return null
  try {
    const response = await fetch(`${env.IMAGE_BASE_URL || "https://api.openai.com/v1"}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.IMAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.IMAGE_MODEL || "gpt-image-1",
        prompt,
        size: "1024x1024",
      }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as {
      data?: { b64_json?: string; url?: string }[]
    }
    const first = data.data?.[0]
    let bytes: Uint8Array | null = null
    if (first?.b64_json) {
      bytes = Uint8Array.from(atob(first.b64_json), (char) => char.charCodeAt(0))
    } else if (first?.url) {
      const image = await fetch(first.url)
      if (image.ok) bytes = new Uint8Array(await image.arrayBuffer())
    }
    if (!bytes) return null
    const key = `${crypto.randomUUID()}.png`
    await putComicObject(key, bytes, "image/png")
    return { key, markup: "" }
  } catch {
    return null
  }
}

async function maybeScriptWithModel(plan: ComicPlan, story: string) {
  if (!env.AI_API_KEY) return plan
  try {
    const response = await fetch(`${env.AI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.AI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Break a story into one continuous comic. Return JSON with characters [{name,description}] and panels [{speech,caption,instructions}]. Keep the same panel count. Family friendly. Do not restart the plot between panels.",
          },
          {
            role: "user",
            content: JSON.stringify({
              story,
              style: plan.styleId,
              panelCount: plan.panels.length,
              captions: plan.captions,
            }),
          },
        ],
      }),
    })
    if (!response.ok) return plan
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}") as {
      characters?: { name?: string; description?: string }[]
      panels?: { speech?: string; caption?: string; instructions?: string }[]
    }
    if (!parsed.panels || parsed.panels.length !== plan.panels.length) return plan
    return {
      ...plan,
      characters:
        parsed.characters?.filter((character) => character.name).slice(0, 4).map((character) => ({
          name: String(character.name),
          description: String(character.description || character.name),
        })) || plan.characters,
      panels: plan.panels.map((panel, index) => ({
        ...panel,
        speech: String(parsed.panels?.[index]?.speech || panel.speech),
        caption: plan.captions ? String(parsed.panels?.[index]?.caption || panel.caption) : "",
        instructions: String(parsed.panels?.[index]?.instructions || panel.instructions),
      })),
    }
  } catch {
    return plan
  }
}

function needCredits(have: number, cost: number, label: string) {
  if (have >= cost) return null
  return `Not enough credits. ${label} needs ${cost} and you have ${have}. Lower the page count, or add credits on Pricing.`
}

export async function getStudioState(guestId: string) {
  const account = await resolveAccount(guestId)
  const credits = await creditBalance(account.key)
  const latest = await env.DB.prepare(
    `SELECT id FROM comic WHERE account_key = ? ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(account.key)
    .first<{ id: string }>()
  const comic = latest ? presentComic(await loadComic(account.key, latest.id), credits).comic : null
  return {
    ok: true as const,
    account,
    credits,
    comic,
  }
}

export async function prepareComic(input: {
  guestId: string
  story: string
  styleId: string
  layoutId: string
  pageCount: number
  captions: boolean
}) {
  const account = await resolveAccount(input.guestId)
  let plan = planComic(input)
  plan = await maybeScriptWithModel(plan, input.story.trim())
  const credits = await creditBalance(account.key)
  const blocked = needCredits(credits, plan.refCost, "Character references")
  if (blocked) return { ok: false as const, error: blocked, credits }
  const style = getStyle(plan.styleId)
  const comicId = id()
  const created = now()
  const cast = []
  for (const character of plan.characters) {
    const prompt = `${style.prompt}. Character reference sheet of ${character.name}. ${character.description}. Front view, plain background, no text.`
    const raster = await storeRaster(prompt)
    const stored = raster ?? (await storeMarkup(renderCharacterSvg(character.name, character.description, style)))
    cast.push({
      id: id(),
      name: character.name,
      description: character.description,
      palette: JSON.stringify(paletteFor(character.name)),
      ...stored,
    })
  }
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO comic (id, account_key, title, story, style_id, layout_id, page_count, captions, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scripted', ?)`,
    ).bind(
      comicId,
      account.key,
      plan.title,
      input.story.trim(),
      plan.styleId,
      plan.layoutId,
      plan.pageCount,
      plan.captions ? 1 : 0,
      created,
    ),
    ...cast.map((character) =>
      env.DB.prepare(
        `INSERT INTO character_ref (id, comic_id, name, description, palette, image_key, markup, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        character.id,
        comicId,
        character.name,
        character.description,
        character.palette,
        character.key,
        character.markup,
        created,
      ),
    ),
    ...plan.panels.map((panel) =>
      env.DB.prepare(
        `INSERT INTO panel (id, comic_id, page_index, panel_index, caption, speech, instructions, image_key, markup, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, '', ?)`,
      ).bind(id(), comicId, panel.pageIndex, panel.panelIndex, panel.caption, panel.speech, panel.instructions, created),
    ),
  ])
  const balance = await consumeCredits(account.key, plan.refCost, "character-refs", comicId)
  return { ok: true as const, ...presentComic(await loadComic(account.key, comicId), balance) }
}

async function paintPanel(comic: ComicRow, panel: PanelRow, characters: CharacterRow[], seed: number) {
  const style = getStyle(comic.style_id)
  const names = characters.map((character) => character.name)
  const prompt = [
    style.prompt,
    panel.instructions,
    names.length ? `Keep these characters consistent: ${characters.map((c) => `${c.name} (${c.description})`).join("; ")}` : "",
    panel.speech ? `Speech bubble text: ${panel.speech}` : "",
    "Single comic panel, no page border collage.",
  ]
    .filter(Boolean)
    .join(" ")
  const raster = await storeRaster(prompt)
  if (raster) return raster
  return storeMarkup(
    renderPanelSvg({
      style,
      speech: panel.speech,
      caption: comic.captions ? panel.caption : "",
      instructions: panel.instructions,
      names,
      seed,
    }),
  )
}

export async function renderPage(input: { guestId: string; comicId: string; pageIndex: number }) {
  const account = await resolveAccount(input.guestId)
  const loaded = await loadComic(account.key, input.comicId)
  const page = loaded.panels.filter((panel) => panel.page_index === input.pageIndex)
  if (page.length === 0) return { ok: false as const, error: "That page is not in this comic.", credits: await creditBalance(account.key) }
  if (page.every((panel) => panel.markup || panel.image_key)) {
    return { ok: true as const, ...presentComic(loaded, await creditBalance(account.key)) }
  }
  const pending = page.filter((panel) => !panel.markup && !panel.image_key)
  const credits = await creditBalance(account.key)
  const blocked = needCredits(credits, pending.length, `Page ${input.pageIndex + 1}`)
  if (blocked) return { ok: false as const, error: blocked, credits }
  for (const panel of pending) {
    const stored = await paintPanel(loaded.comic, panel, loaded.characters, input.pageIndex * 10 + panel.panel_index)
    await env.DB.prepare(`UPDATE panel SET image_key = ?, markup = ? WHERE id = ?`)
      .bind(stored.key, stored.markup, panel.id)
      .run()
  }
  const balance = await consumeCredits(account.key, pending.length, "panels", input.comicId)
  await env.DB.prepare(`UPDATE comic SET status = 'rendered' WHERE id = ?`).bind(input.comicId).run()
  return { ok: true as const, ...presentComic(await loadComic(account.key, input.comicId), balance) }
}

export async function redrawPanel(input: { guestId: string; panelId: string }) {
  const account = await resolveAccount(input.guestId)
  const panel = await env.DB.prepare(`SELECT * FROM panel WHERE id = ?`).bind(input.panelId).first<PanelRow>()
  if (!panel) return { ok: false as const, error: "Panel not found.", credits: 0 }
  const loaded = await loadComic(account.key, await comicIdForPanel(panel.id, account.key))
  const credits = await creditBalance(account.key)
  const blocked = needCredits(credits, 1, "A redraw")
  if (blocked) return { ok: false as const, error: blocked, credits }
  const current = loaded.panels.find((item) => item.id === panel.id) ?? panel
  const stored = await paintPanel(loaded.comic, current, loaded.characters, now() % 1000)
  await env.DB.prepare(`UPDATE panel SET image_key = ?, markup = ? WHERE id = ?`)
    .bind(stored.key, stored.markup, panel.id)
    .run()
  const balance = await consumeCredits(account.key, 1, "redraw", loaded.comic.id)
  return { ok: true as const, ...presentComic(await loadComic(account.key, loaded.comic.id), balance) }
}

async function comicIdForPanel(panelId: string, accountKey: string) {
  const row = await env.DB.prepare(
    `SELECT panel.comic_id AS comicId FROM panel JOIN comic ON comic.id = panel.comic_id
     WHERE panel.id = ? AND comic.account_key = ?`,
  )
    .bind(panelId, accountKey)
    .first<{ comicId: string }>()
  if (!row) throw new Error("Panel not found.")
  return row.comicId
}

export async function editPanel(input: { guestId: string; panelId: string; speech: string; caption: string }) {
  const account = await resolveAccount(input.guestId)
  const comicId = await comicIdForPanel(input.panelId, account.key)
  const speech = input.speech.slice(0, 180)
  const caption = input.caption.slice(0, 220)
  await env.DB.prepare(`UPDATE panel SET speech = ?, caption = ? WHERE id = ?`).bind(speech, caption, input.panelId).run()
  const loaded = await loadComic(account.key, comicId)
  const panel = loaded.panels.find((item) => item.id === input.panelId)
  if (panel?.markup?.includes("<svg")) {
    const stored = await storeMarkup(
      renderPanelSvg({
        style: getStyle(loaded.comic.style_id),
        speech,
        caption: loaded.comic.captions ? caption : "",
        instructions: panel.instructions,
        names: loaded.characters.map((character) => character.name),
        seed: panel.panel_index,
      }),
    )
    await env.DB.prepare(`UPDATE panel SET image_key = ?, markup = ? WHERE id = ?`)
      .bind(stored.key, stored.markup, panel.id)
      .run()
  }
  return { ok: true as const, ...presentComic(await loadComic(account.key, comicId), await creditBalance(account.key)) }
}

export async function exportComicPage(input: { guestId: string; comicId: string; pageIndex: number }) {
  const account = await resolveAccount(input.guestId)
  const loaded = await loadComic(account.key, input.comicId)
  const page = loaded.panels.filter((panel) => panel.page_index === input.pageIndex && panel.markup?.includes("<svg"))
  if (page.length === 0) {
    return { ok: false as const, error: "Render the page before exporting. Raster panels export from their image links." }
  }
  const svg = renderPageSvg(
    page.map((panel) => ({ markup: panel.markup || "" })),
    loaded.comic.layout_id,
  )
  return { ok: true as const, filename: `${loaded.comic.title.replace(/[^\w]+/g, "-").slice(0, 40) || "comic"}-page-${input.pageIndex + 1}.svg`, svg }
}

export async function readMedia(key: string) {
  await ensureSchema()
  if (!/^[\w.-]+$/.test(key)) return null
  try {
    const object = await getComicObject(key)
    if (object) {
      return new Response(object.body, {
        headers: {
          "content-type": object.httpMetadata?.contentType || "application/octet-stream",
          "cache-control": "public, max-age=3600",
        },
      })
    }
  } catch {
    // Fall through to the database copy.
  }
  const panel = await env.DB.prepare(`SELECT markup FROM panel WHERE image_key = ?`).bind(key).first<{ markup: string }>()
  const character = panel?.markup
    ? panel
    : await env.DB.prepare(`SELECT markup FROM character_ref WHERE image_key = ?`).bind(key).first<{ markup: string }>()
  if (!character?.markup) return null
  return new Response(character.markup, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=3600" },
  })
}

function money(amount: number) {
  return Math.round(amount * 100)
}

export async function startCheckout(input: {
  guestId: string
  kind: "plan" | "pack"
  id: string
  interval: "monthly" | "yearly"
}) {
  const account = await resolveAccount(input.guestId)
  if (account.guest) {
    return { ok: false as const, error: "Sign in before checkout so credits land on your account." }
  }
  if (!env.STRIPE_SECRET_KEY) {
    return {
      ok: false as const,
      error: "Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout. No charge was made.",
    }
  }
  const origin = new URL(request().url).origin
  let name = ""
  let amount = 0
  let credits = 0
  let mode: "payment" | "subscription" = "payment"
  let interval: "month" | "year" | null = null
  if (input.kind === "pack") {
    const pack = PACKS.find((item) => item.id === input.id)
    if (!pack) return { ok: false as const, error: "Unknown credit pack." }
    name = `${pack.name} credits`
    amount = pack.price
    credits = pack.credits
  } else {
    const plan = PLANS.find((item) => item.id === input.id)
    if (!plan || plan.monthlyPrice === 0) return { ok: false as const, error: "That plan does not need checkout." }
    mode = "subscription"
    interval = input.interval === "yearly" ? "year" : "month"
    name = `${plan.name} ${interval === "year" ? "yearly" : "monthly"}`
    amount = interval === "year" ? plan.yearlyPrice : plan.monthlyPrice
    credits = plan.credits
  }
  const checkoutId = id()
  await env.DB.prepare(
    `INSERT INTO checkout (id, account_key, plan_id, credits, amount_cents, status, stripe_session_id, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', NULL, ?)`,
  )
    .bind(checkoutId, account.key, input.id, credits, money(amount), now())
    .run()
  const body = new URLSearchParams({
    mode,
    success_url: `${origin}/app?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    client_reference_id: checkoutId,
    "metadata[account_key]": account.key,
    "metadata[credits]": String(credits),
    "metadata[checkout_id]": checkoutId,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(money(amount)),
    "line_items[0][price_data][product_data][name]": name,
  })
  if (interval) body.set("line_items[0][price_data][recurring][interval]", interval)
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
  const payload = (await response.json()) as { url?: string; id?: string; error?: { message?: string } }
  if (!response.ok || !payload.url) {
    return { ok: false as const, error: payload.error?.message || "Checkout failed." }
  }
  await env.DB.prepare(`UPDATE checkout SET stripe_session_id = ? WHERE id = ?`).bind(payload.id ?? null, checkoutId).run()
  return { ok: true as const, url: payload.url }
}

async function verifyStripe(payload: string, header: string) {
  const secret = env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.")
  const parts = header.split(",").map((part) => {
    const index = part.indexOf("=")
    return [part.slice(0, index), part.slice(index + 1)] as const
  })
  const timestamp = parts.find(([key]) => key === "t")?.[1]
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value)
  if (!timestamp || signatures.length === 0) throw new Error("Missing Stripe signature.")
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`))
  const hex = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  if (!signatures.includes(hex)) throw new Error("Invalid Stripe signature.")
}

export async function handleStripeWebhook(request: Request) {
  const payload = await request.text()
  const header = request.headers.get("stripe-signature") || ""
  await verifyStripe(payload, header)
  const event = JSON.parse(payload) as {
    type?: string
    data?: { object?: { metadata?: Record<string, string>; client_reference_id?: string } }
  }
  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    const metadata = event.data?.object?.metadata ?? {}
    const accountKey = metadata.account_key
    const credits = Number(metadata.credits || 0)
    const checkoutId = metadata.checkout_id || event.data?.object?.client_reference_id
    if (accountKey && credits > 0) {
      if (checkoutId) {
        const row = await env.DB.prepare(`SELECT status FROM checkout WHERE id = ?`).bind(checkoutId).first<{ status: string }>()
        if (row?.status === "paid") return new Response("ok")
        await env.DB.prepare(`UPDATE checkout SET status = 'paid' WHERE id = ?`).bind(checkoutId).run()
      }
      const months = event.type === "invoice.paid" ? null : now() + 1000 * 60 * 60 * 24 * 183
      await grantCredits({
        accountKey,
        amount: credits,
        source: event.type === "invoice.paid" ? "subscription" : "pack",
        expiresAt: event.type === "invoice.paid" ? null : months,
        reason: event.type,
      })
    }
  }
  return new Response("ok")
}

export function layoutCost(layoutId: string) {
  return getLayout(layoutId).panels
}
