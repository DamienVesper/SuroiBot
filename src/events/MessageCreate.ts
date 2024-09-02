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

            let dbUser = await this.client.db.user.findUnique({
                where: {
                    discordId: message.author.id,
                    guildId: message.guild.id
                },
                include: {
                    cooldowns: true
                }
            });

            let guild = await this.client.db.guild.findUnique({ where: { discordId: message.guild.id } });

            if (guild === null) {
                this.client.logger.info(`Database`, `Created entry for guild "${message.guild.name}" (${message.guild.id}).`);
                guild = await this.client.db.guild.create({
                    data: {
                        discordId: message.guild.id
                    }
                });
            }

            if (dbUser === null) {
                this.client.logger.info(`Database`, `Created account for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                await this.client.db.user.create({
                    data: {
                        discordId: message.author.id,
                        guildId: message.guild.id,
                        level: this.client.config.modules.leveling.enabled ? this.client.config.modules.leveling.level.min : 0,
                        cooldowns: {
                            create: {
                                daily: new Date(0),
                                xp: new Date(0)
                            }
                        }
                    }
                });

                dbUser = await this.client.db.user.findUnique({
                    where: {
                        discordId: message.author.id,
                        guildId: message.guild.id
                    },
                    include: {
                        cooldowns: true
                    }
                });
            }

            if (this.client.config.modules.leveling.enabled) {
                if (guild === null || dbUser === null) {
                    this.client.logger.error(`Database`, `Guild or User were found null for "${message.author.tag}" (${message.author.id}) in "${message.guild.name}" (${message.guild.id}).`);
                    return;
                }

                console.log(dbUser.cooldowns);
                if ((new Date().valueOf() - (dbUser.cooldowns.xp ?? new Date(0)).valueOf()) < this.client.config.modules.leveling.xpCooldown) {
                    dbUser.xp += Math.floor(Math.random() * this.client.config.modules.leveling.xp.max + this.client.config.modules.leveling.xp.min);
                    dbUser.cooldowns.xp = new Date();
                }
            }
        };
    };
}

export default MessageCreate;
