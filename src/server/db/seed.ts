import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { _CategoryToChangelog, Category, Changelog } from "./schema";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
const db = drizzle(pool);

const changelogs = [
  {
    id: "1",
    createdAt: new Date(),
    publishedAt: new Date(),
    updatedAt: new Date(),
    title: "Changelog 1",
    slug: "changelog-1",
    content: "Changelog 1 content",
    summary: "Changelog 1 summary",
    published: true,
    deleted: false,
    image: "/img/hero.png",
  },
  {
    id: "2",
    createdAt: new Date(),
    publishedAt: new Date(),
    updatedAt: new Date(),
    title: "Changelog 2",
    slug: "changelog-2",
    content: "Changelog 2 content",
    summary: "Changelog 2 summary",
    published: true,
    deleted: false,
    image: "/img/hero.png",
  },
  {
    id: "3",
    createdAt: new Date("01/01/2020"),
    publishedAt: new Date("01/01/2020"),
    updatedAt: new Date("01/01/2020"),
    title: "Changelog 3",
    slug: "changelog-3",
    content:
      "Changelog 3 content with [markdown content](https://de.wikipedia.org/wiki/Markdown)",
    summary:
      "Changelog 3 summary with [markdown content](https://de.wikipedia.org/wiki/Markdown)",
    published: true,
    deleted: false,
    image: "/img/hero.png",
  },
];

const categories = [
  { id: "1", name: "Category 1", deleted: false },
  { id: "2", name: "Category 2", deleted: false },
];

const categoryLinks = [
  { A: "1", B: "1" },
  { A: "2", B: "2" },
  { A: "2", B: "3" },
];

async function seed() {
  try {
    await db.insert(Changelog).values(changelogs);
    await db.insert(Category).values(categories);
    await db.insert(_CategoryToChangelog).values(categoryLinks);

    console.log("Seed data created successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void seed();
