import type { ClientEvents } from "discord.js";
import { DiscordBot } from "../modules/DiscordBot.js";

interface EventConfig<T> {
    name: T
    once: boolean
}

export class Event<T extends keyof ClientEvents> {
    client: DiscordBot;
    config!: EventConfig<T>;

    constructor (client: DiscordBot) {
        this.client = client;
    }

    /**
     * Executed when the event is received.
     */
    run!: (...args: ClientEvents[T]) => Promise<void>;

    /**
     * For more specific events.
     */
    runUnsafe?: (...args: any[]) => Promise<void>;
}
