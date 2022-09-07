/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import shasum from 'shasum';
import url from 'url';

import * as net from './net';
import { getSourceUrl } from './sources';

interface AppInfo {
    ['dist-tags']: {
        latest: string;
    };
    versions: {
        [version: string]: {
            dist: {
                tarball: string;
                shasum: string;
            };
        };
    };
}

const getLatestFromAppInfo = (appInfo: AppInfo) => appInfo['dist-tags'].latest;

const getAppInfo = (appName: string, sourceUrl: string) => {
    const appUrl = new URL(appName, sourceUrl).href;

    return net.downloadToJson<AppInfo>(appUrl, true);
};

const getDistInfo = async (
    appName: string,
    version: string,
    sourceUrl: string
) => {
    const appInfo = await getAppInfo(appName, sourceUrl);

    const versionToInstall =
        version === 'latest' ? getLatestFromAppInfo(appInfo) : version;

    return appInfo.versions[versionToInstall].dist;
};

const verifyShasum = async (filePath: string, expectedShasum: string) => {
    let buffer;
    try {
        buffer = await fs.readFile(filePath);
    } catch (error) {
        throw new Error(
            `Unable to read file when verifying shasum: ${filePath}`
        );
    }

    const computedShasum = shasum(buffer);
    if (expectedShasum !== computedShasum) {
        throw new Error(
            `Shasum verification failed for ${filePath}. Expected ` +
                `'${expectedShasum}', but got '${computedShasum}'.`
        );
    }
};

export const downloadTarball = async (
    appName: string,
    version: string,
    destinationDir: string,
    sourceName: string
) => {
    const sourceUrl = getSourceUrl(sourceName);
    const distInfo = await getDistInfo(appName, version, sourceUrl);
    if (!distInfo.tarball) {
        return Promise.reject(
            new Error(`No tarball found for ${appName}@${version}`)
        );
    }

    const tarballUrl = distInfo.tarball;
    const parsedUrl = url.parse(tarballUrl);
    const fileName = path.basename(parsedUrl.pathname!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const tarballFile = path.join(destinationDir, fileName);

    await net.downloadToFile(tarballUrl, tarballFile, true, {
        name: appName,
        source: sourceName,
    });
    await verifyShasum(tarballFile, distInfo.shasum);

    return tarballFile;
};

const getLatestAppVersion = async (appName: string, sourceUrl: string) => {
    const appInfo = await getAppInfo(appName, sourceUrl);
    return getLatestFromAppInfo(appInfo);
};

/*
 * Get the latest package versions for the given packages. Returns
 * an object with package names as keys, and their latest versions
 * as values. E.g: { foo: "1.2.3", bar: "2.3.4" }.
 */
export const getLatestAppVersions = (
    appNames: string[],
    sourceName: string
) => {
    const promises = appNames.map(async name => ({
        [name]: await getLatestAppVersion(name, getSourceUrl(sourceName)),
    }));
    // Performing the network requests in sequence in case proxy auth is
    // required. When running in sequence, the first request will require
    // authentication, while subsequent requests use cached credentials.
    return promises.reduce(
        (prev, curr) =>
            prev.then(packages =>
                curr.then(packageVersion =>
                    Object.assign(packages, packageVersion)
                )
            ),
        Promise.resolve({})
    );
};
