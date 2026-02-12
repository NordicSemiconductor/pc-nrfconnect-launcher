/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    downloadAndInstallJLink,
    getJLinkState as getState,
    installJLink as install,
} from '@nordicsemiconductor/nrf-jlink-js';
import fs, { copyFileSync, mkdirSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';

import { inRenderer } from '../ipc/jlinkProgress';
import bundledJlinkVersion from './bundledJlink';
import { getUnpackedBundledResourcePath } from './config';

export const getJLinkState = ({ checkOnline }: { checkOnline: boolean }) =>
    getState({ checkOnline, fallbackVersion: bundledJlinkVersion });

const getSingleFileInFolder = (folder: string) => {
    const files = fs.readdirSync(folder);
    if (files.length !== 1) {
        throw new Error(`Failed to find bundled J-Link installer.`);
    }
    return path.join(folder, files[0]);
};

const moveFileToTmp = (filePath: string) => {
    const baseDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const destinationFile = path.join(baseDir, fileName);
    try {
        mkdirSync(path.dirname(destinationFile), { recursive: true });
        copyFileSync(filePath, destinationFile);
        return destinationFile;
    } catch (e) {
        throw new Error(
            `Unable to write file to ${destinationFile}. Error: ${e}`,
        );
    }
};

export const installJLink = async (offlineInstall = false) => {
    if (offlineInstall) {
        const bundledJLinkDir = getUnpackedBundledResourcePath(
            'prefetched',
            'jlink',
        );
        const moveBundledJlinkBeforeInstall = process.platform === 'linux';
        let bundledJLink: string = getSingleFileInFolder(bundledJLinkDir);
        // The bundled file resides in a user-created folder from which the root user will be blocked to run applications
        if (moveBundledJlinkBeforeInstall) {
            bundledJLink = moveFileToTmp(bundledJLink);
        }

        await install(bundledJLink, inRenderer.updateJLinkProgress);

        if (moveBundledJlinkBeforeInstall) {
            rmSync(bundledJLink);
        }
    } else {
        await downloadAndInstallJLink(inRenderer.updateJLinkProgress);
    }
};
