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

'use strict';

import { remote, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import Mustache from 'mustache';

import * as ErrorDialogActions from '../../../actions/errorDialogActions';

const fse = remote.require('fs-extra');
const png2icons = remote.require('png2icons');
const config = remote.require('./main/config');
const fileUtil = remote.require('./main/fileUtil');

export const CREATE_APP_SHORTCUT = 'CREATE_APP_SHORTCUT';

let fileName;
let args;
let filePath;
const mode = (fs.constants.S_IRWXU | fs.constants.S_IRWXG | fs.constants.S_IRWXO);

function createAppShortcut(name) {
    return {
        type: CREATE_APP_SHORTCUT,
        name,
    };
}

function createShortcutForWindows(app) {
    return dispatch => {
        dispatch(createAppShortcut(app.name));
        filePath = path.join(filePath, `${fileName}.lnk`);
        if (app.iconPath) {
            // Convert icns file for the app
            const icoPath = path.join(app.path, 'icon.ico');
            const input = fs.readFileSync(app.iconPath);
            const output = png2icons.PNG2ICO_PNG(input, png2icons.BILINEAR, false, 0);
            if (output) {
                fs.writeFileSync(icoPath, output);
            }
            const shortcutStatus = shell.writeShortcutLink(
                filePath,
                {
                    target: config.getElectronExePath(),
                    // In Windows, use double quote surrounding arguments
                    args,
                    icon: icoPath,
                    // iconIndex has to be set to change icon
                    iconIndex: 0,
                },
                );
            if (shortcutStatus !== true) {
                dispatch(ErrorDialogActions.showDialog('Fail with shell.writeShortcutLink'));
            }
        } else {
            dispatch(ErrorDialogActions.showDialog('Fail to create desktop since app.iconPath is not set'));
        }
    };
}

export function generateShortcutContent(app) {
    let shortcutContent = '[Desktop Entry]\n';
    shortcutContent += 'Encoding=UTF-8\n';
    shortcutContent += `Version=${app.currentVersion}\n`;
    shortcutContent += `Name=${fileName}\n`;
    // In Linux, use single quote surrounding arguments
    shortcutContent += `Exec=${config.getElectronExePath()} ${args}\n`;
    shortcutContent += 'Terminal=false\n';
    shortcutContent += `Icon=${app.iconPath}\n`;
    shortcutContent += 'Type=Application\n';
    if (!fileName || !args) { return null; }
    return shortcutContent;
}

function createShortcutForLinux(app) {
    return dispatch => {
        dispatch(createAppShortcut(app.name));
        filePath = path.join(filePath, `${fileName}.desktop`);
        const shortcutContent = generateShortcutContent(app);
        if (!shortcutContent) {
            return dispatch(ErrorDialogActions.showDialog('Fail to create desktop shortcut since the shortcut content is empty'));
        }
        fs.writeFile(
                filePath,
                shortcutContent,
                err => {
                    if (err) {
                        return dispatch(ErrorDialogActions.showDialog(`Fail to create desktop shortcut on Linux with error: ${err}`));
                    }
                    fs.chmodSync(filePath, mode);
                    return null;
                });
        return null;
    };
}

function createShortcutForMacOS(app) {
    return dispatch => {
        dispatch(createAppShortcut(app.name));
        filePath = path.join(filePath, `${fileName}.app`);
        const appTemplatePath = path.join(config.getElectronRootPath(), '/resources/mac/template.app');
        const tmpAppTemplatePath = path.join(config.getTmpDir(), '/com.nordicsemi.nrfconnet/template.app');

        // Create Info.plist
        const infoTemplatePath = path.join(appTemplatePath, '/Contents/Info.plist');
        const infoTmpPath = path.join(tmpAppTemplatePath, '/Contents/Info.plist');
        const identifier = `com.nordicsemi.nrfconnet.${app.name}${app.isOfficial ? '' : '-local'}`;
        const infoContentSource = fs.readFileSync(infoTemplatePath, 'UTF-8');
        Mustache.parse(infoContentSource);
        const infoContentData = {
            identifier,
            fileName,
        };
        const infoContent = Mustache.render(infoContentSource, infoContentData);

        // Create document.wflow
        const wflowTemplatePath = path.join(appTemplatePath, '/Contents/document.wflow');
        const wflowTmpPath = path.join(tmpAppTemplatePath, '/Contents/document.wflow');
        // In MacOS spaces should be replaced
        const shortcutCMD = `${config.getElectronExePath().replace(/ /g, '\\ ')} ${args}`;
        const wflowContentSource = fs.readFileSync(wflowTemplatePath, 'UTF-8');
        Mustache.parse(wflowContentSource);
        const wflowContentData = {
            shortcutCMD,
        };
        const wflowContent = Mustache.render(wflowContentSource, wflowContentData);

        fileUtil.copyFromAsar(appTemplatePath, tmpAppTemplatePath, 5)
        .then(() => fileUtil.chmodDir(tmpAppTemplatePath, mode))
        .then(() => new Promise((resolve, reject) => {
            // Convert icns file for the app
            const icnsPath = path.join(tmpAppTemplatePath, '/Contents/Resources/icon.icns');
            const input = fs.readFileSync(app.iconPath);
            const output = png2icons.PNG2ICNS(input, png2icons.HERMITE, false, 0);
            if (output) {
                fs.writeFileSync(icnsPath, output);
                resolve();
            }
            reject(new Error('Error occured while converting icon.png to icon.icns.'));
        }))
        .then(() => fileUtil.createTextFile(wflowTmpPath, wflowContent))
        .then(() => fileUtil.createTextFile(infoTmpPath, infoContent))
        .then(() => fileUtil.copy(tmpAppTemplatePath, filePath))
        .then(() => {
            const appExecPath = path.join(filePath, '/Contents/MacOS/Application Stub');
            filePath = path.join(config.getHomeDir(), `/Applications/${fileName}.app/`);
            return fse.chmod(appExecPath, mode);
        })
        .then(() => fileUtil.copy(tmpAppTemplatePath, filePath))
        .then(() => {
            const appExecPath = path.join(filePath, '/Contents/MacOS/Application Stub');
            return fse.chmod(appExecPath, mode);
        })
        .catch(error => {
            dispatch(ErrorDialogActions.showDialog(`Error occured while create desktop shortcut on MacOS with error: ${error}`));
        });
    };
}

export function createShortcut(app) {
    fileName = `${app.displayName || app.name}${app.isOfficial ? '' : ' (Local)'}`;
    args = `--args ${app.isOfficial ? '--open-official-app' : '--open-local-app'} ${app.name}`;
    filePath = config.getDesktopDir();
    if (process.platform === 'win32') {
        return createShortcutForWindows(app);
    } else if (process.platform === 'linux') {
        return createShortcutForLinux(app);
    } else if (process.platform === 'darwin') {
        return createShortcutForMacOS(app);
    }
    return dispatch => dispatch(ErrorDialogActions.showDialog('Your operating system is neither win32, linux nor darwin'));
}

export function dragShortcut(app, event) {
    return dispatch => {
        // Mouse coordinates
        const mX = event.pageX;
        const mY = event.pageY;
        // Window width and height
        const wX = window.innerWidth;
        const wY = window.innerHeight;

        if (mX < 0 || mY < 0 || mX > wX || mY > wY) {
            dispatch(createShortcut(app));
        }
    };
}
