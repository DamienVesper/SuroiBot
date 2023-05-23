import { version } from '../package.json';

import channels from './channels';
import colors from './colors';
import cooldowns from './cooldowns';
import { emojis, emojiIDs } from './emojis';
import help from './help';
import httpCodes from './httpCodes';
import roles from './roles';

import * as dotenv from 'dotenv';
dotenv.config();

const config = {
    developerID: `386940319666667521`,
    prefix: `sr!`,

    channels,
    colors,
    cooldowns,
    emojis,
    emojiIDs,
    help,
    httpCodes,
    roles,

    guild: `1077043833621184563`,
    logChannel: `1092435780095451236`,

    github: `DamienVesper/SurvivReloadedBot`,

    version,
    footer: `Suroi Bot | v${version}`
};

export default config;
