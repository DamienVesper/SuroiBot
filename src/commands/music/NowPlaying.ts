import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

import { capitalize, numToDurationFormat } from '../../utils/utils.js';

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

        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.blue)
            .setTitle(song.title)
            .setAuthor({ name: song?.author ?? `John Doe`, url: song.uri })
            .setDescription(`There ${player.queue.length + 1 === 1 ? `is` : `are`} currently **${player.queue.length + 1}** ${player.queue.length + 1 === 1 ? `song` : `songs`} in the queue.`)
            .addFields([
                {
                    name: `Duration`,
                    value: numToDurationFormat(song.duration!),
                    inline: true
                },
                {
                    name: `Source`,
                    value: capitalize(song.sourceName!),
                    inline: true
                },
                {
                    name: `Requester`,
                    value: song.requester?.displayName ?? song.requester?.tag ?? `John Doe`,
                    inline: true
                }
            ])
            .setThumbnail((song.artworkUrl ?? song.thumbnail)!)
            .setTimestamp()
            .setFooter({ text: `ID: ${song.requester?.id}` });

        const sRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`View Song`).setURL(song.uri ?? `https://example.org`)
        );

        await interaction.followUp({ embeds: [sEmbed], components: [sRow] });
    };
}

export default NowPlaying;
