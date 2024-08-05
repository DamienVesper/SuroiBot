import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../classes/Command.js';

class Play extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`play`)
        .setDescription(`Play a song.`)
        .addStringOption(option => option.setName(`name`).setDescription(`The name or link to the song.`).setRequired(true))
        .setDMPermission(false);

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.guild === null || interaction.channel === null) {
            await interaction.reply({ content: `This command can only be used in a guild!`, ephemeral: true });
            return;
        }

        const voiceChannel = (await interaction.guild.members.fetch(interaction.user.id)).voice.channel;
        if (voiceChannel === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in a voice channel to use that command!`)], ephemeral: true });
            return;
        }

        const guildPlayer = this.client.lavalinkManager.players.get(interaction.guild.id);
        if (guildPlayer !== undefined && voiceChannel.id !== guildPlayer.voiceChannel) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, `You must be in the same voice channel as the bot to use that command!`)], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const songInput = interaction.options.getString(`name`, true);
        const res = await this.client.lavalinkManager.search(songInput, interaction.user as any);

        if (res.loadType === `empty`) {
            console.log(`help!`);
            throw new Error(`There were no tracks to queue.`);
        }
        else if (res.loadType === `playlist`) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `We're getting there with playlists. Please be patient.`)] });
            return;
        } else if (res.loadType === `error`) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, `I could not find any songs with the provided query.`)] });
            return;
        }

        const player = this.client.lavalinkManager.create({
            guild: interaction.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: interaction.channel.id,
            volume: 75,
            selfDeafen: true
        });

        player.connect();
        player.queue.add(res.tracks[0]);

        if (!player.playing && !player.paused && !player.queue.size) player.play();
        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `**${res.tracks[0].title}** has been queued!`)] })
    };
}

export default Play;
