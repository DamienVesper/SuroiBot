import { EmbedBuilder, Events } from "discord.js";

import { Event } from "../classes/Event.js";

const EventType = Events.MessageUpdate;

class MessageUpdate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async (oldMsg, newMsg) => {
            if (!this.client.config.modules.logging.enabled) return;

            if (oldMsg.partial) oldMsg = await oldMsg.fetch(true);
            if (newMsg.partial) newMsg = await newMsg.fetch(true);

            if (oldMsg.author.bot || !oldMsg.inGuild() || oldMsg.content === newMsg.content) return;

            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: oldMsg.author.tag, iconURL: oldMsg.author.displayAvatarURL() })
                .setDescription([
                    `**Message sent by <@${oldMsg.author.id}> edited in <#${oldMsg.channel.id}>.**`,
                    `[Jump to Message](${newMsg.url})`,
                    "",
                    "### Old",
                    `\`\`\`${oldMsg.content}\`\`\``,
                    "### New",
                    `\`\`\`${newMsg.content}\`\`\``
                ].join("\n"))
                .setTimestamp()
                .setFooter({ text: `ID: ${oldMsg.author.id}` });

            const logChannel = await oldMsg.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
            if (logChannel?.isSendable()) await logChannel.send({ embeds: [logEmbed] });
        };
    }
}

export default MessageUpdate;
