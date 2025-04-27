// import type { DiscordBot } from '../modules/DiscordBot';

// export const refreshLeaderboards = async (client: DiscordBot): Promise<void> => {
//     const users = await client.db.user.findMany({
//         take: 10,
//         where: { guildId: interaction.guild.id },
//         orderBy: [
//             { level: `desc` },
//             { xp: `desc` },
//             { discordId: `asc` }
//         ]
//     });
// };
