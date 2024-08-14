import { Events, type ClientEvents, type TextBasedChannel } from 'discord.js';

import { Event } from '../classes/Event.js';

class VoiceStateUpdate extends Event {
    config = {
        name: Events.VoiceStateUpdate,
        once: false
    };

    run: (...args: ClientEvents[Events.VoiceStateUpdate]) => Promise<void> = async (oldState, newState) => {
        const oldChannel = oldState.channel;
        if (oldChannel !== null) {
            const player = this.client.lavalink.get(oldState.guild.id);
            if (player?.voiceChannel === oldChannel.id && oldChannel.members.size === 1) {
                const channel = await this.client.channels.fetch(player.textChannel!) as TextBasedChannel | null;
                this.client.logger.info(`Gateway`, `Left voice channel "${oldChannel.name}" (${oldChannel.id}).`);

                await channel?.send({ embeds: [this.client.createEmbed(player.guild, `Leaving channel as no listeners in VC.`).setColor(this.client.config.colors.blue)] });
                player.destroy();
            }
        }
    };
}

export default VoiceStateUpdate;
