import {
    InteractionContextType,
    SlashCommandBuilder
} from "discord.js";

import { Command } from "../../classes/Command.js";

class Case extends Command<true> {
    cmd = new SlashCommandBuilder()
        .setName("case")
        .setDescription("Interact with mod cases.")
        .setContexts(InteractionContextType.Guild);

    config = {
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run: undefined;
}

export default Case;
