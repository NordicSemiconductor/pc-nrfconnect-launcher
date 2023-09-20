/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { default: bundleApps } = require('./bundleApps');
const { default: getJlink } = require('./getJlink');

exports.default = async () => {
    await Promise.allSettled([getJlink(), bundleApps()]);
};
