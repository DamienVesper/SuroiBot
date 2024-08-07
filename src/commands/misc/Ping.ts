import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';

import { Command } from '../../classes/Command.js';

class Rules extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`ping`)
        .setDescription(`View ping statistics.`);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setDescription([
                `### Ping Statistics`,
                `**Gateway:** ${this.client.ws.ping}`
            ].join(`\n`))
            .setThumbnail(interaction.guild?.iconURL() ?? null)
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.reply({ embeds: [sEmbed] });
    };
}

export default Rules;
