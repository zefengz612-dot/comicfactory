import { getLayout, getStyle } from "./styles.ts"

const BLOCKED =
  /\b(nsfw|porn|porno|nude|nudes|naked|sex|sexual|erotic|xxx|hentai|explicit)\b/i

const NAME_STOP = new Set([
  "The",
  "A",
  "An",
  "I",
  "He",
  "She",
  "They",
  "Then",
  "When",
  "After",
  "Before",
  "Over",
  "At",
  "On",
  "In",
  "And",
  "But",
  "Sunday",
  "Monday",
  "Paris",
  "Romans",
  "Roman",
  "Skyrail",
])

export type CharacterPlan = {
  name: string
  description: string
}

export type PanelPlan = {
  pageIndex: number
  panelIndex: number
  speech: string
  caption: string
  instructions: string
}

export type ComicPlan = {
  title: string
  styleId: string
  layoutId: string
  pageCount: number
  captions: boolean
  characters: CharacterPlan[]
  panels: PanelPlan[]
  refCost: number
  pageCost: number
  totalCost: number
}

export function assertFamilyFriendly(story: string) {
  if (BLOCKED.test(story)) {
    throw new Error(
      "This story violates our content policy (no NSFW or sexual content). Please revise and try again.",
    )
  }
}

export function extractCharacters(story: string): CharacterPlan[] {
  const counts = new Map<string, number>()
  const re = /\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?)\b/g
  for (const match of story.matchAll(re)) {
    const name = match[1]
    if (NAME_STOP.has(name) || NAME_STOP.has(name.split(" ")[0])) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  if (ranked.length === 0) {
    return [
      {
        name: "Lead",
        description: "The protagonist of this story, same face, hair, and clothes in every panel.",
      },
    ]
  }
  return ranked.map(([name]) => ({
    name,
    description: `${name}, locked visual reference: same face, hair, and costume in every panel of this comic.`,
  }))
}

function splitBeats(story: string, count: number) {
  const cleaned = story.replace(/\s+/g, " ").trim()
  let parts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length < count) {
    parts = cleaned
      .split(/[,;]|(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 12)
  }
  if (parts.length === 0) parts = [cleaned || "A quiet panel."]
  if (parts.length >= count) {
    const beats: string[] = []
    for (let i = 0; i < count; i++) {
      const start = Math.floor((i * parts.length) / count)
      const end = Math.floor(((i + 1) * parts.length) / count)
      beats.push(parts.slice(start, Math.max(end, start + 1)).join(" "))
    }
    return beats
  }
  const beats = [...parts]
  while (beats.length < count) {
    const source = parts[beats.length % parts.length]
    beats.push(`${source} The next moment stays on the same characters.`)
  }
  return beats.slice(0, count)
}

function shorten(text: string, max: number) {
  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, max - 1).trim()}…`
}

function speechFrom(beat: string) {
  const quoted = beat.match(/"([^"]+)"/)?.[1] ?? beat.match(/“([^”]+)”/)?.[1]
  if (quoted) return shorten(quoted, 80)
  const words = beat.replace(/[.!?]+$/g, "").split(" ")
  return shorten(words.slice(-10).join(" "), 80)
}

export function titleFrom(story: string) {
  const sentence = story.split(/(?<=[.!?])\s+/)[0] ?? story
  return shorten(sentence.replace(/[.!?]+$/g, ""), 64) || "Untitled comic"
}

export function planComic(input: {
  story: string
  styleId: string
  layoutId: string
  pageCount: number
  captions: boolean
}): ComicPlan {
  assertFamilyFriendly(input.story)
  const story = input.story.trim()
  if (story.length < 12) {
    throw new Error("Paste a little more story — a scene is enough.")
  }
  const style = getStyle(input.styleId)
  const layout = getLayout(input.layoutId)
  const pageCount = Math.min(6, Math.max(1, Math.floor(input.pageCount)))
  const characters = extractCharacters(story)
  const beats = splitBeats(story, pageCount * layout.panels)
  const panels = beats.map((beat, index) => ({
    pageIndex: Math.floor(index / layout.panels),
    panelIndex: index % layout.panels,
    instructions: beat,
    speech: speechFrom(beat),
    caption: input.captions ? shorten(beat, 96) : "",
  }))
  const refCost = characters.length
  const pageCost = layout.panels
  return {
    title: titleFrom(story),
    styleId: style.id,
    layoutId: layout.id,
    pageCount,
    captions: input.captions,
    characters,
    panels,
    refCost,
    pageCost,
    totalCost: refCost + pageCost * pageCount,
  }
}

export function pagePanels(plan: ComicPlan, pageIndex: number) {
  return plan.panels.filter((panel) => panel.pageIndex === pageIndex)
}
