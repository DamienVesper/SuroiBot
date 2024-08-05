import { Events } from 'discord.js';
import { Event } from '../classes/Event.js';

class Ready extends Event {
    config = {
        name: Events.Raw,
        once: false
    };

    run: (...args: any[]) => Promise<void> = async args => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.client.lavalinkManager.updateVoiceState(args);
    };
}

export default Ready;
