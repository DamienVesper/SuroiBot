import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { Command } from "../../classes/Command.js";

class Volume extends Command {
    cmd = new SlashCommandBuilder()
        .setName("volume")
        .addIntegerOption(option => option.setName("value").setDescription("The value to set the volume to (%).").setMinValue(1).setMaxValue(200).setRequired(true))
        .setDescription("Set the volume of the player.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: "This command can only be used in a guild!", flags: MessageFlags.Ephemeral });
            return;
        }

        if (interaction.member.voice.channel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in a voice channel to use that command!")], flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        const volume = interaction.options.getInteger("value", true);
        await player.setVolume(volume);

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Set the player volume to **${volume}%**!`)] });
    };
}

export default Volume;
