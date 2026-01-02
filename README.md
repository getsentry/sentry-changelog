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
   pnpm migrate:dev
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

- The application uses Prisma for database management
- Run `pnpm lint` to check code style with Biome
- Run `pnpm format` to format code
- Pre-commit hooks automatically format and lint staged files
- Database migrations are managed through Prisma
- Sentry integration is configured for error monitoring
