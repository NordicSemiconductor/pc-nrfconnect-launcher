/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';

import { AppSpec, AppWithError, DownloadableApp, LocalApp } from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { Source, SourceName } from '../ipc/sources';
import {
    addDownloadAppData,
    addInstalledAppData,
    downloadAppInfos,
    getLocalApp,
    installedAppPath,
    isInstalled,
    readAppInfo,
} from './appInfo';
import { getAppsLocalDir, getAppsRootDir, getNodeModulesDir } from './config';
import { listDirectories } from './fileUtil';
import {
    legacyMetaFilesExist,
    migrateLegacyMetaFiles,
} from './legacyMetaFiles';
import {
    downloadAllSources,
    getAllSources,
    sourceJsonExistsLocally,
} from './sources';

const getAllAppInfos = (source: Source) => {
    if (!sourceJsonExistsLocally(source) && legacyMetaFilesExist(source)) {
        migrateLegacyMetaFiles(source);
    }

    // FIXME later: For the official source use local copies of the meta files. Maybe even use copies of the apps.

    return readAppInfos(source);
};

const getWithdrawnApps = (
    sourceName: SourceName,
    availableApps: DownloadableApp[]
) => {
    const sourceDir = getNodeModulesDir(sourceName);

    const availableAppsPaths = availableApps.map(app =>
        path.join(sourceDir, app.name)
    );
    const installedAppsPaths = listDirectories(sourceDir).map(appPath =>
        path.join(sourceDir, appPath)
    );

    const withdrawnAppsPaths = installedAppsPaths.filter(
        appPath => !availableAppsPaths.includes(appPath)
    );

    const apps: DownloadableApp[] = [];
    const appsWithErrors: AppWithError[] = [];

    withdrawnAppsPaths.forEach(withdrawnAppPath => {
        const app: AppSpec = {
            name: path.basename(withdrawnAppPath),
            source: sourceName,
        };

        try {
            apps.push(
                addInstalledAppData(
                    addDownloadAppData(app.source)(readAppInfo(app))
                )
            );
        } catch (error) {
            appsWithErrors.push({
                ...app,
                reason: error,
                path: withdrawnAppPath,
            });
        }
    });

    return { apps, appsWithErrors };
};

export const addInstalledAppDatas = (downloadableApps: DownloadableApp[]) => {
    const appsWithErrors: AppWithError[] = [];
    const apps: DownloadableApp[] = [];

    downloadableApps.forEach(app => {
        if (!isInstalled(app)) {
            apps.push(app);
            return;
        }

        try {
            apps.push(addInstalledAppData(app));
        } catch (error) {
            appsWithErrors.push({
                reason: error,
                path: installedAppPath(app),
                name: app.name,
                source: app.source,
            });
        }
    });

    return { apps, appsWithErrors };
};

export const getDownloadableApps = () => {
    const sourcesWithErrors: Source[] = [];
    const apps: DownloadableApp[] = [];
    const appsWithErrors: AppWithError[] = [];

    getAllSources().forEach(source => {
        try {
            const downloadableApps = getAllAppInfos(source).map(
                addDownloadAppData(source.name)
            );

            const {
                apps: withdrawnApps,
                appsWithErrors: withdrawnAppsWithErrors,
            } = getWithdrawnApps(source.name, downloadableApps);

            const {
                apps: downloadableInstalledApps,
                appsWithErrors: downloadableInstalledAppsWithErrors,
            } = addInstalledAppDatas(downloadableApps);

            apps.push(...withdrawnApps, ...downloadableInstalledApps);
            appsWithErrors.push(
                ...withdrawnAppsWithErrors,
                ...downloadableInstalledAppsWithErrors
            );
        } catch (error) {
            sourcesWithErrors.push(source);
        }
    });

    return { apps, appsWithErrors, sourcesWithErrors };
};

const consistentAppAndDirectoryName = (app: LocalApp) =>
    app.name === path.basename(app.path);

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

export const downloadLatestAppInfos = async () => {
    const { sources, sourcesWithErrors } = await downloadAllSources();

    const downloadableAppsPromises = sources.map(async source =>
        (await downloadAppInfos(source)).map(addDownloadAppData(source.name))
    );
    const downloadableApps = (
        await Promise.all(downloadableAppsPromises)
    ).flat();

    const { apps, appsWithErrors } = addInstalledAppDatas(downloadableApps);

    return {
        apps,
        appsWithErrors,
        sourcesWithErrors,
    };
};

const getAllAppSpecs = (source: Source): AppSpec[] => {
    const filesToExclude = ['source.json', 'apps.json', 'updates.json'];

    return fs
        .readdirSync(getAppsRootDir(source.name))
        .filter(name => !filesToExclude.includes(name))
        .filter(name => name.endsWith('.json'))
        .map(name => name.replace(/\.json$/, ''))
        .map(name => ({ name, source: source.name }));
};

export const readAppInfos = (source: Source) =>
    getAllAppSpecs(source).map(readAppInfo);
