import * as debug from 'debug';

const logPrefix = 'poe-aura';

export const logDev = debug(`${logPrefix}:dev`);
export const logInfo = debug(`${logPrefix}:info`);
export const logError = debug(`${logPrefix}:error`);
