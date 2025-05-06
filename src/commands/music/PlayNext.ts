import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { Command } from "../../classes/Command.js";

import type { MusicPlayer } from "../../modules/MusicPlayer.js";
import { LoadTypes } from "magmastream";

class PlayNext extends Command {
    cmd = new SlashCommandBuilder()
        .setName("playnext")
        .addStringOption(option => option.setName("query").setDescription("The name or link to the song, file, or playlist.").setRequired(true))
        .setDescription("Insert a song, audio file, or playlist at the front of the queue.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null || !interaction.inGuild() || !interaction.channel?.isTextBased()) {
            await interaction.reply({ content: "This command can only be used in a guild!", ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in a voice channel to use that command!")], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const guildPlayer = this.client.lavalink.players.get(interaction.guild.id);
        if (guildPlayer !== undefined && voiceChannel.id !== guildPlayer.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        const songInput = interaction.options.getString("query", true);
        const res = await this.client.lavalink.search(songInput, interaction.user as any);

        if (res.loadType === LoadTypes.Error) {
            this.client.logger.debug(`Lavalink Node ${guildPlayer?.node.options.identifier}`, res);
            this.client.logger.error(`Lavalink Node ${guildPlayer?.node.options.identifier}`, "There was an error queuing a track.");
            return;
        } else if (res.loadType === LoadTypes.Empty) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I could not find any songs with the provided query.")] });
            return;
        }

        const player = this.client.lavalink.create({
            guildId: interaction.guild.id,
            voiceChannelId: voiceChannel.id,
            textChannelId: interaction.channel.id,
            volume: 75,
            selfDeafen: true
        }) as MusicPlayer;

        player.connect();

        if (res.loadType === LoadTypes.Playlist && res.playlist !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            player.queue.length === 0
                ? player.queue.add(res.playlist.tracks)
                : player.queue.unshift(...res.playlist.tracks);
            if (!player.playing && !player.paused && player.queue.size === res.playlist.tracks.length) await player.play();

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Added **${res.playlist.tracks.length}** songs to the start of the queue.`)] });
        } else {
            const track = res.tracks[0];
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            player.queue.length === 0
                ? player.queue.add(track)
                : player.queue.unshift(track);

            if (player.stopped || (!player.playing && !player.paused && !player.queue.size)) {
                await player.play();
                player.stopped = false;
            }

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Added **${track.title}** to the start of the queue.`)] });
        }
    };
}

export default PlayNext;
