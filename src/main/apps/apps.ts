/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AppInfo } from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import { omit } from 'lodash';
import path, { basename } from 'path';

import { Source, type SourceWithError } from '../../common/sources';
import {
    AppWithError,
    DownloadableApp,
    isWithdrawn,
    LocalApp,
    UninstalledDownloadableApp,
} from '../../ipc/apps';
import { inRenderer } from '../../ipc/showErrorDialog';
import { getAppsLocalDir } from '../config';
import describeError from '../describeError';
import { listDirectories } from '../fileUtil';
import { downloadToJson } from '../net';
import {
    addDownloadAppData,
    addInstalledAppData,
    appInfoExists,
    getLocalApp,
    installedAppPath,
    isInstalled,
    readAppInfo,
    writeAppInfo,
} from './app';
import { downloadAppResources } from './appResource';
import { maybeMigrateLegacyMetaFiles } from './dataMigration/legacyMetaFiles';
import {
    downloadAllSources,
    getAllSources,
    getAppUrls,
} from './sources/sources';

const defined = <X>(item?: X): item is X => item != null;

const getAppSpec = (source: Source) => (appUrl: string) => ({
    name: basename(appUrl, '.json'),
    source: source.name,
});

/* Motivation: If users switch back to a launcher pre 4.1, uninstalls an app
   and then goes back to launcher 4.1, the app would still contain an
   `installed` property in the app meta file, even though it is not installed.
   So we remove it from the object. */
const withoutInstalledProp = (
    app: UninstalledDownloadableApp & { installed?: unknown },
): UninstalledDownloadableApp => omit(app, 'installed');

const addInstalledAppDatas = (downloadableApps: DownloadableApp[]) => {
    const appsWithErrors: AppWithError[] = [];
    const apps: DownloadableApp[] = [];

    downloadableApps.forEach(app => {
        if (isWithdrawn(app) && !isInstalled(app)) {
            return;
        }

        if (!isInstalled(app)) {
            apps.push(withoutInstalledProp(app));
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

// appInfo.versions may contain a property `undefined` as the result of a broken migration.
const hasValidAppInfo = (appInfo: AppInfo) =>
    appInfo.versions.undefined == null;

export const getDownloadableApps = () => {
    const sourcesWithErrors: SourceWithError[] = [];
    const apps: DownloadableApp[] = [];
    const appsWithErrors: AppWithError[] = [];

    getAllSources().forEach(source => {
        try {
            maybeMigrateLegacyMetaFiles(source);

            // FIXME later: For the official source use local copies of the meta files. Maybe even use copies of the apps.

            // FIXME later: Change addInstalledAppDatas so that it can be part of the map chain
            const result = addInstalledAppDatas(
                getAppUrls(source, { includeWithdrawnApps: true })
                    .map(getAppSpec(source))
                    .filter(appInfoExists)
                    .map(readAppInfo)
                    .filter(hasValidAppInfo)
                    .map(addDownloadAppData(source.name)),
            );

            apps.push(...result.apps);
            appsWithErrors.push(...result.appsWithErrors);
        } catch (error) {
            sourcesWithErrors.push({
                source,
                reason:
                    error instanceof Error ? error.stack : describeError(error),
            });
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
                inRenderer.showErrorDialog(
                    `The local app at the path \`${app.installed.path}\` has the name ` +
                        `\`${app.name}\`, which does not match the directory. ` +
                        `Not showing this app.`,
                );
            });
    }

    return localApps.filter(consistentAppAndDirectoryName);
};

export const downloadLatestAppInfos = async () => {
    const { sources, sourcesWithErrors } = await downloadAllSources();

    const downloadableAppsPromises = sources.map(async source =>
        (await downloadAppInfos(source)).map(addDownloadAppData(source.name)),
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
            const appInfo = await downloadToJson<AppInfo>(appUrl);

            if (path.basename(appUrl) !== `${appInfo.name}.json`) {
                inRenderer.showErrorDialog(
                    `At \`${appUrl}\` an app is found ` +
                        `by the name \`${appInfo.name}\`, which does ` +
                        `not match the URL. This app will be ignored.`,
                );
                return undefined;
            }

            const mergedAppinfo = writeAppInfo(appInfo, source, {
                keepInstallInfo: true,
            });

            await downloadAppResources(appInfo, source.name);

            return mergedAppinfo;
        }),
    );

    return downloadableApps.filter(defined);
};
