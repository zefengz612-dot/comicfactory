import { createServerFn } from "@tanstack/react-start"
import {
  editPanel,
  exportComicPage,
  getStudioState,
  prepareComic,
  redrawPanel,
  renderPage,
  startCheckout,
} from "./server"

async function guard<T>(run: () => Promise<T>) {
  try {
    return await run()
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Something went wrong." }
  }
}

export const getStudioStateFn = createServerFn({ method: "POST" })
  .validator((data: { guestId: string }) => data)
  .handler(({ data }) => guard(() => getStudioState(data.guestId)))

export const prepareComicFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      guestId: string
      story: string
      styleId: string
      layoutId: string
      pageCount: number
      captions: boolean
    }) => data,
  )
  .handler(({ data }) => guard(() => prepareComic(data)))

export const renderPageFn = createServerFn({ method: "POST" })
  .validator((data: { guestId: string; comicId: string; pageIndex: number }) => data)
  .handler(({ data }) => guard(() => renderPage(data)))

export const redrawPanelFn = createServerFn({ method: "POST" })
  .validator((data: { guestId: string; panelId: string }) => data)
  .handler(({ data }) => guard(() => redrawPanel(data)))

export const editPanelFn = createServerFn({ method: "POST" })
  .validator((data: { guestId: string; panelId: string; speech: string; caption: string }) => data)
  .handler(({ data }) => guard(() => editPanel(data)))

export const exportPageFn = createServerFn({ method: "POST" })
  .validator((data: { guestId: string; comicId: string; pageIndex: number }) => data)
  .handler(({ data }) => guard(() => exportComicPage(data)))

export const startCheckoutFn = createServerFn({ method: "POST" })
  .validator(
    (data: { guestId: string; kind: "plan" | "pack"; id: string; interval: "monthly" | "yearly" }) => data,
  )
  .handler(({ data }) => guard(() => startCheckout(data)))
