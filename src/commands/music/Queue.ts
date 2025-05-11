import {
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

import { numToDurationFormat } from "../../utils/utils.js";
import { Paginator } from "../../modules/Paginator.js";

class Queue extends Command {
    cmd = new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the current song being played.")
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

        const player = this.client.lavalink.players.get(interaction.guildId);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        const queue = [player.queue.current].concat(player.queue).filter(x => x !== null);
        if (queue.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There is no song currently in the queue!")] });
            return;
        }

        const pageCount = Math.ceil(queue.length / 10);
        const embeds = [];

        let queueLength = 0;
        for (const track of queue) queueLength += track.duration ?? 0;

        if (!player.voiceChannelId) {
            this.client.logger.error("Gateway", "Could not find channel for player:", player);
            return;
        }

        const channel = await this.client.channels.fetch(player.voiceChannelId);
        if (!channel?.isVoiceBased()) {
            this.client.logger.error("Gateway", `Tried to view a queue for a channel that is not a voice channel. [GUILD]: ${player.guildId} [CHANNEL]: ${player.voiceChannelId}.`);
            return;
        }

        for (let i = 0; i < pageCount * 10; i += 10) {
            const tracks = queue.slice(i, Math.min(i + 10, queue.length));
            embeds.push(new EmbedBuilder()
                .setColor(this.client.config.colors.blue)
                .setTitle("Server Queue")
                .setDescription(tracks.map((track, j) => `${i === 0 && j === 0 ? "↳ " : ""}**${i + j + 1}.** [${track.title}](${track.uri}) - \`[${numToDurationFormat(track.duration)}]\``).join("\n"))
                .setFields([
                    {
                        name: "Queue Size",
                        value: `\`${queue.length}\``,
                        inline: true
                    },
                    {
                        name: "Queue Length",
                        value: `\`${numToDurationFormat(queueLength)}\``,
                        inline: true
                    },
                    {
                        name: "Voice Channel",
                        value: `<#${channel.id}>`,
                        inline: true
                    }
                ])
                .setThumbnail(queue[0].artworkUrl ?? queue[0].thumbnail ?? null)
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
