import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";

import { Event } from "../classes/Event.js";

import { cleanse } from "../utils/utils.js";

const EventType = Events.GuildBanRemove;

class GuildBanRemove extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async ban => {
            if (!this.client.config.modules.logging.enabled) return;

            const log = (await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanRemove,
                limit: 1
            })).entries.first();

            if (!log?.executorId
                || log.executorId === client.user.id
                || Date.now() - log.createdTimestamp > 5e3
            ) return;

            const executor = await client.users.fetch(log.executorId);
            if (!executor) return;

            const desc = [
                `**<@${ban.user.id}> was unbanned from the server.**`,
                "",
                "### Responsible Moderator",
                `<@${log.executorId}>`,
                "### ID",
                `\`\`\`${ban.user.id}\`\`\``
            ];

            if (log.reason) {
                desc.push(...[
                    "### Reason",
                    `\`\`\`${cleanse(log.reason)}\`\`\``
                ]);
            }

            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: executor.username, iconURL: executor.displayAvatarURL() })
                .setDescription(desc.join("\n"))
                .setTimestamp()
                .setFooter({ text: `ID: ${ban.user.id}` });

            const logChannel = await ban.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
            if (logChannel?.isSendable()) await logChannel.send({ embeds: [logEmbed] });
        };
    }
}

export default GuildBanRemove;
