import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

import { numToCooldownFormat } from "../../utils/utils.js";

class Rules extends Command {
    cmd = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("View ping statistics.");

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setDescription([
                "### Bot Statistics",
                `${this.client.config.emojis.network} **Latency:** \`${this.client.ws.ping} ms\``,
                `⏰ **Uptime:** \`${numToCooldownFormat(this.client.uptime)}\``,
                `${this.client.config.emojis.memory} **Memory:** \`${Math.trunc(process.memoryUsage().rss / (1024 ** 2))} MiB\``
            ].join("\n"))
            .setThumbnail(interaction.guild?.iconURL() ?? null)
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.reply({ embeds: [sEmbed] });
    };
}

export default Rules;
