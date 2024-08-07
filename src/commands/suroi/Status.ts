import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';
import axios, { AxiosResponse, type AxiosError } from 'axios';

import { Command } from '../../classes/Command.js';

import { translateSuroiStatus } from '../../utils/utils.js';

class Status extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`status`)
        .setDescription(`View the status of Suroi servers.`);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();

        await Promise.allSettled([
            axios<any, AxiosResponse<{ playerCount: number }>>({ method: `GET`, url: `https://na.suroi.io/api/serverInfo`, timeout: 5e3, signal: AbortSignal.timeout(5e3) }).then(res => [res.data?.playerCount ?? 0, res.status]).catch((err: AxiosError) => [-1, err.response?.status]),
            axios<any, AxiosResponse<{ playerCount: number }>>({ method: `GET`, url: `https://eu.suroi.io/api/serverInfo`, timeout: 5e3, signal: AbortSignal.timeout(5e3) }).then(res => [res.data?.playerCount ?? 0, res.status]).catch((err: AxiosError) => [-1, err.response?.status]),
            axios<any, AxiosResponse<{ playerCount: number }>>({ method: `GET`, url: `https://sa.suroi.io/api/serverInfo`, timeout: 5e3, signal: AbortSignal.timeout(5e3) }).then(res => [res.data?.playerCount ?? 0, res.status]).catch((err: AxiosError) => [-1, err.response?.status]),
            axios<any, AxiosResponse<{ playerCount: number }>>({ method: `GET`, url: `https://as.suroi.io/api/serverInfo`, timeout: 5e3, signal: AbortSignal.timeout(5e3) }).then(res => [res.data?.playerCount ?? 0, res.status]).catch((err: AxiosError) => [-1, err.response?.status])
        ]).then(async values => {
            const VALUES = values as unknown as Array<{ value: [number, number] }>;
            const naRes = VALUES[0].value;
            const euRes = VALUES[1].value;
            const saRes = VALUES[2].value;
            const asRes = VALUES[3].value;

            let playerCount = 0;
            for (const value of VALUES) playerCount += Number(value.value[0]);

            let desc = ``;
            desc += `## Suroi Status\n`;
            desc += `Currently **${playerCount}** players online.\n`;

            desc += `### Don't see your region?\n`;
            desc += `Apart from the North America server, all others are hosted by volunteers.\n`;
            desc += `If you are interested in hosting a server, please contact <@${this.client.config.customData.users.hasanger}> for more information.\n`;

            desc += `### Servers\n`;
            desc += `${translateSuroiStatus(naRes[1])} **North America**${naRes[0] > -1 ? ` (${naRes[0]} players)` : ``}\n`;
            desc += `${translateSuroiStatus(euRes[1])} **Europe**${euRes[0] > -1 ? ` (${euRes[0]} players)` : ``}\n`;
            desc += `${translateSuroiStatus(saRes[1])} **South America**${saRes[0] > -1 ? ` (${saRes[0]} players)` : ``}\n`;
            desc += `${translateSuroiStatus(asRes[1])} **Asia**${asRes[0] > -1 ? ` (${asRes[0]} players)` : ``}\n`;

            const sEmbed = new EmbedBuilder()
                .setColor(this.client.config.colors.orange)
                .setDescription(desc)
                .setThumbnail(interaction.guild?.iconURL() ?? null)
                .setTimestamp()
                .setFooter({ text: `ID: ${interaction.user.id}` });

            const sRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Play Suroi`).setURL(`https://${this.client.config.customData.domain}`),
                new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Wiki`).setURL(`https://wiki.${this.client.config.customData.domain}`),
                new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Report a problem`).setURL(`https://discord.com/users/${this.client.config.customData.users.hasanger}`)
            );

            await interaction.followUp({ embeds: [sEmbed], components: [sRow] });
        });
    };
}

export default Status;
