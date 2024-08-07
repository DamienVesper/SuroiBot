import {
    EmbedBuilder,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';

import { Command } from '../../classes/Command.js';

import { Paginator } from '../../modules/Paginator.js';

import { capitalize, createUsageExample } from '../../utils/utils.js';

class Help extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`help`)
        .setDescription(`View the help menu.`);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();

        const commandsByCategory: Record<string, Command[]> = {};
        for (const [, command] of [...this.client.commands]) {
            if (commandsByCategory[command.category!] === undefined) commandsByCategory[command.category!] = [];
            commandsByCategory[command.category!].push(command);
        }

        const embeds = [
            new EmbedBuilder()
                .setColor(this.client.config.colors.purple)
                .setTitle(`Help`)
                .setDescription(`View help for a specific command. Available categories are:\n${Object.keys(commandsByCategory).map(key => `- **${capitalize(key)}**`).join(`\n`)}`)
                .setTimestamp()
                .setFooter({ text: `ID: ${interaction.user.id}` })
        ];

        for (const [category, commands] of Object.entries(commandsByCategory)) {
            embeds.push(new EmbedBuilder()
                .setColor(this.client.config.colors.purple)
                .setTitle(`Help | ${capitalize(category)}`)
                .setDescription(commands.map(command => `\`${createUsageExample(command.cmd)}\` - ${command.cmd.description}`).join(`\n`))
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const paginator = new Paginator(this.client, interaction, interaction.user, embeds);
    };
}

export default Help;
