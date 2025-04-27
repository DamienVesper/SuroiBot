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
- **Be nice.** Don't be racist, disrespectful of people's situation, etc. Swearing is allowed, except for slurs (e.g. the N-word).
- **This server is English only.** It's OK to say a few words in another language, but conversations in other languages are not allowed.
- **No NSFW content.** Adult and suggestive content is prohibited.
- **No politics!** Discussion of controversial topics like politics, gender, and religion is prohibited, except in the #politics channel. If you'd like access to the #politics channel, ask a moderator.
- **No advertising.** Advertising is allowed only in the advertisements channel. If you want permission to advertise, ask a moderator.
- **Don't be annoying.** The mods reserve the right to time out, kick or ban you for any reason, within reason.
### Game Rules
- **No teaming in solos.** Allying with other solo players for extended periods of time is not allowed.
- **No hacking.** The use of scripts, plugins, extensions, etc. to modify the game in order to gain an advantage over opponents is strictly forbidden. An advantage is anything that reveals information that would not be available to a normal player or anything that automates player actions.
- **No inappropriate usernames.** Our blocklists are very lenient, but some words or phrases are still blocked. Trying to evade filters for these specific words will incur consequences.
- **No presence in cheat related servers.** Attempting to "minimod" or "go undercover" in any cheat related servers is strictly prohibited and will get your discord, as well as your connection banned.
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
