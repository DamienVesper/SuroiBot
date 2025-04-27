import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { Command } from "../../classes/Command.js";

class NowPlaying extends Command {
    cmd = new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("View the current song being played.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null) {
            await interaction.reply({ content: "This command can only be used in a guild!", ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in a voice channel to use that command!")], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (player !== undefined && voiceChannel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        // Check for a property in song that is nulled by the other types.
        const song = player.queue.current;
        if (!song?.sourceName) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "No song is currently being played!")] });
            return;
        }

        await interaction.followUp(this.client.createNowPlayingDetails(player));
    };
}

export default NowPlaying;
