/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { InstalledDownloadableApp } from '../../ipc/apps';
import type { RootState } from '..';

export const getApps: (state: RootState) => {
    isDownloadingLatestAppInfo: boolean;
    lastUpdateCheckDate: Date | null;
    downloadableApps: InstalledDownloadableApp[];
};
