# Storage Migration: Two-Terminal Workflow

Use this when migrating Supabase Storage from the hosted source project to the self-hosted target.

## What this does

- Terminal 1 dumps the source storage schema and bucket list to local files.
- Terminal 2 applies those files to the target Supabase stack over SSH.
- No direct TCP connection to the target database is required from Windows.

## Terminal 1: source dump

Run this from the repo root on your Windows machine:

```powershell
cd "E:\wind new\day1main"
$env:SOURCE_DB_URL="postgresql://postgres:<source-password>@db.ldygmpaipxbokxzyzyti.supabase.co:5432/postgres"
npm run migrate:storage:dump
```

This writes:

- `tmp/storage-schema.generated.sql`
- `tmp/storage-buckets.generated.json`

If `npm` is not available, use:

```powershell
node scripts/policy-data/migrate-storage-schema.js
```

with:

```powershell
$env:STORAGE_MIGRATION_PHASE="dump"
```

## Terminal 2: target apply

Run this from a second local terminal. It will SSH into the target host and apply the dump directly:

```powershell
cd "E:\wind new\day1main"
$env:SOURCE_SCHEMA_SQL="$PWD\tmp\storage-schema.generated.sql"
$env:SOURCE_BUCKETS_JSON="$PWD\tmp\storage-buckets.generated.json"
$env:TARGET_EXEC_MODE="ssh-compose"
$env:TARGET_SSH_HOST="169.255.58.175"
$env:TARGET_SSH_USER="day1admin"
$env:TARGET_COMPOSE_WORKDIR="/opt/supabase-project"
$env:TARGET_COMPOSE_FILES="/opt/supabase-project/docker-compose.yml,/opt/supabase-project/docker-compose.pg17.yml"
$env:TARGET_COMPOSE_SERVICE="db"
npm run migrate:storage:apply:ssh
```

If `npm` is not available, use:

```powershell
node scripts/policy-data/migrate-storage-schema.js
```

## Notes

- The script defaults to the bucket names `call-recordings,applications` if it cannot read bucket metadata from the source.
- The `ssh-compose` target mode avoids requiring `TARGET_DB_URL` from Windows.
- If you want the minimal fallback schema instead of source-derived SQL, set `ALLOW_STORAGE_SCHEMA_FALLBACK=true`.
