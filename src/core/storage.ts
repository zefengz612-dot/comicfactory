import { env } from "./env"

export async function putComicObject(key: string, body: string | Uint8Array, contentType: string) {
  await env.COMICS.put(key, body, { httpMetadata: { contentType } })
  return key
}

export async function getComicObject(key: string) {
  return env.COMICS.get(key)
}
