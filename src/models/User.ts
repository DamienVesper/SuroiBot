// import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

// import { Case } from "./Case.js";
import { Guild } from "./Guild.js";
// import { Cooldowns } from "./Cooldowns.js";

export const User = pgTable("user", t => ({
    id: t.serial().primaryKey(),
    createdAt: t.timestamp().notNull().defaultNow(),
    discordId: t.text().notNull(),
    guildId: t.text().notNull().references(() => Guild.discordId),
    xp: t.integer().notNull().default(0),
    level: t.integer().notNull().default(0),
    balance: t.numeric().notNull().default("0.00"),
    xpBanned: t.boolean().notNull().default(false)
}));

// export const userRelations = relations(User, ({ one, many }) => ({
//     guild: one(Guild, {
//         fields: [User.guildId],
//         references: [Guild.discordId]
//     }),
//     cooldowns: one(Cooldowns, {
//         fields: [User.discordId, User.guildId],
//         references: [Cooldowns.discordId, Cooldowns.guildId]
//     }),
//     cases: many(Case)
// }));
