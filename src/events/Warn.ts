import { Events } from "discord.js";

import { Event } from "../classes/Event.js";

const EventType = Events.Warn;

class Warn extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async warning => {
            this.client.logger.warn("Gateway", warning);
        };
    }
}

export default Warn;
