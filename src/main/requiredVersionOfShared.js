/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

module.exports = packageJson => {
    const allDependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
    };

    return allDependencies['pc-nrfconnect-shared']
        ?.replace(/.*#/, '')
        .replace(/^semver:[~^]?/, '');
};
