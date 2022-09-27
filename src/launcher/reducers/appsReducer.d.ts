/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    InstalledDownloadableApp,
    UninstalledDownloadableApp,
} from '../../ipc/apps';
import { SourceName } from '../../ipc/sources';
import type { RootState } from '..';

export const getApps: (state: RootState) => {
    isDownloadingLatestAppInfo: boolean;
    lastUpdateCheckDate: Date | null;
    downloadableApps: InstalledDownloadableApp[];
};

export const getDownloadableApp: (app: {
    name?: string;
    source?: SourceName;
}) => (
    state: RootState
) => InstalledDownloadableApp | UninstalledDownloadableApp | undefined;
