import config from '../../../config/config';

import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import {
    type ChatInputCommandInteraction,
    PermissionsBitField,
    type TextChannel,
    PermissionFlagsBits
} from 'discord.js';

import type { Client } from '../../typings/discord';
import { discord } from '../../utils/standardize';

const cmd: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(`unban`)
    .addStringOption(option => option.setName(`id`).setDescription(`The user to unban.`).setRequired(true))
    .addStringOption(option => option.setName(`reason`).setDescription(`The reason you are unbanning the user.`))
    .setDescription(`Unban a user.`)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const targetMemberID = interaction.options.getString(`id`, true);

    const reason = interaction.options.getString(`reason`) ?? `No reason provided`;

    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        await interaction.reply({ content: `You are not permitted to run that command!`, ephemeral: true });
        return;
    }

    const logChannel = await client.channels.fetch(config.channels.logs) as TextChannel | null;
    if (logChannel === null) return;

    await interaction.deferReply();

    const sEmbed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL })
        .setDescription(`**Unbanned** <@${targetMemberID}> **from the server.**\n\n**ID**\`\`\`${targetMemberID}\`\`\`\n**Reason**\`\`\`${discord(reason)}\`\`\``)
        .setTimestamp()
        .setFooter({ text: config.footer });

    const xEmbed = new EmbedBuilder()
        .setAuthor({ name: `Unban | ${targetMemberID}`, iconURL: interaction.guild.iconURL() ?? `` })
        .setDescription(`**<@${targetMemberID}> was unbanned from the server.**\n\n**Responsible Moderator**\n<@${interaction.user.id}>\n\n**ID**\`\`\`${targetMemberID}\`\`\`\n**Reason**\`\`\`${discord(reason)}\`\`\``)
        .setTimestamp()
        .setFooter({ text: config.footer });

    await interaction.guild.members.unban(targetMemberID, reason);

    await interaction.followUp({ embeds: [sEmbed] });
    await logChannel.send({ embeds: [xEmbed] });
};

export {
    cmd,
    run
};
