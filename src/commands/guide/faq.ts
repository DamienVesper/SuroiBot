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
                value: `This is the official Discord server for Suroi, an open-source 2D battle royale game inspired by surviv.io.\nThis used to be the server for Surviv Reloaded, a remake of the latter.`
            },
            {
                name: `What is this bot?`,
                value: `This bot was originally made by <@${config.users.damienvesper}> & <@${config.users.killaship}> to explain the significance of Surviv Reloaded. It was later updated by <@${config.users.katloo}> for Suroi.`
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
            .setURL(`https://suroi.io`)
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
