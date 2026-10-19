CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_id ON session(user_id);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS account_user_id ON account(user_id);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS verification_identifier ON verification(identifier);

CREATE TABLE IF NOT EXISTS credit_grant (
  id TEXT PRIMARY KEY,
  account_key TEXT NOT NULL,
  amount INTEGER NOT NULL,
  remaining INTEGER NOT NULL,
  source TEXT NOT NULL,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS credit_grant_account ON credit_grant(account_key);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  account_key TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  comic_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS comic (
  id TEXT PRIMARY KEY,
  account_key TEXT NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  style_id TEXT NOT NULL,
  layout_id TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  captions INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS comic_account ON comic(account_key);

CREATE TABLE IF NOT EXISTS character_ref (
  id TEXT PRIMARY KEY,
  comic_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  palette TEXT NOT NULL,
  image_key TEXT,
  markup TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS panel (
  id TEXT PRIMARY KEY,
  comic_id TEXT NOT NULL,
  page_index INTEGER NOT NULL,
  panel_index INTEGER NOT NULL,
  caption TEXT NOT NULL,
  speech TEXT NOT NULL,
  instructions TEXT NOT NULL,
  image_key TEXT,
  markup TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS panel_comic ON panel(comic_id);

CREATE TABLE IF NOT EXISTS checkout (
  id TEXT PRIMARY KEY,
  account_key TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  stripe_session_id TEXT,
  created_at INTEGER NOT NULL
);
