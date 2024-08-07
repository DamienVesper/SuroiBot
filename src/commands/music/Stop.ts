import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

class Stop extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`stop`)
        .setDescription(`Stop the player and clear queue.`)
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

        if (player.queue.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `There are no songs to clear in the queue!`)] });
            return;
        }

        player.queue.clear();
        player.pause(true);
        player.stop(1);

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Stopped the queue.`)] });
    };
}

export default Stop;
