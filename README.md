# Sentry Changelog

A Next.js application for managing and displaying Sentry's product changelog.

## Setup

### Prerequisites

- [Volta](https://volta.sh/) — pins the Node.js and pnpm versions automatically
- A [Neon](https://neon.tech/) account with access to this project's database

There is **no local database**. Local development runs against a Neon dev branch —
the same serverless Postgres used in production — so there's no Docker to manage.

### Development

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Create a Neon dev branch**

   In the [Neon console](https://console.neon.tech/), open this project and create
   a branch off `production` (e.g. `dev`, or `dev/<your-name>` for an isolated
   copy). Copy its **pooled** connection string.

3. **Configure your local environment**

   Create `.env.development.local` (gitignored) with your dev-branch URL:

   ```bash
   NEON_DATABASE_URL=postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/neondb?sslmode=require
   # Optional — only needed to test admin image uploads locally:
   # BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

   Non-secret defaults (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`) come from the committed
   `.env.development`. See `.env.example` for the full list of variables.

4. **Apply the schema and (optionally) seed**

   These commands auto-load `.env.development.local`:

   ```bash
   pnpm db:push     # apply the Drizzle schema to your dev branch
   pnpm db:seed     # optional: insert sample changelog data
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

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
