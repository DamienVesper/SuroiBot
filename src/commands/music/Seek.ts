import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

import { numToDurationFormat } from '../../utils/utils.js';

class Seek extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`seek`)
        .addIntegerOption(option => option.setName(`time`).setDescription(`The time, in seconds, to seek to.`).setMinValue(0).setRequired(true))
        .setDescription(`Seek a certain position in a track.`)
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

        if (player.queue.current === null) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `No song is currently being played!`)] });
            return;
        } else if (!player.queue.current.isSeekable) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `The current track does not support seeking.`)] });
            return;
        }

        const seekPos = Math.min(Math.max(interaction.options.getInteger(`time`, true) * 1e3, 0), player.queue.current.duration! - 1e3);
        player.seek(seekPos);

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Seeked to **${numToDurationFormat(seekPos)}** in the current track.`)] });
    };
}

export default Seek;
