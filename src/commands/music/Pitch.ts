import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

class Pitch extends Command {
    cmd = new SlashCommandBuilder()
        .setName("pitch")
        .addIntegerOption(option => option.setName("value").setDescription("The pitch (%) to set the audio to. Leave blank for default.").setMinValue(1).setMaxValue(1e3))
        .setDescription("Set the pitch of the player.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: "This command can only be used in a guild!", flags: MessageFlags.Ephemeral });
            return;
        }

        if (interaction.member.voice.channel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in a voice channel to use that command!")], flags: MessageFlags.Ephemeral });
            return;
        }

        const pitch = interaction.options.getInteger("value");
        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        await player.filters.setTimescale({ pitch: (pitch ?? 100) / 100 });
        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, pitch !== null ? `Changed pitch by **${pitch}%**.` : "Reset the pitch.")] });
    };
}

export default Pitch;
