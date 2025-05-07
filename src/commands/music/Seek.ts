import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

import { numToDurationFormat } from "../../utils/utils.js";

class Seek extends Command {
    cmd = new SlashCommandBuilder()
        .setName("seek")
        .addIntegerOption(option => option.setName("time").setDescription("The time, in seconds, to seek to.").setMinValue(0).setRequired(true))
        .setDescription("Seek a certain position in the current song.")
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
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "No song is currently being played!")] });
            return;
        } else if (!player.queue.current.isSeekable) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "The current track does not support seeking.")] });
            return;
        }

        const seekPos = Math.min(Math.max(interaction.options.getInteger("time", true) * 1e3, 0), player.queue.current.duration - 1e3);
        await player.seek(seekPos);

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Seeked to **${numToDurationFormat(seekPos)}** in the current track.`)] });
    };
}

export default Seek;
