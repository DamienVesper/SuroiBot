import { ShardingManager } from "discord.js";

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { Logger } from "./Logger.js";

export class ShardManager extends ShardingManager {
    logger: Logger;

    constructor (token: string) {
        super(resolve(dirname(fileURLToPath(import.meta.url)), "./DiscordBot.js"), { token });

        this.logger = new Logger({
            files: {
                log: resolve(fileURLToPath(import.meta.url), "../../logs/console.log"),
                errorLog: resolve(fileURLToPath(import.meta.url), "../../logs/error.log")
            },
            handleExceptions: true
        });
    }
}
