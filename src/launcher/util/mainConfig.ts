/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type Configuration, inMain } from '../../ipc/config';

let cachedConfig: Configuration;

export default () => {
    if (cachedConfig == null) {
        cachedConfig = inMain.getConfig();
    }

    return cachedConfig;
};
