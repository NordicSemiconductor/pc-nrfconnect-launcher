/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');

const downloadJLink =
    require('@nordicsemiconductor/nrf-jlink-js').downloadAndSaveJLink;
const { bundledJlinkDir } = require('../src/main/bundledJlink');

exports.default = () =>
    downloadJLink(path.join('resources', bundledJlinkDir)).catch(error => {
        console.error('\n!!! EXCEPTION', error.message);
        process.exit(-1);
    });
