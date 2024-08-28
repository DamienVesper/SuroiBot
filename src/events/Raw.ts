import { Events, type ClientEvents } from 'discord.js';

import { Event } from '../classes/Event.js';

const EventType = Events.Raw as unknown as keyof ClientEvents;

class Raw extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>[`client`]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.runUnsafe = async data => await this.client.lavalink.updateVoiceState(data);
    }
}

export default Raw;
