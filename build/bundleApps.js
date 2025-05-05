/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const downloadFile = require('../scripts/downloadFile');

const SOURCE_URL =
    'https://files.nordicsemi.com/artifactory/swtools/external/ncd/apps/official/source.json';

const BUNDLE_APPS = ['pc-nrfconnect-quickstart'];

const alreadyPreparedSandboxes = new Set();

const bundleNrfutilModule = (module, version) => {
    const key = `${module}-${version}}`;
    if (alreadyPreparedSandboxes.has(key)) return; // Already bundled
    alreadyPreparedSandboxes.add(key);

    console.log(`Bundling nrfutil module ${module} version ${version}`);

    const nrfUtilBinary = path.join('resources', 'nrfutil');
    const env = {
        ...process.env,
        NRFUTIL_HOME: path.join(
            'resources',
            'nrfutil-sandboxes',
            ...(process.platform === 'darwin' && process.arch !== 'x64'
                ? [process.arch]
                : []),
            module,
            version
        ),
    };

    execSync(`${nrfUtilBinary} install ${module}=${version} --force`, { env });

    console.log(`🏁 Bundled nrfutil module ${module} version ${version}`);
};

const isAppBundled = appJSONUrl =>
    BUNDLE_APPS.find(app => app === path.parse(appJSONUrl).name);

const parseSourceFile = appUrls =>
    Promise.allSettled(
        appUrls.apps.map(async appJSONUrl => {
            const dstPath = url =>
                path.join('resources', 'prefetched', path.basename(url));

            await downloadFile(appJSONUrl, dstPath(appJSONUrl), false);
            const appJSON = JSON.parse(fs.readFileSync(dstPath(appJSONUrl)));

            await Promise.allSettled([
                downloadFile(appJSON.iconUrl, dstPath(appJSON.iconUrl), false),
                downloadFile(
                    appJSON.releaseNotesUrl,
                    dstPath(appJSON.releaseNotesUrl),
                    false
                ),
            ]);

            if (!isAppBundled(appJSONUrl)) return;

            const latestVersion = appJSON.versions[appJSON.latestVersion];

            const appBundlesPath = path.join(
                'resources',
                'prefetched',
                'appBundles'
            );
            fs.mkdirSync(appBundlesPath, { recursive: true });

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
                        bundleNrfutilModule(
                            module,
                            version,
                            latestVersion.nrfutilCore
                        );
                    });
                });
            }

            await Promise.allSettled(promises);
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
