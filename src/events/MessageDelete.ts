import { EmbedBuilder, Events } from "discord.js";

import { Event } from "../classes/Event.js";

import { cleanse } from "../utils/utils.js";

const EventType = Events.MessageDelete;

class MessageDelete extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async message => {
            if (!this.client.config.modules.logging.enabled) return;

            if (message.partial) message = await message.fetch(true);
            if (!message.inGuild()) return;

            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription([
                    `**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>.**`,
                    `[Jump to Message](${message.url})`,
                    "",
                    "### Content",
                    `\`\`\`${cleanse(message.content)}\`\`\``
                ].join("\n"))
                .setTimestamp()
                .setFooter({ text: `ID: ${message.author.id}` });

            const logChannel = await message.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
            if (logChannel?.isSendable()) await logChannel.send({ embeds: [logEmbed], files: message.attachments.map(x => x) });
        };
    }
}

export default MessageDelete;
