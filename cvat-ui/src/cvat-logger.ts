import { getCore } from 'cvat-core-wrapper';

const core = getCore();
const { logger } = core;
const { LogType } = core.enums;

export default logger;
export { LogType };
