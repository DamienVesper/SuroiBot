import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";

import { Event } from "../classes/Event.js";

import { cleanse } from "../utils/utils.js";

const EventType = Events.GuildMemberRemove;

class GuildMemberRemove extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async member => {
            if (!this.client.config.modules.logging.enabled) return;

            const log = (await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberKick,
                limit: 1
            })).entries.first() ?? (await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1
            })).entries.first();

            const logEmbed = new EmbedBuilder()
                .setThumbnail(member.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID: ${member.id}` });

            if (!log?.executorId
                || log.executorId === client.user.id
                || Date.now() - log.createdTimestamp > 5e3
            ) {
                logEmbed.setDescription([
                    `<@${member.id}> left the server.`,
                    `There are now **${member.guild.memberCount}** members.`
                ].join("\n"));
            } else {
                const executor = await client.users.fetch(log.executorId);
                if (!executor) return;

                const desc = [
                    `**<@${log.targetId}> was ${log.action === AuditLogEvent.MemberBanAdd ? "banned" : "kicked"} from the server.**`,
                    "",
                    "### Responsible Moderator",
                    `<@${log.executorId}>`,
                    "### ID",
                    `\`\`\`${log.targetId}\`\`\``
                ];

                if (log.reason) {
                    desc.push(...[
                        "### Reason",
                        `\`\`\`${cleanse(log.reason)}\`\`\``
                    ]);
                }

                logEmbed.setDescription(desc.join("\n"));
            }

            const logChannel = await member.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
            if (logChannel?.isSendable()) await logChannel.send({ embeds: [logEmbed] });
        };
    }
}

export default GuildMemberRemove;
