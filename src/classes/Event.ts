import { Events } from 'discord.js';
import type { DiscordBot } from '../modules/DiscordBot.js';

export class Event {
    client: DiscordBot;

    config: {
        name: Events
        once: boolean
    } = {
            name: Events.Debug,
            once: false
        };

    constructor (client: DiscordBot) {
        this.client = client;
    }

    /**
     * Executed when the event is received.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    run: (...args: any[]) => Promise<void> = async () => {};
}
