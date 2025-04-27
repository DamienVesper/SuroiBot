import type { SharedSlashCommand, Snowflake } from "discord.js";
import type { Player } from "magmastream";
import type { SKRSContext2D } from "@napi-rs/canvas";

import type { DiscordBot } from "../modules/DiscordBot.js";

/**
 * Clean a string of Discord formatting.
 * @param str The string to clean.
 */
export const cleanse = (str: string): string => str.replace(/\*\*\*|\*\*|\*|__|_|~~/g, r => `\\${r}`);

/**
 * Get a Discord timestamp of a date.
 * @param date The date in question.
 * @param type The type of the date. Can be of type t, T, d, D, f, F, and R.
 */
export const timestamp = (date: Date, type?: string): string => `<t:${Math.floor(date.getTime() / 1e3)}:${type ?? "R"}>`;

/**
 * Format a number into a condensed form.
 * @param num The number to format.
 */
export const numToPredicateFormat = (num: number): string =>
    Math.abs(Number(num)) >= 1e21
        ? `${(Math.abs(Number(num)) / 1e21).toFixed(2)}S`
        : Math.abs(Number(num)) >= 1e18
            ? `${(Math.abs(Number(num)) / 1e18).toFixed(2)}QT`
            : Math.abs(Number(num)) >= 1e15
                ? `${(Math.abs(Number(num)) / 1e15).toFixed(2)}Q`
                : Math.abs(Number(num)) >= 1e12
                    ? `${(Math.abs(Number(num)) / 1e12).toFixed(2)}T`
                    : Math.abs(Number(num)) >= 1e9
                        ? `${(Math.abs(Number(num)) / 1e9).toFixed(2)}B`
                        : Math.abs(Number(num)) >= 1e6
                            ? `${(Math.abs(Number(num)) / 1e6).toFixed(2)}M`
                            : Math.abs(Number(num)) >= 1e3
                                ? `${(Math.abs(Number(num)) / 1e3).toFixed(2)}K`
                                : Math.abs(Number(num)).toString();

/**
 * Format a number by the number of bytes it contains, into a condensed form.
 * @param num The number to format.
 */
export const numToBytesFormat = (num: number): string =>
    Math.abs(Number(num)) >= 1024 ** 5
        ? `${(Math.abs(Number(num)) / 1024 ** 5).toFixed(2)}PiB`
        : Math.abs(Number(num)) >= 1024 ** 4
            ? `${(Math.abs(Number(num)) / 1024 ** 4).toFixed(2)}TiB`
            : Math.abs(Number(num)) >= 1024 ** 3
                ? `${(Math.abs(Number(num)) / 1024 ** 3).toFixed(2)}GiB`
                : Math.abs(Number(num)) >= 1024 ** 2
                    ? `${(Math.round(Math.abs(Number(num)) / 1024 ** 2))}MiB`
                    : Math.abs(Number(num)) >= 1024
                        ? `${(Math.round(Math.abs(Number(num)) / 1024))}KiB`
                        : Math.abs(Number(num)).toString();

/**
 * Convert a number to duration form.
 * @param num The number.
 */
export const numToDurationFormat = (num: number): string => {
    const seconds = (Math.trunc(num / 1e3) % 60).toString().padStart(2, "0");
    const minutes = (Math.trunc(num / 6e4) % 60).toString().padStart(2, "0");
    const hours = Math.trunc(num / 36e5);
    return num > 1e12
        ? "Infinite"
        : hours > 0
            ? `${hours}:${minutes}:${seconds}`
            : `${minutes}:${seconds}`;
};

/**
 * Convert a number to cooldown form.
 * @param num The number.
 */
export const numToCooldownFormat = (num: number): string => {
    const days = Math.trunc(num / 864e5);
    const hours = Math.trunc(num / 36e5) % 24;
    const minutes = Math.trunc(num / 6e4) % 60;
    const seconds = (hours > 0 || minutes > 0)
        ? Math.ceil(((num / 1e3) % 60))
        : ((num / 1e3) % 60).toFixed(3);

    return `${days > 0 ? `${days}d ` : ""}${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`;
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
    const FILLED = "▰";
    const EMPTY = "▱";

    const BAR_LENGTH = 8;

    const barStr = [];
    for (let i = 0; i < BAR_LENGTH; i++) barStr.push((position / max) > ((i + 1) / BAR_LENGTH) ? FILLED : EMPTY);

    return barStr.join("");
};

export const createTrackBar = (player: Player): string => {
    const track = player.queue.current;
    if (track === null) return "ERROR";

    const MAX_LENGTH = 20;
    const COUNT = Math.floor((track.isStream ? 0 : (player.position ?? 0) / track.duration) * MAX_LENGTH);

    return `${numToDurationFormat(player.position)} ${"⎯".repeat(COUNT)}◯${"⎯".repeat(MAX_LENGTH - (COUNT + 1))} ${numToDurationFormat(track.duration)}`;
};

export const createUsageExample = (command: SharedSlashCommand): string => {
    const commandOptions = command.options.map(option => option.toJSON());
    return `/${command.name}${command.options.length > 0 ? ` ${commandOptions.map(option => option.required ? `<${option.name}>` : `[${option.name}]`).join(" ")}` : ""}`;
};

export const getMaxXP = (level: number): number => Math.floor((100 * Math.E * level) / 2);

export const getTotalXP = (level: number, xp: number): number => {
    for (let i = 0; i < level; i++) xp += getMaxXP(i);
    return xp;
};

export const fitText = (context: SKRSContext2D, text: string, maxFontSize: number, maxWidth: number): string => {
    let fontSize = maxFontSize;
    context.font = `${fontSize}px Inter`;
    while (context.measureText(text).width > maxWidth) context.font = `${fontSize -= 2}px Inter`;

    return context.font;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getGuildLeaderboard = async (client: DiscordBot, guildId: Snowflake) => (await client.db.user.findMany({
    where: {
        banned: false,
        guildId: guildId
    },
    orderBy: [
        { level: "desc" },
        { xp: "desc" }
    ]
})).map((x, i) => Object.freeze({ ...x, pos: i }));
