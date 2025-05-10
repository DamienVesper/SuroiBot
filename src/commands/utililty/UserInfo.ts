import {
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type GuildMember
} from "discord.js";

import { Command } from "../../classes/Command.js";

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
                    `${this.client.config.emojis.__.repeat(2)} ID: \`${member.user.id}\``,
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

        if (!member.user.bot) {
            fields.splice(1, 0, {
                name: "Moderation",
                value: [
                    "⚠️ **Warnings:** `0`",
                    "🔨 **Mutes:** `0`",
                    "⚒️ **Kicks:** `0`",
                    "⚔️ **Bans:** `0`"
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
