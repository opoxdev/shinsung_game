CREATE TABLE IF NOT EXISTS profiles (
  uid TEXT PRIMARY KEY NOT NULL,
  profile_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_updated ON profiles(updated_at);

-- Retained globally across seasonal event shutdowns and redeployments.
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
