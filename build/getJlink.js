/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');

const {
    downloadAndSaveJLink,
    downloadJLinkByVersion,
} = require('@nordicsemiconductor/nrf-jlink-js');

const bundledJLink = require('../src/main/bundledJlink');

const jlinkPrefetchDir = path.join('resources', 'prefetched', 'jlink');

const downloadSpecificJLink = version =>
    downloadJLinkByVersion(version, jlinkPrefetchDir)
        .then(filename => {
            console.log(
                `Downloaded specified J-Link ${version} to ${filename}`,
            );
        })
        .catch(error => {
            console.error(
                `Failed to download specified J-Link ${version}: ${error.message}.`,
            );
            process.exit(-1);
        });

const downloadLatestJLink = () =>
    downloadAndSaveJLink(jlinkPrefetchDir)
        .then(result => {
            if (bundledJLink.toLowerCase() !== result.version.toLowerCase()) {
                console.error(
                    `\n!!! ERROR: Bundled J-Link version ${bundledJLink} does not match the downloaded version ${result.version}.`,
                );
                process.exit(-1);
            }

            console.log(
                `Downloaded current J-Link ${result.version} to ${result.fileName}.`,
            );
        })
        .catch(error => {
            console.error(
                `Failed to download current J-Link: ${error.message}.`,
            );
            process.exit(-1);
        });

exports.default = () =>
    process.env.OVERRIDE_JLINK_VERSION
        ? downloadSpecificJLink(process.env.OVERRIDE_JLINK_VERSION)
        : downloadLatestJLink();
