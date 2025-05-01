import { relations } from "drizzle-orm";
import {
    date,
    pgEnum,
    pgTable,
    serial,
    text
} from "drizzle-orm/pg-core";

import { Guild } from "./Guild.js";
import { User } from "./User.js";

export enum CaseAction {
    Warn = "warn",
    Unwarn = "unwarn",
    Mute = "mute",
    Unmute = "unmute",
    Kick = "kick",
    Softban = "softban",
    Hackban = "hackban",
    Tempban = "tempban",
    Ban = "ban",
    Unban = "unban"
}

export const Case = pgTable("user", {
    id: serial("id").primaryKey(),
    createdAt: date()
        .defaultNow(),
    updatedAt: date(),
    expires: date(),
    discordId: text("discordId")
        .notNull()
        .references(() => User.discordId),
    issuerId: text("issuerId")
        .notNull()
        .references(() => User.discordId),
    guildId: text("guildId")
        .notNull()
        .references(() => Guild.discordId),
    reason: text("reason")
        .notNull(),
    action: pgEnum("action", ["warn", "mute", "unmute", "kick", "softban", "ban", "unban"])()
        .notNull()
        .$type<CaseAction>()
});

export const caseRelations = relations(Case, ({ one }) => ({
    user: one(User, {
        fields: [Case.discordId],
        references: [User.discordId]
    }),
    issuer: one(User, {
        fields: [Case.issuerId],
        references: [User.discordId]
    }),
    guild: one(Guild, {
        fields: [Case.guildId],
        references: [Guild.discordId]
    })
}));
