import type { Snowflake } from "discord.js";
import { and, asc, desc, eq } from "drizzle-orm";

import type { DiscordBot } from "../modules/DiscordBot.js";

import { User } from "../models/User.js";
import { Guild } from "../models/Guild.js";

/**
 * Fetch all users in a guild, and return their XP data.
 * @param client The Discord client.
 * @param id The guild ID.
 */
export const getLBUsers = async (client: DiscordBot, id: Snowflake): Promise<LBUser[]> => {
    return (await client.db.select().from(User).where(
        and(
            eq(User.guildId, id),
            eq(User.xpBanned, false)
        )
    ).orderBy(
        desc(User.level),
        desc(User.xp),
        asc(User.discordId)
    ))
        .map(user => ({
            discordId: user.discordId,
            level: user.level,
            xp: user.xp
        }));
};

/**
 * Update all guild leaderboards.
 * @param client The Discord client.
 */
export const updateLeaderboards = async (client: DiscordBot): Promise<void> => {
    if (!client.redis || !client.config.modules.caching.enabled) return;

    const guilds = await client.db.select().from(Guild);

    for (const guild of guilds) {
        const users = await getLBUsers(client, guild.discordId);
        await client.redis.set(`${client.config.modules.caching.prefix}/${guild.id}/lb`, JSON.stringify(users));
    }
};

export type LBUser = Pick<typeof User.$inferSelect, "discordId" | "level" | "xp">;
