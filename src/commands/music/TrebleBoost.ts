import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

class TrebleBoost extends Command {
    cmd = new SlashCommandBuilder()
        .setName("trebleboost")
        .setDescription("Boost the player's treble.")
        .addNumberOption(option => option.setName("value").setDescription("The value to trebleboost by. Leave blank for default.").setMinValue(0).setMaxValue(10))
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

        const trebleboost = interaction.options.getNumber("value");
        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guildId);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I am not currently in a voice channel!")] });
            return;
        } else if (interaction.member.voice.channel.id !== player.voiceChannelId) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "You must be in the same voice channel as the bot to use that command!")] });
            return;
        }

        if (!this.client.config.modules.music.enabled) throw new Error("Music configuration was not specified or enabled.");

        const equalizerBands = this.client.config.modules.music.options.equalizerBands;
        const mult = this.client.config.modules.music.options.trebleIntensityMultiplier;

        await player.filters.setEqualizer(player.filters.equalizer.filter(v => v.band < (equalizerBands - 3) || []).concat((trebleboost ?? 0) === 0
            ? []
            : new Array(3).fill(null).map((_, i) => ({
                band: equalizerBands - (i + 1),
                gain: (trebleboost ?? 0) * mult
            }))));

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, trebleboost !== null ? `Set trebleboost to **${trebleboost}**.` : "Disabled trebleboost filter.")] });
    };
}

export default TrebleBoost;
