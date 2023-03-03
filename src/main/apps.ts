/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path, { basename } from 'path';

import {
    AppWithError,
    DownloadableApp,
    isWithdrawn,
    LocalApp,
} from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { Source } from '../ipc/sources';
import {
    addDownloadAppData,
    addInstalledAppData,
    downloadAppInfos,
    getLocalApp,
    installedAppPath,
    isInstalled,
    readAppInfo,
} from './appInfo';
import { getAppsLocalDir } from './config';
import { listDirectories } from './fileUtil';
import { maybeMigrateLegacyMetaFiles } from './legacyMetaFiles';
import { downloadAllSources, getAllAppUrls, getAllSources } from './sources';

const getAppSpec = (source: Source) => (appUrl: string) => ({
    name: basename(appUrl, '.json'),
    source: source.name,
});

const addInstalledAppDatas = (downloadableApps: DownloadableApp[]) => {
    const appsWithErrors: AppWithError[] = [];
    const apps: DownloadableApp[] = [];

    downloadableApps.forEach(app => {
        if (isWithdrawn(app) && !isInstalled(app)) {
            return;
        }

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
            maybeMigrateLegacyMetaFiles(source);

            // FIXME later: For the official source use local copies of the meta files. Maybe even use copies of the apps.

            // FIXME later: Change addInstalledAppDatas so that it can be part of the map chain
            const result = addInstalledAppDatas(
                getAllAppUrls(source)
                    .map(getAppSpec(source))
                    .map(readAppInfo)
                    .map(addDownloadAppData(source.name))
            );

            apps.push(...result.apps);
            appsWithErrors.push(...result.appsWithErrors);
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
