import type { Snowflake } from 'discord.js';

const emojis = {
    checkmark: `1270150603569631262`,
    xmark: `1270150604307828788`,
    processor: `1270887608637194241`,
    memory: `1270887321641947206`,
    network: `1270888585205387346`
};

const EMOJIS = emojis;

// @ts-expect-error Doesn't like iterables.
for (const [key, value] of Object.entries<Snowflake>(EMOJIS)) EMOJIS[key] = `<:${key}:${value}>`;

export default EMOJIS as Record<keyof typeof emojis, Snowflake>;
