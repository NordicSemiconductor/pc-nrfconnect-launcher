/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import { LocalApp } from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { Source } from '../ipc/sources';
import {
    addInformationForInstalledApps,
    createDownloadableApp,
    downloadAppInfos,
    getLocalApp,
    readAppInfos,
} from './appInfo';
import { getAppsLocalDir } from './config';
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

export const getDownloadableApps = async () => {
    const sourcesWithErrors: Source[] = [];

    const results = await Promise.all(
        getAllSources().map(async source => {
            try {
                const apps = (await getAllAppInfosInSource(source)).map(
                    createDownloadableApp(source.name)
                );

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
