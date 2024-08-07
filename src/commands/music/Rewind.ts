import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

class Rewind extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`rewind`)
        .addIntegerOption(option => option.setName(`time`).setDescription(`The time, in seconds, to rewind. If not specified, defaults to the beginning of the song.`).setMinValue(1))
        .setDescription(`Rewind the current song.`)
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

        const player = this.client.lavalink.players.get(interaction.guild.id);
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

        const seekPos = Math.max(player.position - (interaction.options.getInteger(`time`) ?? (player.position / 1e3) * 1e3), 0);
        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Rewound the current track by **${Math.round((player.position - seekPos) / 1e3)}** seconds.`)] });

        player.seek(seekPos);
    };
}

export default Rewind;
