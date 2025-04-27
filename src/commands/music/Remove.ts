import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { Command } from "../../classes/Command.js";

class Remove extends Command {
    cmd = new SlashCommandBuilder()
        .setName("remove")
        .addIntegerOption(option => option.setName("start").setDescription("The position to start removing at.").setMinValue(1).setRequired(true))
        .addIntegerOption(option => option.setName("end").setDescription("The position to stop removing at (exclusive).").setMinValue(2))
        .setDescription("Remove one or multiple songs from the queue.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.channel?.isTextBased() || interaction.channel.isDMBased()) return;
        if (interaction.guild === null) {
            await interaction.reply({ content: "This command can only be used in a guild!", ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in a voice channel to use that command!")], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (player !== undefined && voiceChannel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        /**
         * The queue does not include the current song, but the queue embed does. So we deduct 1 from the start position to account for this.
         * Unless there is no currently active song, in which we then use the normal length.
         */
        const start = interaction.options.getInteger("start", true) - (player.queue.current !== null ? 1 : 0);

        /**
         * The same thing with the end of the queue.
         * If none is specified, defaults to start + 1.
         */
        const end = player.queue.current !== null
            ? interaction.options.getInteger("end") ?? (start + 2) - 1
            : interaction.options.getInteger("end") ?? (start + 1);

        if (start > player.queue.length || end > player.queue.length) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `There are only **${player.queue.length + 1}** songs in the queue!`)] });
            return;
        } else if ((end - start) === 1) {
            const song = start === 0 ? player.queue.current! : player.queue.splice(start - 1, end - start)[0];
            if (start === 0) await player.stop();

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Removed **${song.title}** from the queue.`)] });
            if (start === 0 && player.queue.current !== null) await interaction.channel.send(this.client.createNowPlayingDetails(player, true));
        } else {
            if (start === 0) await player.stop();
            const songs = player.queue.splice(start - 1, end - start);

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Removed **${songs.length}** songs from the queue.`)] });
            if (start === 0 && player.queue.current !== null) await interaction.channel.send(this.client.createNowPlayingDetails(player, true));
        }
    };
}

export default Remove;
