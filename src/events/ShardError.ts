import { Events } from 'discord.js';

import { Event } from '../classes/Event.js';

const EventType = Events.ShardError;

class ShardError extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>[`client`]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async (err, shardId) => {
            this.client.logger.error(`Shard ${shardId}`, err.stack ?? err.message);
        };
    }
}

export default ShardError;
