export type StyleDef = {
  id: string
  name: string
  folder: string
  kicker: string
  blurb: string
  bubbles: [string, string, string]
  prompt: string
  sky: string
  ground: string
  ink: string
  accent: string
  paper: string
}

export const STYLES: StyleDef[] = [
  {
    id: "american-modern",
    name: "American (modern)",
    folder: "american-modern",
    kicker: "Same hero. Every camera angle.",
    blurb: "Modern digital comics need wide shots, close-ups, and leaps — without the face morphing.",
    bubbles: ["They're jamming us.", "KRAKOOM!", "Signal clear."],
    prompt: "modern American digital comic, bold ink, cinematic color, consistent character design",
    sky: "#24344a",
    ground: "#1b2430",
    ink: "#f4efe6",
    accent: "#e85d4c",
    paper: "#f7f1e6",
  },
  {
    id: "japanese",
    name: "Japanese",
    folder: "japanese",
    kicker: "Soft lines. Soft story. Same girl.",
    blurb: "Manga pages live on expression — blush, glance, rain on a platform — without a new face every panel.",
    bubbles: ["Wait—", "…you came.", "Let's walk."],
    prompt: "manga page, clean screentone, expressive eyes, consistent character, soft rain lighting",
    sky: "#d7e4f2",
    ground: "#8ea0b5",
    ink: "#1c2430",
    accent: "#6aa4d8",
    paper: "#f7fbff",
  },
  {
    id: "franco-belgian",
    name: "Franco-Belgian",
    folder: "franco-belgian",
    kicker: "Clear line. Clear chase.",
    blurb: "Bande dessinée scooters and alley turns stay on-model when the cast is locked.",
    bubbles: ["Paris today.", "This alley!", "Found it."],
    prompt: "Franco-Belgian clear-line comic, flat color, precise ink, consistent character",
    sky: "#9fd0ea",
    ground: "#e7d7a4",
    ink: "#1a2740",
    accent: "#e23b2f",
    paper: "#fffaf0",
  },
  {
    id: "american-1950",
    name: "American (1950)",
    folder: "american-1950",
    kicker: "Vintage POW. Same jawline.",
    blurb: "1950s pulp color still needs one readable hero from skyline to vault to fire escape.",
    bubbles: ["Trouble downtown!", "POW!", "Case closed."],
    prompt: "1950s American pulp comic, Ben-Day dots, primary colors, consistent hero",
    sky: "#f2c14e",
    ground: "#c4492c",
    ink: "#1a120c",
    accent: "#1d4e89",
    paper: "#f8e7c4",
  },
  {
    id: "flying-saucer",
    name: "Flying saucer",
    folder: "flying-saucer",
    kicker: "Pulp skies. One captain.",
    blurb: "First-contact beats stay coherent when the flight jacket and face don't reset each frame.",
    bubbles: ["Object inbound!", "Don't shoot!", "We talk."],
    prompt: "1950s sci-fi pulp comic, saucer, flight jacket, consistent captain",
    sky: "#1d3d73",
    ground: "#c9d4c2",
    ink: "#f4f7fb",
    accent: "#7dcea0",
    paper: "#e7eef8",
  },
  {
    id: "humanoid",
    name: "Humanoid",
    folder: "humanoid",
    kicker: "Desert surreal. Same walker.",
    blurb: "Moebius-style dunes and hatches still need one readable traveler across the page.",
    bubbles: ["The dunes sing.", "A door?", "Down we go."],
    prompt: "Moebius-like desert surreal comic, fine line, pastel dunes, consistent traveler",
    sky: "#f3d7a1",
    ground: "#e7b86a",
    ink: "#3a2a22",
    accent: "#d36b4f",
    paper: "#fff6e8",
  },
  {
    id: "clear-line",
    name: "Clear Line",
    folder: "haddock",
    kicker: "Clear line. Harbor mystery.",
    blurb: "Adventure docks and chase beats keep the reporter on-model from clue to crate.",
    bubbles: ["The ship left clues.", "Follow that truck!", "Got you."],
    prompt: "clear-line harbor adventure comic, reporter, docks, consistent character",
    sky: "#8ec6e6",
    ground: "#d8c39a",
    ink: "#1c2a3a",
    accent: "#1f6f8b",
    paper: "#f6f3ea",
  },
  {
    id: "armorican",
    name: "Armorican",
    folder: "armorican",
    kicker: "Gauls, Romans — one grin.",
    blurb: "Historical comedy pages still need the same warrior from palisade to feast.",
    bubbles: ["Romans again!", "BONK!", "To the feast!"],
    prompt: "historical comedy comic, Gaul village, bold outlines, consistent warrior",
    sky: "#87b8e0",
    ground: "#6ea15a",
    ink: "#2a1c12",
    accent: "#e2b33a",
    paper: "#fff8ea",
  },
  {
    id: "3d-render",
    name: "3D Render",
    folder: "3d-render",
    kicker: "Movie lighting. Same kid every shot.",
    blurb: "Wide garage, close-up wonder, launch, sky — 3D still needs one readable face.",
    bubbles: ["She's ready.", "WHOOSH!", "Higher!"],
    prompt: "stylized 3D animated film still, cinematic lighting, consistent character",
    sky: "#6ea0d6",
    ground: "#c9845a",
    ink: "#1b2430",
    accent: "#f0c35a",
    paper: "#f3f6fb",
  },
]

export function getStyle(id: string) {
  return STYLES.find((style) => style.id === id) ?? STYLES[0]
}

export type LayoutDef = {
  id: string
  name: string
  panels: number
  note: string
}

export const LAYOUTS: LayoutDef[] = [
  { id: "grid", name: "Grid", panels: 4, note: "Print-style 2×2 page" },
  { id: "strip", name: "Strip", panels: 3, note: "Social strip" },
  { id: "vertical", name: "Vertical", panels: 4, note: "Scrollable read" },
  { id: "splash", name: "Splash", panels: 3, note: "One wide beat plus two insets" },
]

export function getLayout(id: string) {
  return LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0]
}

export const STORY_EXAMPLES = [
  {
    id: "skyrail",
    label: "Skyrail heist",
    styleId: "american-modern",
    story:
      "On the midnight Skyrail cargo train, courier Reno opens bay seven and finds thieves dismantling a city energy core. Silver-haired Vex is undercover among them. Over six pages they fight through rain-slick cars, jam the core with her magnetic mail clasp, and cut the detonator line before the train falls on the slums.",
  },
  {
    id: "market",
    label: "Spice market chase",
    styleId: "franco-belgian",
    story:
      "At the Sunday spice market, courier Tavi sees a thief snatch a brass music box from an old woman. He races through saffron stalls and hanging rugs, vaults a goat cart, and corners the thief—only to find a scared kid trying to return a family heirloom they thought was stolen years ago.",
  },
  {
    id: "bus",
    label: "Rainy bus stop",
    styleId: "japanese",
    story:
      "Jun waits under a broken bus-stop light in the rain. Mei arrives with an umbrella too small for two. He almost pockets the letter he wrote her, then offers it instead.",
  },
]
