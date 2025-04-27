import type { Snowflake } from "discord.js";

const emojis = {
    __: "1290000832259166329",

    checkmark: "1270150603569631262",
    xmark: "1270150604307828788",

    processor: "1270887608637194241",
    memory: "1270887321641947206",
    network: "1270888585205387346",

    owner: "1290002965909864519",
    admin: "1290002956015374366",
    mod: "1290002992820654150",
    manager: "1290002961681875065",
    dev: "1290002960620978268",
    bot: "1290002959622738002",

    member: "1290005640441237567",
    arrow: "1290008611400974357",
    textchannel: "1290005014173061276",
    voicechannel: "1290005013208240158"
};

const EMOJIS = emojis;

// @ts-expect-error Doesn't like iterables.
for (const [key, value] of Object.entries<Snowflake>(EMOJIS)) EMOJIS[key] = `<:${key}:${value}>`;

export default EMOJIS as Record<keyof typeof emojis, Snowflake>;
