/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const downloadFile = require('../scripts/downloadFile');

const SOURCE_URL =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/source.json';

const BUNDLE_APPS = ['pc-nrfconnect-quickstart'];

const preparingSandbox = new Map();

const bundleNrfutilModule = (module, version) => {
    if (
        preparingSandbox.has(module) &&
        preparingSandbox.get(module).has(version)
    )
        return; // Already bundled

    if (!preparingSandbox.has(module)) preparingSandbox.set(module, new Set());

    preparingSandbox.get(module).add(version);

    console.log(`Bundling nrfutil module ${module} version ${version}`);
    execSync(
        `${path.join(
            'resources',
            'nrfutil'
        )} install ${module}=${version} --force`,
        {
            env: {
                ...process.env,
                NRFUTIL_HOME: path.join(
                    'resources',
                    'nrfutil-sandboxes',
                    module,
                    version
                ),
            },
        }
    );
    console.log(`🏁 Bundled nrfutil module ${module} version ${version}:`);
};

const isAppBundled = appJSONUrl =>
    BUNDLE_APPS.find(app => app === path.parse(appJSONUrl).name);

const parseSourceFile = appUrls =>
    Promise.allSettled(
        appUrls.apps.map(async appJSONUrl => {
            const dstPath = path.join(
                'resources',
                'prefetched',
                path.basename(appJSONUrl)
            );

            await downloadFile(appJSONUrl, dstPath, false);

            const appJSON = JSON.parse(fs.readFileSync(dstPath));

            if (!isAppBundled(appJSONUrl)) return;

            const latestVersion = appJSON.versions[appJSON.latestVersion];

            const appBundlesPath = path.join(
                'resources',
                'prefetched',
                'appBundles'
            );
            fs.mkdirSync(appBundlesPath);

            const promises = [];
            promises.push(
                downloadFile(
                    latestVersion.tarballUrl,
                    path.join(
                        appBundlesPath,
                        path.basename(latestVersion.tarballUrl)
                    ),
                    false
                )
            );

            if (latestVersion.nrfutilModules) {
                Object.keys(latestVersion.nrfutilModules).forEach(module => {
                    latestVersion.nrfutilModules[module].forEach(version => {
                        promises.push(bundleNrfutilModule(module, version));
                    });
                });
            }

            await Promise.allSettled(promises);
            if (os.platform() !== 'win32') {
                execSync(
                    `chmod -R 744 ${path.join(
                        'resources',
                        'nrfutil-sandboxes'
                    )} `
                );
            }
        })
    );

exports.default = async () => {
    await downloadFile(
        SOURCE_URL,
        `resources/prefetched/${path.basename(SOURCE_URL)}`,
        false
    );

    const appUrls = JSON.parse(
        fs.readFileSync(`./resources/prefetched/${path.basename(SOURCE_URL)}`)
    );

    await parseSourceFile(appUrls);
};