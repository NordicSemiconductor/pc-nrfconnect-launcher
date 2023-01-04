/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import type { PackageJson } from 'pc-nrfconnect-shared';

import {
    appExists,
    AppSpec,
    AppWithError,
    DownloadableApp,
    DownloadableAppInfo,
    failureReadingFile,
    InstalledDownloadableApp,
    InstallResult,
    LocalApp,
    successfulInstall,
} from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { LOCAL, Source } from '../ipc/sources';
import { downloadAppInfos, readAppInfo, readAppInfos } from './appInfo';
import {
    getAppsExternalDir,
    getAppsLocalDir,
    getAppsRootDir,
    getNodeModulesDir,
} from './config';
import {
    deleteFile,
    extractNpmPackage,
    getNameFromNpmPackage,
    getTmpFilename,
    listDirectories,
    listFiles,
    readJsonFile,
} from './fileUtil';
import { ensureDirExists, mkdir } from './mkdir';
import { downloadTarball } from './registryApi';
import {
    downloadSourceJsonToFile,
    getAllSources,
    initialiseAllSources,
    sourceJsonExistsLocally,
} from './sources';

const installedAppPath = (app: AppSpec) => {
    const appDir =
        app.source === LOCAL
            ? getAppsLocalDir()
            : getNodeModulesDir(app.source);
    return path.join(appDir, app.name);
};

const defined = <X>(item?: X): item is X => item != null;

const isInstalled = (app: AppSpec) => fs.pathExistsSync(installedAppPath(app));

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

const localApp = (appName: string): AppSpec => ({
    source: LOCAL,
    name: appName,
});

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

const installAllLocalAppArchives = () => {
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

export const initAppsDirectory = async () => {
    ensureDirExists(getAppsRootDir());
    ensureDirExists(getAppsLocalDir());
    ensureDirExists(getAppsExternalDir());
    ensureDirExists(getNodeModulesDir());
    initialiseAllSources();
    await installAllLocalAppArchives();
};

const shortcutIconExtension = () => {
    if (process.platform === 'win32') {
        return 'ico';
    }
    if (process.platform === 'darwin') {
        return 'icns';
    }
    return 'png';
};

const ifExists = (filePath: string) =>
    fs.existsSync(filePath) ? filePath : undefined;

const shortcutIconPath = (resourcesPath: string) =>
    ifExists(path.join(resourcesPath, `icon.${shortcutIconExtension()}`));

// FIXME later: Inline this into use for local apps
const infoFromInstalledApp = (app: AppSpec) => {
    const appPath = installedAppPath(app);

    const packageJson = readJsonFile<PackageJson>(
        path.join(appPath, 'package.json')
    );

    const resourcesPath = path.join(appPath, 'resources');
    const iconPath =
        ifExists(path.join(resourcesPath, 'icon.svg')) ??
        path.join(resourcesPath, 'icon.png');

    return {
        name: packageJson.name,
        displayName: packageJson.displayName ?? packageJson.name,
        currentVersion: packageJson.version,
        description: packageJson.description ?? '',
        path: appPath,
        iconPath,
        shortcutIconPath: shortcutIconPath(resourcesPath) ?? iconPath,
        engineVersion: packageJson.engines?.nrfconnect,
        repositoryUrl: packageJson.repository?.url,
    } as const;
};

const uninstalledApp = (app: DownloadableAppInfo) => ({
    ...app,
    currentVersion: undefined,
});

const installedApp = (app: DownloadableAppInfo): InstalledDownloadableApp => {
    const appPath = installedAppPath(app);
    const resourcesPath = path.join(appPath, 'resources');

    const packageJson = readJsonFile<PackageJson>(
        path.join(appPath, 'package.json')
    );

    const iconPathInApp =
        ifExists(path.join(resourcesPath, 'icon.svg')) ??
        path.join(resourcesPath, 'icon.png');

    return {
        name: packageJson.name,
        source: app.source,

        description: packageJson.description ?? app.description,
        displayName: packageJson.displayName ?? app.displayName,

        engineVersion: packageJson.engines?.nrfconnect,

        currentVersion: packageJson.version,
        latestVersion: app.latestVersion,
        versions: app.versions,

        path: appPath,

        shortcutIconPath: shortcutIconPath(resourcesPath) ?? iconPathInApp,
        iconPath: iconPathInApp,

        homepage: packageJson.homepage ?? app.homepage,
        repositoryUrl: packageJson.repository?.url,

        releaseNotes: app.releaseNotes,

        url: app.url,
    };
};

const addInformationForInstalledApps = (
    appInfos: DownloadableAppInfo[],
    source: Source
) => {
    const appsWithErrors: AppWithError[] = [];

    const apps = appInfos.map(appInfo => {
        const appSpec = { source: source.name, name: appInfo.name };
        if (!isInstalled(appSpec)) {
            return uninstalledApp(appInfo);
        }

        try {
            return installedApp(appInfo);
        } catch (error) {
            appsWithErrors.push({
                reason: error,
                path: installedAppPath(appSpec),
                name: appInfo.name,
                source: source.name,
            });

            return undefined;
        }
    });

    return {
        apps: apps.filter(defined),
        appsWithErrors,
    };
};

const getAllAppsInSource = async (source: Source) => {
    let appInfos: DownloadableAppInfo[];

    if (!sourceJsonExistsLocally(source)) {
        /* If we never downloaded the meta files for a source,
           then we must download them at least once, regardless
           of whether the users selected "Check for updates at startup"
        */

        await downloadSourceJsonToFile(source);
        appInfos = await downloadAppInfos(source);
    } else {
        appInfos = readAppInfos(source);
    }

    // FIXME later: For the official source use local copies of the meta files instead. Maybe even use copies of the apps.

    return addInformationForInstalledApps(appInfos, source);
};

export const getDownloadableApps = async () => {
    const sourcesWithErrors: Source[] = [];

    const results = await Promise.all(
        getAllSources().map(source => {
            try {
                return getAllAppsInSource(source);
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

const getLocalApp = (appName: string): LocalApp => ({
    ...infoFromInstalledApp(localApp(appName)),
    source: LOCAL,
});

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

    return installedApp(readAppInfo(app));
};
