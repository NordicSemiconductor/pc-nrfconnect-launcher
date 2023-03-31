/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path, { basename } from 'path';
import type { AppInfo } from 'pc-nrfconnect-shared';

import {
    AppWithError,
    DownloadableApp,
    isWithdrawn,
    LocalApp,
} from '../../ipc/apps';
import { showErrorDialog } from '../../ipc/showErrorDialog';
import { Source } from '../../ipc/sources';
import { getAppsLocalDir } from '../config';
import { listDirectories } from '../fileUtil';
import { downloadToJson } from '../net';
import {
    addDownloadAppData,
    addInstalledAppData,
    getLocalApp,
    installedAppPath,
    isInstalled,
    readAppInfo,
    writeAppInfo,
} from './app';
import { downloadAppResources } from './appResource';
import { maybeMigrateLegacyMetaFiles } from './legacyMetaFiles';
import {
    downloadAllSources,
    getAllAppUrls,
    getAllSources,
    getAppUrls,
} from './sources';

const defined = <X>(item?: X): item is X => item != null;

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
    app.name === path.basename(app.installed.path);

export const getLocalApps = (consistencyCheck = true) => {
    const localApps = listDirectories(getAppsLocalDir()).map(getLocalApp);

    if (consistencyCheck) {
        localApps
            .filter(app => !consistentAppAndDirectoryName(app))
            .forEach(app => {
                showErrorDialog(
                    `The local app at the path \`${app.installed.path}\` has the name ` +
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

export const downloadAppInfos = async (source: Source) => {
    const downloadableApps = await Promise.all(
        getAppUrls(source).map(async appUrl => {
            const appInfo = await downloadToJson<AppInfo>(appUrl, true);

            if (path.basename(appUrl) !== `${appInfo.name}.json`) {
                showErrorDialog(
                    `At \`${appUrl}\` an app is found ` +
                        `by the name \`${appInfo.name}\`, which does ` +
                        `not match the URL. This app will be ignored.`
                );
                return undefined;
            }

            const mergedAppinfo = writeAppInfo(appInfo, source, {
                keepInstallInfo: true,
            });

            await downloadAppResources(appInfo, source.name);

            return mergedAppinfo;
        })
    );

    return downloadableApps.filter(defined);
};
