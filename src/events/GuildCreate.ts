import { Events } from "discord.js";
import { eq } from "drizzle-orm";

import { Event } from "../classes/Event.js";
import { Guild } from "../models/Guild.js";

const EventType = Events.GuildCreate;

class GuildCreate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async guild => {
            const guildQuery = await this.client.db.select({}).from(Guild).where(eq(Guild.discordId, guild.id)).limit(1);
            if (guildQuery.length === 0) {
                this.client.logger.info("Drizzle", `Created entry for guild "${guild.name}" (${guild.id}).`);
                await this.client.db.insert(Guild).values({
                    discordId: guild.id
                } satisfies typeof Guild.$inferInsert);
            }
        };
    }
}

export default GuildCreate;
