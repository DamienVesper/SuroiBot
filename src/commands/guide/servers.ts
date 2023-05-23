import config from '../../../config/config';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
    type ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js';

import { type Client } from '../../typings/discord';

const cmd: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(`servers`)
    .setDescription(`View servers hosting Surviv Reloaded.`);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null || interaction.guild.rulesChannel === null) return;

    const sEmbed = new EmbedBuilder()
        .setColor(config.colors.orange)
        .setAuthor({ name: `Suroi.io Servers`, iconURL: interaction.guild?.iconURL() ?? undefined })
        .setDescription(`A list of servers hosting Suroi.\nDon't see your region? Other than the North America server, they are volunteer hosted. Interested in hosting a server? Contact Hasanger for details.')
        .addFields([
            {
                name: `North America`,
                value: `[surio.io](https://suroi.io)`
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
