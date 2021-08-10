process.once('loaded', () => {
    const { contextBridge } = require('electron');
    const settings = require('./settings');
    const config = require('./config');
    const net = require('./net');
    const mainApps = require('./apps');
    const fs = require('fs');
    const autoUpdate = require('./autoUpdate');
    const fileUtil = require('./fileUtil');

    contextBridge.exposeInMainWorld('electron', {
        settingsGet: settings.get,
        settingsSet: settings.set,
        getSources: settings.getSources,
        setSources: settings.setSources,
        isSkipUpdateApps: config.isSkipUpdateApps,
        isSkipUpdateCore: config.isSkipUpdateCore,
        getAppsRootDir: config.getAppsRootDir,
        isRunningLauncherFromSource: config.isRunningLauncherFromSource,
        getDesktopDir: config.getDesktopDir,
        getUbuntuDesktopDir: config.getUbuntuDesktopDir,
        getElectronExePath: config.getElectronExePath,
        getElectronRootPath: config.getElectronRootPath,
        getTmpDir: config.getTmpDir,
        getHomeDir: config.getHomeDir,
        getReleaseNotesUrl: config.getReleaseNotesUrl,
        getVersion: config.getVersion,
        netRegisterProxyHandler: net.registerProxyLoginHandler,
        downloadToFile: net.downloadToFile,
        processEnv: () => process.env,
        existsSync: fs.existsSync,
        remove: fs.remove,
        getLocalApps: mainApps.getLocalApps,
        getOfficialApps: mainApps.getOfficialApps,
        downloadReleaseNotes: mainApps.downloadReleaseNotes,
        installOfficialApp: mainApps.installOfficialApp,
        removeOfficialApp: mainApps.removeOfficialApp,
        downloadAppsJsonFiles: mainApps.downloadAppsJsonFiles,
        downloadAppsJsonFile: mainApps.downloadAppsJsonFile,
        generateUpdatesJsonFiles: mainApps.generateUpdatesJsonFiles,
        removeSourceDirectory: mainApps.removeSourceDirectory,
        autoUpdater: autoUpdate.autoUpdater,
        CancellationToken: autoUpdate.CancellationToken,
        untar: fileUtil.untar,
        chmodDir: fileUtil.chmodDir,
        createTextFile: fileUtil.createTextFile,
        copy: fileUtil.copy,
    });
});
