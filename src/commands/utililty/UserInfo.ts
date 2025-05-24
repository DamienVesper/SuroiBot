import {
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type GuildMember
} from "discord.js";
import { and, eq } from "drizzle-orm";

import { Command } from "../../classes/Command.js";

import { Case, CaseAction } from "../../models/Case.js";

import { cleanse, timestamp } from "../../utils/utils.js";

class UserInfo extends Command {
    cmd = new SlashCommandBuilder()
        .setName("userinfo")
        .addUserOption(option => option.setName("user").setDescription("The user to view."))
        .setDescription("View user statistics.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: "This command can only be used in a guild!", flags: MessageFlags.Ephemeral });
            return;
        }

        const user = interaction.options.getUser("user");
        await interaction.deferReply();

        const member: GuildMember | null = await interaction.guild.members.fetch(user?.id ?? interaction.user.id);
        if (member === null) {
            await interaction.reply({ content: "The interaction member was not found in the guild.", flags: MessageFlags.Ephemeral });
            return;
        }

        const fields = [
            {
                name: "General",
                value: [
                    `${this.client.config.emojis.arrow} **Name:** \`${cleanse(member.user.displayName)}\``,
                    `${this.client.config.emojis.__.repeat(2)} ID: \`${member.id}\``,
                    `🎂 **Created:** ${timestamp(member.user.createdAt)}`,
                    `📆 **Joined:** ${timestamp(member.joinedAt ?? new Date())}`,
                    `${this.client.config.emojis.bot} **Bot:** ${member.user.bot ? this.client.config.emojis.checkmark : this.client.config.emojis.xmark}`
                    // todo: badges
                    // `${this.client.config.emojis.discord}**Badges:** \`${channels.size}\``,
                ].join("\n")
            },
            {
                name: "Roles",
                value: member.roles.cache.filter(role => role.name !== "@everyone").sort((a, b) => b.position - a.position).map(role => `<@&${role.id}>`).join(" | ")
            }
        ];

        const cases = await this.client.db.select({ action: Case.action }).from(Case).where(and(
            eq(Case.targetId, member.id),
            eq(Case.guildId, interaction.guildId),
            eq(Case.active, true)
        ));

        if (!member.user.bot) {
            fields.splice(1, 0, {
                name: "Moderation",
                value: [
                    `⚠️ **Warnings:** \`${cases.filter(x => x.action === CaseAction.Warn).length}\``,
                    `🔨 **Mutes:** \`${cases.filter(x => x.action === CaseAction.Mute).length}\``,
                    `⚒️ **Kicks:** \`${cases.filter(x => x.action === CaseAction.Kick).length}\``,
                    `⚔️ **Bans:** \`${cases.filter(x => x.action === CaseAction.Ban).length}\``
                ].join("\n")
            });
        }

        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setDescription("### User Information")
            .setFields(fields)
            .setThumbnail(interaction.guild.iconURL() ?? null)
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.followUp({ embeds: [sEmbed] });
    };
}

export default UserInfo;
