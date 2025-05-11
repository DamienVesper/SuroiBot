import {
    type ChatInputCommandInteraction,
    Collection,
    SharedSlashCommand
} from "discord.js";

import type { DiscordBot } from "../modules/DiscordBot.js";

import { Subcommand } from "./Subcommand.js";

export abstract class Command<SubcommandOnly = false> {
    client: DiscordBot;

    abstract cmd: SharedSlashCommand;
    config: ConfigType = {
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    category!: string;

    subcommands = new Collection<Subcommand["cmd"]["name"], Subcommand>();

    constructor (client: DiscordBot) {
        this.client = client;
    }

    /**
     * Executed when receiving the interaction.
     * @param interaction The interaction received.
     */
    abstract run: SubcommandOnly extends false
        ? (interaction: ChatInputCommandInteraction) => Promise<void>
        : undefined;
}

interface ConfigType {
    botPermissions: bigint[]
    userPermissions: bigint[]
    cooldown: number
}
