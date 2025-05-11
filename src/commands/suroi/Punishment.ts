import {
    InteractionContextType,
    SlashCommandBuilder
} from "discord.js";

import { Command } from "../../classes/Command.js";

class Punishment extends Command<true> {
    cmd = new SlashCommandBuilder()
        .setName("punishment")
        .setDescription("Interact with game infractions.")
        .setContexts(InteractionContextType.Guild);

    config = {
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run: undefined;
}

export default Punishment;
