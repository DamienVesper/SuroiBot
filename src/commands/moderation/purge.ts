import config from '../../../config/config';

import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import {
    type ChatInputCommandInteraction,
    type GuildTextBasedChannel,
    PermissionsBitField,
    type TextChannel,
    PermissionFlagsBits
} from 'discord.js';

import log from '../../utils/log';

import type { Client } from '../../typings/discord';

const cmd: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(`purge`)
    .addIntegerOption(option => option.setName(`amount`).setDescription(`The amount of messages to be deleted.`).setMinValue(1).setMaxValue(100).setRequired(true))
    .addStringOption(option => option.setName(`reason`).setDescription(`The reason you are purging the channel.`))
    .setDescription(`Purge a channel's messages.`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const messageCount = interaction.options.getInteger(`amount`) ?? 100;
    const reason = interaction.options.getString(`reason`) ?? `No reason provided`;

    if (interaction.channel == null) return;

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: `You are not permitted to run that command!`, ephemeral: true });
        return;
    }

    const messages = await interaction.channel?.messages.fetch({ limit: messageCount });
    if (messages === undefined) return;

    await interaction.deferReply();

    await (interaction.channel as GuildTextBasedChannel)?.bulkDelete(messages).catch(() => log(`red`, `Failed deleting messages.`));

    const sEmbed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL })
        .setDescription(`Succesfully deleted ${messageCount} messages.`)
        .setFooter({ text: config.footer });

    const xEmbed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL })
        .setDescription(`**Purged ${messageCount} messages in <#${interaction.channel.id}>.**\n\n**Reason**\`\`\`${reason}\`\`\``)
        .setFooter({ text: config.footer });

    const msg = await interaction.followUp({ embeds: [sEmbed] });

    const logChannel = await client.channels.fetch(config.channels.logs) as TextChannel | null;
    if (logChannel === null) return;

    await logChannel.send({ embeds: [xEmbed] });

    setTimeout(() => {
        void msg.delete();
    }, 5e3);
};

export {
    cmd,
    run
};
