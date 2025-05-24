// import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";

// import { Guild } from "./Guild.js";
// import { User } from "./User.js";

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

export const CaseActionEnum = pgEnum("caseAction", ["warn", "mute", "unmute", "kick", "softban", "ban", "unban"]);

export const Case = pgTable("case", t => ({
    sId: t.serial().primaryKey(),
    id: t.integer().notNull(),
    createdAt: t.timestamp().notNull().defaultNow(),
    updatedAt: t.timestamp(),
    expiresAt: t.timestamp(),
    targetId: t.text().notNull(),
    issuerId: t.text().notNull(),
    guildId: t.text().notNull(),
    reason: t.text("reason").notNull(),
    action: CaseActionEnum().notNull().$type<CaseAction>(),
    active: t.boolean().notNull().default(true)
}));

// export const caseRelations = relations(Case, ({ one }) => ({
//     guild: one(Guild, {
//         fields: [Case.guildId],
//         references: [Guild.discordId]
//     })
// }));
