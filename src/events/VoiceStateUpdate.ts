import { Events } from "discord.js";

import { Event } from "../classes/Event.js";

const EventType = Events.VoiceStateUpdate;

class VoiceStateUpdate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async (oldState, newState) => {
            const oldChannel = oldState.channel;
            if (oldChannel !== null) {
                const player = this.client.lavalink.get(oldState.guild.id);
                if (player?.textChannelId && player?.voiceChannelId === oldChannel.id && oldChannel.members.size === 1) {
                    const channel = await this.client.channels.fetch(player.textChannelId);
                    if (channel?.isSendable()) {
                        this.client.logger.debug("Gateway", `Left voice channel "${oldChannel.name}" (${oldChannel.id}).`);

                        await channel.send({ embeds: [this.client.createEmbed(player.guildId, "Leaving channel as there are no listeners.").setColor(this.client.config.colors.blue)] });
                        await player.destroy();
                    }
                }
            }
        };
    }
}

export default VoiceStateUpdate;
