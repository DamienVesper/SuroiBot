import { config } from '../.config/config.js';

import type { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import type { Player, Track } from 'magmastream';

/**
 * Translate Suroi HTTP response.
 * @param code The HTTP response.
 */
export const translateSuroiStatus = (code: number | undefined): string => {
    switch (code) {
        case 200:
        case 301:
        case 302:
            return config.emojis.checkmark;
        default:
            return config.emojis.xmark;
    }
};

/**
 * Convert a number to duration form.
 * @param num The number.
 */
export const numToDurationFormat = (num: number): string => {
    const seconds = (Math.trunc(num / 1e3) % 60).toString().padStart(2, `0`);
    const minutes = (Math.trunc(num / 6e4) % 60).toString().padStart(2, `0`);
    const hours = Math.trunc(num / 36e5);

    return hours > 0
        ? `${hours}:${minutes}:${seconds}`
        : `${minutes}:${seconds}`;
};

/**
 * Convert a number to cooldown form.
 * @param num The number.
 */
export const numToCooldownFormat = (num: number): string => {
    const hours = Math.trunc(num / 36e5);
    const minutes = (Math.trunc(num / 6e4) % 60);
    const seconds = (hours > 0 || minutes > 0)
        ? Math.ceil(((num / 1e3) % 60))
        : ((num / 1e3) % 60).toFixed(3);

    return `${hours > 0 ? `${hours}h ` : ``}${minutes > 0 ? `${minutes}m ` : ``}${seconds}s`;
};

/**
 * Capitalize a string
 * @param str The string to capitalize.
 */
export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Create a progress bar.
 * @param position The position to fill to.
 * @param max The maximum position.
 */
export const createProgressBar = (position: number, max: number): string => {
    const FILLED = `▰`;
    const EMPTY = `▱`;

    const BAR_LENGTH = 8;

    const barStr = [];
    for (let i = 0; i < BAR_LENGTH; i++) barStr.push((position / max) > ((i + 1) / BAR_LENGTH) ? FILLED : EMPTY);

    return barStr.join(``);
};

export const createTrackBar = (player: Player): string => {
    const track = player.queue.current as Track | null;
    if (track === null) return `ERROR`;

    const MAX_LENGTH = 20;
    const COUNT = Math.floor((track.isStream ? 0 : (player.position ?? 0) / track.duration) * MAX_LENGTH);

    return `${numToDurationFormat(player.position)} ${`⎯`.repeat(COUNT)}◯${`⎯`.repeat(MAX_LENGTH - (COUNT + 1))} ${numToDurationFormat(track.duration)}`;
};

export const createUsageExample = (command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder): string => {
    const commandOptions = command.options.map(option => option.toJSON());
    return `/${command.name}${command.options.length > 0 ? ` ${commandOptions.map(option => option.required ? `<${option.name}>` : `[${option.name}]`).join(` `)}` : ``}`;
};
