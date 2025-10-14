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
import fs from 'fs';
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

export const installJLink = async (offlineInstall = false) => {
    if (offlineInstall) {
        const bundledJLinkDir = getUnpackedBundledResourcePath(
            'prefetched',
            'jlink',
        );
        await install(
            getSingleFileInFolder(bundledJLinkDir),
            inRenderer.updateJLinkProgress,
        );
    } else {
        await downloadAndInstallJLink(inRenderer.updateJLinkProgress);
    }
};
