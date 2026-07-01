-- Add durable consent records for terms/privacy acceptance.
CREATE TABLE "consent_records" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "terms_version" TEXT NOT NULL,
  "privacy_version" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "consent_records_user_id_terms_version_privacy_version_key"
  ON "consent_records"("user_id", "terms_version", "privacy_version");

CREATE INDEX "consent_records_user_id_idx"
  ON "consent_records"("user_id");

ALTER TABLE "consent_records"
  ADD CONSTRAINT "consent_records_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Add production-safe rate-limit storage shared across app instances.
CREATE TABLE "rate_limit_entries" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "window_start" TIMESTAMP(3) NOT NULL,
  "locked_until" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "rate_limit_entries_pkey" PRIMARY KEY ("key")
);
