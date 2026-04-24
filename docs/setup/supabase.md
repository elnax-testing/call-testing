# Supabase Setup - SPX AI Voice Agent

The tracked SQL files for this guide now live in `sql/supabase/setup.sql`, `sql/supabase/migration_v2.sql`, and `sql/supabase/migration_v3.sql`.

Everything you need to configure a **fresh Supabase project** from scratch.

---

## Step 1 — Create a Supabase project

1. Go to [app.supabase.com](https://app.supabase.com) and sign in
2. Click **New Project**
3. Choose your organisation, give it a name (e.g. `spx-ai-voice`), set a database password, pick the **Mumbai (ap-south-1)** region
4. Click **Create new project** and wait ~2 minutes

---

## Step 2 — Get your API credentials

1. Go to **Settings → API**
2. Copy:
   - **Project URL** → paste as `SUPABASE_URL` in your `.env`
   - **anon / public key** → paste as `SUPABASE_KEY` in your `.env`

---

## Step 3 — Run the database SQL

Go to **SQL Editor → New Query** and run these files in order:

1. `sql/supabase/setup.sql`
2. `sql/supabase/migration_v2.sql`
3. `sql/supabase/migration_v3.sql`

What they do:

- `setup.sql`: creates the base `call_logs` table, the base `appointments` table, and the storage policies for call recordings.
- `migration_v2.sql`: adds analytics columns plus transcript and active-call tables.
- `migration_v3.sql`: upgrades the internal appointments planner with overlap protection and update timestamps.

> ✅ You should see **Success. No rows returned** — that means it worked.

---

## Step 4 — Create the Storage bucket (UI)

Even though the SQL above registers the bucket, you may need to create it manually:

1. Go to **Storage → New Bucket**
2. Name: `call-recordings`
3. Set to **Private**
4. Click **Create bucket**

Then run the SQL from Step 3 to apply the public-read policy.

---

## Step 5 — Generate S3 credentials for call recording

1. Go to **Storage → Settings → S3 Access**
2. Click **Generate new access key**
3. Copy the values and add them to your `.env`:

```env
SUPABASE_S3_ACCESS_KEY=your_access_key_id
SUPABASE_S3_SECRET_KEY=your_secret_access_key
SUPABASE_S3_ENDPOINT=https://YOUR_PROJECT_REF.supabase.co/storage/v1/s3
SUPABASE_S3_REGION=ap-south-1
```

> Your project ref is the subdomain in your Supabase URL.
> e.g. if URL is `https://abcxyz.supabase.co` → endpoint is `https://abcxyz.supabase.co/storage/v1/s3`

---

## Step 6 — Verify the setup

Run this query in **SQL Editor** to confirm the core tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('call_logs', 'appointments', 'call_transcripts', 'active_calls')
ORDER BY table_name;
```

Expected output:

| table_name |
|---|
| active_calls |
| appointments |
| call_logs |
| call_transcripts |

---

## Reference

- Base setup: `sql/supabase/setup.sql`
- Analytics and transcript migration: `sql/supabase/migration_v2.sql`
- Internal appointments planner migration: `sql/supabase/migration_v3.sql`
