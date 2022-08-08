/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { ipcMain, ipcRenderer } = require('electron');

const channel = {
    downloadAllAppsJsonFiles: 'apps:download-all-apps-json-files',
    getLocalApps: 'apps:get-local-apps',
    getDownloadableApps: 'apps:get-downloadable-apps',
    downloadReleaseNotes: 'apps:download-release-notes',
    installDownloadableApp: 'apps:install-downloadable-app',
    removeDownloadableApp: 'apps:remove-downloadable-app',
};

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

// getDownloadableApps

const registerGetDownloadableAppsHandlerFromMain = onGetDownloadableApps =>
    ipcMain.handle(channel.getDownloadableApps, onGetDownloadableApps);

const invokeGetDownloadableAppsFromRenderer = () =>
    ipcRenderer.invoke(channel.getDownloadableApps);

// downloadReleaseNotes

const registerDownloadReleaseNotesHandlerFromMain = onDownloadReleaseNotes =>
    ipcMain.handle(channel.downloadReleaseNotes, (_event, app) =>
        onDownloadReleaseNotes(app)
    );

const invokeDownloadReleaseNotesFromRenderer = app =>
    ipcRenderer.invoke(channel.downloadReleaseNotes, app);

// installDownloadableApp

const registerInstallDownloadableAppHandlerFromMain =
    onInstallDownloadableApp =>
        ipcMain.handle(
            channel.installDownloadableApp,
            (_event, name, version, source) =>
                onInstallDownloadableApp(name, version, source)
        );

const invokeInstallDownloadableAppFromRenderer = (name, version, source) =>
    ipcRenderer.invoke(channel.installDownloadableApp, name, version, source);

// removeDownloadableApp

const registerRemoveDownloadableAppHandlerFromMain = onRemoveDownloadableApp =>
    ipcMain.handle(channel.removeDownloadableApp, (_event, name, source) =>
        onRemoveDownloadableApp(name, source)
    );

const invokeRemoveDownloadableAppFromRenderer = (name, source) =>
    ipcRenderer.invoke(channel.removeDownloadableApp, name, source);

module.exports = {
    registerDownloadAllAppsJsonFilesHandlerFromMain,
    invokeDownloadAllAppsJsonFilesFromRenderer,
    registerGetLocalAppsHandlerFromMain,
    invokeGetLocalAppsFromRenderer,
    registerGetDownloadableAppsHandlerFromMain,
    invokeGetDownloadableAppsFromRenderer,
    registerDownloadReleaseNotesHandlerFromMain,
    invokeDownloadReleaseNotesFromRenderer,
    registerInstallDownloadableAppHandlerFromMain,
    invokeInstallDownloadableAppFromRenderer,
    registerRemoveDownloadableAppHandlerFromMain,
    invokeRemoveDownloadableAppFromRenderer,
};
