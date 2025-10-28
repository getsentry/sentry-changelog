# Changelog API Documentation

## Endpoint

```
GET /api/changelogs/
```

## Query Parameters

| Parameter   | Type     | Required | Default | Max | Description                                    |
| ----------- | -------- | -------- | ------- | --- | ---------------------------------------------- |
| `page`      | integer  | No       | 1       | -   | Page number (minimum: 1)                       |
| `limit`     | integer  | No       | 50      | 100 | Results per page                               |
| `category`  | string   | No       | -       | -   | Filter by category name (case-insensitive)     |
| `startDate` | ISO 8601 | No       | -       | -   | Filter posts published on or after this date   |
| `endDate`   | ISO 8601 | No       | -       | -   | Filter posts published on or before this date  |
| `search`    | string   | No       | -       | -   | Search in title and summary (case-insensitive) |

## Response Format

```json
{
  "data": [
    {
      "title": "New Feature: Real-time Monitoring",
      "slug": "new-feature-real-time-monitoring",
      "summary": "Introducing real-time monitoring capabilities...",
      "publishedAt": "2025-10-24T12:00:00.000Z",
      "categories": [
        {
          "id": "cat_123",
          "name": "Features"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  },
  "query": {
    "category": "Features",
    "startDate": "2025-01-01",
    "search": "monitoring"
  }
}
```

### Response Fields

#### `data` Array

Each item contains:

- `title` (string): Post title
- `slug` (string): URL-friendly slug
- `summary` (string|null): Post summary/excerpt
- `publishedAt` (string): ISO 8601 timestamp
- `categories` (array): Array of category objects with `id` and `name`

#### `pagination` Object

- `page` (number): Current page number
- `limit` (number): Results per page
- `total` (number): Total matching results
- `totalPages` (number): Total pages available

#### `query` Object

Echoes back the applied filters for transparency (only includes parameters that were provided)

## Example Requests

### Basic Request

Get the first 50 published posts:

```bash
curl "http://localhost:3000/api/changelogs/"
```

### Pagination

Get the second page with 20 results per page:

```bash
curl "http://localhost:3000/api/changelogs/?page=2&limit=20"
```

### Filter by Category

Get only "Security" posts:

```bash
curl "http://localhost:3000/api/changelogs/?category=Security"
```

### Date Range

Get posts from Q1 2025:

```bash
curl "http://localhost:3000/api/changelogs/?startDate=2025-01-01&endDate=2025-03-31"
```

### Search

Search for posts about "authentication":

```bash
curl "http://localhost:3000/api/changelogs/?search=authentication"
```

### Combined Filters

Get recent "Features" posts with pagination:

```bash
curl "http://localhost:3000/api/changelogs/?category=Features&startDate=2025-01-01&limit=10"
```

### With jq for Pretty Output

```bash
curl -s "http://localhost:3000/api/changelogs/?limit=5" | jq '.'
```

## Error Responses

### 400 Bad Request

Invalid date format:

```json
{
  "error": "Invalid startDate format. Use ISO date string."
}
```

### 500 Internal Server Error

Server error (e.g., database connection issue):

```json
{
  "error": "Internal server error"
}
```
