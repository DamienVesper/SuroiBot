import { Collection, Events, InteractionContextType, PermissionsBitField } from 'discord.js';

import { Event } from '../classes/Event.js';

import { numToCooldownFormat } from '../utils/utils.js';

const EventType = Events.InteractionCreate;

class InteractionCreate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>[`client`]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async interaction => {
            if (interaction.isChatInputCommand()) {
                const command = this.client.commands.get(interaction.commandName);
                if (command === undefined) {
                    await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `This command is outdated.`)], ephemeral: true });
                    return;
                }

                // There isn't any permissions handling outside of guilds, so we can safely ignore all other interaction sources.

                if (!command.cmd.contexts?.includes(InteractionContextType.BotDM) && interaction.guild !== null) {
                    if (!(this.client.config.dev.overridePermissions && interaction.user.id === this.client.config.dev.userID)) {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        const bot = await interaction.guild.members.fetch(this.client.user.id);

                        // Handle any weird API errors.
                        if (member === undefined || bot === undefined) {
                            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `There was an error running that command.`)] });
                            throw new Error(`The GuildMember of either the interaction user or client was not defined.`);
                        }

                        // Check if the user has permissions.
                        const userPermissions = Object.entries(new PermissionsBitField(command.config.userPermissions).serialize()).filter(x => x[1]).map(x => x[0]);
                        const missingUserPerms: string[] = [];

                        for (const [perm, value] of Object.entries(member.permissions.serialize()))
                            if (userPermissions.includes(perm) && !value) missingUserPerms.push(perm);

                        if (missingUserPerms.length !== 0) {
                            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You are missing the ${missingUserPerms.length === 1 ? `permission` : `permissions`} ${missingUserPerms.map(x => `\`${x}\``).join(`, `)} to use this command.`)], ephemeral: true });
                            return;
                        }

                        // Check if the bot has permissions. This is usually a less common issue, so it's checked afterwards for efficiency.
                        const botPermissions = Object.entries(new PermissionsBitField(command.config.botPermissions).serialize()).filter(x => x[1]).map(x => x[0]);
                        const missingBotPerms: string[] = [];

                        for (const [perm, value] of Object.entries(bot.permissions.serialize()))
                            if (botPermissions.includes(perm) && !value) missingBotPerms.push(perm);

                        if (missingBotPerms.length !== 0) {
                            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `I am missing the ${missingBotPerms.length === 1 ? `permission` : `permissions`} ${missingBotPerms.map(x => `\`${x}\``).join(`, `)} to execute this command.`)], ephemeral: true });
                            return;
                        }
                    }
                }

                // Check cooldowns.
                if (command.config.cooldown !== 0) {
                    let cooldowns = this.client.cooldowns.get(interaction.user.id);
                    if (cooldowns === undefined) {
                        this.client.cooldowns.set(interaction.user.id, new Collection());
                        cooldowns = this.client.cooldowns.get(interaction.user.id)!;
                    }

                    const cmdCooldown = cooldowns.get(command.cmd.name);
                    if (cmdCooldown === undefined || (Date.now() - cmdCooldown > command.config.cooldown)) cooldowns.set(command.cmd.name, Date.now());
                    else {
                        await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must wait another \`${numToCooldownFormat(command.config.cooldown - (Date.now() - cmdCooldown))}\` before using that command.`)], ephemeral: true });
                        return;
                    }
                }

                try {
                    if (interaction.guild !== null) this.client.logger.debug(`Gateway`, `"${interaction.user.tag}" (${interaction.user.id}) ran command ${interaction.commandName} in "${interaction.guild.name}" (${interaction.guild.id}).`);
                    await command.run(interaction);
                } catch (err: any) {
                    this.client.logger.error(`Gateway`, err.stack ?? err.message);
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    interaction.replied || interaction.deferred
                        ? await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `There was an error executing this command.`)], ephemeral: interaction.ephemeral ?? true })
                        : await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `There was an error executing this command.`)], ephemeral: true });
                }
            } else if (interaction.isButton()) {
                const button = this.client.buttons.get(interaction.customId);
                if (button === undefined) return;
            } else if (interaction.isModalSubmit()) {
                const modal = this.client.modals.get(interaction.customId);
                if (modal === undefined) return;
            } // else if (interaction.isUserContextMenuCommand()) {}
        };
    }
}

export default InteractionCreate;
