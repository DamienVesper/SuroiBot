import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';

import { Command } from '../../classes/Command.js';
import { config } from '../../.config/config.js';

const linksText = `
### Useful Links
- [Play Suroi](https://${config.customData.domain})
- [Suroi GitHub](https://github.com/${config.customData.github.repo})
- [Suroi Wiki](https://wiki.${config.customData.domain})
- [Wiki GitHub](https://github.com/${config.customData.github.wikiRepo})
`;

class Rules extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`links`)
        .setDescription(`View useful links.`);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setDescription(linksText)
            .setThumbnail(interaction.guild?.iconURL() ?? null)
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.reply({ embeds: [sEmbed] });
    };
}

export default Rules;
