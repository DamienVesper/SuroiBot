import { Events } from "discord.js";

import { Event } from "../classes/Event.js";

const EventType = Events.Error;

class ErrorEvent extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async err => {
            this.client.logger.error("Gateway", err);
        };
    }
}

export default ErrorEvent;
