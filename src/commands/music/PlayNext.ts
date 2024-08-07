import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

class PlayNext extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`playnext`)
        .addStringOption(option => option.setName(`query`).setDescription(`The name or link to the song, file, or playlist.`).setRequired(true))
        .setDescription(`Insert a song, audio file, or playlist at the front of the queue.`)
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

        const guildPlayer = this.client.lavalinkManager.players.get(interaction.guild.id);
        if (guildPlayer !== undefined && voiceChannel.id !== guildPlayer.voiceChannel) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in the same voice channel as the bot to use that command!`)] });
            return;
        }

        const songInput = interaction.options.getString(`query`, true);
        const res = await this.client.lavalinkManager.search(songInput, interaction.user as any);

        if (res.loadType === `error`) {
            this.client.logger.debug(`Lavalink Node ${guildPlayer?.node.options.identifier}`, res);
            this.client.logger.error(`Lavalink Node ${guildPlayer?.node.options.identifier}`, `There was an error queuing a track.`);
            return;
        } else if (res.loadType === `empty`) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I could not find any songs with the provided query.`)] });
            return;
        }

        const player = this.client.lavalinkManager.create({
            guild: interaction.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: interaction.channel.id,
            volume: 75,
            selfDeafen: true
        });

        player.connect();

        if (res.loadType === `playlist` && res.playlist !== undefined) {
            player.queue.unshift(...res.playlist.tracks);
            if (!player.playing && !player.paused && player.queue.size === res.playlist.tracks.length) await player.play();

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Added **${res.playlist.tracks.length}** songs to the start of the queue.`)] });
        } else {
            const track = res.tracks[0];
            player.queue.unshift(track);

            if (!player.playing && !player.paused && !player.queue.size) await player.play();
            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Added **${track.title}** to the start of the queue.`)] });
        }
    };
}

export default PlayNext;
