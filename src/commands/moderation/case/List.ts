import {
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Subcommand } from "../../../classes/Subcommand.js";

class List extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("View a user's cases.")
        .addUserOption(option => option.setName("user").setDescription("The user to view cases of."))
        .addNumberOption(option => option.setName("page").setDescription("The page of cases to view.").setMinValue(1))
        .addStringOption(option => option.setName("verbose").setDescription("Show disabled cases.").setChoices({ name: "True", value: "true" }));

    config = {
        parent: "case",
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        console.log("hi");
    };
}

export default List;
