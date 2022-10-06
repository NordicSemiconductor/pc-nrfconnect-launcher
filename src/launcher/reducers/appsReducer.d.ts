/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    InstalledDownloadableApp,
    UninstalledDownloadableApp,
} from '../../ipc/apps';
import type { SourceName } from '../../ipc/sources';
import type { RootState } from '..';

export const isAppUpdateAvailable: (state: RootState) => boolean;

export const getUpdateCheckStatus: (state: RootState) => {
    isCheckingForUpdates: boolean;
    lastUpdateCheckDate: null | Date;
};

export const getDownloadableApp: (app: {
    name?: string;
    source?: SourceName;
}) => (
    state: RootState
) => InstalledDownloadableApp | UninstalledDownloadableApp | undefined;

export const getUpgradeableVisibleApps: (
    state: RootState
) => InstalledDownloadableApp[];

export const getAllSourceNamesSorted: (state: RootState) => SourceName[];
