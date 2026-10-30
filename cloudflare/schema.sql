CREATE TABLE IF NOT EXISTS profiles (
  uid TEXT PRIMARY KEY NOT NULL,
  profile_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_updated ON profiles(updated_at);
