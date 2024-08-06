import { config } from '../.config/config.js';

/**
 * Convert a number to duration form.
 * @param num The number.
 */
export const numToDurationFormat = (num: number): string => {
    const seconds = num % 60;
    const minutes = num % 3600;
    const hours = Math.floor(num / 3600);

    return hours > 0
        ? `${hours}:${minutes}:${seconds}`
        : `${minutes}:${seconds}`;
};

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
