import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

class Remove extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`remove`)
        .addIntegerOption(option => option.setName(`id`).setDescription(`The position of the song in the queue.`).setMinValue(1).setRequired(true))
        .setDescription(`Remove a song from the queue.`)
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

        const songID = interaction.options.getInteger(`id`, true) - 1;
        if (songID > player.queue.length) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `There are only **${player.queue.length + 1}** songs in the queue!`)] });
            return;
        } else if (songID === 0) {
            const song = player.queue.current!;
            player.stop(1);

            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Removed **${song.title}** from the queue.`)] });
            await interaction.channel?.send(this.client.createNowPlayingDetails(player, true));
        } else {
            const song = player.queue.splice(songID - 1, songID)[0];
            await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Removed **${song.title}** from the queue.`)] });
        }
    };
}

export default Remove;
