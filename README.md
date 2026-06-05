# Sentry Changelog

A Next.js application for managing and displaying Sentry's product changelog.

## Setup

### Prerequisites

- [Volta](https://volta.sh/) for Node.js version management
- pnpm 9.15.0

### Development

1. **Install Node.js via Volta**

   ```bash
   # Volta will automatically install the correct Node.js version
   # when you enter the project directory
   volta install node
   ```

2. **Start the database**

   ```bash
   docker compose up -d
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Set up the database**

   ```bash
   pnpm db:push
   pnpm db:migrate
   pnpm db:seed
   ```

   - Production uses Neon (`NEON_DATABASE_URL` should point to your Neon pooled connection)
   - For local development, keep Docker Postgres (`NEON_DATABASE_URL` in `.env.development`)
   - Configure Vercel Blob via `BLOB_READ_WRITE_TOKEN`

5. **Start the development server**

   ```bash
   pnpm dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Migration from GCP (One-Time)

This is a one-time migration from GCP Cloud SQL + GCS to Neon + Vercel Blob for an existing deployment.
Keep this section until migration is complete, then remove it.

### 1) Provision Neon Database

1. Create a project in the Neon console.
2. Create a database (example name: `changelog`) and copy both connection strings:
   - **Pooled**: use for runtime `NEON_DATABASE_URL`
   - **Direct**: use for import/migration commands

### 2) Export from Cloud SQL and import into Neon

```bash
# Export from GCP Cloud SQL
pg_dump --no-owner --no-acl --format=plain \
  "postgresql://USER:PASS@GCP_HOST:5432/changelog" > gcp_dump.sql

# Import into Neon (use the DIRECT connection string)
psql "postgresql://USER:PASS@DIRECT_HOST.neon.tech/neondb?sslmode=require" < gcp_dump.sql

# Verify row count
psql "postgresql://USER:PASS@DIRECT_HOST.neon.tech/neondb?sslmode=require" -c "SELECT count(*) FROM \"Changelog\";"
```

### 3) Move images GCS -> Vercel Blob

1. In Vercel, create a Blob store for the project.
2. Download existing objects from GCS:

   ```bash
   gsutil -m cp -r gs://BUCKET_NAME/ ./gcs-images/
   ```

3. Upload to Vercel Blob (one-off): use either:
   - a small Node script using `@vercel/blob` `put()`
   - or the Vercel Blob CLI

   Example helper (conceptual):

   ```ts
   import { promises as fs } from 'node:fs'
   import path from 'node:path'
   import { readdir } from 'node:fs/promises'
   import { put } from '@vercel/blob'

   const files = await readdir('./gcs-images')

   for (const file of files) {
     const body = await fs.readFile(path.join('./gcs-images', file))
     await put(file, body, {
       access: 'public',
     })
   }
   ```

4. Rewrite image URLs in Postgres (replace only old GCS images):

   ```sql
   UPDATE "Changelog"
   SET "image" = REPLACE(
     "image",
     'https://storage.googleapis.com/BUCKET_NAME/',
     'https://BLOB_STORE_ID.public.blob.vercel-storage.com/'
   )
   WHERE "image" LIKE 'https://storage.googleapis.com/%';
   ```

### 4) Configure Vercel env vars

- Set `NEON_DATABASE_URL` to Neon **pooled** connection string.
- Ensure `BLOB_READ_WRITE_TOKEN` is set (Vercel provides this when Blob is linked).
- Remove old GCP/Google storage/auth settings:
  - `GCP_BUCKET`
  - `GOOGLE_CLOUD_PROJECT`
  - `GOOGLE_CLOUD_REGION`
  - `GOOGLE_APPLICATION_CREDENTIALS`
  - `GOOGLE_PRIVATE_KEY`
- Keep OAuth keys:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

### 5) Deploy and verify

1. Deploy the migration branch.
2. Verify:
   - changelog pages load
   - images render from Blob URLs
   - admin upload flow works
   - search works
3. After everything passes, decommission the old GCP resources:
   - Cloud SQL instance
   - GCS bucket

## API

### GET /api/changelogs

Returns a list of published changelog entries. Supports filtering, search, and pagination.

#### Query Parameters

| Parameter  | Type   | Default | Description                                      |
| ---------- | ------ | ------- | ------------------------------------------------ |
| `category` | string | -       | Filter by category name (exact match)            |
| `from`     | string | -       | ISO date. Returns entries published on or after  |
| `to`       | string | -       | ISO date. Returns entries published on or before |
| `search`   | string | -       | Full-text search on title and summary            |
| `limit`    | number | 20      | Max results per request (1-100)                  |
| `offset`   | number | 0       | Number of results to skip for pagination         |

#### Example Requests

```bash
# Get all changelogs (default pagination)
curl https://changelog.sentry.dev/api/changelogs

# Filter by category
curl https://changelog.sentry.dev/api/changelogs?category=SDK

# Filter by date range
curl "https://changelog.sentry.dev/api/changelogs?from=2024-01-01&to=2024-12-31"

# Search
curl https://changelog.sentry.dev/api/changelogs?search=performance

# Combined filters with pagination
curl "https://changelog.sentry.dev/api/changelogs?category=SDK&search=react&limit=10&offset=20"
```

#### Response

```json
[
  {
    "id": "clx1234567890",
    "title": "New React SDK Features",
    "slug": "new-react-sdk-features",
    "summary": "We've added new features to the React SDK...",
    "image": "https://example.com/image.png",
    "content": "Full markdown content...",
    "publishedAt": "2024-06-15T00:00:00.000Z",
    "categories": [{ "id": "cat123", "name": "SDK" }]
  }
]
```

#### Error Responses

| Status | Description           |
| ------ | --------------------- |
| 400    | Invalid date format   |
| 500    | Internal server error |

## Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run
```

## Contributing

- Database management is powered by Drizzle and Neon-backed Postgres
- Run `pnpm lint` to check code style with Biome
- Run `pnpm format` to format code
- Pre-commit hooks automatically format and lint staged files
- Database migrations are managed with Drizzle (`db:generate`, `db:migrate`, `db:push`)
- Sentry integration is configured for error monitoring
