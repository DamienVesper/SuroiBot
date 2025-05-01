import { relations } from "drizzle-orm";
import {
    date,
    pgTable,
    serial,
    text
} from "drizzle-orm/pg-core";

import { Case } from "./Case.js";
import { User } from "./User.js";

export const Guild = pgTable("guild", {
    id: serial("id").primaryKey(),
    createdAt: date()
        .defaultNow(),
    discordId: text("discordId")
        .notNull()
        .unique()
});

export const guildRelations = relations(Guild, ({ many }) => ({
    users: many(User),
    cases: many(Case)
}));
