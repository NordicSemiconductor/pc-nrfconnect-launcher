/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { rmSync } = require('fs');
const path = require('path');
const { default: bundleApps } = require('./bundleApps');
const { default: getJlink } = require('./getJlink');

exports.default = async () => {
    rmSync(path.join('resources', 'prefetched'), {
        force: true,
        recursive: true,
    });

    await Promise.allSettled([getJlink(), bundleApps()]);
};
