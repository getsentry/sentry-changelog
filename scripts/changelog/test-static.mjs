import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { encode } from "next-auth/jwt";
import pg from "pg";

// This test edits fixture rows. Refuse every database except an explicitly
// named local test database, including when someone has loaded their usual env.
const database = new URL(
  process.env.NEON_DATABASE_URL ?? "postgresql://invalid",
);
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(database.hostname),
  "Use a local test database",
);
assert(database.pathname.endsWith("_test"), "Database name must end in _test");
const pool = new pg.Pool({ connectionString: database.toString() });
const buildDraftSlug = "static-test-build-draft";
const buildDeletedSlug = "static-test-build-deleted";
if (process.argv.includes("--prepare")) {
  for (const [slug, published, deleted] of [
    [buildDraftSlug, false, false],
    [buildDeletedSlug, true, true],
  ]) {
    await pool.query(
      'INSERT INTO "Changelog" (id, title, slug, summary, content, published, deleted, "updatedAt") VALUES ($1::text,$2,$1::text,$3,$4,$5,$6,now()) ON CONFLICT (id) DO NOTHING',
      [
        slug,
        `Private ${slug}`,
        "Private build summary",
        "Private build body",
        published,
        deleted,
      ],
    );
  }
  await pool.end();
  console.log("Prepared draft and deleted fixtures for the static build");
  process.exit(0);
}
const secret = randomUUID();
const port = 3033;
const base = `http://localhost:${port}`;
let server;
let logs = "";
let original;
const fixtureId = `static-test-${randomUUID()}`;
const fixtureSlug = fixtureId;

async function get(path, headers) {
  const response = await fetch(`${base}${path}`, {
    redirect: "manual",
    headers,
  });
  return { status: response.status, html: await response.text() };
}

async function invalidate(value = secret) {
  return fetch(`${base}/api/revalidate`, {
    method: "POST",
    headers: { "x-revalidate-secret": value },
  });
}

async function assertHidden(path, privateText) {
  const { status, html } = await get(path);
  // A streamed notFound may retain status 200 after the shell has been sent.
  assert(
    status === 404 || html.includes('name="robots" content="noindex"'),
    `Expected not found: ${path}`,
  );
  assert(!html.includes(privateText), `Private content leaked from ${path}`);
}

try {
  original = (
    await pool.query('SELECT * FROM "Changelog" WHERE id = $1', ["1"])
  ).rows[0];
  assert(
    original?.slug === "changelog-1",
    "Seed the test database with pnpm db:seed first",
  );

  const home = await readFile(".next/server/app/changelog.html", "utf8");
  assert.match(
    home,
    /<h3[^>]*>Changelog 1<\/h3>/,
    "The prerendered homepage must contain articles, not just a skeleton",
  );
  const article = await readFile(
    ".next/server/app/changelog/changelog-1.html",
    "utf8",
  );
  assert.match(
    article,
    /<h1[^>]*>Changelog 1<\/h1>/,
    "Published database articles must be prerendered",
  );
  assert(article.includes("Changelog 1 content"));
  const manifest = JSON.parse(
    await readFile(".next/prerender-manifest.json", "utf8"),
  );
  assert(!manifest.routes[`/changelog/${buildDraftSlug}`]);
  assert(!manifest.routes[`/changelog/${buildDeletedSlug}`]);
  assert(!home.includes("Private build body"));
  console.log(
    "PASS: homepage and published article HTML exist before starting the server",
  );

  const require = createRequire(import.meta.url);
  server = spawn(
    process.execPath,
    [require.resolve("next/dist/bin/next"), "start", "--port", String(port)],
    {
      env: {
        ...process.env,
        NEXTAUTH_SECRET: secret,
        NEXTAUTH_URL: base,
        REVALIDATE_SECRET: secret,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  for (const stream of [server.stdout, server.stderr]) {
    stream.on("data", (chunk) => {
      logs = (logs + chunk).slice(-20000);
    });
  }
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`);
    try {
      if ((await get("/changelog/")).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await delay(100);
  }
  assert(ready, `Server did not start: ${logs}`);

  const token = await encode({
    secret,
    token: {
      sub: "test-user",
      name: "Static test",
      email: "static-test@example.com",
    },
  });
  const authenticatedHeaders = { cookie: `next-auth.session-token=${token}` };
  await assertHidden(`/changelog/${buildDraftSlug}/`, "Private build body");
  assert(
    (
      await get(`/changelog/${buildDraftSlug}/`, authenticatedHeaders)
    ).html.includes("Private build body"),
  );
  await assertHidden(`/changelog/${buildDraftSlug}/`, "Private build body");
  await assertHidden(`/changelog/${buildDeletedSlug}/`, "Private build body");
  console.log(
    "PASS: build-time drafts and authenticated previews stay private",
  );

  await pool.query(
    'UPDATE "Changelog" SET title = $1, summary = $2, content = $3 WHERE id = $4',
    [
      "Edited static article",
      "Edited static summary",
      "Edited **static body**.",
      "1",
    ],
  );
  assert.equal((await invalidate("wrong-secret")).status, 401);
  assert(!(await get("/changelog/")).html.includes("Edited static article"));
  assert.equal((await invalidate()).status, 200);
  assert.match(
    (await get("/changelog/")).html,
    /<h3[^>]*>Edited static article<\/h3>/,
  );
  const edited = await get("/changelog/changelog-1/");
  assert(
    edited.html.includes("Edited static article"),
    JSON.stringify({
      status: edited.status,
      title: edited.html.match(/<title>(.*?)<\/title>/)?.[1],
      snippet: edited.html.slice(0, 300),
    }),
  );
  assert(edited.html.includes("<strong>static body</strong>"));
  console.log(
    "PASS: the first request after revalidation sees edited feed and article content",
  );

  await pool.query('UPDATE "Changelog" SET published = false WHERE id = $1', [
    "1",
  ]);
  await invalidate();
  await assertHidden("/changelog/changelog-1/", "Edited static article");
  assert(!(await get("/changelog/")).html.includes("Edited static article"));
  await pool.query('UPDATE "Changelog" SET published = true WHERE id = $1', [
    "1",
  ]);
  await invalidate();
  assert(
    (await get("/changelog/changelog-1/")).html.includes(
      "Edited static article",
    ),
  );
  console.log(
    "PASS: a build-time public article can be unpublished and republished",
  );

  await pool.query(
    'INSERT INTO "Changelog" (id, title, slug, summary, content, published, deleted, "updatedAt") VALUES ($1,$2,$3,$4,$5,false,false,now())',
    [
      fixtureId,
      "Private static test draft",
      fixtureSlug,
      "Private draft summary",
      "Private draft body",
    ],
  );
  await invalidate();
  await assertHidden(`/changelog/${fixtureSlug}/`, "Private static test draft");
  assert(
    !(await get("/changelog/")).html.includes("Private static test draft"),
  );
  console.log(
    "PASS: anonymous requests cannot read draft content or draft metadata",
  );

  await pool.query(
    'UPDATE "Changelog" SET published = true, "publishedAt" = now() WHERE id = $1',
    [fixtureId],
  );
  await invalidate();
  assert.match(
    (await get("/changelog/")).html,
    /<h3[^>]*>Private static test draft<\/h3>/,
  );
  assert(
    (await get(`/changelog/${fixtureSlug}/`)).html.includes(
      "Private draft body",
    ),
  );
  console.log(
    "PASS: publishing a previously missing/draft slug works without rebuilding",
  );

  await pool.query('UPDATE "Changelog" SET slug = $1 WHERE id = $2', [
    `${fixtureSlug}-renamed`,
    fixtureId,
  ]);
  await invalidate();
  await assertHidden(`/changelog/${fixtureSlug}/`, "Private draft body");
  assert(
    (await get(`/changelog/${fixtureSlug}-renamed/`)).html.includes(
      "Private draft body",
    ),
  );
  console.log(
    "PASS: changing a slug invalidates the old URL and serves the new one",
  );

  await pool.query('UPDATE "Changelog" SET published = false WHERE id = $1', [
    fixtureId,
  ]);
  await invalidate();
  await assertHidden(
    `/changelog/${fixtureSlug}-renamed/`,
    "Private static test draft",
  );
  assert(
    !(await get("/changelog/")).html.includes("Private static test draft"),
  );

  await pool.query(
    'UPDATE "Changelog" SET published = true, deleted = true WHERE id = $1',
    [fixtureId],
  );
  await invalidate();
  await assertHidden(
    `/changelog/${fixtureSlug}-renamed/`,
    "Private draft body",
  );
  assert(
    !(await get("/changelog/")).html.includes("Private static test draft"),
  );
  console.log("PASS: unpublishing and deleting remove cached public content");
} catch (error) {
  if (logs) console.error(logs);
  throw error;
} finally {
  if (server) {
    const stopped = once(server, "exit");
    server.kill("SIGTERM");
    if (server.exitCode === null) await stopped;
  }
  if (original) {
    await pool.query(
      'UPDATE "Changelog" SET title = $1, summary = $2, content = $3, published = $4 WHERE id = $5',
      [
        original.title,
        original.summary,
        original.content,
        original.published,
        "1",
      ],
    );
  }
  await pool.query('DELETE FROM "Changelog" WHERE id = $1', [fixtureId]);
  await pool.query('DELETE FROM "Changelog" WHERE id IN ($1, $2)', [
    buildDraftSlug,
    buildDeletedSlug,
  ]);
  await pool.end();
}
