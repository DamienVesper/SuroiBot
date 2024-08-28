import { Events } from 'discord.js';

import { Event } from '../classes/Event.js';

const EventType = Events.MessageCreate;

class MessageCreate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>[`client`]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async message => {
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
    };
}

export default MessageCreate;
