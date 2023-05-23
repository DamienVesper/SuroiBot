import config from '../../../config/config';

import { SlashCommandBuilder } from '@discordjs/builders';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js';

import axios, { type AxiosError } from 'axios';
import { URL } from 'url';

import { type Client } from '../../typings/discord';
import { discord } from '../../utils/standardize';
import log from '../../utils/log';

const cmd: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(`checkurl`)
    .addStringOption(option => option.setName(`url`).setDescription(`The URL to check.`).setRequired(true))
    .setDescription(`Check the response code of a URL.`);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    try {
        const inputURL = interaction.options.getString(`url`, true);
        const url = new URL(inputURL);

        const sEmbed = new EmbedBuilder()
            .setAuthor({ name: `URL Status`, iconURL: interaction.guild?.iconURL() ?? undefined, url: url.href })
            .setTimestamp()
            .setFooter({ text: config.footer });

        const sRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setURL(url.href)
                .setLabel(`View Site`)
                .setStyle(ButtonStyle.Link)
        );

        await interaction.deferReply();

        /**
         * @todo Change UA so that axios isn't detected.
         */
        axios.get(url.href).then(res => {
            sEmbed.setColor(config.colors.teal);
            sEmbed.addFields([{ name: `Response`, value: config.httpCodes[res.status] !== undefined ? `${res.status} - ${config.httpCodes[res.status]}` : `The bot could not understand the response sent by the server.` }]);
        }).catch((err: AxiosError) => {
            const status = err.response?.status;

            sEmbed.setColor(config.colors.red);
            sEmbed.addFields([{ name: `Response`, value: status !== undefined && config.httpCodes[status] !== undefined ? `${status} - ${config.httpCodes[status]}` : `The bot's attempt to establish a connection to the server timed out.` }]);
        }).finally(() => {
            sEmbed.setDescription(`[${discord(url.hostname)}](${url.href})`);
            void interaction.followUp({
                embeds: [sEmbed],
                components: [sRow]
            });
        });
    } catch (err) {
        log(`red`, `Failed to validate URL.`);
        await interaction.reply({ content: `That is an invalid url!`, ephemeral: true });
    }
};

export {
    cmd,
    run
};
