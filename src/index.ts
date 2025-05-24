import { resolve } from "path";
import { fileURLToPath } from "url";

import { DiscordBot } from "./modules/DiscordBot.js";

const main = async (): Promise<void> => {
    const client = new DiscordBot();

    await client.loadEvents(resolve(fileURLToPath(import.meta.url), "../events"));
    await client.loadCommands(resolve(fileURLToPath(import.meta.url), "../commands"));

    await client.login(process.env.DISCORD_TOKEN);
};

void main();
