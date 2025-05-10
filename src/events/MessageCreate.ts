import { Events } from "discord.js";

import { Event } from "../classes/Event.js";
import { getMaxXP } from "../utils/utils.js";
import { and, eq } from "drizzle-orm";
import { User } from "../models/User.js";
import { Guild } from "../models/Guild.js";
import { Cooldowns } from "../models/Cooldowns.js";

const EventType = Events.MessageCreate;

class MessageCreate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async message => {
            if (message.author.bot || !message.inGuild()) return;

            /**
             * Expensive to run three different queries per message. Maybe this can be simplified somehow?
             */
            const userQuery = await this.client.db.select().from(User).where(and(eq(User.discordId, message.author.id), eq(User.guildId, message.guildId))).limit(1);
            const guildQuery = await this.client.db.select().from(Guild).where(eq(Guild.discordId, message.guildId)).limit(1);
            const cooldownQuery = await this.client.db.select().from(Cooldowns).where(and(eq(Cooldowns.discordId, message.author.id), eq(Cooldowns.guildId, message.guildId))).limit(1);

            let dbUser: typeof User.$inferSelect | null = userQuery.length !== 0 ? userQuery[0] : null;
            let guild: typeof Guild.$inferSelect | null = guildQuery.length !== 0 ? guildQuery[0] : null;
            let cooldowns: typeof Cooldowns.$inferSelect | null = cooldownQuery.length !== 0 ? cooldownQuery[0] : null;

            if (guild === null) {
                this.client.logger.debug("Database", `Created entry for guild "${message.guild.name}" (${message.guild.id}).`);
                guild = (await this.client.db.insert(Guild).values({
                    discordId: message.guildId
                } satisfies typeof Guild.$inferInsert).returning())[0];
            }

            if (dbUser === null) {
                this.client.logger.debug("Database", `Created account for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                dbUser = (await this.client.db.insert(User).values({
                    discordId: message.author.id,
                    guildId: message.guildId,
                    level: this.client.config.modules.leveling.enabled ? this.client.config.modules.leveling.level.min : 0
                } satisfies typeof User.$inferInsert).returning())[0];
            }

            if (cooldowns === null) {
                this.client.logger.debug("Database", `Created account for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                cooldowns = (await this.client.db.insert(Cooldowns).values({
                    discordId: message.author.id,
                    guildId: message.guildId
                } satisfies typeof Cooldowns.$inferInsert).returning())[0];
            }

            if (this.client.config.modules.leveling.enabled) {
                if (guild === null || dbUser === null) {
                    this.client.logger.error("Database", `Guild or User were found null for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                    return;
                }

                if (cooldowns !== null) {
                    if ((Date.now() - (cooldowns.xp ?? new Date(0)).valueOf()) > this.client.config.modules.leveling.xpCooldown) {
                        const maxXP = getMaxXP(dbUser.level);
                        dbUser.xp += Math.floor(Math.random() * this.client.config.modules.leveling.xp.max + this.client.config.modules.leveling.xp.min);

                        if (dbUser.xp > maxXP) {
                            dbUser.level++;
                            dbUser.xp -= maxXP;
                        }

                        // Update player XP.
                        await this.client.db.update(User).set({
                            xp: dbUser.xp,
                            level: dbUser.level // TODO: Check perf to see if this is updated only as needed.
                        }).where(eq(User.id, dbUser.id));

                        // Update player cooldowns.
                        await this.client.db.update(Cooldowns).set({
                            xp: new Date()
                        }).where(eq(Cooldowns.id, cooldowns.id));
                    }
                }
            }
        };
    };
}

export default MessageCreate;
