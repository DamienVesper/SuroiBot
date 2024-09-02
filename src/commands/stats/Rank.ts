import {
    InteractionContextType,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';
import { Font, RankCardBuilder } from 'canvacord';

import { Command } from '../../classes/Command.js';
import { getMaxXP } from '../../utils/utils.js';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

class Rank extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`rank`)
        .addUserOption(option => option.setName(`user`).setDescription(`The user to check.`))
        .setDescription(`View a person's server rank.`)
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null) return;
        await interaction.deferReply();

        const dbUser = await this.client.db.user.findUnique({
            where: {
                discordId: interaction.user.id,
                guildId: interaction.guild.id
            }
        });

        if (dbUser === null) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `No account exists for that user!`)] });
            return;
        };

        const member = await interaction.guild.members.fetch(dbUser.discordId);
        if (member === null) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `That user could not be found!`)] });
            return;
        }

        const role = member.roles.highest.color === 0x000000
            ? member.roles.hoist?.color == 0x000000
                ? member.roles.cache.filter(role => role.color !== 0x000000).first() ?? member.roles.highest
                : member.roles.hoist ?? member.roles.highest
            : member.roles.highest;
        const roleIsDefaultColor = role.color === 0x000000;

        await Font.fromFile(resolve(fileURLToPath(import.meta.url), `../../../../assets/fonts/Inter-Regular.ttf`), `Inter`);

        const card = new RankCardBuilder()
            .setDisplayName(member.user.displayName)
            .setAvatar(member.user.displayAvatarURL({ extension: `png` }))
            .setLevel(dbUser.level)
            .setRank(0)
            .setCurrentXP(dbUser.xp)
            .setRequiredXP(getMaxXP(dbUser.level))
            .setStyles({
                progressbar: {
                    thumb: {
                        style: {
                            backgroundColor: `#${roleIsDefaultColor ? `000000` : role.color.toString(16)}`
                        }
                    }
                }

            });

        const asset = await card.build({ format: `png` });
        await interaction.followUp({ files: [asset] });
    };
}

export default Rank;
