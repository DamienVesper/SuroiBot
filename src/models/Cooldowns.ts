import { relations } from "drizzle-orm";
import {
    integer,
    pgTable,
    serial,
    text
} from "drizzle-orm/pg-core";

import { Guild } from "./Guild.js";
import { User } from "./User.js";

export const Cooldown = pgTable("user", {
    id: serial("id").primaryKey(),
    discordId: text("discordId")
        .notNull()
        .references(() => User.discordId),
    guildId: text("guildId")
        .notNull()
        .references(() => Guild.discordId),
    xp: integer("xp")
        .default(0)
});

export const userRelations = relations(User, ({ one }) => ({
    user: one(User, {
        fields: [Cooldown.discordId],
        references: [User.discordId]
    }),
    guild: one(Guild, {
        fields: [Cooldown.guildId],
        references: [Guild.discordId]
    })
}));
