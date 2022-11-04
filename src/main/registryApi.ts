/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import shasum from 'shasum';
import url from 'url';

import { AppSpec } from '../ipc/apps';
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

const getAppInfo = (app: AppSpec) => {
    const sourceUrl = getSourceUrl(app.source);

    const appUrl = new URL(app.name, sourceUrl).href;

    return net.downloadToJson<AppInfo>(appUrl, true);
};

const getDistInfo = async (app: AppSpec, version: string) => {
    const appInfo = await getAppInfo(app);

    const versionToInstall =
        version === 'latest' ? appInfo['dist-tags'].latest : version;

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
    app: AppSpec,
    version: string,
    destinationDir: string
) => {
    const distInfo = await getDistInfo(app, version);
    if (!distInfo.tarball) {
        return Promise.reject(
            new Error(`No tarball found for ${app.name}@${version}`)
        );
    }

    const tarballUrl = distInfo.tarball;
    const parsedUrl = url.parse(tarballUrl);
    const fileName = path.basename(parsedUrl.pathname!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const tarballFile = path.join(destinationDir, fileName);

    await net.downloadToFile(tarballUrl, tarballFile, true, app);
    await verifyShasum(tarballFile, distInfo.shasum);

    return tarballFile;
};

export const getLatestAppVersion = async ({ name, source }: AppSpec) =>
    (await getAppInfo({ name, source }))['dist-tags'].latest;

/*
 * Get the latest package versions for the given packages. Returns
 * an object with package names as keys, and their latest versions
 * as values. E.g: { foo: "1.2.3", bar: "2.3.4" }.
 */
export const getLatestAppVersions = async (
    appNames: string[],
    source: string
) => {
    const nameVersionPairPromises = appNames.map(async name => [
        name,
        await getLatestAppVersion({ name, source }),
    ]);

    return Object.fromEntries(await Promise.all(nameVersionPairPromises));
};
