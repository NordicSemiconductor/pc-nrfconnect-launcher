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
    DownloadableAppInfoBase,
    DownloadableAppInfoDeprecated,
    failureReadingFile,
    InstalledDownloadableApp,
    InstallResult,
    LocalApp,
    successfulInstall,
    UninstalledDownloadableApp,
} from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { LOCAL, Source, SourceName } from '../ipc/sources';
import { downloadAppInfos, readAppInfos } from './appInfo';
import {
    getAppsExternalDir,
    getAppsJsonPath,
    getAppsLocalDir,
    getAppsRootDir,
    getNodeModulesDir,
    getUpdatesJsonPath,
} from './config';
import describeError from './describeError';
import * as fileUtil from './fileUtil';
import { mkdir, mkdirIfNotExists } from './mkdir';
import * as net from './net';
import * as registryApi from './registryApi';
import {
    AppsJson,
    downloadSourceJsonToFile,
    getAllSourceNamesDeprecated,
    getAllSources,
    initialiseAllSources,
    sourceJsonExistsLocally,
    UpdatesJson,
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
    const appName = fileUtil.getNameFromNpmPackage(tgzFilePath);
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
    await mkdir(appPath);
    try {
        await fileUtil.extractNpmPackage(appName, tgzFilePath, appPath);
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
        await fileUtil.deleteFile(tgzFilePath);
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
            await fileUtil.deleteFile(tgzFilePath);
        }
    }
};

const installAllLocalAppArchives = () => {
    const tgzFiles = fileUtil.listFiles(getAppsLocalDir(), /\.tgz$/);
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
    await mkdirIfNotExists(getAppsRootDir());
    await mkdirIfNotExists(getAppsLocalDir());
    await mkdirIfNotExists(getAppsExternalDir());
    await mkdirIfNotExists(getNodeModulesDir());
    await initialiseAllSources();
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

const infoFromInstalledApp = (app: AppSpec) => {
    const appPath = installedAppPath(app);

    const packageJson = fileUtil.readJsonFile<PackageJson>(
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

const downloadableAppsInAppsJson = (
    source: SourceName
): DownloadableAppInfoDeprecated[] => {
    const appsJson = fileUtil.readJsonFile<AppsJson>(getAppsJsonPath(source));

    const isAnAppEntry = (
        entry: [string, unknown]
    ): entry is [string, DownloadableAppInfoBase] => entry[0] !== '_source';

    return Object.entries(appsJson)
        .filter(isAnAppEntry)
        .map(([name, app]) => ({
            name,
            source,
            ...app,
        }));
};

interface InstalledAppResult {
    status: 'success';
    value: DownloadableApp;
}

const installedAppInfo = (
    app: DownloadableAppInfoDeprecated,
    availableUpdates: UpdatesJson = getUpdates(app.source)
): InstalledAppResult => {
    const fromInstalledApp = infoFromInstalledApp(app);

    return {
        status: 'success',
        value: {
            ...fromInstalledApp,
            ...app,
            currentVersion: fromInstalledApp.currentVersion,
            latestVersion:
                availableUpdates[app.name] || fromInstalledApp.currentVersion,
            releaseNote: readReleaseNotesDeprecated(app),
        },
    };
};

interface UninstalledAppResult {
    status: 'success';
    value: UninstalledDownloadableApp;
}
interface InvalidAppResult {
    status: 'invalid';
    reason: unknown;
}

const uninstalledAppInfoDeprecated = (
    app: DownloadableAppInfoDeprecated,
    availableUpdates: UpdatesJson
): UninstalledAppResult | InvalidAppResult => {
    try {
        return {
            status: 'success',
            value: {
                ...app,
                latestVersion: availableUpdates[app.name],
                currentVersion: undefined,
                iconPath: ifExists(iconPathDeprecated(app)),
                releaseNote: readReleaseNotesDeprecated(app),
            },
        };
    } catch (error) {
        return {
            status: 'invalid',
            reason: error,
        };
    }
};

interface ErroneousAppResult {
    status: 'erroneous';
    reason: unknown;
    path: string;
    name: string;
    source: string;
}

type SuccessfulAppResult = UninstalledAppResult | InstalledAppResult;

type AppResult = SuccessfulAppResult | ErroneousAppResult | InvalidAppResult;

const isErroneous = (result: AppResult): result is ErroneousAppResult =>
    result.status === 'erroneous';

const isSuccessful = (result: AppResult): result is SuccessfulAppResult =>
    result.status === 'success';

const getUpdates = (source: SourceName) => {
    try {
        return fileUtil.readJsonFile<UpdatesJson>(getUpdatesJsonPath(source));
    } catch (error) {
        console.log(
            `Failed to read updates file for source \`${source}\`. Falling back to assuming no updates.`
        );
        return {};
    }
};

const getDownloadableAppsFromSource = (source: SourceName) => {
    const apps = downloadableAppsInAppsJson(source);
    const availableUpdates = getUpdates(source);

    return apps.map(app => {
        try {
            return isInstalled(app)
                ? installedAppInfo(app, availableUpdates)
                : uninstalledAppInfoDeprecated(app, availableUpdates);
        } catch (error) {
            return {
                status: 'erroneous',
                reason: error,
                path: installedAppPath(app),
                name: app.name,
                source,
            } as ErroneousAppResult;
        }
    });
};

const uninstalledApp = (app: DownloadableAppInfo) => ({
    ...app,
    currentVersion: undefined,
});

const installedApp = (app: DownloadableAppInfo): InstalledDownloadableApp => {
    const appPath = installedAppPath(app);
    const resourcesPath = path.join(appPath, 'resources');

    const packageJson = fileUtil.readJsonFile<PackageJson>(
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

        releaseNote: app.releaseNote,

        url: app.url,
    };
};

export const addInformationForInstalledApps = (
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

export const getDownloadableAppsDeprecated = () => {
    const appResults = getAllSourceNamesDeprecated().flatMap(
        getDownloadableAppsFromSource
    );

    appResults.forEach(result => {
        if (result.status === 'invalid') {
            // this can happen if for example the apps.json for a source
            // is not properly updated so that there is a mismatch
            // between what is claims is there and what is actually there.
            // In this case we want to hide the error to the user as they
            // cannot do anything to prevent this besides removing the source.
            console.debug(result.reason);
        }
    });

    return {
        apps: appResults.filter(isSuccessful).map(result => result.value),
        appsWithErrors: appResults.filter(isErroneous),
    };
};

const consistentAppAndDirectoryName = (app: LocalApp) =>
    app.name === path.basename(app.path);

const getLocalApp = (appName: string): LocalApp => ({
    ...infoFromInstalledApp(localApp(appName)),
    source: LOCAL,
});

export const getLocalApps = (consistencyCheck = true) => {
    const localApps = fileUtil
        .listDirectories(getAppsLocalDir())
        .map(getLocalApp);

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

    const tmpDir = fileUtil.getTmpFilename(app.name);
    await fs.move(appPath, tmpDir);
    return fs.remove(tmpDir);
};

export const installDownloadableApp = async (
    app: DownloadableAppInfoDeprecated,
    version: string
) => {
    const destinationDir = getAppsRootDir(app.source);
    const tgzFilePath = await registryApi.downloadTarball(
        app,
        version,
        destinationDir
    );

    if (isInstalled(app)) {
        await removeDownloadableApp(app);
    }

    await fileUtil.extractNpmPackage(
        app.name,
        tgzFilePath,
        installedAppPath(app)
    );
    await fileUtil.deleteFile(tgzFilePath);

    return {
        ...app,
        ...installedAppInfo(app).value,
    };
};

const replacePrLinks = (releaseNotes: string, homepage?: string) =>
    homepage == null
        ? releaseNotes
        : releaseNotes.replace(
              /#(\d+)/g,
              (match, pr) => `[${match}](${homepage}/pull/${pr})`
          );

const releaseNotesPathDeprecated = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}-Changelog.md`);

const storeReleaseNotesInBackground = (app: AppSpec, releaseNotes: string) =>
    fileUtil
        .createTextFile(releaseNotesPathDeprecated(app), releaseNotes)
        .catch(reason =>
            console.warn(
                `Failed to store release notes: ${describeError(reason)}`
            )
        );

const readReleaseNotesDeprecated = (app: AppSpec & { homepage?: string }) => {
    try {
        const releaseNotes = fs.readFileSync(
            releaseNotesPathDeprecated(app),
            'utf-8'
        );
        const prettyReleaseNotes = replacePrLinks(releaseNotes, app.homepage);

        return prettyReleaseNotes;
    } catch (error) {
        // We assume an error here means that the release notes just were not downloaded yet.
        return undefined;
    }
};

export const downloadReleaseNotesDeprecated = async (app: DownloadableApp) => {
    try {
        const releaseNotes = await net.downloadToString(
            `${app.url}-Changelog.md`,
            false
        );
        if (releaseNotes != null) {
            const prettyReleaseNotes = replacePrLinks(
                releaseNotes,
                app.homepage
            );
            storeReleaseNotesInBackground(app, prettyReleaseNotes);

            return prettyReleaseNotes;
        }
    } catch (e) {
        console.debug(
            'Unable to fetch changelog, ignoring this as non-critical.',
            describeError(e)
        );
    }
};

const iconPathDeprecated = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}.svg`);

export const downloadAppIconDeprecated = async (app: DownloadableApp) => {
    try {
        const iconUrl = `${app.url}.svg`;

        await net.downloadToFile(iconUrl, iconPathDeprecated(app));

        return iconPathDeprecated(app);
    } catch (e) {
        console.debug(
            'Unable to fetch icon, ignoring this as non-critical.',
            describeError(e)
        );
    }
};
