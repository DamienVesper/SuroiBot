import { Events } from 'discord.js';

import { Event } from '../classes/Event.js';

class Raw extends Event {
    config = {
        name: Events.Raw,
        once: false
    };

    run: (data: any) => Promise<void> = async data => {
        await this.client.lavalinkManager.updateVoiceState(data);
    };
}

export default Raw;
