import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

class BassBoost extends Command {
    cmd = new SlashCommandBuilder()
        .setName("bassboost")
        .addNumberOption(option => option.setName("value").setDescription("The value to bassboost by. Leave blank for default.").setMinValue(0).setMaxValue(10))
        .setDescription("Boost the player's bass.")
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

        const bassboost = interaction.options.getNumber("value");
        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        if (!this.client.config.modules.music.enabled) throw new Error("Music configuration was not specified or enabled.");

        const mult = this.client.config.modules.music.options.bassIntensityMultiplier;
        await player.filters.setEqualizer((player.filters.equalizer?.filter(v => v.band > 2) ?? []).concat((bassboost ?? 0) === 0
            ? []
            : new Array(3).fill(null).map((_, i) => ({
                band: i,
                gain: (bassboost ?? 0) * mult
            }))));

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, bassboost !== null ? `Set bassboost to **${bassboost}**.` : "Disabled bassboost filter.")] });
    };
}

export default BassBoost;
