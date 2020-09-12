/********* Entry-specified configuration *********/
export const presetConfig = {
   logLevel: 'info',
} as const;

/************* Exports of this entry *************/
export * from './core';

import { configure } from './core';
configure(presetConfig);

/* eventnet.attrs */
export * as attrs from './attrs/api';

/* eventnet.connectors */
export * as connectors from './connectors/api';

/* eventnet.monitor */
export * as monitor from './monitor/api';

/* eventnet.nodes */
export * as nodes from './nodes/api';
