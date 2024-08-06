import { Collection, Events, PermissionsBitField, type ClientEvents } from 'discord.js';

import { Event } from '../classes/Event.js';

import { numToCooldownFormat } from '../utils/utils.js';

class InteractionCreate extends Event {
    config = {
        name: Events.InteractionCreate,
        once: false
    };

    run: (...args: ClientEvents[Events.InteractionCreate]) => Promise<void> = async interaction => {
        if (interaction.isChatInputCommand()) {
            const command = this.client.commands.get(interaction.commandName);
            if (command === undefined) {
                await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `This command is outdated.`)], ephemeral: true });
                return;
            }

            // There isn't any permissions handling outside of guilds, so we can safely ignore all other interaction sources.
            if (command.cmd.dm_permission === false && interaction.guild !== null) {
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

                // Check cooldowns.
                if (command.config.cooldown !== 0) {
                    let cooldowns = this.client.cooldowns.get(interaction.user.id);
                    if (cooldowns === undefined) {
                        this.client.cooldowns.set(interaction.user.id, new Collection());
                        cooldowns = this.client.cooldowns.get(interaction.user.id)!;
                    }

                    const cmdCooldown = cooldowns.get(command.cmd.name);
                    if (cmdCooldown === undefined || (new Date().valueOf() - cmdCooldown > command.config.cooldown)) cooldowns.set(command.cmd.name, new Date().valueOf());
                    else {
                        await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must wait another \`${numToCooldownFormat(command.config.cooldown - (new Date().valueOf() - cmdCooldown))}\` before using that command.`)], ephemeral: true });
                        return;
                    }
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
        }
    };
}

export default InteractionCreate;
