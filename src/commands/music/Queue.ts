import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../classes/Command.js';

class NowPlaying extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`nowplaying`)
        .setDescription(`View the current song being played.`)
        .setDMPermission(false);

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

        const player = this.client.lavalinkManager.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I am not currently in a voice channel!`)] });
            return;
        } else if (player !== undefined && voiceChannel.id !== player.voiceChannel) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in the same voice channel as the bot to use that command!`)] });
            return;
        }

        const song = player.queue.current;
        if (song === null) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `No song is currently being played!`)] });
            return;
        }

        const sEmbed = this.client.createEmbed(song.requester!.id, `### [${song.title}](${song.uri})\n-# Requested by <@${song.requester?.id}>`)
            .setColor(this.client.config.colors.blue)
            .setAuthor({ name: song?.author ?? `John Doe` })
            .setThumbnail((song.artworkUrl ?? song.thumbnail)!);

        await interaction.followUp({ embeds: [sEmbed] });
    };
}

export default NowPlaying;
