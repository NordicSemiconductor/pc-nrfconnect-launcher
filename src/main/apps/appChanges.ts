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
    InstallResult,
    successfulInstall,
} from '../../ipc/apps';
import { getAppsLocalDir, getAppsRootDir } from '../config';
import { deleteFile, listFiles, untar } from '../fileUtil';
import { mkdir } from '../mkdir';
import { downloadToFile } from '../net';
import {
    addDownloadAppData,
    addInstalledAppData,
    getLocalApp,
    installedAppPath,
    isInstalled,
    localApp,
    readAppInfo,
    readAppInfoFile,
    writeAppInfo,
} from './app';
import { getSource } from './sources';

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
    if (fs.pathExistsSync(appPath)) {
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

const removeInstallMetaData = (app: AppSpec) => {
    const appInfo = readAppInfo(app);
    delete appInfo.installed;

    writeAppInfo(
        appInfo,
        getSource(app.source)! // eslint-disable-line @typescript-eslint/no-non-null-assertion
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

    removeInstallMetaData(app);

    const tmpDir = getTmpFilename(app.name);
    await fs.move(appPath, tmpDir);
    return fs.remove(tmpDir);
};

const verifyShasum = async (filePath: string, expectedShasum?: string) => {
    let buffer;
    try {
        buffer = await fs.readFile(filePath);
    } catch (error) {
        throw new Error(
            `Unable to read file when verifying shasum: ${filePath}`
        );
    }

    const computedShasum = shasum(buffer);
    if (expectedShasum != null && expectedShasum !== computedShasum) {
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
    const packageFilePath = path.join(getAppsRootDir(app.source), fileName);

    await downloadToFile(tarballUrl, packageFilePath, true, app);
    await verifyShasum(packageFilePath, versionToInstall.shasum);

    return { packageFilePath, checksum: versionToInstall.shasum };
};

const addInstallMetaData = (
    app: AppSpec,
    appPath: string,
    checksum?: string
) => {
    writeAppInfo(
        {
            ...readAppInfo(app),
            installed: { path: appPath, shasum: checksum },
        },
        getSource(app.source)! // eslint-disable-line @typescript-eslint/no-non-null-assertion
    );
};

export const installDownloadableApp = async (
    app: DownloadableApp,
    version?: string
): Promise<DownloadableApp> => {
    const { packageFilePath, checksum } = await downloadTarball(app, version);

    if (isInstalled(app)) {
        await removeDownloadableApp(app);
    }

    const appPath = installedAppPath(app);
    await extractNpmPackage(app.name, packageFilePath, appPath);
    await deleteFile(packageFilePath);

    addInstallMetaData(app, appPath, checksum);

    return addInstalledAppData(
        // @ts-expect-error -- Because the property `installed` was added above it must be there, I just do not know yet how to convince TypeScript of that
        addDownloadAppData(app.source)(readAppInfo(app))
    );
};
