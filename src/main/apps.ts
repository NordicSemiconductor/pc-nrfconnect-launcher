/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import type { PackageJson } from 'pc-nrfconnect-shared';

import {
    AppSpec,
    AppWithError,
    DownloadableApp,
    InstalledDownloadableApp,
    LocalApp,
} from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { LOCAL, Source } from '../ipc/sources';
import { downloadAppInfos, readAppInfos } from './appInfo';
import { getAppsLocalDir, getNodeModulesDir } from './config';
import { ifExists, listDirectories, readJsonFile } from './fileUtil';
import {
    downloadSourceJsonToFile,
    getAllSources,
    sourceJsonExistsLocally,
} from './sources';

export const installedAppPath = (app: AppSpec) => {
    const appDir =
        app.source === LOCAL
            ? getAppsLocalDir()
            : getNodeModulesDir(app.source);
    return path.join(appDir, app.name);
};

const defined = <X>(item?: X): item is X => item != null;

export const isInstalled = (app: AppSpec) =>
    fs.pathExistsSync(installedAppPath(app));

export const localApp = (appName: string): AppSpec => ({
    source: LOCAL,
    name: appName,
});

export const installedApp = (
    app: DownloadableApp
): InstalledDownloadableApp => {
    const appPath = installedAppPath(app);
    const resourcesPath = path.join(appPath, 'resources');

    const packageJson = readJsonFile<PackageJson>(
        path.join(appPath, 'package.json')
    );

    return {
        name: packageJson.name,
        source: app.source,

        description: packageJson.description ?? app.description,
        displayName: packageJson.displayName ?? app.displayName,

        engineVersion: packageJson.engines?.nrfconnect,

        currentVersion: packageJson.version,
        latestVersion: app.latestVersion,
        versions: app.versions,

        path: appPath,
        iconPath:
            ifExists(path.join(resourcesPath, 'icon.svg')) ??
            path.join(resourcesPath, 'icon.png'),

        homepage: packageJson.homepage ?? app.homepage,
        repositoryUrl: packageJson.repository?.url,

        releaseNotes: app.releaseNotes,
    };
};

const addInformationForInstalledApps = (apps: DownloadableApp[]) => {
    const appsWithErrors: AppWithError[] = [];

    const appsWithInstallInfos = apps.map(app => {
        if (!isInstalled(app)) {
            return app;
        }

        try {
            return installedApp(app);
        } catch (error) {
            appsWithErrors.push({
                reason: error,
                path: installedAppPath(app),
                name: app.name,
                source: app.source,
            });

            return undefined;
        }
    });

    return {
        apps: appsWithInstallInfos.filter(defined),
        appsWithErrors,
    };
};

const getAllAppsInSource = async (source: Source) => {
    if (!sourceJsonExistsLocally(source)) {
        /* If we never downloaded the meta files for a source,
           then we must download them at least once, regardless
           of whether the users selected "Check for updates at startup"
        */

        // FIXME later: For the official source use local copies of the meta files instead. Maybe even use copies of the apps.
        await downloadSourceJsonToFile(source);
        return downloadAppInfos(source);
    }

    return readAppInfos(source);
};

export const getDownloadableApps = async () => {
    const sourcesWithErrors: Source[] = [];

    const results = await Promise.all(
        getAllSources().map(async source => {
            try {
                const apps = await getAllAppsInSource(source);

                return addInformationForInstalledApps(apps);
            } catch (error) {
                sourcesWithErrors.push(source);
                return {
                    apps: [],
                    appsWithErrors: [],
                };
            }
        })
    );

    return {
        apps: results.flatMap(result => result.apps),
        appsWithErrors: results.flatMap(result => result.appsWithErrors),
        sourcesWithErrors,
    };
};

const consistentAppAndDirectoryName = (app: LocalApp) =>
    app.name === path.basename(app.path);

export const getLocalApp = (appName: string): LocalApp => ({
    ...installedApp({
        name: appName,
        source: LOCAL,
        displayName: appName,
        description: '',
        versions: {},
        latestVersion: '',
        iconPath: '',
    }),
    source: LOCAL,
});

export const getLocalApps = (consistencyCheck = true) => {
    const localApps = listDirectories(getAppsLocalDir()).map(getLocalApp);

    if (consistencyCheck) {
        localApps
            .filter(app => !consistentAppAndDirectoryName(app))
            .forEach(app => {
                showErrorDialog(
                    `The local app at the path \`${app.path}\` has the name ` +
                        `\`${app.name}\`, which does not match the directory. ` +
                        `Not showing this app.`
                );
            });
    }

    return localApps.filter(consistentAppAndDirectoryName);
};
