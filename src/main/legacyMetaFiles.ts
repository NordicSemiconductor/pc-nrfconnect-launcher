/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import { PackageJson } from 'pc-nrfconnect-shared';

import { Source } from '../ipc/sources';
import { installedAppPath, writeAppInfo } from './appInfo';
import { getAppsRootDir, getNodeModulesDir } from './config';
import { readJsonFile } from './fileUtil';
import { writeSourceJson } from './sources';

type AppName = `pc-nrfconnect-${string}`;

interface UpdatesJson {
    [app: AppName]: string;
}

interface LegacyAppInfo {
    displayName: string;
    description: string;
    url: string;
    homepage?: string;
}

interface AppsJson {
    _source?: string;
    [app: AppName]: LegacyAppInfo;
}

const updatesJsonFile = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'updates.json');

const appsJsonFile = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'apps.json');

export const legacyMetaFilesExist = (source: Source) =>
    fs.existsSync(appsJsonFile(source));

const getSource = (appsJson: AppsJson) => appsJson._source ?? 'official'; // eslint-disable-line no-underscore-dangle

const appEntries = (appsJson: AppsJson): [string, LegacyAppInfo][] =>
    Object.entries(appsJson).filter(([key]) => key !== '_source');

export const convertAppsJsonToSourceJson = (appsJson: AppsJson) => ({
    name: getSource(appsJson),
    apps: appEntries(appsJson).map(([, appInfo]) => `${appInfo.url}.json`),
});

export const createNewAppInfo = (
    appName: AppName,
    appsJson: AppsJson,
    updatesJson: UpdatesJson,
    packageJson: PackageJson | null
) => {
    const appInfo = appsJson[appName];

    const latestVersion = updatesJson[appName];
    return {
        name: appName,
        displayName: packageJson?.displayName ?? appInfo.displayName,
        description: packageJson?.description ?? appInfo.description,
        homepage: packageJson?.homepage ?? appInfo.homepage,
        iconUrl: `${appInfo.url}.svg`,
        releaseNotesUrl: `${appInfo.url}-Changelog.md`,
        latestVersion,
        versions: {
            [latestVersion]: {
                tarballUrl: `${appInfo.url}-${latestVersion}.tgz`,
            },
        },
        installed:
            packageJson == null
                ? undefined
                : {
                      path: installedAppPath({
                          name: appName,
                          source: getSource(appsJson),
                      }),
                  },
    };
};

export const migrateLegacyMetaFiles = (source: Source) => {
    const appsJson = readJsonFile<AppsJson>(appsJsonFile(source));
    const updatesJson = readJsonFile<UpdatesJson>(updatesJsonFile(source), {});

    writeSourceJson(source, convertAppsJsonToSourceJson(appsJson));

    appEntries(appsJson).forEach(([appName]) => {
        const packageJson = readJsonFile<PackageJson | null>(
            path.join(getNodeModulesDir(source.name), appName, 'package.json'),
            null
        );

        writeAppInfo(
            createNewAppInfo(
                appName as AppName,
                appsJson,
                updatesJson,
                packageJson
            ),
            source
        );
    });

    // FIXME later: Also support the withdrawn app pc-nrfconnect-gettingstarted
};
