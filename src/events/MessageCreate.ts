import { Events, type ClientEvents } from 'discord.js';

import { Event } from '../classes/Event.js';

class MessageCreate extends Event {
    config = {
        name: Events.MessageCreate,
        once: false
    };

    run: (...args: ClientEvents[Events.MessageCreate]) => Promise<void> = async message => {
        if (message.author.bot || message.guild === null) return;

        if (this.client.config.modules.leveling.enabled) {
            const dbUser = await this.client.db.user.findUnique({ where: { discordId: message.author.id } });
            if (dbUser === null) {
                this.client.logger.info(`Database`, `Created account for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                await this.client.db.user.create({
                    data: {
                        discordId: message.author.id,
                        guildId: message.guild.id,
                        level: this.client.config.modules.leveling.level.min
                    }
                });
            } else {
                // if (dbUser.cooldowns)
            }
        }
    };
}

export default MessageCreate;
