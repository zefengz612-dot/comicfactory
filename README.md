# Comic Factory

Story in, comic pages out. Paste a scene, lock a look for each character, and export a page.

This app is a Comic Factory product on the ShipAny TanStack shape: TanStack Start, Vite, React 19, better-auth, Drizzle, a credit ledger, and Cloudflare Workers with D1 and R2. The private template at `github.com/shipany-ai/shipany-tanstack` is not readable without a GitHub login, so this repo follows the public ShipAny TanStack layout (`src/core` for auth, credits, and storage; `src/modules/comic` for generation) instead of copying that private tree. It does **not** migrate the old Neon database from `zefengz612-dot/comic-factory`. Schema is created fresh on D1.

Branding is Comic Factory. `comicfactory.app` is the product domain placeholder. This worker config does not bind that domain or any custom domain.

## Run locally

```bash
pnpm install
cp .dev.vars.example .dev.vars   # set AUTH_SECRET
pnpm dev                         # http://127.0.0.1:43123
```

`pnpm dev` applies the SQL in `migrations/0001_init.sql` on first use of the local D1 database. You can also run `pnpm db:migrate:local`.

Without `AI_API_KEY` / `IMAGE_API_KEY`, storyboarding and panel art use the built-in renderer so the flow runs offline. Set those keys when you want a hosted model.

## Environment

| Name | Where | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | `.dev.vars` locally, `wrangler secret put` in production | better-auth signing secret |
| `APP_NAME` | `wrangler.jsonc` `vars` | `Comic Factory` |
| `APP_URL` | `wrangler.jsonc` `vars` | Public origin of this deployment. Use the `*.workers.dev` URL after the first deploy. Do not set a custom domain here until you choose to bind one yourself. |
| `DATABASE_PROVIDER` | `wrangler.jsonc` `vars` | `d1` |
| `AI_API_KEY` | secret, optional | OpenAI-compatible chat for the panel script |
| `AI_BASE_URL` | secret, optional | Default `https://api.openai.com/v1` |
| `AI_MODEL` | secret, optional | Default `gpt-4o-mini` |
| `IMAGE_API_KEY` | secret, optional | OpenAI-compatible image API. Unset uses the built-in panel renderer. |
| `IMAGE_BASE_URL` | secret, optional | Default `https://api.openai.com/v1` |
| `IMAGE_MODEL` | secret, optional | Default `gpt-image-1` |
| `STRIPE_SECRET_KEY` | secret, optional | Enables Checkout. No charge is attempted when this is empty. |
| `STRIPE_WEBHOOK_SECRET` | secret, optional | Verifies `POST /api/stripe/webhook` and grants credits |

D1 binding: `DB`. R2 binding: `COMICS`, bucket `comic-factory-new`.

Free and guest accounts receive 8 starter credits. One character reference, panel, or redraw costs one credit. Editing speech does not. A render that throws before the image is stored does not spend credits.

## Deploy to Cloudflare Workers

Do not add a `routes` or custom-domain block for `comicfactory.app`.

This environment did not have a Cloudflare API token, so deploy was not run. From a machine that is logged in:

```bash
# Token needs Account → Workers Scripts:Edit, D1:Edit, Workers R2 Storage:Edit.
# Also set the account id (dashboard → Workers → account id).
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...

npx wrangler d1 create comic-factory-new
# Put the printed database_id into wrangler.jsonc (binding DB). The committed id is a local placeholder.

npx wrangler r2 bucket create comic-factory-new

printf '%s' "$(openssl rand -base64 32)" | npx wrangler secret put AUTH_SECRET

pnpm db:migrate:remote
pnpm cf:deploy
```

`pnpm cf:deploy` is `vite build` then `wrangler deploy`. The command prints a `*.workers.dev` URL. Set `APP_URL` in `wrangler.jsonc` to that origin (not a custom domain) and deploy once more so auth and Stripe return URLs match the worker. Point Stripe's webhook at `https://<worker>.workers.dev/api/stripe/webhook` only after `STRIPE_WEBHOOK_SECRET` is set.

`npx wrangler whoami` should show the account before you deploy. `wrangler login` is the browser alternative to `CLOUDFLARE_API_TOKEN`.

## GitHub

Create the private repo from a GitHub login that can write to `zefengz612-dot`:

```bash
gh auth login
gh repo create zefengz612-dot/comic-factory-new --private --source=. --remote=github --push
```

Do not push this tree onto `zefengz612-dot/comic-factory`. That repository stays read-only.
