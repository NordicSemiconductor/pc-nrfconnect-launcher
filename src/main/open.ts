/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { shell } from 'electron';
import fs from 'fs';

export const openFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Could not find file at path: ${filePath}`);
    }

    shell.openPath(filePath);
};

export const openUrl = (url: string) => {
    shell.openExternal(url);
};

export const openFileLocation = (filePath: string) => {
    shell.showItemInFolder(filePath);
};
