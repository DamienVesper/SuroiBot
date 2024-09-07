import {
    InteractionContextType,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type GuildMember
} from 'discord.js';
import { LeaderboardBuilder } from 'canvacord';

import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

import { Command } from '../../classes/Command.js';

import { getTotalXP } from '../../utils/utils.js';
import type { Unpacked } from '../../utils/types.js';

class Leaderboard extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`leaderboard`)
        .setDescription(`View the server leaderboard.`)
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null) return;
        await interaction.deferReply();

        const users = await this.client.db.user.findMany({
            take: 10,
            where: { guildId: interaction.guild.id },
            orderBy: [
                { level: `desc` },
                { xp: `desc` },
                { discordId: `asc` }
            ]
        });

        if (users.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `There are no users in the leaderboard!`)] });
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
                image: interaction.guild.iconURL() ?? `https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico`,
                subtitle: `${interaction.guild.memberCount} members`
            })
            .setPlayers(members.map(({ user, member }, i) => ({
                avatar: member.displayAvatarURL({ extension: `png` }) ?? member.user.defaultAvatarURL,
                username: member.user.username,
                displayName: member.displayName,
                level: user.level,
                xp: getTotalXP(user.level, user.xp),
                rank: i + 1
            })))
            .setBackground(await readFile(resolve(fileURLToPath(import.meta.url), `../../../../assets/img/background.jpg`)))
            .setVariant(`horizontal`);

        await interaction.followUp({ files: [await lb.build({ format: `png` })] });
    };
}

export default Leaderboard;
