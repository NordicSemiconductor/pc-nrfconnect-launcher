/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import { AppSpec, AppWithError, DownloadableApp, LocalApp } from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { Source, SourceName } from '../ipc/sources';
import {
    addInformationForInstalledApps,
    createDownloadableApp,
    downloadAppInfos,
    getInstalledApp,
    getLocalApp,
    readAppInfo,
    readAppInfos,
} from './appInfo';
import { getAppsLocalDir, getNodeModulesDir } from './config';
import { listDirectories } from './fileUtil';
import {
    downloadSourceJsonToFile,
    getAllSources,
    sourceJsonExistsLocally,
} from './sources';

const getAllAppInfosInSource = async (source: Source) => {
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
                getInstalledApp(
                    createDownloadableApp(app.source)(readAppInfo(app))
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

export const getDownloadableApps = async () => {
    const sourcesWithErrors: Source[] = [];
    const apps: DownloadableApp[] = [];
    const appsWithErrors: AppWithError[] = [];

    await Promise.all(
        getAllSources().map(async source => {
            try {
                const downloadableApps = (
                    await getAllAppInfosInSource(source)
                ).map(createDownloadableApp(source.name));

                const {
                    apps: withdrawnApps,
                    appsWithErrors: withdrawnAppsWithErrors,
                } = getWithdrawnApps(source.name, downloadableApps);

                const {
                    apps: downloadableInstalledApps,
                    appsWithErrors: downloadableInstalledAppsWithErrors,
                } = addInformationForInstalledApps(downloadableApps);

                apps.push(...withdrawnApps, ...downloadableInstalledApps);
                appsWithErrors.push(
                    ...withdrawnAppsWithErrors,
                    ...downloadableInstalledAppsWithErrors
                );
            } catch (error) {
                sourcesWithErrors.push(source);
            }
        })
    );

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
