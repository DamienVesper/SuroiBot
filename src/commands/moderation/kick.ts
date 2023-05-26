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
    .setName(`kick`)
    .addUserOption(option => option.setName(`user`).setDescription(`The user to kick.`).setRequired(true))
    .addStringOption(option => option.setName(`reason`).setDescription(`The reason you are kicking the user.`))
    .setDescription(`Kick a user.`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (interaction.guild === null) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const targetMember = await interaction.guild.members.fetch(interaction.options.getUser(`user`, true).id);

    const reason = interaction.options.getString(`reason`) ?? `No reason provided`;

    if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        await interaction.reply({ content: `You are not permitted to run that command!`, ephemeral: true });
        return;
    } else if (!targetMember.kickable) {
        await interaction.reply({ content: `That user is a staff member!`, ephemeral: true });
        return;
    }

    const logChannel = await client.channels.fetch(config.channels.logs) as TextChannel | null;
    if (logChannel === null) return;

    await interaction.deferReply();

    const sEmbed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL })
        .setDescription(`**Kicked** <@${targetMember.id}> ||(${discord(targetMember.user.tag)})|| **from the server.**\n\n**ID**\`\`\`${targetMember.id}\`\`\`\n**Reason**\`\`\`${discord(reason)}\`\`\``)
        .setTimestamp()
        .setFooter({ text: config.footer });

    const xEmbed = new EmbedBuilder()
        .setAuthor({ name: targetMember.user.tag, iconURL: targetMember.user.avatarURL() ?? targetMember.user.defaultAvatarURL })
        .setDescription(`**<@${targetMember.id}> was kicked from the server.**\n\n**Responsible Moderator**\n<@${interaction.user.id}>\n\n**ID**\`\`\`${targetMember.id}\`\`\`\n**Reason**\`\`\`${discord(reason)}\`\`\``)
        .setThumbnail(targetMember.user.avatarURL() ?? targetMember.user.defaultAvatarURL)
        .setTimestamp()
        .setFooter({ text: config.footer });

    await targetMember.kick(reason);

    await interaction.followUp({ embeds: [sEmbed] });
    await logChannel.send({ embeds: [xEmbed] });
};

export {
    cmd,
    run
};
