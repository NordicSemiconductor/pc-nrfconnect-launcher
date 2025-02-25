/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';

import packageJson from '../../package.json';
import type { TokenInformation } from './artifactoryToken';
import type { SourceName } from './sources';

type WindowState = {
    x?: number;
    y?: number;
    width: number;
    height: number;
    maximized: boolean;
};

export type ShownStates = {
    downloadable: boolean;
    installed: boolean;
};

interface Schema {
    lastBundledAppInstalledVersion: string;
    isQuickStartInfoShownBefore: boolean;
    lastWindowState: WindowState;
    updateCheck: {
        doOnStartup: boolean;
        lastUpdate?: Date;
    };
    appFilter: {
        hiddenSources: SourceName[];
        nameFilter: string;
        shownStates: ShownStates;
    };
    doNotShowAppleSiliconWarning?: boolean;
    encryptedArtifactoryToken?: string;
    artifactoryTokenInformation?: TokenInformation;
    doNotRemindDeprecatedSources?: boolean;
}

const store = new Store<Schema>();

export const resetStore = () => store.clear();

const defaultWindowSize = {
    width: 1024,
    height: 800,
    maximized: false,
};
export const getLastWindowState = () =>
    store.get('lastWindowState', defaultWindowSize);
export const setLastWindowState = (lastWindowState: WindowState) =>
    store.set('lastWindowState', lastWindowState);

export const getCheckForUpdatesAtStartup = () =>
    store.get('updateCheck')?.doOnStartup ?? true;
export const setCheckForUpdatesAtStartup = (checkUpdatesAtStartup: boolean) =>
    store.set('updateCheck.doOnStartup', checkUpdatesAtStartup);

export const getLastUpdateCheckDate = () => {
    const storedValue = store.get('updateCheck')?.lastUpdate;
    return storedValue == null ? undefined : new Date(storedValue);
};
export const setLastUpdateCheckDate = (lastUpdate: Date) =>
    store.set('updateCheck.lastUpdate', lastUpdate.toISOString());

export const getHiddenSources = () =>
    new Set(store.get('appFilter')?.hiddenSources ?? []);
export const setHiddenSources = (hiddenSources: Set<SourceName>) =>
    store.set('appFilter.hiddenSources', [...hiddenSources]);

export const getNameFilter = () => store.get('appFilter')?.nameFilter ?? '';
export const setNameFilter = (nameFilter: string) =>
    store.set('appFilter.nameFilter', nameFilter);

const defaultShownStates = {
    downloadable: true,
    installed: true,
};
export const getShownStates = () =>
    store.get('appFilter')?.shownStates ?? defaultShownStates;
export const setShownStates = (shownStates: ShownStates) =>
    store.set('appFilter.shownStates', shownStates);

export const getIsQuickStartInfoShownBefore = () =>
    store.get('isQuickStartInfoShownBefore', false);
export const setQuickStartInfoWasShown = () =>
    store.set('isQuickStartInfoShownBefore', true);

export const getBundledAppInstalled = () =>
    store.get('lastBundledAppInstalledVersion') === packageJson.version;

export const setBundledAppInstalled = () =>
    store.set('lastBundledAppInstalledVersion', packageJson.version);

export const setDoNotShowAppleSiliconWarning = () =>
    store.set('doNotShowAppleSiliconWarning', true);

export const getDoNotShowAppleSiliconWarning = () =>
    store.get('doNotShowAppleSiliconWarning', false);

export const getEncryptedArtifactoryToken = () =>
    store.get('encryptedArtifactoryToken');
export const setEncryptedArtifactoryToken = (token: string) =>
    store.set('encryptedArtifactoryToken', token);
export const removeEncryptedArtifactoryToken = () =>
    store.delete('encryptedArtifactoryToken');

export const getArtifactoryTokenInformation = () =>
    store.get('artifactoryTokenInformation');
export const setArtifactoryTokenInformation = (
    tokenInformation: TokenInformation
) => store.set('artifactoryTokenInformation', tokenInformation);
export const removeArtifactoryTokenInformation = () =>
    store.delete('artifactoryTokenInformation');

export const getDoNotRemindDeprecatedSources = () =>
    store.get('doNotRemindDeprecatedSources', false);
export const setDoNotRemindDeprecatedSources = () =>
    store.set('doNotRemindDeprecatedSources', true);
