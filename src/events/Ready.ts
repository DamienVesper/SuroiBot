import { Events } from "discord.js";

import { Event } from "../classes/Event.js";

const EventType = Events.ClientReady;

class Ready extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async client => {
            this.client.logger.info("Gateway", `Connected to Discord as "${client.user.tag}" (${client.user.id}).`);

            this.client.lavalink?.init(client.user.id);

            await this.client.deployCommands(this.client.config.mode);
        };
    }
}

export default Ready;
