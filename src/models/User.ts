import { relations } from "drizzle-orm";
import {
    boolean,
    date,
    integer,
    numeric,
    pgTable,
    serial,
    text
} from "drizzle-orm/pg-core";

import { Case } from "./Case.js";
import { Guild } from "./Guild.js";
import { Cooldowns } from "./Cooldowns.js";

export const User = pgTable("user", {
    id: serial("id").primaryKey(),
    createdAt: date()
        .defaultNow(),
    discordId: text("discordId")
        .notNull()
        .unique(),
    guildId: text("guildId")
        .notNull()
        .references(() => Guild.discordId),
    xp: integer()
        .notNull()
        .default(0),
    level: integer()
        .notNull()
        .default(0),
    balance: numeric()
        .notNull()
        .default("0.00"),
    xpBanned: boolean()
        .notNull()
        .default(false)
});

export const userRelations = relations(User, ({ one, many }) => ({
    guild: one(Guild, {
        fields: [User.guildId],
        references: [Guild.discordId]
    }),
    cooldowns: one(Cooldowns, {
        fields: [User.discordId, User.guildId],
        references: [Cooldowns.discordId, Cooldowns.guildId]
    }),
    cases: many(Case)
}));
