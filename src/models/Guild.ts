import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

import { Case } from "./Case.js";
import { Cooldowns } from "./Cooldowns.js";
import { User } from "./User.js";

export const Guild = pgTable("guild", t => ({
    id: t.serial().primaryKey(),
    createdAt: t.timestamp().notNull().defaultNow(),
    discordId: t.text().notNull().unique()
}));

export const guildRelations = relations(Guild, ({ many }) => ({
    users: many(User),
    cases: many(Case),
    cooldowns: many(Cooldowns)
}));
