/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { default: getInternalSource } = require('./getInternalSource');
const { default: getJlink } = require('./getJlink');
const { default: getQuickstart } = require('./getQuickstart');

exports.default = async () => {
    await getJlink();
    await getInternalSource();
    await getQuickstart();
};
