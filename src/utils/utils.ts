import { config } from '../.config/config.js';

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
 * Capitalize a string
 * @param str The string to capitalize.
 */
export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);
