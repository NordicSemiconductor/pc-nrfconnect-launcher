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

'use strict';

import { remote, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import pngToIco from 'png-to-ico';

import * as ErrorDialogActions from '../../../actions/errorDialogActions';

const config = remote.require('./main/config');

export const CREATE_APP_SHORTCUT = 'CREATE_APP_SHORTCUT';


let fileName;
let args;
let filePath;

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
            pngToIco(app.iconPath)
              .then(buf => {
                  const icoPath = path.join(app.path, 'icon.ico');
                  fs.writeFileSync(icoPath, buf);
                  return icoPath;
              })
              .then(icoPath => {
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
              })
              .catch(err => {
                  dispatch(ErrorDialogActions.showDialog(`Fail to create desktop shortcut on Windows with error: ${err}`));
              });
        } else {
            dispatch(ErrorDialogActions.showDialog('Fail to create desktop since app.iconPath is not set'));
        }
    };
}

function createShortcutForLinux(app) {
    return dispatch => {
        dispatch(createAppShortcut(app.name));
        filePath = path.join(filePath, `${fileName}.desktop`);
        let shortcutContent = '[Desktop Entry]\n';
        shortcutContent += 'Encoding=UTF-8\n';
        shortcutContent += `Version=${app.currentVersion}\n`;
        shortcutContent += `Name=${fileName}\n`;
        // In Linux, use single quote surrounding arguments
        shortcutContent += `Exec=${config.getElectronExePath()} ${args}\n`;
        shortcutContent += 'Terminal=false\n';
        shortcutContent += `Icon=${app.iconPath}\n`;
        shortcutContent += 'Type=Application\n';

        fs.writeFile(
                filePath,
                shortcutContent,
                err => {
                    if (err) {
                        return dispatch(ErrorDialogActions.showDialog(`Fail to create desktop shortcut on Linux with error: ${err}`));
                    }
                    fs.chmodSync(filePath, '755');
                    return null;
                });
    };
}

function createShortcutForMacOS(app) {
    return dispatch => {
        dispatch(createAppShortcut(app.name));
        filePath = path.join(filePath, `${fileName}.command`);
        const shortcutContent = `${config.getElectronExePath().replace(/ /g, '\\ ')} ${args}`;
        fs.writeFile(
                filePath,
                shortcutContent,
                err => {
                    if (err) {
                        return dispatch(ErrorDialogActions.showDialog(`Fail to create desktop shortcut on Linux with error: ${err}`));
                    }
                    fs.chmodSync(filePath, '755');
                    return null;
                });
    };
}

export function createShortcut(app) {
    fileName = `${app.displayName || app.name} (${app.isOfficial ? 'Official' : 'Local'})`;
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
