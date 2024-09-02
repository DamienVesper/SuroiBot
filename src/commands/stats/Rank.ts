import {
    InteractionContextType,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';

import { Command } from '../../classes/Command.js';

class Rank extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`rank`)
        .addUserOption(option => option.setName(`user`).setDescription(`The user to check.`))
        .setDescription(`View a person's server rank.`)
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {};
}

export default Rank;
