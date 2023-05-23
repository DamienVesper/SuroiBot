import config from '../../../config/config';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
    type ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js';

import { type Client } from '../../typings/discord';

const cmd: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(`servers`)
    .setDescription(`View servers hosting Suroi.`);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null || interaction.guild.rulesChannel === null) return;

    const sEmbed = new EmbedBuilder()
        .setColor(config.colors.orange)
        .setAuthor({ name: `Suroi.io Servers`, iconURL: interaction.guild?.iconURL() ?? undefined })
        .setDescription(`A list of servers hosting Suroi.\n\n**Don't see your region?**\nApart from the North America server, all others are hosted by volunteers.\nIf you are interested in hosting a server, please contact <@${config.users.hasanger}> for more information.`)
        .addFields([
            {
                name: `North America`,
                value: `[suroi.io](https://suroi.io)`
            }
        ])
        .setTimestamp()
        .setFooter({ text: config.footer });

    await interaction.reply({
        embeds: [sEmbed]
    });
};

export {
    cmd,
    run
};
