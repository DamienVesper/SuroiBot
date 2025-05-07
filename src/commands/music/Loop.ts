import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

import type { MusicPlayer } from "../../modules/MusicPlayer.js";

class Loop extends Command {
    cmd = new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Loop the current queue or track.")
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

        const player = this.client.lavalink.players.get(interaction.guild.id) as MusicPlayer;
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        if (!player.queueRepeat && !player.trackRepeat) {
            player.setQueueRepeat(true);
            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, "Now looping the queue.")] });
        } else if (player.queueRepeat) {
            player.setQueueRepeat(false);
            player.setTrackRepeat(true);

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, "Now looping the current track.")] });
        } else if (player.trackRepeat) {
            player.setTrackRepeat(false);
            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, "Looping has been disabled.")] });
        }
    };
}

export default Loop;
