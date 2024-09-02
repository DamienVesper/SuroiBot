import { InteractionContextType, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

class Vibrato extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`vibrato`)
        .addIntegerOption(option => option.setName(`value`).setDescription(`The vibrato depth (%). Leave blank for default.`).setMinValue(0).setMaxValue(100))
        .addNumberOption(option => option.setName(`frequency`).setDescription(`The frequency of the vibrato. Leave blank for default.`).setMinValue(0.001).setMaxValue(14))
        .setDescription(`Set the vibrato filter.`)
        .setContexts(InteractionContextType.Guild);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null) {
            await interaction.reply({ content: `This command can only be used in a guild!`, ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in a voice channel to use that command!`)], ephemeral: true });
            return;
        }

        const vibrato = interaction.options.getInteger(`value`);
        const vibratoFrequency = interaction.options.getNumber(`frequency`);

        await interaction.deferReply();

        const player = this.client.lavalink.players.get(interaction.guild.id);
        if (player === undefined) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I am not currently in a voice channel!`)] });
            return;
        } else if (player !== undefined && voiceChannel.id !== player.voiceChannel) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in the same voice channel as the bot to use that command!`)] });
            return;
        }

        if (!this.client.config.modules.music?.enabled) throw new Error(`Music configuration was not specified or enabled.`);
        player.filters.setVibrato({
            depth: (vibrato ?? 0) / 100,
            frequency: (vibratoFrequency ?? player.filters.vibrato?.frequency) ?? this.client.config.modules.music.options.tremoloVibratoFrequency
        });

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Set vibrato to ${vibrato !== null ? `**${vibrato}%**` : `default`} ${vibratoFrequency !== null ? `with a frequency of **${vibratoFrequency}** Hz` : `at the default frequency`}.`)] });
    };
}

export default Vibrato;
