import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';

import { Command } from '../../classes/Command.js';

import { numToCooldownFormat } from '../../utils/utils.js';
import { getCPUUsage } from '../../utils/os.js';

class BotInfo extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`botinfo`)
        .setDescription(`View bot statistics.`);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();

        // todo: add shard information to info
        const cpuUsage = await getCPUUsage(false);
        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setDescription([
                `### Bot Information`,
                `${this.client.config.emojis.network} **Latency:** \`${this.client.ws.ping} ms\``,
                `⏰ **Uptime:** \`${numToCooldownFormat(this.client.uptime)}\``,
                `${this.client.config.emojis.processor} **CPU:** \`${(cpuUsage * 100).toFixed(2)}%\``,
                `${this.client.config.emojis.memory} **Memory:** \`${Math.trunc(process.memoryUsage().rss / (1024 ** 2))} MiB\``
            ].join(`\n`))
            .setThumbnail(interaction.guild?.iconURL() ?? null)
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.followUp({ embeds: [sEmbed] });
    };
}

export default BotInfo;
