import config from '../../../config/config';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js';

import { type Client } from '../../typings/discord';

const cmd: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(`faq`)
    .setDescription(`View FAQ regarding the project.`);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null || interaction.guild.rulesChannel === null) return;

    const sEmbed = new EmbedBuilder()
        .setColor(config.colors.orange)
        .setAuthor({ name: `Help`, iconURL: interaction.guild?.iconURL() ?? undefined })
        .addFields([
            {
                name: `What is this server?`,
                value: `This is the official Discord server for Suroi, an open-source 2D battle royale game inspired by surviv.io.
This used to be the server for Surviv Reloaded, a surviv.io remake.`
            },
            {
                name: `What is this bot?`,
                value: `This bot was originally made by DamienVesper & Killaship to save the hassle of explaining exactly what Surviv Reloaded was to everyone. Updated by Katie for Suroi`
            },
            {
                name: `What is Suroi`,
                value: `Suroi is a new open-source 2D battle royale game inspired by surviv.io.`
            },
            {
                name: `Where can I get more info?`,
                value: `More information can be found on our [GitHub](https://github.com/HasangerGames/suroi).`
            }
        ])
        .setTimestamp()
        .setFooter({ text: config.footer });

    const sRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setURL(`https://resurviv.io`)
            .setLabel(`Website`)
            .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
        embeds: [sEmbed],
        components: [sRow]
    });
};

export {
    cmd,
    run
};
