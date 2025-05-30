/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AppInfo } from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import path from 'path';

import type { SourceName } from '../../common/sources';
import type { AppSpec } from '../../ipc/apps';
import { getAppsRootDir } from '../config';
import describeError from '../describeError';
import { readFile } from '../fileUtil';
import { downloadToFile } from '../net';

const iconPath = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}.svg`);

const releaseNotesPath = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}-Changelog.md`);

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

const readReleaseNotes = (app: AppSpec, homepage?: string) => {
    try {
        const releaseNotes = readFile(releaseNotesPath(app));
        const prettyReleaseNotes = replacePrLinks(releaseNotes, homepage);

        return prettyReleaseNotes;
    } catch (error) {
        // We assume an error here means that the release notes just were not downloaded yet.
        return undefined;
    }
};

export const downloadAppResources = (appInfo: AppInfo, source: SourceName) => {
    const appSpec = { name: appInfo.name, source };
    return Promise.all([
        downloadResource(appInfo.iconUrl, iconPath(appSpec)),
        downloadResource(appInfo.releaseNotesUrl, releaseNotesPath(appSpec)),
    ]);
};

export const appResourceProperties = (app: AppSpec, homepage?: string) => ({
    iconPath: iconPath(app),
    releaseNotes: readReleaseNotes(app, homepage),
});
