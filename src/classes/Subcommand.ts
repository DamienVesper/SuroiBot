import {
    type ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from "discord.js";

import type { DiscordBot } from "../modules/DiscordBot.js";

import { CommandTypes } from "../utils/utils.js";
import { Command } from "./Command.js";

export abstract class Subcommand {
    client: DiscordBot;

    abstract cmd: SlashCommandSubcommandBuilder;
    config: ConfigType = {
        parent: "",
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    type = CommandTypes.Subcommand;

    constructor (client: DiscordBot) {
        this.client = client;
    }

    /**
     * Executed when receiving the interaction.
     * @param interaction The interaction received.
     */
    abstract run: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

interface ConfigType {
    parent: Command["cmd"]["name"]
    botPermissions: bigint[]
    userPermissions: bigint[]
    cooldown: number
}
