// import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

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
export const Cooldowns = pgTable("cooldowns", t => ({
    id: t.serial().primaryKey(),
    discordId: t.text().notNull().references(() => User.discordId),
    guildId: t.text().notNull().references(() => Guild.discordId),
    xp: t.timestamp().notNull().default(new Date(0))
}));

// export const cooldownRelations = relations(Cooldowns, ({ one }) => ({
//     user: one(User, {
//         fields: [Cooldowns.discordId],
//         references: [User.discordId]
//     }),
//     guild: one(Guild, {
//         fields: [Cooldowns.guildId],
//         references: [Guild.discordId]
//     })
// }));
