/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AnyAction } from 'redux';

import { DownloadableApp, LaunchableApp, LocalApp } from '../../ipc/apps';
import { SourceName } from '../../ipc/sources';

export const downloadLatestAppInfoAction: () => AnyAction;

export const downloadLatestAppInfoSuccessAction: (
    updateCheckDate?: Date
) => AnyAction;

export const loadDownloadableAppsSuccess: (
    apps: DownloadableApp[],
    appToUpdate?: { name: string; source: SourceName }
) => AnyAction;

export const showConfirmLaunchDialogAction: (
    text: string,
    app: LaunchableApp
) => AnyAction;

export const upgradeDownloadableAppAction: (
    name: string,
    version: string,
    source: SourceName
) => AnyAction;

export const upgradeDownloadableAppErrorAction: () => AnyAction;

export const upgradeDownloadableAppSuccessAction: (
    name: string,
    version: string,
    source: SourceName
) => AnyAction;

export const removeDownloadableAppAction: (
    name: string,
    source: SourceName
) => AnyAction;

export const removeDownloadableAppSuccessAction: (
    name: string,
    source: SourceName
) => AnyAction;

export const removeDownloadableAppErrorAction: () => AnyAction;

export const installDownloadableAppAction: (
    name: string,
    source: SourceName
) => AnyAction;

export const installDownloadableAppSuccessAction: (
    name: string,
    source: SourceName
) => AnyAction;

export const installDownloadableAppErrorAction: () => AnyAction;

export const loadDownloadableAppsAction: () => AnyAction;

export const loadDownloadableAppsError: () => AnyAction;

export const setAppReleaseNoteAction: (
    source: SourceName,
    name: string,
    releaseNote: string
) => AnyAction;

export const loadLocalAppsAction: () => AnyAction;

export const loadLocalAppsSuccess: (apps: LocalApp[]) => AnyAction;

export const loadLocalAppsError: () => AnyAction;

export const setAppIconPath: (
    source: string,
    name: string,
    iconPath: string
) => AnyAction;

export const downloadLatestAppInfoErrorAction: () => AnyAction;
