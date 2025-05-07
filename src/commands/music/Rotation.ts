import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { Command } from "../../classes/Command.js";

class Rotation extends Command {
    cmd = new SlashCommandBuilder()
        .setName("rotation")
        .addNumberOption(option => option.setName("value").setDescription("The frequency to rotate at.").setMinValue(0).setMaxValue(10))
        .setDescription("Set a panning filter to the audio.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: "This command can only be used in a guild!", ephemeral: true });
            return;
        }

        if (interaction.member.voice.channel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in a voice channel to use that command!")], ephemeral: true });
            return;
        }

        const rotation = interaction.options.getNumber("value");
        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        await player.filters.setRotation({ rotationHz: rotation ?? 0 });
        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, rotation !== null ? `Set the rotation frequency to **${rotation}** Hz.` : "Reset the rotation frequency.")] });
    };
}

export default Rotation;
