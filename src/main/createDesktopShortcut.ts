/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-bitwise */

import { shell } from 'electron';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import { uuid } from 'short-uuid';

import { LaunchableApp } from '../ipc/apps';
import { showErrorDialog } from '../ipc/showErrorDialog';
import * as config from './config';
import * as fileUtil from './fileUtil';

const mode =
    fs.constants.S_IRWXU |
    fs.constants.S_IRGRP |
    fs.constants.S_IXGRP |
    fs.constants.S_IROTH |
    fs.constants.S_IXOTH;

const sourceName = (app: LaunchableApp) => {
    if (app.isOfficial) {
        if (app.source === 'official') {
            return '';
        }
        return ` (${app.source})`;
    }

    return ' (Local)';
};

const getFileName = (app: LaunchableApp) =>
    `${app.displayName || app.name}${sourceName(app)}`;

const getArgs = (app: LaunchableApp) =>
    [
        '--args',
        app.isOfficial ? '--open-official-app' : '--open-local-app',
        app.name,
        '--source',
        `"${app.source}"`,
    ].join(' ');

const createShortcutForWindows = (app: LaunchableApp) => {
    const fileName = getFileName(app);
    const filePath = path.join(config.getDesktopDir(), `${fileName}.lnk`);
    if (app.shortcutIconPath) {
        const shortcutStatus = shell.writeShortcutLink(filePath, {
            target: config.getElectronExePath(),
            args: getArgs(app),
            icon: app.shortcutIconPath,
            // iconIndex has to be set to change icon
            iconIndex: 0,
        });
        if (shortcutStatus !== true) {
            showErrorDialog('Fail with shell.writeShortcutLink');
        }
    } else {
        showErrorDialog('Fail to create desktop since app.iconPath is not set');
    }
};

const createShortcutForLinux = (app: LaunchableApp) => {
    const fileName = getFileName(app);
    const desktopFilePath = path.join(
        config.getDesktopDir(),
        `${fileName}.desktop`
    );
    const applicationsFilePath = path.join(
        config.getUbuntuDesktopDir(),
        `${fileName}.desktop`
    );

    const args = getArgs(app);
    const { iconPath, shortcutIconPath } = app;

    const shortcutContent = [
        '[Desktop Entry]',
        'Encoding=UTF-8',
        `Version=${app.currentVersion}`,
        `Name=${fileName}`,
        `Exec=${config.getElectronExePath()} ${args}`,
        'Terminal=false',
        `Icon=${shortcutIconPath || iconPath}`,
        'Type=Application',
        '',
    ].join('\n');

    try {
        fs.writeFileSync(desktopFilePath, shortcutContent);
        fs.chmodSync(desktopFilePath, mode);
        fs.writeFileSync(applicationsFilePath, shortcutContent);
        fs.chmodSync(applicationsFilePath, mode);
    } catch (err) {
        showErrorDialog(
            `Fail to create desktop shortcut on Linux with error: ${err}`
        );
    }
};

/*
 * Create desktop shortcut on MacOS
 * Template is located at /resources/mac/template.app.
 * Copy this template to a tmp folder first.
 * Change the content inside.
 * Copy the modified one to launchpad and desktop.
 * Change the mode of binary file to executable.
 *
 * Copying template to a tmp folder first is to avoid icon cache on MacOS.
 */
const createShortcutForMacOS = async (app: LaunchableApp) => {
    const fileName = getFileName(app);
    let filePath = path.join(config.getDesktopDir(), `${fileName}.app`);
    const templateName = `template-${uuid()}.app`;
    const appTemplateTarPath = path.join(
        config.getElectronRootPath(),
        '/resources/mac/template.tar.gz'
    );
    const tmpAppPath = path.join(
        config.getTmpDir(),
        '/com.nordicsemi.nrfconnect'
    );
    const tmpAppTemplatePath = path.join(tmpAppPath, templateName);
    const appExecPath = path.join(filePath, '/Contents/MacOS/Application Stub');
    const icnsPath = path.join(
        tmpAppTemplatePath,
        '/Contents/Resources/icon.icns'
    );

    try {
        // Untar template
        await fileUtil.untar(appTemplateTarPath, tmpAppTemplatePath, 1);
        await fileUtil.chmodDir(tmpAppTemplatePath, mode);

        // Create Info.plist
        const infoTmpPath = path.join(
            tmpAppTemplatePath,
            '/Contents/Info.plist'
        );
        const identifier = `com.nordicsemi.nrfconnect.${app.name}${
            app.isOfficial ? '' : '-local'
        }`;
        const infoContentSource = fs.readFileSync(infoTmpPath, 'utf-8');
        Mustache.parse(infoContentSource);
        const infoContentData = {
            identifier,
            fileName,
        };
        const infoContent = Mustache.render(infoContentSource, infoContentData);

        // Create document.wflow
        const wflowTmpPath = path.join(
            tmpAppTemplatePath,
            '/Contents/document.wflow'
        );
        // In MacOS spaces should be replaced
        const shortcutCMD = `${config
            .getElectronExePath()
            .replace(/ /g, '\\ ')} ${getArgs(app)}`;
        const wflowContentSource = fs.readFileSync(wflowTmpPath, 'utf-8');
        Mustache.parse(wflowContentSource);
        const wflowContentData = {
            shortcutCMD,
        };
        const wflowContent = Mustache.render(
            wflowContentSource,
            wflowContentData
        );

        await fileUtil.createTextFile(infoTmpPath, infoContent);
        await fileUtil.createTextFile(wflowTmpPath, wflowContent);
        await fileUtil.copy(app.shortcutIconPath, icnsPath);

        // Copy to Desktop
        await fileUtil.copy(tmpAppTemplatePath, filePath);

        // Copy to Applications
        filePath = path.join(
            config.getHomeDir(),
            `/Applications/${fileName}.app/`
        );
        await fileUtil.copy(tmpAppTemplatePath, filePath);

        // Change mode
        await fileUtil.chmodDir(appExecPath, mode);
    } catch (error) {
        showErrorDialog(
            `Error occured while creating desktop shortcut on MacOS with error: ${error}`
        );
    }
};

export default (app: LaunchableApp) => {
    switch (process.platform) {
        case 'win32':
            createShortcutForWindows(app);
            break;
        case 'linux':
            createShortcutForLinux(app);
            break;
        case 'darwin':
            createShortcutForMacOS(app);
            break;
        default:
            showErrorDialog(
                'Your operating system is neither Windows, Linux, nor macOS'
            );
    }
};
