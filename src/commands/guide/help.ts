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
    .setName(`help`)
    .setDescription(`View the help menu.`);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null || interaction.guild.rulesChannel === null) return;

    const sEmbed = new EmbedBuilder()
        .setColor(config.colors.orange)
        .setAuthor({ name: `Help`, iconURL: interaction.guild?.iconURL() ?? undefined })
        .setDescription(Object.entries(config.help).map(x => `\`/${x[0]}\` - ${x[1]}`).join(`\n`))
        .setTimestamp()
        .setFooter({ text: config.footer });

    const sRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.guild.rulesChannel.id}`)
            .setLabel(`Rules`)
            .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
            .setURL(`https://suroi.io`)
            .setLabel(`Website`)
            .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
            .setURL(`https://github.com/${config.github}`)
            .setLabel(`GitHub`)
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
