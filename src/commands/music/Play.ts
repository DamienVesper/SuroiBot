import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../classes/Command.js';

class Play extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`play`)
        .setDescription(`Play a song.`)
        .addStringOption(option => option.setName(`name`).setDescription(`The name or link to the song.`).setRequired(true))
        .setDMPermission(false);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null) {
            await interaction.reply({ content: `This command can only be used in a guild!`, ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in a voice channel to use that command!`)] });
    };
}

export default Play;
