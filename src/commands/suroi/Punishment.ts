import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command, type ConfigType } from "../../classes/Command.js";

class Punishment extends Command {
    cmd = new SlashCommandBuilder()
        .setName("punishment")
        .addStringOption(option => option.setName("id").setDescription("The ID of user to ban.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason you are banning the user."))
        .setDescription("Hackban a user.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(InteractionContextType.Guild);

    config: ConfigType = {
        botPermissions: [
            PermissionFlagsBits.ViewAuditLog
        ],
        userPermissions: [
            PermissionFlagsBits.ViewAuditLog
        ],
        isSubcommand: false,
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;
    };
}

export default Punishment;
