import { ChatInputCommandInteraction, Collection, Events, MessageFlags, PermissionFlagsBits } from "discord.js";

import { Event } from "../classes/Event.js";

import { numToCooldownFormat } from "../utils/utils.js";
import { Command } from "../classes/Command.js";

const EventType = Events.InteractionCreate;

class InteractionCreate extends Event<typeof EventType> {
    constructor (client: Event<typeof EventType>["client"]) {
        super(client);

        this.config = {
            name: EventType,
            once: false
        };

        this.run = async interaction => {
            if (interaction.isChatInputCommand()) {
                /**
                 * Check if the bot, if in a guild, has the minimum permissions to send messages.
                 * If it is in a guild and does not have the required permissions, abort the interaction.
                 */
                if (interaction.inGuild() && !interaction.channel?.permissionsFor(interaction.guild!.members.me!).has([
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages
                ])) return;

                /**
                 * After a recent deployment, it takes time to update the cached command.
                 * If the command they invoke is not one we have, it must be from the old set of deployed commands.
                 * So we gracefully handle it and let them know the reason their command is not working.
                 * Typically, Discord clients will update cached commands after invoking the outdated command once.
                 */
                const command = this.client.commands.get(interaction.commandName);
                if (command === undefined) {
                    await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "This command is outdated. Please try again.")], flags: MessageFlags.Ephemeral });
                    return;
                }

                /**
                 * Here, we split the preliminary command usability checking into two parts: dev permissions and command category.
                 * We do Discord permission handling further down the line.
                 *
                 * If we have so specified in the config file, we only want devs to be able to run commands.
                 * Otherwise, use the default permissions from Discord (aka do nothing in this condition block).
                 */
                if (this.client.config.dev.overridePermissions && !this.client.config.dev.users.includes(interaction.user.id)) {
                    await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "The bot is currently in developer mode.")] });
                    return;
                }

                /**
                 * If command is being invoked from outside of a guild, run it without checking for permissions, as there is no concept of permissions outside of a guild.
                 */
                if (!interaction.inGuild()) {
                    await runCommand(this.client, interaction, command);
                    return;
                }

                /**
                 * If command is being invoked from a guild while development mode is enabled,
                 * handle the special case where permissions are taken from the config file.
                 */
                if (this.client.config.dev.overridePermissions && interaction.guildId !== this.client.config.dev.guildID) {
                    await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "That command cannot be used here!")] });
                    return;
                }

                /**
                 * Check if the user has permissions (in Discord).
                 * This will probably fail miserably.
                 */
                const missingUserPerms = interaction.memberPermissions.missing(command.config.userPermissions) ?? [];
                if (missingUserPerms.length !== 0) {
                    await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You are missing the ${missingUserPerms.length === 1 ? "permission" : "permissions"} ${missingUserPerms.map(x => `\`${x}\``).join(", ")} to use this command.`)], flags: MessageFlags.Ephemeral });
                    return;
                }

                /**
                 * Check if the bot has permissions (in Discord).
                 * This will also probably fail miserably.
                 */
                const missingBotPerms = interaction.guild?.members.me?.permissions.missing(command.config.botPermissions) ?? [];
                if (missingBotPerms.length !== 0) {
                    await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `I am missing the ${missingBotPerms.length === 1 ? "permission" : "permissions"} ${missingBotPerms.map(x => `\`${x}\``).join(", ")} to execute this command.`)], flags: MessageFlags.Ephemeral });
                    return;
                }

                /**
                 * Check cooldowns.
                 * Technically, this only works in a bot with a single active guild (as cooldowns are shared globally), but that's not a problem in our scenario.
                 */
                if (command.config.cooldown !== 0) {
                    let cooldowns = this.client.cooldowns.get(interaction.user.id);
                    if (cooldowns === undefined) {
                        this.client.cooldowns.set(interaction.user.id, new Collection());
                        cooldowns = this.client.cooldowns.get(interaction.user.id)!;
                    }

                    const cmdCooldown = cooldowns.get(command.cmd.name);
                    if (cmdCooldown === undefined || (Date.now() - cmdCooldown > command.config.cooldown)) cooldowns.set(command.cmd.name, Date.now());
                    else {
                        await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must wait another \`${numToCooldownFormat(command.config.cooldown - (Date.now() - cmdCooldown))}\` before using that command.`)], flags: MessageFlags.Ephemeral });
                        return;
                    }
                }

                await runCommand(client, interaction, command);
            } else if (interaction.isButton()) {
                const button = this.client.buttons.get(interaction.customId);
                if (button === undefined) return;
            } else if (interaction.isModalSubmit()) {
                const modal = this.client.modals.get(interaction.customId);
                if (modal === undefined) return;
            }

            // TODO: Implement context menus.
            // else if (interaction.isUserContextMenuCommand()) {}
        };
    }
}

/**
 * Helper function to run commands given the proper inputs.
 * @param client The bot who owns the command.
 * @param interaction The interaction that invokes the command.
 * @param command The actual command being invoked.
 */
const runCommand = async (client: InteractionCreate["client"], interaction: ChatInputCommandInteraction, command: Command): Promise<void> => {
    try {
        client.logger.debug("Gateway", interaction.guild !== null
            ? `"${interaction.user.tag}" (${interaction.user.id}) ran command ${interaction.commandName} in "${interaction.guild.name}" (${interaction.guild.id}).`
            : `"${interaction.user.tag}" (${interaction.user.id}) ran command ${interaction.commandName} in a DM.`);
        await command.run(interaction);
    } catch (err: any) {
        client.logger.error("Gateway", err.stack ?? err.message);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        interaction.replied || interaction.deferred
            ? await interaction.followUp({ embeds: [client.createDenyEmbed(interaction.user, "There was an error executing this command.")], flags: interaction.ephemeral ? MessageFlags.Ephemeral : undefined })
            : await interaction.reply({ embeds: [client.createDenyEmbed(interaction.user, "There was an error executing this command.")], flags: MessageFlags.Ephemeral });
    }
};

export default InteractionCreate;
