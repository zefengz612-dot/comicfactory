import type { StyleDef } from "./styles"

export type Palette = {
  hair: string
  skin: string
  cloth: string
  trim: string
}

const HAIR = ["#1b1b1b", "#c9ccd1", "#6b3a22", "#2c1810", "#d8b15a", "#3d4a38"]
const SKIN = ["#f0c7a4", "#e0ac88", "#c68642", "#8d5524", "#f6d7c3"]
const CLOTH = ["#1f4e79", "#8c2f2f", "#2f6b4f", "#5c4a8a", "#b45309", "#0f766e"]

function hash(text: string) {
  let value = 0
  for (const char of text) value = (value * 33 + char.charCodeAt(0)) >>> 0
  return value
}

export function paletteFor(name: string): Palette {
  const n = hash(name)
  return {
    hair: HAIR[n % HAIR.length],
    skin: SKIN[(n >> 3) % SKIN.length],
    cloth: CLOTH[(n >> 6) % CLOTH.length],
    trim: HAIR[(n >> 9) % HAIR.length],
  }
}

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function wrap(text: string, width: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > width && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 4)
}

function figure(x: number, y: number, scale: number, palette: Palette, mood: number) {
  const lean = mood % 2 === 0 ? -6 : 8
  return `
    <g transform="translate(${x} ${y}) rotate(${lean}) scale(${scale})">
      <ellipse cx="0" cy="78" rx="34" ry="8" fill="#000" opacity="0.18"/>
      <path d="M-18 18 L-28 70 L-8 70 L-4 28 Z" fill="${palette.cloth}"/>
      <path d="M18 18 L28 70 L8 70 L4 28 Z" fill="${palette.cloth}"/>
      <path d="M-22 16 H22 L16 46 H-16 Z" fill="${palette.cloth}" stroke="${palette.trim}" stroke-width="2"/>
      <circle cx="0" cy="-8" r="16" fill="${palette.skin}"/>
      <path d="M-16 -10 Q0 -28 16 -10 Q10 -22 -10 -22 Z" fill="${palette.hair}"/>
      <circle cx="-5" cy="-8" r="1.4" fill="#1a120c"/>
      <circle cx="5" cy="-8" r="1.4" fill="#1a120c"/>
      <path d="M-4 -1 Q0 3 5 -1" fill="none" stroke="#1a120c" stroke-width="1.2"/>
    </g>`
}

export function renderCharacterSvg(name: string, description: string, style: StyleDef) {
  const palette = paletteFor(name)
  const lines = wrap(description, 42)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 460" width="360" height="460">
  <rect width="360" height="460" fill="${style.paper}"/>
  <rect x="16" y="16" width="328" height="428" fill="${style.sky}" stroke="${style.ink}" stroke-width="6"/>
  <rect x="16" y="300" width="328" height="144" fill="${style.ground}"/>
  ${figure(180, 250, 1.7, palette, hash(name))}
  <rect x="28" y="28" width="304" height="36" fill="${style.paper}" stroke="${style.ink}" stroke-width="3"/>
  <text x="180" y="52" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="700" fill="${style.ink}">${escapeXml(name)}</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="180" y="${360 + index * 18}" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="${style.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n")}
</svg>`
}

export function renderPanelSvg(input: {
  style: StyleDef
  speech: string
  caption: string
  instructions: string
  names: string[]
  seed: number
}) {
  const { style } = input
  const cast = (input.names.length ? input.names : ["Lead"]).slice(0, 2)
  const figures = cast
    .map((name, index) =>
      figure(cast.length === 1 ? 400 : 260 + index * 280, 300, 1.35, paletteFor(name), input.seed + index),
    )
    .join("\n")
  const action = /boom|krak|pow|whoosh|bonk|crash/i.test(`${input.speech} ${input.instructions}`)
  const speech = wrap(input.speech || "…", 28)
  const caption = input.caption ? wrap(input.caption, 70) : []
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
  <rect width="800" height="520" fill="${style.paper}"/>
  <rect x="10" y="10" width="780" height="500" fill="${style.sky}" stroke="${style.ink}" stroke-width="8"/>
  <rect x="10" y="340" width="780" height="170" fill="${style.ground}"/>
  ${
    action
      ? `<g stroke="${style.accent}" stroke-width="4" opacity="0.85">
          <path d="M80 80 L180 40"/><path d="M120 120 L240 60"/><path d="M620 70 L740 30"/><path d="M580 120 L720 80"/>
        </g>`
      : ""
  }
  ${figures}
  <path d="M70 70 h250 q24 0 24 24 v70 q0 24 -24 24 h-40 l-24 28 v-28 h-186 q-24 0 -24 -24 v-70 q0 -24 24 -24z" fill="${style.paper}" stroke="${style.ink}" stroke-width="4"/>
  ${speech
    .map(
      (line, index) =>
        `<text x="195" y="${108 + index * 22}" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="700" fill="${style.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n")}
  ${
    caption.length
      ? `<rect x="28" y="430" width="744" height="62" fill="${style.paper}" stroke="${style.ink}" stroke-width="3"/>
         ${caption
           .slice(0, 2)
           .map(
             (line, index) =>
               `<text x="40" y="${456 + index * 18}" font-family="Georgia, serif" font-size="14" fill="${style.ink}">${escapeXml(line)}</text>`,
           )
           .join("\n")}`
      : ""
  }
</svg>`
}

export function renderPageSvg(panels: { markup: string }[], layoutId: string) {
  const slots =
    layoutId === "strip"
      ? [
          [12, 12, 250, 360],
          [274, 12, 250, 360],
          [536, 12, 250, 360],
        ]
      : layoutId === "vertical"
        ? [
            [40, 12, 720, 220],
            [40, 244, 720, 220],
            [40, 476, 720, 220],
            [40, 708, 720, 220],
          ]
        : layoutId === "splash"
          ? [
              [12, 12, 776, 430],
              [12, 454, 380, 250],
              [408, 454, 380, 250],
            ]
          : [
              [12, 12, 380, 300],
              [408, 12, 380, 300],
              [12, 324, 380, 300],
              [408, 324, 380, 300],
            ]
  const height = layoutId === "vertical" ? 940 : layoutId === "splash" ? 720 : layoutId === "strip" ? 390 : 640
  const images = panels.slice(0, slots.length).map((panel, index) => {
    const [x, y, w, h] = slots[index]
    const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(panel.markup)}`
    return `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" />`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${height}" width="800" height="${height}">
  <rect width="800" height="${height}" fill="#f4f7f6"/>
  ${images.join("\n")}
</svg>`
}
