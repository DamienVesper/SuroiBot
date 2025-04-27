import { config } from "../.config/config.js";

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
