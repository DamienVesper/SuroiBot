import type { Snowflake } from 'discord.js';

const emojis = {
    checkmark: `1270150603569631262`,
    xmark: `1270150604307828788`
};

const EMOJIS = emojis;

// @ts-expect-error Doesn't like iterables.
for (const [key, value] of Object.entries<Snowflake>(EMOJIS)) EMOJIS[key] = `<:${key}:${value}>`;

export default EMOJIS as Record<keyof typeof emojis, Snowflake>;
