/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    AppInfo,
    parseAppLegacyPackageJson,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import fs from 'fs-extra';
import path, { basename } from 'path';

import {
    AppSpec,
    DownloadableApp,
    InstalledDownloadableApp,
    LocalApp,
    WithdrawnApp,
} from '../../ipc/apps';
import { LOCAL, Source, SourceName } from '../../ipc/sources';
import { getAppsLocalDir, getAppsRootDir, getNodeModulesDir } from '../config';
import { ifExists, readFile, readJsonFile, writeJsonFile } from '../fileUtil';
import { appResourceProperties } from './appResource';
import { getSource, isInListOfWithdrawnApps } from './sources';

export const localApp = (appName: string): AppSpec => ({
    source: LOCAL,
    name: appName,
});

// FIXME later: Check all usages of this function and whether the app's meta data can rather be used
export const installedAppPath = (app: AppSpec) => {
    const appDir =
        app.source === LOCAL
            ? getAppsLocalDir()
            : getNodeModulesDir(app.source);
    return path.join(appDir, app.name);
};

export const isInstalled = (
    app: DownloadableApp
): app is InstalledDownloadableApp | WithdrawnApp =>
    fs.pathExistsSync(installedAppPath(app));

// FIXME later: This should not be needed anymore. Remove it.
const appInfoFile = (appSpec: AppSpec) =>
    path.join(getAppsRootDir(appSpec.source), `${appSpec.name}.json`);

export const readAppInfoFile = (appSpec: AppSpec) =>
    readJsonFile<AppInfo>(appInfoFile(appSpec));

export const readAppInfoFileIfExists = (appSpec: AppSpec) =>
    readJsonFile<AppInfo | null>(appInfoFile(appSpec), null);

export const appInfoExists = (appSpec: AppSpec) =>
    fs.existsSync(appInfoFile(appSpec));

export const readAppInfo = (appSpec: AppSpec) => {
    const source = getSource(appSpec.source);
    if (source == null) {
        throw new Error(
            `Unable to find source \`${appSpec.source}\` for app \`${appSpec.name}\``
        );
    }

    return readAppInfoFile(appSpec);
};

export const writeAppInfo = (
    appInfo: AppInfo,
    source: Source,
    { keepInstallInfo = false } = {}
) => {
    const appSpec = { name: appInfo.name, source: source.name };
    const mergedContent = { ...appInfo };

    if (keepInstallInfo) {
        const installedInfo = readAppInfoFileIfExists(appSpec)?.installed;

        if (installedInfo != null) {
            mergedContent.installed = installedInfo;
        }
    }

    writeJsonFile(appInfoFile(appSpec), mergedContent);

    return mergedContent;
};

export const addDownloadAppData =
    (source: SourceName) => (appInfo: AppInfo) => {
        const appSpec = { name: appInfo.name, source };
        return {
            ...appInfo,
            ...appResourceProperties(appSpec, appInfo.homepage),

            source,
            isWithdrawn: isInListOfWithdrawnApps(
                source,
                basename(appInfoFile(appSpec))
            ),
        } as DownloadableApp;
    };

export const addInstalledAppData = (
    app: Omit<
        InstalledDownloadableApp | WithdrawnApp,
        'currentVersion' | 'path' | 'iconPath'
    >
): InstalledDownloadableApp | WithdrawnApp => {
    const appPath = installedAppPath(app);
    const resourcesPath = path.join(appPath, 'resources');

    const packageJsonResult = parseAppLegacyPackageJson(
        readFile(path.join(appPath, 'package.json'))
    );

    if (!packageJsonResult.success) {
        throw new Error(packageJsonResult.error.message);
    }

    const packageJson = packageJsonResult.data;

    return {
        ...app,

        name: packageJson.name,

        description: packageJson.description ?? app.description,
        displayName: packageJson.displayName ?? app.displayName,

        engineVersion: packageJson.engines.nrfconnect,

        currentVersion: packageJson.version,

        iconPath:
            ifExists(path.join(resourcesPath, 'icon.svg')) ??
            path.join(resourcesPath, 'icon.png'),

        homepage: packageJson.homepage ?? app.homepage,
        repositoryUrl: packageJson.repository?.url,
        html: packageJson.nrfConnectForDesktop?.html,
    };
};

export const getLocalApp = (appName: string): LocalApp => ({
    ...addInstalledAppData({
        name: appName,
        source: LOCAL,
        displayName: appName,
        description: '',
        versions: {},
        latestVersion: '',
        installed: {
            path: installedAppPath(localApp(appName)),
        },
        isWithdrawn: false,
    }),
    source: LOCAL,
});
