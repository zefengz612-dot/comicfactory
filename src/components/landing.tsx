import { Link } from "@tanstack/react-router"
import { SiteFooter, SiteHeader } from "~/components/site"
import { STYLES, type StyleDef } from "~/modules/comic/styles"

const reasons = [
  {
    title: "Single images aren't comics",
    body: "Midjourney and ChatGPT give you one frame. A comic needs a sequence — beats, dialogue, and a page that actually reads.",
  },
  {
    title: "Characters keep changing faces",
    body: "Panel 1 looks right. Panel 4 looks like a cousin. Consistency is the #1 reason AI comics fall apart.",
  },
  {
    title: "Prompting every panel is a second job",
    body: "You came to tell a story — not to engineer twenty camera angles and costume notes by hand.",
  },
]

const steps = [
  { title: "Paste your story", body: "A scene, chapter, or short draft is enough. No special prompt syntax." },
  {
    title: "AI breaks it into panels",
    body: "Comic Factory pulls characters, dialogue, and camera beats — then locks a visual reference for each cast member.",
  },
  { title: "Get pages you can ship", body: "Render consistent panels, flip through the page, export when it feels right." },
]

const outcomes = [
  {
    title: "Story in, scripted panels out",
    body: "Prose becomes paced panels with action and dialogue. You edit the story, not a pile of stray image prompts.",
  },
  {
    title: "Same face from page one to the end",
    body: "Character refs lock hair, costume, and look so your cast stays on-model across the whole comic.",
  },
  {
    title: "Layouts that fit how you publish",
    body: "Grids for print-style pages, strips for social, vertical flow when you want a scrollable read.",
  },
  {
    title: "Export when you're ready",
    body: "Download finished pages for Instagram, Webtoon drafts, pitch decks, or classroom handouts.",
  },
]

const audiences = [
  { title: "Writers", body: "Prototype a graphic novel chapter before hiring an artist — or prove the scene works on the page." },
  { title: "OC creators", body: "Put original characters into motion without redrawing them from scratch every panel." },
  { title: "Social creators", body: "Ship a comic strip this week, not after a month of learning illustration tools." },
  {
    title: "Teachers & educators",
    body: "Turn a lesson or short story into a visual sequence students actually finish reading.",
  },
]

const faqs = [
  { q: "Do I need to install anything?", a: "No. Comic Factory runs in the browser. Paste a story, pick a style, and generate panels online — nothing to download." },
  {
    q: "Will my characters look the same across panels?",
    a: "That's the point. Before drawing pages, Comic Factory builds a visual reference for each character, then conditions every panel on it so faces, hair, and outfits stay on-model.",
  },
  {
    q: "Can I paste a raw story, or do I need special prompts?",
    a: "Paste a scene, short story, or chapter as-is. The AI parses the narrative, extracts characters and beats, then breaks it into panels and dialogue — you don't need to prompt each frame.",
  },
  {
    q: "How is this different from Midjourney or ChatGPT images?",
    a: "Those tools excel at single images. A comic needs sequence, dialogue, and continuity. Comic Factory is a story → script → consistent panels pipeline, not a one-shot image box.",
  },
  {
    q: "What can I download when the comic is done?",
    a: "Finished pages export as images ready for social posts, webtoon drafts, classroom use, or sharing a graphic-novel prototype.",
  },
  {
    q: "Who is Comic Factory for?",
    a: "Writers prototyping graphic novels, OC artists putting characters in motion, social creators shipping strips fast, and teachers illustrating stories — anyone whose bottleneck is drawing time, not ideas.",
  },
]

const heroPanels = [
  { panel: 1, span: "col-span-4 row-span-3", priority: true },
  { panel: 2, span: "col-span-2 row-span-3", priority: true },
  { panel: 3, span: "col-span-2 row-span-3", priority: false },
  { panel: 4, span: "col-span-4 row-span-3", priority: false },
]

function isImpact(line: string) {
  const letters = line.replace(/[^A-Za-z]/g, "")
  return letters.length > 1 && letters === letters.toUpperCase()
}

function ExamplePage({ style }: { style: StyleDef }) {
  const impact = isImpact(style.bubbles[1])
  const cells = [
    { panel: 1, span: "col-span-4 row-span-3", bubble: style.bubbles[0], impact: "" },
    { panel: 2, span: "col-span-2 row-span-3", bubble: "", impact: "" },
    { panel: 3, span: "col-span-2 row-span-3", bubble: impact ? "" : style.bubbles[1], impact: impact ? style.bubbles[1] : "" },
    { panel: 4, span: "col-span-4 row-span-3", bubble: style.bubbles[2], impact: "" },
  ]
  return (
    <div className="example-page grid grid-cols-6 grid-rows-6 gap-2 bg-[var(--ink)] p-2 shadow-[10px_12px_0_rgba(18,24,32,0.16)]">
      {cells.map((cell) => (
        <div key={cell.panel} className={`relative min-h-[8rem] overflow-hidden bg-[#1a222c] md:min-h-[11rem] ${cell.span}`}>
          <img
            src={`/examples/${style.folder}/panel-${cell.panel}.webp`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {cell.bubble ? (
            <span className="absolute bottom-2 right-2 z-10 max-w-[70%] bg-white/90 px-2 py-1 text-xs font-semibold text-[var(--ink)] md:text-sm">
              {cell.bubble}
            </span>
          ) : null}
          {cell.impact ? (
            <span className="landing-display pointer-events-none absolute bottom-2 left-2 z-10 text-3xl leading-none text-[var(--accent-hot)] md:text-5xl">
              {cell.impact}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader variant="overlay" />
      <main id="content">
        <section className="landing-hero relative isolate min-h-[100svh] overflow-hidden">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="landing-hero-art absolute inset-0 overflow-hidden bg-[var(--ink)]">
              <div className="hero-comic-bleed absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1.5 p-1.5 md:gap-2 md:p-2">
                {heroPanels.map((cell) => (
                  <div key={cell.panel} className={`relative min-h-0 overflow-hidden bg-[#1a222c] ${cell.span}`}>
                    <img
                      src={`/examples/american-modern/panel-${cell.panel}.webp`}
                      alt=""
                      fetchPriority={cell.priority ? "high" : "auto"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="landing-hero-scrim absolute inset-0" />
            </div>
          </div>
          <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 md:justify-center md:px-8 md:pb-20 md:pt-24">
            <div className="landing-hero-copy max-w-xl">
              <h1 className="landing-display text-5xl text-white sm:text-6xl md:text-7xl lg:text-8xl">AI Comic Generator</h1>
              <p className="mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
                You have the story. We draw the comic.
              </p>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
                Just enter a story - get a comic with story continuity and character consistency.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/app"
                  search={{ style: undefined }}
                  className="landing-cta-primary inline-flex items-center justify-center rounded-sm px-6 py-3 text-base font-semibold"
                >
                  Generate a comic — start free
                </Link>
                <a href="#styles" className="text-sm font-medium text-white/75 underline-offset-4 hover:text-white hover:underline md:text-base">
                  See style examples
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--rule)]">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Why an AI comic generator beats a single image</h2>
            <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">
              Most AI art tools stop at a pretty still. Comic Factory is built for the gap between writing a scene and having a finished page.
            </p>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {reasons.map((reason, index) => (
                <li key={reason.title}>
                  <p className="landing-display-quiet text-4xl text-[var(--accent)]">0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold">{reason.title}</h3>
                  <p className="mt-2 text-[var(--ink-muted)]">{reason.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="styles" className="border-t border-[var(--rule)]">
          <div className="mx-auto max-w-6xl px-5 pt-20 md:px-8 md:pt-28">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Comic styles you can generate</h2>
            <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">
              One AI comic generator, many looks — from modern American to manga, pulp, and clear-line European pages.
            </p>
          </div>
          {STYLES.map((style, index) => (
            <div key={style.id} className={index % 2 === 0 ? "bg-[var(--paper-2)]" : "bg-[var(--paper)]"}>
              <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
                <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-14 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <div className="max-w-lg">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{style.name}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{style.kicker}</h3>
                    <p className="mt-4 leading-relaxed text-[var(--ink-muted)]">{style.blurb}</p>
                    <Link
                      to="/app"
                      search={{ style: style.id }}
                      className="landing-cta-primary mt-8 inline-flex items-center justify-center rounded-sm px-6 py-3 text-base font-semibold"
                    >
                      Try {style.name}
                    </Link>
                  </div>
                  <ExamplePage style={style} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="border-t border-[var(--rule)]">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">How this AI comic generator works</h2>
            <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
              Built for writers who want finished pages — not a weekend lost to prompt spaghetti.
            </p>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <p className="landing-display-quiet text-4xl text-[var(--accent)]">0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[var(--ink-muted)]">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-[var(--rule)] bg-[var(--paper)]">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Multi-page story</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Keep characters consistent across every page</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--ink-muted)]">
              Other AI tools reset every frame. Comic Factory carries plot, pacing, and character look from page 1 to page 6 — so your comic reads as one story, not six disconnected pictures.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {["01", "02", "03", "04", "05", "06"].map((panel, index) => (
                <article key={panel}>
                  <div className="bg-[var(--ink)] p-1.5 shadow-[6px_8px_0_rgba(18,24,32,0.12)]">
                    <img
                      src={`/examples/skyrail-heist/panel-${panel}.webp`}
                      alt={`Skyrail heist panel ${index + 1}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-center text-sm font-semibold text-[var(--ink-muted)]">{index + 1}/6</p>
                </article>
              ))}
            </div>
            <Link
              to="/app"
              search={{ style: undefined }}
              className="landing-cta-primary mt-12 inline-flex items-center justify-center rounded-sm px-6 py-3 text-base font-semibold"
            >
              Paste a story like this
            </Link>
          </div>
        </section>

        <section className="border-t border-[var(--rule)] bg-[var(--paper-2)]">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">What you get from an AI comic generator</h2>
            <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">A pipeline from draft to page — so the comic stays coherent when you add the next beat.</p>
            <div className="mt-14 grid gap-12 md:grid-cols-2">
              {outcomes.map((item) => (
                <article key={item.title} className="max-w-md">
                  <h3 className="text-xl font-semibold md:text-2xl">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--rule)]">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">Built for writers who need an AI comic generator</h2>
            <p className="mt-3 max-w-xl text-[var(--ink-muted)]">If the bottleneck is art time, not ideas, this is for you.</p>
            <ul className="mt-12 grid gap-10 sm:grid-cols-2">
              {audiences.map((item) => (
                <li key={item.title} className="max-w-md">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-[var(--rule)] bg-[var(--paper-2)]">
          <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">AI comic generator FAQ</h2>
            <div className="mt-10 space-y-8">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-lg font-semibold md:text-xl">{faq.q}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--ink-muted)]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--rule)] bg-[var(--ink)] text-[var(--paper)]">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-8 md:py-24">
            <div>
              <p className="landing-display text-4xl text-white md:text-5xl">Comic Factory</p>
              <p className="mt-2 max-w-md text-lg text-[var(--paper-muted)]">Stop stalling on the art. Paste the scene you already wrote.</p>
            </div>
            <Link
              to="/app"
              search={{ style: undefined }}
              className="landing-cta-on-dark inline-flex items-center justify-center rounded-sm px-6 py-3 text-base font-semibold"
            >
              Start free in browser
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
