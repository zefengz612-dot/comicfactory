declare module "*.css?url" {
  const href: string
  export default href
}

declare module "*.sql?raw" {
  const content: string
  export default content
}

declare module "cloudflare:workers" {
  export const env: {
    DB: D1Database
    COMICS: R2Bucket
    APP_NAME: string
    APP_URL: string
    DATABASE_PROVIDER: string
    AUTH_SECRET?: string
    AI_API_KEY?: string
    AI_BASE_URL?: string
    AI_MODEL?: string
    IMAGE_API_KEY?: string
    IMAGE_BASE_URL?: string
    IMAGE_MODEL?: string
    STRIPE_SECRET_KEY?: string
    STRIPE_WEBHOOK_SECRET?: string
  }
}
