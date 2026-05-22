import { relations } from "drizzle-orm";
import {
    pgTable, text, timestamp, boolean,
    index, serial, numeric, integer,
    jsonb, unique, varchar
} from "drizzle-orm/pg-core";

// pair element that holds a reference to the challenge and when it was claimed
export type ClaimEntry = {
    challenge_id: number;
    claimed_at: string; // ISO date string
};
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  claims: jsonb("claims").$type<ClaimEntry[]>().default([]),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    role: text("role").notNull(),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// KHI EXCLUSIVES
export const challenges = pgTable("challenges", {
    id: serial("id").primaryKey(),

    name: text("name").unique().notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),
    written_by: text("written_by").default("Unknown Author"),
    flag: text("flag").unique().notNull(),
    points: integer("points").notNull(),            // computed server-side

    user_rates: integer("user_rates").array().default([]),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
    hlinks: text("hlinks").array().default([]),
    is_active: boolean("is_active").default(true),  // used to close a challenge from players to perform maintanence
    is_gym: boolean("is_gym").default(false),       // used to defined what is an event challenge and post-event challenge
});

export const teams = pgTable("teams", {
    id: serial("id").primaryKey(),
    name: text("name").unique().notNull(),
    leader_id: text("leader_id").notNull().references(() => user.id),
    created_at: timestamp("created_at").defaultNow(),
});

export const team_members = pgTable("team_members", {
    id: serial("id").primaryKey(),
    team_id: integer("team_id").notNull().references(() => teams.id),
    user_id: text("user_id").notNull().references(() => user.id),
    joined_at: timestamp("joined_at").defaultNow(),
}, (t) => [
    unique().on(t.team_id, t.user_id), // prevent duplicate membership
]);

export const team_requests = pgTable("team_requests", {
    id: serial("id").primaryKey(),
    to: text("to").notNull().references(() => teams.id, { onDelete: 'cascade' }),
    from: text("from").notNull().references(() => user.id).notNull(),
    checksum: varchar("checksum", {length: 12}).unique().notNull()
});