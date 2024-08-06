import { Events, type ClientEvents } from 'discord.js';

import { Event } from '../classes/Event.js';

class Ready extends Event {
    config = {
        name: Events.ClientReady,
        once: true
    };

    run: (...args: ClientEvents[Events.ClientReady]) => Promise<void> = async client => {
        this.client.logger.info(`Gateway`, `Connected to Discord as "${client.user.tag}" (${client.user.id}).`);

        this.client.lavalinkManager.init(client.user.id);

        await this.client.deployCommands(this.client.config.mode);
    };
}

export default Ready;
