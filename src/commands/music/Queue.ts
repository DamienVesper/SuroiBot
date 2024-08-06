import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type VoiceChannel
} from 'discord.js';

import { Command } from '../../classes/Command.js';

import { numToDurationFormat } from '../../utils/utils.js';
import { Paginator } from '../../modules/Paginator.js';

class Queue extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`queue`)
        .setDescription(`View the current song being played.`)
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

        const player = this.client.lavalinkManager.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I am not currently in a voice channel!`)] });
            return;
        } else if (player !== undefined && voiceChannel.id !== player.voiceChannel) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in the same voice channel as the bot to use that command!`)] });
            return;
        }

        const queue = [player.queue.current!].concat(player.queue);
        if (queue.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `There is no song currently in the queue!`)] });
            return;
        }

        const pageCount = Math.ceil(queue.length / 10);
        const embeds = [];

        let queueLength = 0;
        for (const track of queue) queueLength += track.duration ?? 0;

        const channel = await this.client.channels.fetch(player.voiceChannel!) as VoiceChannel;

        for (let i = 0; i < pageCount * 10; i += 10) {
            const tracks = i + 10 > queue.length
                ? queue.slice(i, queue.length)
                : queue.slice(i, i + 10);

            embeds.push(new EmbedBuilder()
                .setColor(this.client.config.colors.blue)
                .setTitle(`Server Queue`)
                .setDescription(tracks.map((track, j) => `${i === 0 && j === 0 ? `↳ ` : ``}**${i + j + 1}.** [${track.title}](${track.uri!}) - \`[${numToDurationFormat(track.duration!)}]\``).join(`\n`))
                .setFields([
                    {
                        name: `Queue Size`,
                        value: `\`${queue.length}\``,
                        inline: true
                    },
                    {
                        name: `Queue Length`,
                        value: `\`${numToDurationFormat(queueLength)}\``,
                        inline: true
                    },
                    {
                        name: `Voice Channel`,
                        value: `<#${channel.id}>`,
                        inline: true
                    }
                ])
                .setThumbnail(queue[0].artworkUrl ?? queue[0].thumbnail ?? ``)
                .setTimestamp()
                .setFooter({ text: `ID: ${interaction.user.id}` }));
        }

        if (embeds.length === 1) await interaction.followUp({ embeds: [embeds[0]] });
        else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const paginator = new Paginator(this.client, interaction, interaction.user, embeds);
        }
    };
}

export default Queue;
