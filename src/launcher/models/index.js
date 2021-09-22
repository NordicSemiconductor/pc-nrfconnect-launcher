/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

const ImmutableApp = Record({
    name: null,
    displayName: null,
    description: null,
    homepage: null,
    currentVersion: null,
    latestVersion: null,
    engineVersion: null,
    path: null,
    iconPath: null,
    shortcutIconPath: null,
    isOfficial: null,
    sharedVersion: null,
    source: null,
    url: null,
    releaseNote: null,
    upgradeAvailable: null,
    repositoryUrl: null,
});

function getImmutableApp(app) {
    return new ImmutableApp({
        name: app.name,
        displayName: app.displayName,
        description: app.description,
        homepage: app.homepage,
        currentVersion: app.currentVersion,
        latestVersion: app.latestVersion,
        engineVersion: app.engineVersion,
        path: app.path,
        iconPath: app.iconPath,
        shortcutIconPath: app.shortcutIconPath,
        isOfficial: app.isOfficial,
        source: app.source,
        sharedVersion: app.sharedVersion,
        url: app.url,
        releaseNote: app.releaseNote,
        upgradeAvailable: app.upgradeAvailable,
        repositoryUrl: app.repositoryUrl,
    });
}

export { getImmutableApp as default };
