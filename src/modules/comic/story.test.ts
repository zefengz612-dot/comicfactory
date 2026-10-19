import assert from "node:assert/strict"
import test from "node:test"
import { extractCharacters, planComic } from "./story.ts"

const skyrail =
  "On the midnight Skyrail cargo train, courier Reno opens bay seven and finds thieves dismantling a city energy core. Silver-haired Vex is undercover among them."

test("extracts recurring names and ignores stopwords", () => {
  const names = extractCharacters(skyrail).map((character) => character.name)
  assert.ok(names.includes("Reno"))
  assert.ok(names.includes("Vex"))
  assert.equal(names.includes("Skyrail"), false)
})

test("plans a grid page and prices refs plus panels", () => {
  const plan = planComic({
    story: skyrail,
    styleId: "american-modern",
    layoutId: "grid",
    pageCount: 1,
    captions: true,
  })
  assert.equal(plan.panels.length, 4)
  assert.equal(plan.refCost, plan.characters.length)
  assert.equal(plan.totalCost, plan.refCost + 4)
  assert.ok(plan.panels.every((panel) => panel.caption.length > 0))
})

test("rejects sexual content before any panels are planned", () => {
  assert.throws(
    () =>
      planComic({
        story: "A explicit nude scene in the alley.",
        styleId: "japanese",
        layoutId: "strip",
        pageCount: 1,
        captions: false,
      }),
    /content policy/,
  )
})

test("pads short stories so every panel still belongs to one plot", () => {
  const plan = planComic({
    story: "Jun waits in the rain. Mei arrives with one umbrella.",
    styleId: "japanese",
    layoutId: "vertical",
    pageCount: 2,
    captions: false,
  })
  assert.equal(plan.panels.length, 8)
  assert.equal(plan.panels.filter((panel) => panel.caption).length, 0)
})
