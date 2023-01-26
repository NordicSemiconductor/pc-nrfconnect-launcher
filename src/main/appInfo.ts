/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import type { AppInfo } from 'pc-nrfconnect-shared';

import { AppSpec, DownloadableAppInfo } from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { Source, SourceName } from '../ipc/sources';
import { getAppsRootDir } from './config';
import describeError from './describeError';
import { createJsonFile, readJsonFile } from './fileUtil';
import { downloadToFile, downloadToJson } from './net';
import { downloadAllSources, getAppUrls, getSource } from './sources';

const iconPath = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}.svg`);

const releaseNotesPath = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}-Changelog.md`);

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

    const appInfo = readAppInfoFile(appSpec);

    return createDownloadableAppInfo(source, appInfo);
};

const writeAppInfo = (appInfo: AppInfo, source: Source) => {
    const appSpec = { name: appInfo.name, source: source.name };

    const installedInfo = readAppInfoFileIfExists(appSpec)?.installed;

    const mergedContent = { ...appInfo };
    if (installedInfo != null) {
        mergedContent.installed = installedInfo;
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

const createDownloadableAppInfo = (
    source: Source,
    appInfo: AppInfo
): DownloadableAppInfo => ({
    name: appInfo.name,
    source: source.name,

    displayName: appInfo.displayName,
    description: appInfo.description,

    iconPath: iconPath({ name: appInfo.name, source: source.name }),
    releaseNotes: readReleaseNotes({
        name: appInfo.name,
        source: source.name,
    }),
    homepage: appInfo.homepage,
    latestVersion: appInfo.latestVersion,
    versions: appInfo.versions,
});

const defined = <X>(item?: X): item is X => item != null;

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

            writeAppInfo(appInfo, source);

            await downloadIconAndReleaseNotes(appInfo, source.name);

            return createDownloadableAppInfo(source, appInfo);
        })
    );

    // FIXME later: Handle if there are local app info files which do not exist on the server any longer

    return downloadableApps.filter(defined);
};

export const downloadLatestAppInfos = async () => {
    const { successfulSources, sourcesFailedToDownload } =
        await downloadAllSources();
    const apps = (
        await Promise.all(successfulSources.map(downloadAppInfos))
    ).flat();

    return {
        apps,
        sourcesFailedToDownload,
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
