import config from '../../../config/config';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
    type ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js';

import { type Client } from '../../typings/discord';

const cmd: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(`links`)
    .setDescription(`View important links regarding the project.`);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null || interaction.guild.rulesChannel === null) return;

    const sEmbed = new EmbedBuilder()
        .setColor(config.colors.orange)
        .setAuthor({ name: `Useful Links`, iconURL: interaction.guild?.iconURL() ?? undefined })
        .setDescription(`[Suroi.io - Stable](https://suroi.io)\n[Discord](https://discord.suroi.io)\n[Subreddit](https://reddit.com/r/suroigame)\n[GitHub](https://github.com/HasangerGames/suroi)\n[Bot GitHub](https://github.com/DamienVesper/SurvivReloadedBot)`)
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
