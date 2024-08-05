import { Events } from 'discord.js';
import { Event } from '../classes/Event.js';

class Ready extends Event {
    config = {
        name: Events.Raw,
        once: false
    };

    run: (data: any) => Promise<void> = async data => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.client.lavalinkManager.updateVoiceState(data);
    };
}

export default Ready;
