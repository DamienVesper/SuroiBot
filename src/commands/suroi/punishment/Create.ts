import {
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Subcommand } from "../../../classes/Subcommand.js";

class Create extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create a punishment.");

    config = {
        parent: "punishment",
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;
    };
}

export default Create;
