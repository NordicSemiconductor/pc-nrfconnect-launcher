/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path, { basename } from 'path';
import type { AppInfo, PackageJson } from 'pc-nrfconnect-shared';

import {
    AppSpec,
    DownloadableApp,
    InstalledDownloadableApp,
    LocalApp,
    WithdrawnApp,
} from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { LOCAL, Source, SourceName } from '../ipc/sources';
import { getAppsLocalDir, getAppsRootDir, getNodeModulesDir } from './config';
import describeError from './describeError';
import { createJsonFile, ifExists, readJsonFile } from './fileUtil';
import { downloadToFile, downloadToJson } from './net';
import { getAppUrls, getSource, isInListOfWithdrawnApps } from './sources';

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

const defined = <X>(item?: X): item is X => item != null;

export const isInstalled = (
    app: DownloadableApp
): app is InstalledDownloadableApp | WithdrawnApp =>
    fs.pathExistsSync(installedAppPath(app));

const iconPath = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}.svg`);

const releaseNotesPath = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}-Changelog.md`);

// FIXME later: This should not be needed anymore. Remove it.
const appInfoFile = (appSpec: AppSpec) =>
    path.join(getAppsRootDir(appSpec.source), `${appSpec.name}.json`);

export const readAppInfoFile = (appSpec: AppSpec) =>
    readJsonFile<AppInfo>(appInfoFile(appSpec));

export const readAppInfoFileIfExists = (appSpec: AppSpec) => {
    try {
        return readJsonFile<AppInfo>(appInfoFile(appSpec));
    } catch (error) {
        return undefined;
    }
};

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

    createJsonFile(appInfoFile(appSpec), mergedContent);
};

const downloadResource = async (url: string, filePath: string) => {
    try {
        await downloadToFile(url, filePath);
    } catch (e) {
        console.debug(
            'Unable to fetch resource, ignoring this as non-critical.',
            describeError(e)
        );
    }
};

const replacePrLinks = (releaseNotes: string, homepage?: string) =>
    homepage == null
        ? releaseNotes
        : releaseNotes.replace(
              /#(\d+)/g,
              (match, pr) => `[${match}](${homepage}/pull/${pr})`
          );

const readReleaseNotes = (app: AppSpec & { homepage?: string }) => {
    try {
        const releaseNotes = fs.readFileSync(releaseNotesPath(app), 'utf-8');
        const prettyReleaseNotes = replacePrLinks(releaseNotes, app.homepage);

        return prettyReleaseNotes;
    } catch (error) {
        // We assume an error here means that the release notes just were not downloaded yet.
        return undefined;
    }
};

const downloadIconAndReleaseNotes = (appInfo: AppInfo, source: SourceName) => {
    const appSpec = { name: appInfo.name, source };
    return Promise.all([
        downloadResource(appInfo.iconUrl, iconPath(appSpec)),
        downloadResource(appInfo.releaseNotesUrl, releaseNotesPath(appSpec)),
    ]);
};

export const addDownloadAppData =
    (source: SourceName) => (appInfo: AppInfo) => {
        const appSpec = { name: appInfo.name, source };
        return {
            ...appInfo,

            source,
            iconPath: iconPath(appSpec),
            releaseNotes: readReleaseNotes({
                name: appInfo.name,
                source,
            }),
            isWithdrawn: isInListOfWithdrawnApps(
                source,
                basename(appInfoFile(appSpec))
            ),
        } as DownloadableApp;
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

            writeAppInfo(appInfo, source, { keepInstallInfo: true });

            await downloadIconAndReleaseNotes(appInfo, source.name);

            return appInfo;
        })
    );

    return downloadableApps.filter(defined);
};

export const addInstalledAppData = (
    app: Omit<
        InstalledDownloadableApp | WithdrawnApp,
        'currentVersion' | 'path' | 'iconPath'
    >
): InstalledDownloadableApp | WithdrawnApp => {
    const appPath = installedAppPath(app);
    const resourcesPath = path.join(appPath, 'resources');

    const packageJson = readJsonFile<PackageJson>(
        path.join(appPath, 'package.json')
    );

    return {
        ...app,

        name: packageJson.name,

        description: packageJson.description ?? app.description,
        displayName: packageJson.displayName ?? app.displayName,

        engineVersion: packageJson.engines?.nrfconnect,

        currentVersion: packageJson.version,

        iconPath:
            ifExists(path.join(resourcesPath, 'icon.svg')) ??
            path.join(resourcesPath, 'icon.png'),

        homepage: packageJson.homepage ?? app.homepage,
        repositoryUrl: packageJson.repository?.url,
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
