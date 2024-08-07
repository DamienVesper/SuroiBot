import { Events, type ClientEvents } from 'discord.js';

import { Event } from '../classes/Event.js';

class ErrorEvent extends Event {
    config = {
        name: Events.ShardError,
        once: false
    };

    run: (...args: ClientEvents[Events.ShardError]) => Promise<void> = async err => {
        this.client.logger.error(`Gateway`, err.stack ?? err.message);
    };
}

export default ErrorEvent;
