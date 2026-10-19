export type Post = {
  slug: string
  title: string
  date: string
  description: string
  body: string[]
}

export const POSTS: Post[] = [
  {
    slug: "best-ai-comic-factory-alternative-2026",
    title: "Best AI Comic Factory Alternative (2026)",
    date: "2026-09-30",
    description: "What to look for when a one-shot image tool is not enough for a comic.",
    body: [
      "A comic is a sequence. The useful test of an AI comic tool is whether page four still shows the person you met on page one, with dialogue that follows the scene you pasted.",
      "Single-image generators are strong at a still. They make you re-prompt costume, camera, and mood for every frame, and the face drifts. A comic pipeline should take the story first, lock a reference for each character, then draw panels against that reference.",
      "When you compare tools, check four things: can you paste prose instead of a prompt stack, can you pick a layout (grid, strip, or vertical), can you redraw one panel without restarting the book, and can you export a page. Comic Factory is built around that path.",
    ],
  },
  {
    slug: "how-to-generate-comics-with-ai",
    title: "How to Generate Comics with AI: A Practical Step-by-Step Guide",
    date: "2026-09-28",
    description: "From a raw scene to a page you can download.",
    body: [
      "Start with a scene you already wrote. A few sentences with names is better than a pile of camera jargon. Keep it family-friendly.",
      "Pick a style and a layout before you generate. Modern American, manga, clear-line, and pulp pages ask for different inks, but the cast should stay put. A grid is the fastest print-style page. A strip fits a social post. Vertical fits a scroll.",
      "Generate character references first, then the page. If a face slips, redraw that panel. Edit the speech bubble when the line is wrong. Export the page when the sequence reads.",
      "Credits map to images: one reference or one panel is one credit. A failed render should not keep the credit. Free starter credits are enough to finish about one page and see if the story holds.",
    ],
  },
]
