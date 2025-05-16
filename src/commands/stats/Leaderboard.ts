import {
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type GuildMember
} from "discord.js";

import { Command } from "../../classes/Command.js";

import { getLBUsers, LBUser } from "../../utils/db.js";
import { cleanse } from "../../utils/utils.js";

class Leaderboard extends Command {
    cmd = new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the server leaderboard.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: "This command can only be used in a guild!", flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        let lbUsers: LBUser[] = [];

        if (this.client.redis && this.client.config.modules.caching.enabled) {
            const users = await this.client.redis.get(`${this.client.config.modules.caching.prefix}/${interaction.guildId}/lb`);
            if (users === null) {
                await interaction.followUp({ content: "The leaderboard is currently updating. Please try again later.", flags: MessageFlags.Ephemeral });
                return;
            }

            lbUsers = JSON.parse(users) as LBUser[];
        } else lbUsers = await getLBUsers(this.client, interaction.guildId);

        if (lbUsers.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There are no users in the leaderboard!")] });
            return;
        }

        const members: Array<{ user: LBUser, member: GuildMember }> = [];
        for (let i = 0; i < 10; i++) {
            const member = await interaction.guild.members.fetch(lbUsers[i].discordId);
            if (member === null) continue;

            members.push({ user: lbUsers[i], member });
        }

        const lbTxt = [];
        for (let i = 0; i < 10; i++)
            lbTxt.push(`${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"} **${cleanse(members[i].member.nickname ?? members[i].member.displayName)}** - Level ${members[i].user.level}\n`);

        const userPos = lbUsers.findIndex(x => x.discordId === interaction.user.id);
        if (userPos > 9) {
            /**
             * Maybe a way to simplify this from 2O(n) to O(n) [when adding the previous findIndex() cost].
             */
            const user = lbUsers.find(x => x.discordId === interaction.user.id);
            if (user) {
                lbTxt.push(
                    "---",
                    `#${userPos} - **${cleanse(interaction.member.nickname ?? interaction.user.displayName)}** - Level ${user.level}`
                );
            }
        }

        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.blue)
            .setAuthor({ name: `${interaction.guild.name} Leaderboard`, iconURL: interaction.guild.iconURL() ?? undefined })
            .setDescription(lbTxt.join("\n"))
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        await interaction.followUp({ embeds: [sEmbed] });
    };
}

export default Leaderboard;
