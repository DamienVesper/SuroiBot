import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

import type { MusicPlayer } from '../../modules/MusicPlayer.js';
import { Paginator } from '../../modules/Paginator.js';

class Lyrics extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`lyrics`)
        .setDescription(`View the lyrics of the current song.`)
        .setDMPermission(false);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null) {
            await interaction.reply({ content: `This command can only be used in a guild!`, ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in a voice channel to use that command!`)], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id) as MusicPlayer;
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I am not currently in a voice channel!`)] });
            return;
        } else if (player !== undefined && voiceChannel.id !== player.voiceChannel) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in the same voice channel as the bot to use that command!`)] });
            return;
        } else if (player.queue.current === null) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `No song is currently playing!`)] });
            return;
        }

        // @ts-expect-error SessionID is private.
        const lyrics: Partial<SongLyrics> | null = await player.node.rest.get(`/v4/sessions/${player.node.rest.sessionId}/players/${interaction.guild.id}/track/lyrics?skipTrackSource=true`);
        if (lyrics?.lines === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I could not find any lyrics for that track!`)] });
            return;
        }

        const embeds: EmbedBuilder[] = [];
        for (let i = 0; i < lyrics.lines.length; i += 20) {
            const sEmbed = new EmbedBuilder()
                .setColor(this.client.config.colors.blue)
                .setDescription([
                    `### Lyrics for "${player.queue.current.title}"`
                ].concat(lyrics.lines.slice(i, Math.min(i + 20, lyrics.lines.length)).map(line => line.line)).join(`\n`))
                .setThumbnail((player.queue.current.artworkUrl ?? player.queue.current.thumbnail) ?? null)
                .setTimestamp()
                .setFooter({ text: `ID: ${interaction.user.id}` });
            embeds.push(sEmbed);
        }

        if (embeds.length === 1) await interaction.followUp({ embeds });
        else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const paginator = new Paginator(this.client, interaction, interaction.user, embeds);
        }
    };
}

/**
 * Song lyrics provided by LavaLyrics.
 */
interface SongLyrics {
    sourceName: string
    provider: string
    text: string | null
    lines: Array<{
        timestamp: number
        duration: number | null
        line: string
        plugin: Record<never, never>
    }>
}

export default Lyrics;
