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

export const CREATE_LOCAL_APP_SHORTCUT = 'CREATE_LOCAL_APP_SHORTCUT';
export const CREATE_OFFICIAL_APP_SHORTCUT = 'CREATE_OFFICIAL_APP_SHORTCUT';

function createShortCutForWindows(app) {
    return dispatch => {
        const appObj = app.toJS();
        const shortcutObj = {
            displayName: appObj.displayName,
            isOfficial: appObj.isOfficial,
        };
        let shortcutStr = JSON.stringify(shortcutObj);
        shortcutStr = shortcutStr.replace(/"/g, '\\"');
        if (app.iconPath) {
            pngToIco(app.iconPath)
              .then(buf => {
                // result is a URL to the resulting icon file
                  const icoPath = path.join(app.path, 'icon.ico');
                  fs.writeFileSync(icoPath, buf);
                  return icoPath;
              })
              .then(icoPath => {
                  const shortcutStatus = shell.writeShortcutLink(
                      // Todo: rewrite this path with path.join()
                  `${config.getHomeDir()}\\Desktop\\${app.displayName || app.name} (${app.isOfficial ? 'Official' : 'Local'}).lnk`,
                      {
                          target: `${process.execPath}`,
                          // In Windows, use double quote surrounding arguments
                          args: `--args "${shortcutStr}"`,
                          icon: icoPath,
                          iconIndex: 0,
                      },
                  );
              })
              .catch(err => {
                  console.log(err);
              });
        }
    };
}

function createShortCutForLinux(app) {
    return dispatch => {
        const appObj = app.toJS();
        const shortcutObj = {
            displayName: appObj.displayName,
            isOfficial: appObj.isOfficial,
        };
        const shortcutStr = JSON.stringify(shortcutObj);
        const fileName = `${app.displayName || app.name} (${app.isOfficial ? 'Official' : 'Local'})`;
        let shortcutContent = '[Desktop Entry]\n';
        shortcutContent += 'Encoding=UTF-8\n';
        shortcutContent += `Version=${app.currentVersion}\n`;
        shortcutContent += `Name=${fileName}\n`;
        // In Linux, use single quote surrounding arguments
        shortcutContent += `Exec=${process.execPath} --args '${shortcutStr}'\n`;
        shortcutContent += 'Terminal=false\n';
        shortcutContent += `Icon=${app.iconPath}\n`;
        shortcutContent += 'Type=Application\n';


        let filePath = path.join(config.getHomeDir(), 'Desktop');
        filePath = path.join(filePath, `${fileName}.desktop)`);
        console.log(filePath);
        fs.writeFile(
                filePath,
                `${shortcutContent}`,
                err => {
                    if (err) {
                        return console.log(err);
                    }
                    fs.chmodSync(filePath, '775');
                    return null;
                });
    };
}

function createShortCutForMacOS(app) {

}

export function createShortCut(app) {
    console.log(process.platform);
    if (process.platform === 'win32') {
        return createShortCutForWindows(app);
    } else if (process.platform === 'linux') {
        return createShortCutForLinux(app);
    } else if (process.platform === 'darwin') {
        return createShortCutForMacOS(app);
    }
    return dispatch => dispatch(ErrorDialogActions.showDialog('The operating system is neither win32, linux nor darwin'));
}
