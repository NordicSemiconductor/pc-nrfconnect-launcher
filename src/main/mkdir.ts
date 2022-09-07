/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';

export const mkdir = async (dirPath: fs.PathLike) => {
    try {
        await fs.mkdir(dirPath, 0o775);
    } catch (error) {
        if (error) {
            throw new Error(
                `Unable to create ${dirPath}: ${(error as Error).message}`
            );
        }
    }
};

export const mkdirIfNotExists = async (dirPath: fs.PathLike) => {
    try {
        await fs.stat(dirPath);
    } catch (error) {
        if (error) {
            await mkdir(dirPath);
        }
    }
};

export const ensureDirExists = mkdirIfNotExists;
