import { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import { authClient } from "~/core/auth-client"
import {
  editPanelFn,
  exportPageFn,
  getStudioStateFn,
  prepareComicFn,
  redrawPanelFn,
  renderPageFn,
} from "~/modules/comic/fns"
import { LAYOUTS, STORY_EXAMPLES, STYLES, getLayout } from "~/modules/comic/styles"

type Panel = {
  id: string
  pageIndex: number
  panelIndex: number
  caption: string
  speech: string
  instructions: string
  imageUrl: string
}

type Character = { id: string; name: string; description: string; imageUrl: string }

type Comic = {
  id: string
  title: string
  styleId: string
  layoutId: string
  pageCount: number
  characters: Character[]
  pages: { index: number; panels: Panel[] }[]
}

function useGuestId() {
  const [guestId, setGuestId] = useState<string | null>(null)
  useEffect(() => {
    const key = "comic-factory-guest"
    let value = localStorage.getItem(key)
    if (!value) {
      value = crypto.randomUUID()
      localStorage.setItem(key, value)
    }
    setGuestId(value)
  }, [])
  return guestId
}

export function Studio({ initialStyle }: { initialStyle?: string }) {
  const guestId = useGuestId()
  const session = authClient.useSession()
  const [story, setStory] = useState(STORY_EXAMPLES[0].story)
  const [styleId, setStyleId] = useState(initialStyle && STYLES.some((style) => style.id === initialStyle) ? initialStyle : "american-modern")
  const [layoutId, setLayoutId] = useState("grid")
  const [pageCount, setPageCount] = useState(1)
  const [captions, setCaptions] = useState(true)
  const [credits, setCredits] = useState<number | null>(null)
  const [comic, setComic] = useState<Comic | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState<Panel | null>(null)
  const [edit, setEdit] = useState<Panel | null>(null)

  useEffect(() => {
    if (!guestId) return
    let cancel = false
    getStudioStateFn({ data: { guestId } }).then((result) => {
      if (cancel || !result.ok) return
      setCredits(result.credits)
      if (result.comic) {
        setComic(result.comic)
        setStory(result.comic.story)
        setStyleId(result.comic.styleId)
        setLayoutId(result.comic.layoutId)
        setPageCount(result.comic.pageCount)
      }
    })
    return () => {
      cancel = true
    }
  }, [guestId])

  const layout = getLayout(layoutId)
  const estimate = useMemo(() => layout.panels * pageCount + 2, [layout.panels, pageCount])
  const currentPage = comic?.pages.find((page) => page.index === pageIndex)
  const rendered = currentPage?.panels.some((panel) => panel.imageUrl) ?? false

  async function prepare() {
    if (!guestId) return
    setBusy("Locking character references…")
    setError(null)
    const result = await prepareComicFn({
      data: { guestId, story, styleId, layoutId, pageCount, captions },
    })
    setBusy(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setComic(result.comic)
    setCredits(result.credits)
    setPageIndex(0)
    setBusy("Drawing page 1…")
    const drawn = await renderPageFn({ data: { guestId, comicId: result.comic.id, pageIndex: 0 } })
    setBusy(null)
    if (!drawn.ok) {
      setError(drawn.error)
      if ("credits" in drawn && typeof drawn.credits === "number") setCredits(drawn.credits)
      return
    }
    setComic(drawn.comic)
    setCredits(drawn.credits)
  }

  async function drawPage(index: number) {
    if (!guestId || !comic) return
    setBusy(`Drawing page ${index + 1}…`)
    setError(null)
    const result = await renderPageFn({ data: { guestId, comicId: comic.id, pageIndex: index } })
    setBusy(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setComic(result.comic)
    setCredits(result.credits)
    setPageIndex(index)
  }

  async function redraw(panel: Panel) {
    if (!guestId) return
    setBusy("Redrawing panel…")
    setError(null)
    const result = await redrawPanelFn({ data: { guestId, panelId: panel.id } })
    setBusy(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setComic(result.comic)
    setCredits(result.credits)
  }

  async function saveEdit() {
    if (!guestId || !edit) return
    setBusy("Updating dialogue…")
    const result = await editPanelFn({
      data: { guestId, panelId: edit.id, speech: edit.speech, caption: edit.caption },
    })
    setBusy(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setComic(result.comic)
    setEdit(null)
  }

  async function download() {
    if (!guestId || !comic) return
    setBusy("Building the page export…")
    const result = await exportPageFn({ data: { guestId, comicId: comic.id, pageIndex } })
    setBusy(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const blob = new Blob([result.svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = result.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--rule)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/brand/logo-nav.webp" alt="Comic Factory" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-sm bg-[var(--paper-2)] px-2 py-1 font-semibold">
              {credits === null ? "…" : `${credits} credits`}
            </span>
            {session.data?.user ? (
              <span className="hidden text-[var(--ink-muted)] sm:inline">{session.data.user.email}</span>
            ) : (
              <Link to="/sign-in" className="font-semibold text-[var(--accent-deep)]">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[320px_1fr]">
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">1 · Story</p>
            <Textarea value={story} onChange={(event) => setStory(event.target.value)} className="mt-2 min-h-40" />
            <div className="mt-2 flex flex-wrap gap-2">
              {STORY_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  className="rounded-sm border border-[var(--rule)] bg-white px-2 py-1 text-xs font-semibold"
                  onClick={() => {
                    setStory(example.story)
                    setStyleId(example.styleId)
                  }}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)]">2 · Style</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setStyleId(style.id)}
                  className={`rounded-sm border px-2 py-2 text-left text-xs font-semibold ${styleId === style.id ? "border-[var(--accent)] bg-[#e7f6f3]" : "border-[var(--rule)] bg-white"}`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">
              Layout
              <select
                className="mt-1 h-10 w-full rounded-sm border border-[var(--rule)] bg-white px-2 text-sm"
                value={layoutId}
                onChange={(event) => setLayoutId(event.target.value)}
              >
                {LAYOUTS.map((layoutOption) => (
                  <option key={layoutOption.id} value={layoutOption.id}>
                    {layoutOption.name} · {layoutOption.panels}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Pages
              <select
                className="mt-1 h-10 w-full rounded-sm border border-[var(--rule)] bg-white px-2 text-sm"
                value={pageCount}
                onChange={(event) => setPageCount(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={captions} onChange={(event) => setCaptions(event.target.checked)} />
            Captions
          </label>
          <p className="text-xs text-[var(--ink-muted)]">
            About {estimate} credits for {pageCount} {layout.name.toLowerCase()} page{pageCount > 1 ? "s" : ""} plus character refs. Free accounts start with 8.
          </p>
          <Button className="w-full" size="lg" disabled={!guestId || !!busy} onClick={() => void prepare()}>
            {busy ?? "Generate comic"}
          </Button>
          {error ? <p className="text-sm text-[var(--accent-hot)]">{error}</p> : null}
        </section>
        <section className="min-h-[480px] border border-[var(--rule)] bg-white p-4">
          {!comic ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
              <p className="font-display text-3xl">Write your story here</p>
              <p className="mt-2 max-w-md text-sm text-[var(--ink-muted)]">
                Type a short scene — or tap an example. Keep it family-friendly (no NSFW). Character refs lock first, then the page.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {rendered ? "Pages" : "Storyboard"}
                  </p>
                  <h1 className="font-display text-2xl">{comic.title}</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: comic.pageCount }, (_, index) => (
                    <Button key={index} size="sm" variant={index === pageIndex ? "ink" : "outline"} onClick={() => void drawPage(index)}>
                      {index + 1}/{comic.pageCount}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline" disabled={!rendered || !!busy} onClick={() => void download()}>
                    Export page
                  </Button>
                </div>
              </div>
              {comic.characters.length > 0 ? (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {comic.characters.map((character) => (
                    <figure key={character.id} className="w-24 shrink-0 border border-[var(--ink)] bg-[var(--paper)]">
                      {character.imageUrl ? (
                        <img src={character.imageUrl} alt="" className="aspect-[3/4] w-full object-cover" />
                      ) : null}
                      <figcaption className="px-1 py-1 text-center text-[11px] font-semibold">{character.name}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
              <div
                className={`mt-4 grid gap-3 ${layoutId === "strip" ? "sm:grid-cols-3" : layoutId === "vertical" ? "grid-cols-1" : "sm:grid-cols-2"}`}
              >
                {(currentPage?.panels ?? []).map((panel) => (
                  <article key={panel.id} className="border border-[var(--ink)] bg-[var(--paper)]">
                    {panel.imageUrl ? (
                      <img src={panel.imageUrl} alt="" className="aspect-[4/3] w-full bg-white object-contain" />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center p-4 text-sm text-[var(--ink-muted)]">
                        {panel.instructions}
                      </div>
                    )}
                    <div className="flex gap-2 border-t border-[var(--rule)] p-2">
                      <Button size="sm" variant="outline" disabled={!!busy || !panel.imageUrl} onClick={() => setZoom(panel)}>
                        Zoom
                      </Button>
                      <Button size="sm" variant="outline" disabled={!!busy || !panel.imageUrl} onClick={() => setEdit(panel)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" disabled={!!busy || !panel.imageUrl} onClick={() => void redraw(panel)}>
                        Redraw
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              {comic.pageCount > pageIndex + 1 ? (
                <p className="mt-4 text-sm text-[var(--ink-muted)]">
                  Happy with this page?{" "}
                  <button type="button" className="font-semibold text-[var(--accent-deep)]" onClick={() => void drawPage(pageIndex + 1)}>
                    Continue with page {pageIndex + 2}
                  </button>
                </p>
              ) : null}
            </div>
          )}
        </section>
      </div>
      <Dialog open={!!zoom} onOpenChange={(open) => !open && setZoom(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{zoom?.speech || "Panel"}</DialogTitle>
          </DialogHeader>
          {zoom?.imageUrl ? <img src={zoom.imageUrl} alt="" className="w-full border border-[var(--ink)]" /> : null}
          {zoom?.caption ? <p className="text-sm text-[var(--ink-muted)]">{zoom.caption}</p> : null}
        </DialogContent>
      </Dialog>
      <Dialog open={!!edit} onOpenChange={(open) => !open && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit panel</DialogTitle>
          </DialogHeader>
          <label className="text-sm font-semibold">
            Speech
            <Textarea className="mt-1" value={edit?.speech ?? ""} onChange={(event) => setEdit((panel) => panel && { ...panel, speech: event.target.value })} />
          </label>
          <label className="text-sm font-semibold">
            Caption
            <Textarea className="mt-1" value={edit?.caption ?? ""} onChange={(event) => setEdit((panel) => panel && { ...panel, caption: event.target.value })} />
          </label>
          <Button onClick={() => void saveEdit()} disabled={!!busy}>
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
