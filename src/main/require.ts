/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from './log';

export const requireModule = (module: string) => {
    try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(module);
        return true;
    } catch (error) {
        logger.error(error);
        return false;
    }
};
