import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

/**
 * Rules text, in markdown.
 */
const rulesText = `
## Suroi Rules
### Server Rules
- **Be nice.** Remember, there are humans at the other end of the screen. Racism, sexism, homophobia, anti-LGBTQ, and the like are not tolerated in this server. Swearing is allowed, __except for slurs__ (e.g. the N-word).
- **This server is English only.** It's OK to say a few words in another language, but conversations in other languages are not allowed.
- **Keep it PG.** NSFW or overly explicit content, content containing sexual intent, suggestive/sexual poses, and / or scantily dressed people are prohibited.
- **No politics!** Discussion of controversial topics like politics, gender, and religion is forbidden.
- **No advertising.** Advertising is allowed only in <#1086269974647144490>. If you want permission to advertise, ask a moderator.
- **Don't be annoying.** The mods reserve the right to warn, time out, kick, or ban you for any reason, within reason. They have the final say in how the rules are interpreted.
- **Play by the rules.**  You're not a lawyer, don't try to exploit or debate loopholes in these rules. Using alt accounts to evade punishment will result in a permanent ban of all your accounts.
- **Respect fair play!** If you are found to be using hacks, cheats, etc., in Suroi, or join any server related to them, you will be banned immediately without warning.
- **No spamming.** Flooding chat with walls of text is not allowed. Message chains are permitted, as long as they're not disruptive.
### Game Rules
- **Play fairly.** Game modifications or external software that allows you to gain an advantage over opponents is strictly forbidden.
- **No teaming.** Allying with other players not on your team, is not allowed.
- **No inappropriate usernames.** Usernames containing slurs and other hateful language are prohibited.
- **No VPNs / proxies.** If you need an exemption, contact us through [email](mailto:support@suroi.io) or Discord.
`;

class Rules extends Command {
    cmd = new SlashCommandBuilder()
        .setName("rules")
        .setDescription("View server rules.");

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const sEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setDescription(rulesText)
            .setThumbnail(interaction.guild?.iconURL() ?? null)
            .setImage("https://i.kym-cdn.com/entries/icons/original/000/033/153/therules.jpg")
            .setTimestamp()
            .setFooter({ text: `ID: ${interaction.user.id}` });

        const sRow = new ActionRowBuilder<ButtonBuilder>();

        if (interaction.guild?.rulesChannelId != null) sRow.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Server Rules").setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.guild.rulesChannelId}`));
        sRow.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Game Rules").setURL(`https://${this.client.config.customData.domain}/rules/`));

        await interaction.reply({ embeds: [sEmbed], components: [sRow] });
    };
}

export default Rules;
