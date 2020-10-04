/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint-disable no-tabs */
/* eslint-disable no-bitwise */
/* eslint-disable import/prefer-default-export */

'use strict';

import { remote, shell } from 'electron';

import Mustache from 'mustache';
import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';

import { ErrorDialogActions } from 'pc-nrfconnect-shared';

const config = remote.require('../main/config');
const fileUtil = remote.require('../main/fileUtil');

const mode =
    fs.constants.S_IRWXU |
    fs.constants.S_IRGRP |
    fs.constants.S_IXGRP |
    fs.constants.S_IROTH |
    fs.constants.S_IXOTH;

/**
 * Get file name according to app
 *
 * @param {Object} app, create desktop shortcut for which app.
 * @returns {String} file name from app.
 */
function getFileName(app) {
    const appName = `${app.displayName || app.name}`;
    let sourceName = ' (Local)';
    if (app.isOfficial) {
        sourceName = app.source === 'official' ? '' : ` (${app.source})`;
    }
    return `${appName}${sourceName}`;
}

/**
 * Get arguments according to app
 *
 * @param {Object} app, create desktop shortcut for which app.
 * @returns {String} arguments from app.
 */
function getArgs(app) {
    const args = ['--args'];
    if (app.isOfficial) {
        args.push(
            '--open-official-app',
            app.name,
            '--source',
            `"${app.source}"`
        );
    } else {
        args.push('--open-local-app', app.name);
    }
    return args.join(' ');
}

/**
 * Create desktop shortcut on Windows
 *
 * @param {Object} app, create desktop shortcut for which app.
 * @returns {Function} dispatch, dispatch action in Redux.
 */
function createShortcutForWindows(app) {
    return dispatch => {
        const fileName = getFileName(app);
        const filePath = path.join(config.getDesktopDir(), `${fileName}.lnk`);
        if (app.shortcutIconPath) {
            const shortcutStatus = shell.writeShortcutLink(filePath, {
                target: config.getElectronExePath(),
                // In Windows, use double quote surrounding arguments
                args: getArgs(app),
                icon: app.shortcutIconPath,
                // iconIndex has to be set to change icon
                iconIndex: 0,
            });
            if (shortcutStatus !== true) {
                dispatch(
                    ErrorDialogActions.showDialog(
                        'Fail with shell.writeShortcutLink'
                    )
                );
            }
        } else {
            dispatch(
                ErrorDialogActions.showDialog(
                    'Fail to create desktop since app.iconPath is not set'
                )
            );
        }
    };
}

/**
 * Generate shortcut content on Linux
 *
 * @param {Object} app, create desktop shortcut for which app.
 * @returns {string} shortcut content for Linux.
 */
function generateShortcutContent(app) {
    const fileName = getFileName(app);
    const args = getArgs(app);
    let shortcutContent = '[Desktop Entry]\n';
    shortcutContent += 'Encoding=UTF-8\n';
    shortcutContent += `Version=${app.currentVersion}\n`;
    shortcutContent += `Name=${fileName}\n`;
    // In Linux, use single quote surrounding arguments
    shortcutContent += `Exec=${config.getElectronExePath()} ${args}\n`;
    shortcutContent += 'Terminal=false\n';
    const { iconPath, shortcutIconPath } = app;
    shortcutContent += `Icon=${shortcutIconPath || iconPath}\n`;
    shortcutContent += 'Type=Application\n';
    if (!fileName || !args) {
        return null;
    }
    return shortcutContent;
}

/**
 * Create desktop shortcut on Linux
 *
 * @param {Object} app, create desktop shortcut for which app.
 * @returns {Function} dispatch, dispatch action in Redux.
 */
function createShortcutForLinux(app) {
    return dispatch => {
        const fileName = getFileName(app);
        const filePath = path.join(
            config.getDesktopDir(),
            `${fileName}.desktop`
        );
        const shortcutContent = generateShortcutContent(app);
        if (!shortcutContent) {
            return dispatch(
                ErrorDialogActions.showDialog(
                    'Fail to create desktop shortcut since the shortcut content is empty'
                )
            );
        }
        fs.writeFile(filePath, shortcutContent, err => {
            if (err) {
                return dispatch(
                    ErrorDialogActions.showDialog(
                        `Fail to create desktop shortcut on Linux with error: ${err}`
                    )
                );
            }
            fs.chmodSync(filePath, mode);
            return null;
        });
        return null;
    };
}

/**
 * Create desktop shortcut on MacOS
 * Template is located at /resources/mac/template.app.
 * Copy this template to a tmp folder first.
 * Change the content inside.
 * Copy the modified one to launchpad and desktop.
 * Change the mode of binary file to executable.
 *
 * Copying template to a tmp folder first is to avoid icon cache on MacOS.
 *
 * @param {Object} app, create desktop shortcut for which app.
 * @returns {Function} dispatch, dispatch action in Redux.
 */
function createShortcutForMacOS(app) {
    return async dispatch => {
        const fileName = getFileName(app);
        let filePath = path.join(config.getDesktopDir(), `${fileName}.app`);
        const templateName = `template-${v4()}.app`;
        const appTemplateTarPath = path.join(
            config.getElectronRootPath(),
            '/resources/mac/template.tar.gz'
        );
        const tmpAppPath = path.join(
            config.getTmpDir(),
            '/com.nordicsemi.nrfconnect'
        );
        const tmpAppTemplatePath = path.join(tmpAppPath, templateName);
        const appExecPath = path.join(
            filePath,
            '/Contents/MacOS/Application Stub'
        );
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
            const infoContentSource = fs.readFileSync(infoTmpPath, 'UTF-8');
            Mustache.parse(infoContentSource);
            const infoContentData = {
                identifier,
                fileName,
            };
            const infoContent = Mustache.render(
                infoContentSource,
                infoContentData
            );

            // Create document.wflow
            const wflowTmpPath = path.join(
                tmpAppTemplatePath,
                '/Contents/document.wflow'
            );
            // In MacOS spaces should be replaced
            const shortcutCMD = `${config
                .getElectronExePath()
                .replace(/ /g, '\\ ')} ${getArgs(app)}`;
            const wflowContentSource = fs.readFileSync(wflowTmpPath, 'UTF-8');
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
            dispatch(
                ErrorDialogActions.showDialog(
                    `Error occured while creating desktop shortcut on MacOS with error: ${error}`
                )
            );
        }
    };
}

/**
 * Create desktop shortcut
 *
 * @param {Object} app, create desktop shortcut for which app.
 * @returns {Function} dispatch, dispatch action in Redux.
 */
export function createShortcut(app) {
    if (process.platform === 'win32') {
        return createShortcutForWindows(app);
    }
    if (process.platform === 'linux') {
        return createShortcutForLinux(app);
    }
    if (process.platform === 'darwin') {
        return createShortcutForMacOS(app);
    }
    return dispatch =>
        dispatch(
            ErrorDialogActions.showDialog(
                'Your operating system is neither win32, linux nor darwin'
            )
        );
}
