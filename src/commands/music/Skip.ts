import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { Command } from "../../classes/Command.js";

class Queue extends Command {
    cmd = new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip one or more songs.")
        .addIntegerOption(option => option.setName("count").setDescription("The number of songs to skip.").setMinValue(1))
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

        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        if (player.queue.current === null) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "No song is currently playing!")] });
            return;
        }

        const skipCount = interaction.options.getInteger("count") ?? 1;
        await player.stop(skipCount);

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Skipped ${skipCount > 1 ? `**${skipCount}** songs` : "the current song"}.`)] });
    };
}

export default Queue;
