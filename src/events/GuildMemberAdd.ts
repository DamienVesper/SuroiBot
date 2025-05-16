import { EmbedBuilder, Events } from "discord.js";

import { Event } from "../classes/Event.js";
import { timestamp } from "../utils/utils.js";

const EventType = Events.GuildMemberAdd;

class GuildMemberAdd extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async member => {
            if (!this.client.config.modules.logging.enabled) return;

            const logEmbed = new EmbedBuilder()
                .setDescription([
                    `<@${member.id}> joined the server.`,
                    `There are now **${member.guild.memberCount}** members.`,
                    "",
                    `Account Created: ${timestamp(member.user.createdAt)}`
                ].join("\n"))
                .setThumbnail(member.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID: ${member.id}` });

            const logChannel = await member.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
            if (logChannel?.isSendable()) await logChannel.send({ embeds: [logEmbed] });
        };
    }
}

export default GuildMemberAdd;
