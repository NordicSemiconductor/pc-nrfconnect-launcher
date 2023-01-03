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
import { downloadToFile, downloadToJson } from './net';
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

    return downloadToJson<AppInfo>(appUrl, true);
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

    await downloadToFile(tarballUrl, tarballFile, true, app);
    await verifyShasum(tarballFile, distInfo.shasum);

    return tarballFile;
};
