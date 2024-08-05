/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import {
    createWriteStream,
    existsSync,
    mkdirSync,
    rmSync,
    type WriteStream
} from 'fs';
import { dirname, resolve } from 'path';

/**
 * @link https://github.com/chalk/chalk/blob/main/source/vendor/ansi-styles/index.js
 */
const styles = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39],
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
};

export class Logger {
    readonly styles = styles;
    readonly config: {
        clear: boolean
        padding: boolean
        handleExceptions: boolean

        files?: {
            log: string
            errorLog: string
        }
    };

    readonly #logFilePath: string | undefined = undefined;
    readonly #errorLogFilePath: string | undefined = undefined;

    readonly #logStream: WriteStream | undefined = undefined;
    readonly #errorLogStream: WriteStream | undefined = undefined;

    constructor (options?: Partial<typeof this.config>) {
        this.config = {
            clear: options?.clear ?? true,
            padding: options?.padding ?? false,
            handleExceptions: options?.handleExceptions ?? false
        };

        if (options?.files) {
            this.#logFilePath = resolve(options.files.log);
            this.#errorLogFilePath = resolve(options.files.errorLog);

            // Create the file directories, if applicable.
            if (!existsSync(dirname(this.#logFilePath))) mkdirSync(dirname(this.#logFilePath));
            if (!existsSync(dirname(this.#errorLogFilePath))) mkdirSync(dirname(this.#errorLogFilePath));

            // Clear the log files if necessary.
            if (this.config.clear) this.reset();

            this.#logStream = createWriteStream(this.#logFilePath);
            this.#errorLogStream = createWriteStream(this.#errorLogFilePath);
        }

        // Handle exceptions, if applicable.
        if (this.config.handleExceptions) {
            process.on(`uncaughtException`, (err, origin) => {
                this.error(`System`, err.stack ?? err.message);
            });
            process.on(`unhandledRejection`, (err: any, origin) => {
                this.error(`System`, err?.stack ?? err);
            });
        }
    }

    /**
     * Clears the console.
     */
    clear = (): void => {
        console.clear();
    };

    /**
     * Clears the log files.
     * @note This should not be done while any write streams are open.
     */
    reset = (): void => {
        if (this.#logStream !== undefined
            || this.#errorLogStream !== undefined)
            return this.error(`Logger`, `Failed clearing log file: write stream not closed.`);

        if (this.#logFilePath === undefined || this.#errorLogFilePath === undefined)
            return this.error(`Logger`, `Failed clearing log file: file paths not specified.`);

        rmSync(this.#logFilePath, { force: true });
        if (this.#logFilePath !== this.#errorLogFilePath) rmSync(this.#errorLogFilePath, { force: true });
    };

    /**
     * Log a message to the console.
     * @param level The level to log at.
     * @param name The system the log originated from.
     * @param args The message to log.
     */
    log = (level: `info` | `warn` | `error` | `debug`, system: string, ...args: any[]): void => {
        /**
         * Message to log to the console (stdout).
         */
        const logMsg = [
            this.format(this.styles.dim, this.createTimestamp()),
            this.format(this.styles.bold, this.format(this.styles.dim, `|`)),
            this.format(this.styles.bold, level === `info`
                ? this.format(this.styles.cyan, `INFO`)
                : level === `warn`
                    ? this.format(this.styles.yellow, `WARN`)
                    : level === `error`
                        ? this.format(this.styles.red, `ERROR`)
                        : this.format(this.styles.white, `DEBUG`)
            ),
            this.format(this.styles.bold, this.format(this.styles.dim, `|`)),
            this.format(this.styles.bold, system),
            this.format(this.styles.bold, this.format(this.styles.dim, `|`)),
            this.format(this.styles.reset, this.normalizedArgs(args).join(` `))
        ];

        /**
         * Message to write to the log file.
         */
        const logEntryMsg = [
            this.createTimestamp(),
            `|`,
            level.toUpperCase(),
            `|`,
            system,
            `|`,
            ...this.normalizedArgs(args),
            `\n`
        ];

        // Log the message.
        console.log(...logMsg);

        if (this.#errorLogStream !== undefined && level === `error`) this.#errorLogStream.write(logEntryMsg.join(` `));
        else if (this.#logStream !== undefined) this.#logStream.write(logEntryMsg.join(` `));
    };

    info = (system: string, ...args: any[]): ReturnType<typeof this.log> => this.log(`info`, system, ...args);
    warn = (system: string, ...args: any[]): ReturnType<typeof this.log> => this.log(`warn`, system, ...args);
    error = (system: string, ...args: any[]): ReturnType<typeof this.log> => this.log(`error`, system, ...args);
    debug = (system: string, ...args: any[]): ReturnType<typeof this.log> => this.log(`debug`, system, ...args);

    /**
     * Format a console string.
     * @param style The style to use.
     * @param args The message to format.
     * @returns
     */
    format = (style: typeof this.styles.reset, ...args: string[]): string => `\x1b[${style[0]}m${this.normalizedArgs(args).join(` `)}\x1b[${style[1]}m`;

    /**
     * Normalize arguments to return string equivalents.
     * @param args The arguments to normalize.
     */
    private normalizedArgs = (args: any[]): typeof args => args.map(arg => {
        if (typeof arg === `object`) return JSON.stringify(arg);
        else return arg;
    });

    /**
     * Create a human-readable timestamp for logs.
     */
    private createTimestamp = (): string => {
        // Set timing variables.
        const time = new Date();

        const second = time.getSeconds().toString().padStart(2, `0`);
        const minute = time.getMinutes().toString().padStart(2, `0`);
        const hour = (this.config.padding
            ? time.getHours()
            : (time.getHours() % 12 === 0 ? 12 : time.getHours() % 12)
        ).toString();

        const day = time.getDate().toString();
        const month = (time.getMonth() + 1).toString();
        const year = time.getFullYear().toString();

        return this.config.padding
            ? `${month.padStart(2, `0`)}/${day.padStart(2, `0`)}/${year.padStart(2, `0`)} ${hour.padStart(2, `0`)}:${minute}:${second}`
            : `${month}/${day}/${year} ${hour}:${minute}:${second} ${time.getHours() > 12 ? `PM` : `AM`}`;
    };
}
