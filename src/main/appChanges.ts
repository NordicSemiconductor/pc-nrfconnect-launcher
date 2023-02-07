/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app as electronApp, dialog } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import shasum from 'shasum';
import { uuid } from 'short-uuid';

import {
    appExists,
    AppSpec,
    DownloadableApp,
    failureReadingFile,
    InstalledDownloadableApp,
    InstallResult,
    successfulInstall,
} from '../ipc/apps';
import { LOCAL } from '../ipc/sources';
import {
    createDownloadableApp,
    getInstalledApp,
    getLocalApp,
    installedAppPath,
    isInstalled,
    readAppInfo,
    readAppInfoFile,
} from './appInfo';
import { getAppsLocalDir, getAppsRootDir } from './config';
import { deleteFile, listFiles, untar } from './fileUtil';
import { mkdir } from './mkdir';
import { downloadToFile } from './net';

const localApp = (appName: string): AppSpec => ({
    source: LOCAL,
    name: appName,
});

const getTmpFilename = (basename: string) =>
    path.join(electronApp.getPath('temp'), `${basename}-${uuid()}`);

const extractNpmPackage = async (
    appName: string,
    tgzFile: string,
    destinationDir: string
) => {
    const tmpDir = getTmpFilename(appName);

    await untar(tgzFile, tmpDir, 1);
    await fs.move(tmpDir, destinationDir, { overwrite: true });
};

/*
 * Get the app name from the given *.tgz archive file. Expects the
 * file name to be on the form "{name}-{version}.tgz".
 */
export const getNameFromNpmPackage = (tgzFile: string) => {
    const fileName = path.basename(tgzFile);
    const lastDash = fileName.lastIndexOf('-');
    if (lastDash > 0) {
        return fileName.substring(0, lastDash);
    }
    return null;
};

export const installLocalApp = async (
    tgzFilePath: string
): Promise<InstallResult> => {
    // Determine app name and path
    const appName = getNameFromNpmPackage(tgzFilePath);
    if (!appName) {
        return failureReadingFile(
            `Unable to get app name from archive: \`${tgzFilePath}\`. ` +
                `Expected file name format: \`{name}-{version}.tgz.\``
        );
    }
    const appPath = installedAppPath(localApp(appName));

    // Check if app exists
    if (isInstalled(localApp(appName))) {
        return appExists(appName, appPath);
    }

    // Extract app package
    mkdir(appPath);
    try {
        await extractNpmPackage(appName, tgzFilePath, appPath);
    } catch (error) {
        await fs.remove(appPath);
        return failureReadingFile(
            `Unable to extract app archive \`${tgzFilePath}\`.`,
            error
        );
    }

    const app = getLocalApp(appName);

    if (app.name !== appName) {
        await fs.remove(appPath);
        return failureReadingFile(
            `According to the filename \`${tgzFilePath}\`, the app should ` +
                `be called \`${appName}\`, but internally it is called ` +
                `\`${app.name}\`.`
        );
    }

    return successfulInstall(app);
};

export const removeLocalApp = (appName: string) =>
    fs.remove(installedAppPath(localApp(appName)));

const deleteFileOnSuccess = async (
    result: InstallResult,
    tgzFilePath: string
) => {
    if (result.type === 'success') {
        await deleteFile(tgzFilePath);
    }
};

const showErrorOnUnreadableFile = (result: InstallResult) => {
    if (
        result.type === 'failure' &&
        result.errorType === 'error reading file'
    ) {
        dialog.showErrorBox('Failed to install local app', result.errorMessage);
    }
};

const shouldRemoveExistingApp = (tgzFilePath: string, appPath: string) => {
    const clickedButton = dialog.showMessageBoxSync({
        type: 'question',
        title: 'Existing app directory',
        message:
            `Tried to extract archive ${tgzFilePath}, ` +
            `but app directory ${appPath} already exists.\n\n` +
            'Do you want to remove existing app in order to extract the archive?',
        buttons: ['Remove', 'Cancel'],
    });

    return clickedButton === 0;
};

const confirmOverwritingOnExistingApp = async (
    result: InstallResult,
    tgzFilePath: string
) => {
    if (
        result.type === 'failure' &&
        result.errorType === 'error because app exists' &&
        shouldRemoveExistingApp(tgzFilePath, result.appPath)
    ) {
        await fs.remove(result.appPath);
        const resultOfRetry = await installLocalApp(tgzFilePath);

        if (resultOfRetry.type === 'success') {
            await deleteFile(tgzFilePath);
        }
    }
};

export const installAllLocalAppArchives = () => {
    const tgzFiles = listFiles(getAppsLocalDir(), /\.tgz$/);
    return tgzFiles.reduce(
        (prev, tgzFile) =>
            prev.then(async () => {
                const tgzFilePath = path.join(getAppsLocalDir(), tgzFile);

                const result = await installLocalApp(tgzFilePath);

                await deleteFileOnSuccess(result, tgzFilePath);
                await confirmOverwritingOnExistingApp(result, tgzFilePath);
                showErrorOnUnreadableFile(result);
            }),
        Promise.resolve<unknown>(undefined)
    );
};

export const removeDownloadableApp = async (app: AppSpec) => {
    const appPath = installedAppPath(app);
    if (!appPath.includes('node_modules')) {
        throw new Error(
            'Sanity check failed when trying ' +
                `to remove app directory ${appPath}. The directory does not ` +
                'have node_modules in its path.'
        );
    }

    const tmpDir = getTmpFilename(app.name);
    await fs.move(appPath, tmpDir);
    return fs.remove(tmpDir);
};

const verifyShasum = async (filePath: string, expectedShasum: string) => {
    let buffer;
    try {
        buffer = await fs.readFile(filePath);
    } catch (error) {
        throw new Error(
            `Unable to read file when verifying shasum: ${filePath}`
        );
    }

    const computedShasum = shasum(buffer);
    if (expectedShasum !== computedShasum) {
        throw new Error(
            `Shasum verification failed for ${filePath}. Expected ` +
                `'${expectedShasum}', but got '${computedShasum}'.`
        );
    }
};

const downloadTarball = async (app: AppSpec, version?: string) => {
    const appInfo = readAppInfoFile(app);
    const versionToInstall = appInfo.versions[appInfo.latestVersion];

    if (versionToInstall == null) {
        return Promise.reject(
            new Error(`No tarball found for ${app.name}@${version}`)
        );
    }

    const tarballUrl = versionToInstall.tarballUrl;

    const fileName = path.basename(tarballUrl);
    const tarballFile = path.join(getAppsRootDir(app.source), fileName);

    await downloadToFile(tarballUrl, tarballFile, true, app);
    await verifyShasum(tarballFile, versionToInstall.shasum);

    return tarballFile;
};

export const installDownloadableApp = async (
    app: DownloadableApp,
    version?: string
): Promise<InstalledDownloadableApp> => {
    const tgzFilePath = await downloadTarball(app, version);

    if (isInstalled(app)) {
        await removeDownloadableApp(app);
    }

    await extractNpmPackage(app.name, tgzFilePath, installedAppPath(app));
    await deleteFile(tgzFilePath);

    return getInstalledApp(createDownloadableApp(app.source)(readAppInfo(app)));
};
