/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import shasum from 'shasum';

import { AppSpec } from '../ipc/apps';
import { readAppInfoFile } from './appInfo';
import { getAppsRootDir } from './config';
import { downloadToFile } from './net';

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

export const downloadTarball = async (app: AppSpec, version?: string) => {
    const appInfo = readAppInfoFile(app);
    const versionToInstall = appInfo.versions[appInfo.latestVersion];

    if (versionToInstall == null) {
        return Promise.reject(
            new Error(`No tarball found for ${app.name}@${version}`)
        );
    }

    const tarballUrl = versionToInstall.tarballUrl;

    const fileName = path.basename(tarballUrl);
    const tarballFile = path.join(getAppsRootDir(app.source), fileName);

    await downloadToFile(tarballUrl, tarballFile, true, app);
    await verifyShasum(tarballFile, versionToInstall.shasum);

    return tarballFile;
};
