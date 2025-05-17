// import { relations } from "drizzle-orm";
import {
    pgTable,
    serial,
    text,
    timestamp
} from "drizzle-orm/pg-core";

// import { Case } from "./Case.js";
// import { Cooldowns } from "./Cooldowns.js";
// import { User } from "./User.js";

export const Guild = pgTable("guild", {
    id: serial("id").primaryKey(),
    createdAt: timestamp()
        .notNull()
        .defaultNow(),
    discordId: text("discordId")
        .notNull()
        .unique()
});

// export const guildRelations = relations(Guild, ({ many }) => ({
//     users: many(User),
//     cases: many(Case),
//     cooldowns: many(Cooldowns)
// }));
