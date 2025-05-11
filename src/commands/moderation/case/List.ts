import {
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";
import { and, eq } from "drizzle-orm";

import { Subcommand } from "../../../classes/Subcommand.js";

import { Paginator } from "../../../modules/Paginator.js";

import { Case } from "../../../models/Case.js";

import { capitalize, cleanse, numToCooldownFormat } from "../../../utils/utils.js";

class List extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("View a user's cases.")
        .addUserOption(option => option.setName("user").setDescription("The user to view cases of."));

    config = {
        parent: "case",
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;

        const user = interaction.options.getUser("user") ?? interaction.user;
        await interaction.deferReply();

        const cases = await this.client.db.select().from(Case).where(and(
            eq(Case.guildId, interaction.guildId),
            eq(Case.discordId, user.id)
        ));

        if (cases.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `${user.id === interaction.user.id ? "You have" : "That user has"} no cases.`)] });
            return;
        }

        const embeds: EmbedBuilder[] = [];

        for (let i = 0; i < cases.length; i += 5) {
            const caseArr = cases.slice(i, Math.min(i + 5, cases.length - 1)).map(x => {
                /**
                 * This is really messy. Needs to be improved.
                 */
                const desc = [
                    `### ${capitalize(x.action)} | Case #${x.id}`,
                    `> Active: ${x.action ? this.client.config.emojis.checkmark : this.client.config.emojis.xmark}`,
                    `> Date: <t:${Math.floor(x.createdAt.getTime() / 1e3)}:f>`,
                    `> Moderator: <@${x.issuerId}>`,
                    `> Reason: \`${cleanse(x.reason)}\``
                ];

                if (x.expiresAt) desc.splice(2, 0, `> Duration: ${numToCooldownFormat(x.expiresAt.valueOf() - x.createdAt.valueOf())}`);
                return desc;
            }).join("\n");

            const sEmbed = new EmbedBuilder()
                .setColor(this.client.config.colors.pink)
                .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() ?? user.defaultAvatarURL })
                .setDescription([
                    "# User Cases"
                ].concat(caseArr).join("\n"))
                .setTimestamp()
                .setFooter({ text: `ID: ${user.id}` });
            embeds.push(sEmbed);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const paginator = new Paginator(this.client, interaction, interaction.user, embeds);
    };
}

export default List;
