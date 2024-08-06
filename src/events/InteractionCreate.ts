import { Events, type ClientEvents } from 'discord.js';
import { Event } from '../classes/Event.js';

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

            try {
                if (interaction.guild !== null) this.client.logger.debug(`System`, `"${interaction.user.tag}" (${interaction.user.id}) ran command ${interaction.commandName} in "${interaction.guild.name}" (${interaction.guild.id}).`);
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
