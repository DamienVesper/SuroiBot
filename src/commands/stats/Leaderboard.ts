import {
    InteractionContextType,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type GuildMember
} from "discord.js";
import { LeaderboardBuilder } from "canvacord";
import { asc, desc } from "drizzle-orm";

import { resolve } from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

import { Command } from "../../classes/Command.js";
import { User } from "../../models/User.js";
import { getTotalXP } from "../../utils/utils.js";
import type { Unpacked } from "../../utils/types.js";

class Leaderboard extends Command {
    cmd = new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the server leaderboard.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: "This command can only be used in a guild!", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const users = await this.client.db.select().from(User).orderBy(desc(User.level), desc(User.xp), asc(User.discordId)).limit(10);
        if (users.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There are no users in the leaderboard!")] });
            return;
        }

        const members: Array<{ user: Unpacked<typeof users>, member: GuildMember }> = [];
        for (const user of users) {
            const member = await interaction.guild.members.fetch(user.discordId);
            if (member === null) continue;

            members.push({ user, member });
        }

        const lb = new LeaderboardBuilder()
            .setHeader({
                title: interaction.guild.name,
                image: interaction.guild.iconURL()?.endsWith(".gif")
                    ? ""
                    : interaction.guild.iconURL({ forceStatic: true }) ?? "",
                subtitle: `${interaction.guild.memberCount} members`
            })
            .setPlayers(members.map(({ user, member }, i) => ({
                avatar: member.displayAvatarURL({ extension: "png" }) ?? member.user.defaultAvatarURL,
                username: member.user.username,
                displayName: member.displayName,
                level: user.level,
                xp: getTotalXP(user.level, user.xp),
                rank: i + 1
            })))
            .setBackground(await readFile(resolve(fileURLToPath(import.meta.url), "../../../../assets/img/background.jpg")));

        await interaction.followUp({ files: [await lb.build({ format: "png" })] });
    };
}

export default Leaderboard;
