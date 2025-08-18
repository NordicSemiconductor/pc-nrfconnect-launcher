/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    downloadAndInstallJLink,
    installJLink as install,
} from '@nordicsemiconductor/nrf-jlink-js';
import fs from 'fs';
import path from 'path';

import { inRenderer } from '../ipc/installJLink';
import { getUserDataDir } from './config';

export default (offlineInstall = false) => {
    if (offlineInstall) {
        const bundledDir = path.join(getUserDataDir(), 'jlink');
        const files = fs.readdirSync(bundledDir);
        if (files.length === 0 || files.length > 1) {
            throw new Error(`Failed to find bundled J-Link installer.`);
        }
        install(
            path.join(bundledDir, files[0]),
            inRenderer.updateJLinkProgress
        );
    } else {
        downloadAndInstallJLink(inRenderer.updateJLinkProgress);
    }
};
