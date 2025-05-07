import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { Command } from "../../classes/Command.js";

class Speed extends Command {
    cmd = new SlashCommandBuilder()
        .setName("speed")
        .addNumberOption(option => option.setName("value").setDescription("The speed to set the audio to, as a multipler. Leave blank for default.").setMinValue(0.01).setMaxValue(10))
        .setDescription("Set the speed of the player.")
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({ content: "This command can only be used in a guild!", ephemeral: true });
            return;
        }

        if (interaction.member.voice.channel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in a voice channel to use that command!")], ephemeral: true });
            return;
        }

        const speed = interaction.options.getNumber("value");
        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        await player.filters.setTimescale({ speed: speed ?? 1 });
        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, speed !== null ? `Set the player speed to **${speed * 100}%**.` : "Reset the player speed.")] });
    };
}

export default Speed;
