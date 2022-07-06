/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = {
    downloadAppsJsonFile: 'apps:download-apps-json-file',
    removeSourceDirectory: 'apps:remove-source-directory',
    downloadAllAppsJsonFiles: 'apps:download-all-apps-json-files',
    getLocalApps: 'apps:get-local-apps',
    getOfficialApps: 'apps:get-official-apps',
    downloadReleaseNotes: 'apps:download-release-notes',
    installOfficialApp: 'apps:install-official-app',
    removeOfficialApp: 'apps:remove-official-app',
};

// downloadAppsJsonFile

const registerDownloadAppsJsonFileHandlerFromMain = onDownloadAppsJsonFile =>
    ipcMain.handle(channel.downloadAppsJsonFile, (_event, url) =>
        onDownloadAppsJsonFile(url)
    );

const invokeDownloadAppsJsonFileFromRenderer = url =>
    ipcRenderer.invoke(channel.downloadAppsJsonFile, url);

// removeSourceDirectory

const registerRemoveSourceDirectoryHandlerFromMain = onRemoveSourceDirectory =>
    ipcMain.handle(channel.removeSourceDirectory, (_event, source) =>
        onRemoveSourceDirectory(source)
    );

const invokeRemoveSourceDirectoryFromRenderer = source =>
    ipcRenderer.invoke(channel.removeSourceDirectory, source);

// downloadAllAppsJsonFiles

const registerDownloadAllAppsJsonFilesHandlerFromMain =
    onDownloadAllAppsJsonFiles =>
        ipcMain.handle(
            channel.downloadAllAppsJsonFiles,
            onDownloadAllAppsJsonFiles
        );

const invokeDownloadAllAppsJsonFilesFromRenderer = () =>
    ipcRenderer.invoke(channel.downloadAllAppsJsonFiles);

// getLocalApps

const registerGetLocalAppsHandlerFromMain = onGetLocalApps =>
    ipcMain.handle(channel.getLocalApps, onGetLocalApps);

const invokeGetLocalAppsFromRenderer = () =>
    ipcRenderer.invoke(channel.getLocalApps);

// getOfficialApps

const registerGetOfficialAppsHandlerFromMain = onGetOfficialApps =>
    ipcMain.handle(channel.getOfficialApps, onGetOfficialApps);

const invokeGetOfficialAppsFromRenderer = () =>
    ipcRenderer.invoke(channel.getOfficialApps);

// downloadReleaseNotes

const registerDownloadReleaseNotesHandlerFromMain = onDownloadReleaseNotes =>
    ipcMain.handle(channel.downloadReleaseNotes, (_event, app) =>
        onDownloadReleaseNotes(app)
    );

const invokeDownloadReleaseNotesFromRenderer = app =>
    ipcRenderer.invoke(channel.downloadReleaseNotes, app);

// installOfficialApp

const registerInstallOfficialAppHandlerFromMain = onInstallOfficialApp =>
    ipcMain.handle(
        channel.installOfficialApp,
        (_event, name, version, source) =>
            onInstallOfficialApp(name, version, source)
    );

const invokeInstallOfficialAppFromRenderer = (name, version, source) =>
    ipcRenderer.invoke(channel.installOfficialApp, name, version, source);

// removeOfficialApp

const registerRemoveOfficialAppHandlerFromMain = onRemoveOfficialApp =>
    ipcMain.handle(channel.removeOfficialApp, (_event, name, source) =>
        onRemoveOfficialApp(name, source)
    );

const invokeRemoveOfficialAppFromRenderer = (name, source) =>
    ipcRenderer.invoke(channel.removeOfficialApp, name, source);

module.exports = {
    registerDownloadAppsJsonFileHandlerFromMain,
    invokeDownloadAppsJsonFileFromRenderer,
    registerRemoveSourceDirectoryHandlerFromMain,
    invokeRemoveSourceDirectoryFromRenderer,
    registerDownloadAllAppsJsonFilesHandlerFromMain,
    invokeDownloadAllAppsJsonFilesFromRenderer,
    registerGetLocalAppsHandlerFromMain,
    invokeGetLocalAppsFromRenderer,
    registerGetOfficialAppsHandlerFromMain,
    invokeGetOfficialAppsFromRenderer,
    registerDownloadReleaseNotesHandlerFromMain,
    invokeDownloadReleaseNotesFromRenderer,
    registerInstallOfficialAppHandlerFromMain,
    invokeInstallOfficialAppFromRenderer,
    registerRemoveOfficialAppHandlerFromMain,
    invokeRemoveOfficialAppFromRenderer,
};
