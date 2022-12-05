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
    DownloadableApp,
    DownloadableAppInfo,
    DownloadableAppInfoBase,
    failureReadingFile,
    InstallResult,
    LocalApp,
    successfulInstall,
    UninstalledDownloadableApp,
} from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import { LOCAL, SourceName } from '../ipc/sources';
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
    downloadAllAppsJson,
    getAllSourceNames,
    initialiseAllSources,
    UpdatesJson,
} from './sources';

const isInstalled = (appPath: string) => fs.pathExistsSync(appPath);

/*
 * Create the updates.json file containing the latest available versions for
 * a source. Format: { "foo": "x.y.z", "bar: "x.y.z" }.
 */
const generateUpdatesJsonFile = async (sourceName: SourceName) => {
    const fileName = getUpdatesJsonPath(sourceName);

    const latestVersions = await registryApi.getLatestAppVersions(
        downloadableAppsInAppsJson(sourceName)
    );
    await fileUtil.createJsonFile(fileName, latestVersions);
};

/*
 * Create the updates.json files for all sources
 */
const generateUpdatesJsonFiles = () =>
    Promise.all(getAllSourceNames().map(generateUpdatesJsonFile));

export const downloadAllAppsJsonFiles = async () => {
    await downloadAllAppsJson();
    await generateUpdatesJsonFiles();
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
    const appPath = path.join(getAppsLocalDir(), appName);

    // Check if app exists
    if (isInstalled(appPath)) {
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
    fs.remove(path.join(getAppsLocalDir(), appName));

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

const infoFromInstalledApp = (appParendDir: string, appName: string) => {
    const appPath = path.join(appParendDir, appName);

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
): DownloadableAppInfo[] => {
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
    app: DownloadableAppInfo,
    availableUpdates: UpdatesJson = getUpdates(app.source)
): InstalledAppResult => {
    const fromInstalledApp = infoFromInstalledApp(
        getNodeModulesDir(app.source),
        app.name
    );

    return {
        status: 'success',
        value: {
            ...fromInstalledApp,
            ...app,
            currentVersion: fromInstalledApp.currentVersion,
            latestVersion:
                availableUpdates[app.name] || fromInstalledApp.currentVersion,
            releaseNote: readReleaseNotes(app),
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

const uninstalledAppInfo = (
    app: DownloadableAppInfo,
    availableUpdates: UpdatesJson
): UninstalledAppResult | InvalidAppResult => {
    try {
        return {
            status: 'success',
            value: {
                ...app,
                latestVersion: availableUpdates[app.name],
                currentVersion: undefined,
                iconPath: ifExists(
                    path.join(getAppsRootDir(app.source), `${app.name}.svg`)
                ),
                releaseNote: readReleaseNotes(app),
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

const getUpdates = (source: SourceName) =>
    fileUtil.readJsonFile<UpdatesJson>(getUpdatesJsonPath(source));

const getDownloadableAppsFromSource = (source: SourceName) => {
    const apps = downloadableAppsInAppsJson(source);
    const availableUpdates = getUpdates(source);

    return apps.map(app => {
        const filePath = path.join(getNodeModulesDir(source), app.name);

        try {
            return isInstalled(filePath)
                ? installedAppInfo(app, availableUpdates)
                : uninstalledAppInfo(app, availableUpdates);
        } catch (error) {
            return {
                status: 'erroneous',
                reason: error,
                path: filePath,
                name: app.name,
                source,
            } as ErroneousAppResult;
        }
    });
};

export const getDownloadableApps = () => {
    const appResults = getAllSourceNames().flatMap(
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
    ...infoFromInstalledApp(getAppsLocalDir(), appName),
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
    const appPath = path.join(getNodeModulesDir(app.source), app.name);
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
    app: DownloadableAppInfo,
    version: string
) => {
    const { name, source } = app;

    const destinationDir = getAppsRootDir(source);
    const tgzFilePath = await registryApi.downloadTarball(
        app,
        version,
        destinationDir
    );

    const appPath = path.join(getNodeModulesDir(source), name);

    if (isInstalled(appPath)) {
        await removeDownloadableApp(app);
    }
    await fileUtil.extractNpmPackage(name, tgzFilePath, appPath);
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

const releaseNotesPath = (app: AppSpec) =>
    path.join(getAppsRootDir(app.source), `${app.name}-Changelog.md`);

const storeReleaseNotesInBackground = (app: AppSpec, releaseNotes: string) =>
    fileUtil
        .createTextFile(releaseNotesPath(app), releaseNotes)
        .catch(reason =>
            console.warn(
                `Failed to store release notes: ${describeError(reason)}`
            )
        );

const readReleaseNotes = (app: DownloadableAppInfo) => {
    try {
        return fs.readFileSync(releaseNotesPath(app), 'utf-8');
    } catch (error) {
        // We assume an error here means that the release notes just were not downloaded yet.
        return undefined;
    }
};

export const downloadReleaseNotes = async (app: DownloadableApp) => {
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

    return undefined;
};
