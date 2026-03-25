/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');
const os = require('os');

const downloadJLink =
    require('@nordicsemiconductor/nrf-jlink-js').downloadAndSaveJLink;

const bundledJLink = require('../src/main/bundledJlink');
const downloadFile = require('../scripts/downloadFile');

const assertValidVersion = version => {
    const match = version.match(/^v(\d+\.\d+[a-z]?)$/i);

    if (match == null) {
        throw new Error(
            'OVERRIDE_JLINK_VERSION must match v<major>.<minor><suffix>, for example v8.76, V9.24a, or v5.00.',
        );
    }
};

const downloadSpecificJLink = version => {
    assertValidVersion(version);

    const platform = {
        win32: 'Windows',
        darwin: 'MacOSX',
        linux: 'Linux',
    }[os.platform()];
    const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
    const fileExtension = {
        win32: 'exe',
        darwin: 'pkg',
        linux: 'deb',
    }[os.platform()];

    const filename = `JLink_${platform}_V${version.replace('.', '').replace(/^v/i, '')}_${arch}.${fileExtension}`;

    const url = `https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=true&repoKey=swtools&path=external/ncd/jlink/${filename}`;

    return downloadFile(
        url,
        path.join('resources', 'prefetched', 'jlink', filename),
    ).catch(error => {
        console.error(`Failed to download J-Link from ${url}: `, error.message);
        process.exit(-1);
    });
};

const downloadLatestJLink = () =>
    downloadJLink(path.join('resources', 'prefetched', 'jlink'))
        .then(result => {
            if (bundledJLink.toLowerCase() !== result.version.toLowerCase()) {
                console.error(
                    `\n!!! ERROR: Bundled J-Link version ${bundledJLink} does not match the downloaded version ${result.version}.`,
                );
                process.exit(-1);
            }

            console.log(
                `Downloaded J-Link version ${result.version} successfully.`,
            );
        })
        .catch(error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        });

exports.default = () =>
    process.env.OVERRIDE_JLINK_VERSION
        ? downloadSpecificJLink(process.env.OVERRIDE_JLINK_VERSION)
        : downloadLatestJLink();
