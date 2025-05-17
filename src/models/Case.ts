// import { relations } from "drizzle-orm";
import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp
} from "drizzle-orm/pg-core";

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

export const actionEnum = pgEnum("action", ["warn", "mute", "unmute", "kick", "softban", "ban", "unban"]);

export const Case = pgTable("case", {
    sId: serial("sId").primaryKey(),
    id: integer("id")
        .notNull(),
    createdAt: timestamp()
        .notNull()
        .defaultNow(),
    updatedAt: timestamp(),
    expiresAt: timestamp(),
    discordId: text("discordId")
        // .references(() => User.discordId)
        .notNull(),
    issuerId: text("issuerId")
        // .references(() => User.discordId)
        .notNull(),
    guildId: text("guildId")
        // .references(() => Guild.discordId)
        .notNull(),
    reason: text("reason")
        .notNull(),
    action: actionEnum()
        .notNull()
        .$type<CaseAction>(),
    active: boolean("active")
        .notNull()
        .default(true)
});

// export const caseRelations = relations(Case, ({ one }) => ({
//     guild: one(Guild, {
//         fields: [Case.guildId],
//         references: [Guild.discordId]
//     })
// }));
