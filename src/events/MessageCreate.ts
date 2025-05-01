import { Events } from "discord.js";

import { Event } from "../classes/Event.js";
import { getMaxXP } from "../utils/utils.js";
import { and, eq } from "drizzle-orm";
import { User } from "../models/User.js";
import { Guild } from "../models/Guild.js";

const EventType = Events.MessageCreate;

class MessageCreate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async message => {
            if (message.author.bot || message.guild === null) return;

            const userQuery = await this.client.db.select().from(User).where(and(eq(User.discordId, message.author.id), eq(User.guildId, message.guildId!))).limit(1);
            const guildQuery = await this.client.db.select().from(Guild).where(eq(Guild.discordId, message.guildId!)).limit(1);

            let dbUser: typeof User.$inferSelect | null = userQuery.length !== 0 ? userQuery[0] : null;
            let guild: typeof Guild.$inferSelect | null = guildQuery.length !== 0 ? guildQuery[0] : null;

            if (guild === null) {
                this.client.logger.debug("Database", `Created entry for guild "${message.guild.name}" (${message.guild.id}).`);
                guild = (await this.client.db.insert(Guild).values({
                    discordId: message.guildId!
                } satisfies typeof Guild.$inferInsert).returning())[0];
            }

            if (dbUser === null) {
                this.client.logger.debug("Database", `Created account for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                dbUser = (await this.client.db.insert(User).values({
                    discordId: message.author.id,
                    guildId: message.guildId!,
                    level: this.client.config.modules.leveling.enabled ? this.client.config.modules.leveling.level.min : 0 // ,
                    // cooldowns: {
                    //     create: {
                    //         discordId: message.author.id,
                    //         daily: new Date(0),
                    //         xp: new Date(0)
                    //     }
                    // }
                } satisfies typeof User.$inferInsert).returning())[0];
            }

            if (this.client.config.modules.leveling.enabled) {
                if (guild === null || dbUser === null) {
                    this.client.logger.error("Database", `Guild or User were found null for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                    return;
                }

                if (dbUser.cooldowns !== null) {
                    if ((Date.now() - (dbUser.cooldowns.xp ?? new Date(0)).valueOf()) > this.client.config.modules.leveling.xpCooldown) {
                        const maxXP = getMaxXP(dbUser.level);
                        dbUser.xp += Math.floor(Math.random() * this.client.config.modules.leveling.xp.max + this.client.config.modules.leveling.xp.min);

                        if (dbUser.xp > maxXP) {
                            dbUser.level++;
                            dbUser.xp -= maxXP;
                        }

                        await this.client.db.user.update({
                            where: { id: dbUser.id },
                            data: {
                                xp: dbUser.xp,
                                level: dbUser.level, // TODO: Check perf to see if this is updated only as needed.
                                cooldowns: {
                                    update: {
                                        data: {
                                            xp: new Date()
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        };
    };
}

export default MessageCreate;
