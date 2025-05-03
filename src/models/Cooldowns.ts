import { relations } from "drizzle-orm";
import {
    pgTable,
    serial,
    text,
    timestamp
} from "drizzle-orm/pg-core";

import { Guild } from "./Guild.js";
import { User } from "./User.js";

/**
 * This exists as a separate table rather than being
 * columns of the User table itself as it is much more prone
 * to being randomly updated, and therefore decoupling them
 * reduces the risk of accidentally deleting all the data.
 *
 * A bandage solution when the real problem is developer
 * skill issue, but whatever.
 */
export const Cooldowns = pgTable("user", {
    id: serial("id").primaryKey(),
    discordId: text("discordId")
        .notNull()
        .references(() => User.discordId),
    guildId: text("guildId")
        .notNull()
        .references(() => Guild.discordId),
    xp: timestamp("xp")
        .notNull()
        .default(new Date(0))
});

export const userRelations = relations(User, ({ one }) => ({
    user: one(User, {
        fields: [Cooldowns.discordId],
        references: [User.discordId]
    }),
    guild: one(Guild, {
        fields: [Cooldowns.guildId],
        references: [Guild.discordId]
    })
}));
