/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AnyAction } from 'redux';

import { App } from '../../ipc/apps';
import type { SourceName } from '../../ipc/sources';
import type { AppThunk } from '..';

export const loadDownloadableApps: {
    (appName: string, appSource: SourceName): AppThunk;
    (): AppThunk;
};

export const setAppManagementSource: (
    source?: SourceName,
    show?: boolean
) => AppThunk;

export const downloadLatestAppInfoAction: () => AnyAction;

export const downloadLatestAppInfoSuccessAction: (
    updateCheckDate?: Date
) => AnyAction;

export const loadDownloadableAppsSuccess: (
    apps: App[],
    appToUpdate?: { name: string; source: string }
) => AnyAction;
