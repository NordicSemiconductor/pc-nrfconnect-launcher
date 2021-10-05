/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface App {
    name?: string;
    displayName?: string;
    description?: string;
    homepage?: string;
    currentVersion?: string;
    latestVersion?: string;
    engineVersion?: string;
    path?: string;
    iconPath?: string;
    shortcutIconPath?: string;
    isOfficial?: string;
    sharedVersion?: string;
    source?: string;
    url?: string;
    releaseNote?: string;
    upgradeAvailable?: string;
    repositoryUrl?: string;
}
