import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';

import { Command } from '../../classes/Command.js';

class Rules extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`links`)
        .setDescription(`View useful links.`);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setDescription([
                `### Useful Links`,
                `- [Play Suroi](https://${this.client.config.customData.domain})`,
                `- [Suroi GitHub](https://github.com/${this.client.config.customData.github.repo})`,
                `- [Suroi Wiki](https://wiki.${this.client.config.customData.domain})`,
                `- [Wiki GitHub](https://github.com/${this.client.config.customData.github.wikiRepo})`
            ].join(`\n`))
            .setThumbnail(interaction.guild?.iconURL() ?? null)
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.reply({ embeds: [sEmbed] });
    };
}

export default Rules;
