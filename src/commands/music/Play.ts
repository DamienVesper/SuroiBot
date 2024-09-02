import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';
import type { MusicPlayer } from '../../modules/MusicPlayer.js';

class Play extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`play`)
        .addStringOption(option => option.setName(`query`).setDescription(`The name or link to the song, file, or playlist.`).setRequired(true))
        .setDescription(`Play a song, audio file, or playlist.`)
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null || interaction.channel === null) {
            await interaction.reply({ content: `This command can only be used in a guild!`, ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in a voice channel to use that command!`)], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const guildPlayer = this.client.lavalink.players.get(interaction.guild.id);
        if (guildPlayer !== undefined && voiceChannel.id !== guildPlayer.voiceChannel) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in the same voice channel as the bot to use that command!`)] });
            return;
        }

        const songInput = interaction.options.getString(`query`, true);
        const res = await this.client.lavalink.search(songInput, interaction.user as any);

        if (res.loadType === `error`) {
            this.client.logger.debug(`Lavalink Node ${guildPlayer?.node.options.identifier}`, res);
            this.client.logger.error(`Lavalink Node ${guildPlayer?.node.options.identifier}`, `There was an error queuing a track.`);
            return;
        } else if (res.loadType === `empty`) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I could not find any songs with the provided query.`)] });
            return;
        }

        const player = this.client.lavalink.create({
            guild: interaction.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: interaction.channel.id,
            volume: 75,
            selfDeafen: true
        }) as MusicPlayer;

        player.connect();

        if (res.loadType === `playlist` && res.playlist !== undefined) {
            player.queue.add(res.playlist.tracks);
            if (!player.playing && !player.paused && player.queue.size === res.playlist.tracks.length) await player.play();

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Queued **${res.playlist.tracks.length}** songs.`)] });
        } else {
            const track = res.tracks[0];
            player.queue.add(track);

            if (player.stopped || (!player.playing && !player.paused && !player.queue.size)) {
                await player.play();
                player.stopped = false;
            }

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Queued **${track.title}**.`)] });
        }
    };
}

export default Play;
