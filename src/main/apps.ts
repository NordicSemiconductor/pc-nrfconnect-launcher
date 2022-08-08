/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from 'electron';
import Store from 'electron-store';
import fs from 'fs-extra';
import path from 'path';
import type { PackageJson } from 'pc-nrfconnect-shared';

import {
    AppInAppsJson,
    InstalledDownloadableApp,
    LocalApp,
    UninstalledDownloadableApp,
    UnversionedDownloadableApp,
} from '../ipc/apps';
import * as config from './config';
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

interface AppData {
    changelog?: string;
    etag?: string;
}

const store = new Store<{
    apps: { [appUrl: string]: AppData };
}>({ name: 'pc-nrfconnect-launcher' });

const getInstalledAppNames = async (sourceName: string) => {
    const installedAppNames = fileUtil.listDirectories(
        config.getNodeModulesDir(sourceName)
    );
    const availableApps = await fileUtil.readJsonFile<AppsJson>(
        config.getAppsJsonPath(sourceName)
    );
    const availableAppNames = Object.keys(availableApps);

    return availableAppNames.filter(appName =>
        installedAppNames.includes(appName)
    );
};

/*
 * Create the updates.json file containing the latest available versions for
 * a source. Format: { "foo": "x.y.z", "bar: "x.y.z" }.
 */
const generateUpdatesJsonFile = async (sourceName: string) => {
    const fileName = config.getUpdatesJsonPath(sourceName);
    const installedApps = await getInstalledAppNames(sourceName);
    const latestVersions = await registryApi.getLatestAppVersions(
        installedApps,
        sourceName
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

const confirmAndRemoveOldLocalApp = async (
    tgzFilePath: string,
    appPath: string
) => {
    const { response } = await dialog.showMessageBox({
        type: 'question',
        title: 'Existing app directory',
        message:
            `Tried to extract archive ${tgzFilePath}, ` +
            `but app directory ${appPath} already exists.\n\n` +
            'Do you want to remove existing app in order to extract the archive?',
        buttons: ['Remove', 'Cancel'],
    });

    if (response === 0) {
        await fs.remove(appPath);
    }
};

const installLocalAppArchive = async (tgzFilePath: string) => {
    const appName = fileUtil.getNameFromNpmPackage(tgzFilePath);
    if (!appName) {
        throw new Error(
            `Unable to get app name from archive: ${tgzFilePath}. ` +
                `Expected file name format: {name}-{version}.tgz.`
        );
    }
    const appPath = path.join(config.getAppsLocalDir(), appName);

    if (await fs.pathExists(appPath)) {
        await confirmAndRemoveOldLocalApp(tgzFilePath, appPath);
    }

    if (!(await fs.pathExists(appPath))) {
        await mkdir(appPath);
        await fileUtil.extractNpmPackage(appName, tgzFilePath, appPath);
        await fileUtil.deleteFile(tgzFilePath);
    }
};

const installAllLocalAppArchives = () => {
    const appsLocalDir = config.getAppsLocalDir();
    const tgzFiles = fileUtil.listFiles(appsLocalDir, /\.tgz$/);
    return tgzFiles.reduce(
        (prev, tgzFile) =>
            prev.then(() =>
                installLocalAppArchive(path.join(appsLocalDir, tgzFile))
            ),
        Promise.resolve()
    );
};

export const initAppsDirectory = async () => {
    await mkdirIfNotExists(config.getAppsRootDir());
    await mkdirIfNotExists(config.getAppsLocalDir());
    await mkdirIfNotExists(config.getAppsExternalDir());
    await mkdirIfNotExists(config.getNodeModulesDir());
    await initialiseAllSources();
    await installAllLocalAppArchives();
};

const infoFromInstalledApp = async (appParendDir: string, appName: string) => {
    const appPath = path.join(appParendDir, appName);

    const packageJsonPath = path.join(appPath, 'package.json');
    const packageJson = await fileUtil.readJsonFile<PackageJson>(
        packageJsonPath
    );

    const resourcesPath = path.join(appPath, 'resources');

    let iconPath = path.join(resourcesPath, 'icon.png');
    if (!fs.existsSync(iconPath)) {
        iconPath = path.join(appPath, 'icon.png');
    }

    let shortcutIconPath;
    if (process.platform === 'win32') {
        shortcutIconPath = path.join(resourcesPath, 'icon.ico');
    } else if (process.platform === 'darwin') {
        shortcutIconPath = path.join(resourcesPath, 'icon.icns');
    }
    if (shortcutIconPath == null || !fs.existsSync(shortcutIconPath)) {
        shortcutIconPath = iconPath;
    }

    const isOfficial = !appPath.startsWith(config.getAppsLocalDir());
    const source = isOfficial
        ? path.basename(path.dirname(path.dirname(appPath)))
        : null;

    return {
        name: packageJson.name,
        displayName: packageJson.displayName,
        currentVersion: packageJson.version,
        description: packageJson.description,
        path: appPath,
        iconPath: fs.existsSync(iconPath) ? iconPath : undefined,
        shortcutIconPath: fs.existsSync(shortcutIconPath)
            ? shortcutIconPath
            : undefined,
        isOfficial,
        engineVersion: packageJson.engines?.nrfconnect,
        source,
        repositoryUrl: packageJson.repository?.url,
    };
};

const latestVersionInfo = (
    officialApp: { name: string; currentVersion?: string },
    availableUpdates: UpdatesJson
) => {
    const latestVersion =
        availableUpdates[officialApp.name] || officialApp.currentVersion;
    return {
        latestVersion,
        upgradeAvailable:
            officialApp.currentVersion &&
            officialApp.currentVersion !== latestVersion,
    };
};

const downloadableAppsInAppsJson = async (source: string) => {
    const appsJson = await fileUtil.readJsonFile<AppsJson>(
        config.getAppsJsonPath(source)
    );

    return Object.entries(appsJson)
        .filter(([name]) => name !== '_source')
        .map(
            ([name, app]) =>
                ({
                    name,
                    source,
                    ...(app as AppInAppsJson),
                } as UnversionedDownloadableApp)
        );
};

interface InstalledAppResult {
    status: 'success';
    value: InstalledDownloadableApp;
}

const installedAppInfo = async (
    app: UnversionedDownloadableApp,
    source: string,
    availableUpdates: UpdatesJson
) => {
    const appWithInstalledAppInfo = {
        ...(await infoFromInstalledApp(
            config.getNodeModulesDir(source),
            app.name
        )),
        ...app,
    };

    return {
        status: 'success',
        value: {
            ...appWithInstalledAppInfo,
            ...latestVersionInfo(appWithInstalledAppInfo, availableUpdates),
        },
    } as InstalledAppResult;
};

interface UninstalledAppResult {
    status: 'success';
    value: UninstalledDownloadableApp;
}
interface InvalidAppResult {
    status: 'invalid';
    reason: unknown;
}

const uninstalledAppInfo = async (
    app: UnversionedDownloadableApp,
    source: string
) => {
    try {
        const latestVersions = await registryApi.getLatestAppVersions(
            [app.name],
            source
        );
        return {
            status: 'success',
            value: {
                ...app,
                ...latestVersionInfo(app, latestVersions),
            },
        } as UninstalledAppResult;
    } catch (error) {
        return {
            status: 'invalid',
            reason: error,
        } as InvalidAppResult;
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

const getDownloadableAppsFromSource = async (source: string) => {
    const apps = await downloadableAppsInAppsJson(source);
    const availableUpdates = await fileUtil.readJsonFile<UpdatesJson>(
        config.getUpdatesJsonPath(source)
    );

    return Promise.all(
        apps.map(async app => {
            const filePath = path.join(
                config.getNodeModulesDir(source),
                app.name
            );

            try {
                const isInstalled = await fs.pathExists(filePath);

                if (isInstalled) {
                    return installedAppInfo(app, source, availableUpdates);
                }

                return uninstalledAppInfo(app, source);
            } catch (error) {
                return {
                    status: 'erroneous',
                    reason: error,
                    path: filePath,
                    name: app.name,
                    source,
                } as ErroneousAppResult;
            }
        })
    );
};

export const getDownloadableApps = async () => {
    const appResults = (
        await Promise.all(
            getAllSourceNames().map(getDownloadableAppsFromSource)
        )
    ).flat();

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
        apps: appResults
            .filter(result => result.status === 'success')
            .map(result => (result as SuccessfulAppResult).value),
        appsWithErrors: appResults.filter(
            result => result.status === 'erroneous'
        ),
    };
};

export const getLocalApps = () => {
    const appsLocalDir = path.join(config.getAppsRootDir(), 'local');
    const localAppPromises = fileUtil
        .listDirectories(appsLocalDir)
        .map(name => infoFromInstalledApp(appsLocalDir, name));

    return Promise.all(localAppPromises as Promise<LocalApp>[]);
};

export const removeDownloadableApp = async (name: string, source: string) => {
    const appPath = path.join(config.getNodeModulesDir(source), name);
    if (!appPath.includes('node_modules')) {
        throw new Error(
            'Sanity check failed when trying ' +
                `to remove app directory ${appPath}. The directory does not ` +
                'have node_modules in its path.'
        );
    }

    const tmpDir = fileUtil.getTmpFilename(name);
    await fs.move(appPath, tmpDir);
    return fs.remove(tmpDir);
};

export const installDownloadableApp = async (
    name: string,
    version: string,
    source: string
) => {
    const destinationDir = config.getAppsRootDir(source);
    const tgzFilePath = await registryApi.downloadTarball(
        name,
        version,
        destinationDir,
        source
    );

    const appPath = path.join(config.getNodeModulesDir(source), name);
    const isInstalled = await fs.pathExists(appPath);
    if (isInstalled) {
        await removeDownloadableApp(name, source);
    }
    await fileUtil.extractNpmPackage(name, tgzFilePath, appPath);
    await fileUtil.deleteFile(tgzFilePath);
};

const migrateStoreIfNeeded = () => {
    const oldStore = new Store({ name: 'pc-nrfconnect-core' });
    if (oldStore.size > 0 && store.size === 0) {
        store.store = JSON.parse(JSON.stringify(oldStore.store));
    }
};

const replacePrLinks = (homepage: string, changelog: string) =>
    changelog.replace(
        /#(\d+)/g,
        (match, pr) => `[${match}](${homepage}/pull/${pr})`
    );

interface AppData {
    changelog?: string;
    etag?: string;
}

/*
 * Download release notes.
 *
 * The release notes are also cached in the electron store. If the server did not report changed
 * release notes or was unable to respond, the cached release notes are used.
 */
export const downloadReleaseNotes = async ({
    url,
    homepage,
}: {
    url: string;
    homepage: string;
}) => {
    migrateStoreIfNeeded();

    const appDataPath = `apps.${url.replace(/\./g, '\\.')}`;
    try {
        const previousAppData = store.get(appDataPath, {}) as AppData;

        const previousEtag = previousAppData.changelog
            ? previousAppData.etag
            : undefined;
        const { response, etag } = await net.downloadToStringIfChanged(
            `${url}-Changelog.md`,
            previousEtag
        );
        if (response != null) {
            const changelog = replacePrLinks(homepage, response);
            store.set(appDataPath, { etag, changelog });
        }
    } catch (e) {
        // Ignore errors and just return what we have stored before
    }

    return (store.get(appDataPath, {}) as AppData).changelog;
};
