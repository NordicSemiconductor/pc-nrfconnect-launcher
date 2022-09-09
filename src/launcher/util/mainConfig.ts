/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Configuration, getConfig } from '../../ipc/getConfig';

let cachedConfig: Configuration;

export default () => {
    if (cachedConfig == null) {
        cachedConfig = getConfig();
    }

    return cachedConfig;
};
