import { Events } from "discord.js";

import { Event } from "../classes/Event.js";

const EventType = Events.GuildCreate;

class GuildCreate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async guild => {
            const guildDoc = await this.client.db.guild.findUnique({ where: { discordId: guild.id } });
            if (guildDoc === null) {
                this.client.logger.info("Database", `Created entry for guild "${guild.name}" (${guild.id}).`);
                await this.client.db.guild.create({
                    data: {
                        discordId: guild.id
                    }
                });
            }
        };
    }
}

export default GuildCreate;
