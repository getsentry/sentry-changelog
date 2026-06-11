import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const User = pgTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp("emailVerified", { precision: 3, mode: "date" }),
    image: text("image"),
    admin: boolean("admin").notNull().default(false),
  },
  (table) => [uniqueIndex("User_email_key").on(table.email)],
);

export const Account = pgTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    uniqueIndex("Account_provider_providerAccountId_key").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const Session = pgTable(
  "Session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expires: timestamp("expires", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("Session_sessionToken_key").on(table.sessionToken)],
);

export const VerificationToken = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("VerificationToken_token_key").on(table.token),
    uniqueIndex("VerificationToken_identifier_token_key").on(
      table.identifier,
      table.token,
    ),
  ],
);

export const Changelog = pgTable(
  "Changelog",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    publishedAt: timestamp("publishedAt", {
      precision: 3,
      mode: "date",
    }).defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    image: text("image"),
    content: text("content"),
    summary: text("summary"),
    published: boolean("published").notNull().default(false),
    deleted: boolean("deleted").notNull().default(false),
    adminManaged: boolean("adminManaged").notNull().default(false),
    platform: text("platform").array().notNull().default([]),
    broadcastCategory: text("broadcastCategory"),
    authorId: text("authorId").references(() => User.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [uniqueIndex("Changelog_slug_key").on(table.slug)],
);

export const Category = pgTable(
  "Category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull(),
    deleted: boolean("deleted").notNull().default(false),
  },
  (table) => [uniqueIndex("Category_name_key").on(table.name)],
);

export const _CategoryToChangelog = pgTable(
  "_CategoryToChangelog",
  {
    A: text("A")
      .notNull()
      .references(() => Category.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    B: text("B")
      .notNull()
      .references(() => Changelog.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    uniqueIndex("_CategoryToChangelog_AB_unique").on(table.A, table.B),
    index("_CategoryToChangelog_B_index").on(table.B),
  ],
);

export type ChangelogModel = InferSelectModel<typeof Changelog>;
export type CategoryModel = InferSelectModel<typeof Category>;
