import {
    InteractionContextType,
    SlashCommandBuilder
} from "discord.js";

import { Command } from "../../classes/Command.js";

class Report extends Command<true> {
    cmd = new SlashCommandBuilder()
        .setName("report")
        .setDescription("Interact with game reports.")
        .setContexts(InteractionContextType.Guild);

    config = {
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run: undefined;
}

export default Report;
