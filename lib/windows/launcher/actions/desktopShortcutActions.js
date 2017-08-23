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

import * as ErrorDialogActions from '../../../actions/errorDialogActions';

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
        const tmpAppTemplatePath = path.join(config.getTmpDir(), 'template.app');
        const infoPath = path.join(tmpAppTemplatePath, '/Contents/Info.plist');
        const identifier = `com.nordicsemi.nrfconnet.${app.name}`;
        const infoContent = `
            <?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
            <plist version="1.0">
            <dict>
            	<key>AMIsApplet</key>
            	<true/>
            	<key>AMStayOpen</key>
            	<false/>
            	<key>BuildMachineOSBuild</key>
            	<string>15E8</string>
            	<key>CFBundleDevelopmentRegion</key>
            	<string>English</string>
            	<key>CFBundleDocumentTypes</key>
            	<array>
            		<dict>
            			<key>CFBundleTypeExtensions</key>
            			<array>
            				<string>*</string>
            			</array>
            			<key>CFBundleTypeName</key>
            			<string>Automator workflow file</string>
            			<key>CFBundleTypeOSTypes</key>
            			<array>
            				<string>****</string>
            			</array>
            			<key>CFBundleTypeRole</key>
            			<string>Viewer</string>
            		</dict>
            	</array>
            	<key>CFBundleExecutable</key>
            	<string>Application Stub</string>
            	<key>CFBundleIconFile</key>
            	<string>icon.icns</string>
            	<key>CFBundleIdentifier</key>
            	<string>${identifier}${app.isOfficial ? '' : '-local'}</string>
            	<key>CFBundleInfoDictionaryVersion</key>
            	<string>6.0</string>
            	<key>CFBundleName</key>
            	<string>${fileName}</string>
            	<key>CFBundlePackageType</key>
            	<string>APPL</string>
            	<key>CFBundleShortVersionString</key>
            	<string>1.2</string>
            	<key>CFBundleSignature</key>
            	<string>????</string>
            	<key>CFBundleSupportedPlatforms</key>
            	<array>
            		<string>MacOSX</string>
            	</array>
            	<key>CFBundleURLTypes</key>
            	<array/>
            	<key>CFBundleVersion</key>
            	<string>419</string>
            	<key>DTCompiler</key>
            	<string>com.apple.compilers.llvm.clang.1_0</string>
            	<key>DTPlatformBuild</key>
            	<string>7C43</string>
            	<key>DTPlatformVersion</key>
            	<string>GM</string>
            	<key>DTSDKBuild</key>
            	<string>15E8</string>
            	<key>DTSDKName</key>
            	<string>macosx10.11internal</string>
            	<key>DTXcode</key>
            	<string>0720</string>
            	<key>DTXcodeBuild</key>
            	<string>7C43</string>
            	<key>LSMinimumSystemVersion</key>
            	<string>10.5</string>
            	<key>LSMinimumSystemVersionByArchitecture</key>
            	<dict>
            		<key>x86_64</key>
            		<string>10.6</string>
            	</dict>
            	<key>LSUIElement</key>
            	<true/>
            	<key>NSAppleScriptEnabled</key>
            	<string>YES</string>
            	<key>NSMainNibFile</key>
            	<string>ApplicationStub</string>
            	<key>NSPrincipalClass</key>
            	<string>NSApplication</string>
            	<key>NSServices</key>
            	<array/>
            	<key>UTExportedTypeDeclarations</key>
            	<array/>
            	<key>UTImportedTypeDeclarations</key>
            	<array/>
            </dict>
            </plist>
        `;
        const wflowPath = path.join(tmpAppTemplatePath, '/Contents/document.wflow');
        // In MacOS spaces should be replaced
        const shortcutCMD = `${config.getElectronExePath().replace(/ /g, '\\ ')} ${args}`;
        const wflowContent = `
            <?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
            <plist version="1.0">
            <dict>
            	<key>AMApplicationBuild</key>
            	<string>419</string>
            	<key>AMApplicationVersion</key>
            	<string>2.6</string>
            	<key>AMDocumentVersion</key>
            	<string>2</string>
            	<key>actions</key>
            	<array>
            		<dict>
            			<key>action</key>
            			<dict>
            				<key>AMAccepts</key>
            				<dict>
            					<key>Container</key>
            					<string>List</string>
            					<key>Optional</key>
            					<true/>
            					<key>Types</key>
            					<array>
            						<string>com.apple.cocoa.string</string>
            					</array>
            				</dict>
            				<key>AMActionVersion</key>
            				<string>2.0.3</string>
            				<key>AMApplication</key>
            				<array>
            					<string>Automator</string>
            				</array>
            				<key>AMParameterProperties</key>
            				<dict>
            					<key>COMMAND_STRING</key>
            					<dict/>
            					<key>CheckedForUserDefaultShell</key>
            					<dict/>
            					<key>inputMethod</key>
            					<dict/>
            					<key>shell</key>
            					<dict/>
            					<key>source</key>
            					<dict/>
            				</dict>
            				<key>AMProvides</key>
            				<dict>
            					<key>Container</key>
            					<string>List</string>
            					<key>Types</key>
            					<array>
            						<string>com.apple.cocoa.string</string>
            					</array>
            				</dict>
            				<key>ActionBundlePath</key>
            				<string>/System/Library/Automator/Run Shell Script.action</string>
            				<key>ActionName</key>
            				<string>Run Shell Script</string>
            				<key>ActionParameters</key>
            				<dict>
            					<key>COMMAND_STRING</key>
            					<string>${shortcutCMD}</string>
            					<key>CheckedForUserDefaultShell</key>
            					<true/>
            					<key>inputMethod</key>
            					<integer>0</integer>
            					<key>shell</key>
            					<string>/bin/zsh</string>
            					<key>source</key>
            					<string></string>
            				</dict>
            				<key>BundleIdentifier</key>
            				<string>com.apple.RunShellScript</string>
            				<key>CFBundleVersion</key>
            				<string>2.0.3</string>
            				<key>CanShowSelectedItemsWhenRun</key>
            				<false/>
            				<key>CanShowWhenRun</key>
            				<true/>
            				<key>Category</key>
            				<array>
            					<string>AMCategoryUtilities</string>
            				</array>
            				<key>Class Name</key>
            				<string>RunShellScriptAction</string>
            				<key>InputUUID</key>
            				<string>7E814181-F8D0-418F-8A42-CAC390E79D59</string>
            				<key>Keywords</key>
            				<array>
            					<string>Shell</string>
            					<string>Script</string>
            					<string>Command</string>
            					<string>Run</string>
            					<string>Unix</string>
            				</array>
            				<key>OutputUUID</key>
            				<string>7011594D-91B3-404F-BDE6-F371BB977719</string>
            				<key>UUID</key>
            				<string>D3915FE3-6845-4FDA-8E78-305B38A3D5BB</string>
            				<key>UnlocalizedApplications</key>
            				<array>
            					<string>Automator</string>
            				</array>
            				<key>arguments</key>
            				<dict>
            					<key>0</key>
            					<dict>
            						<key>default value</key>
            						<integer>0</integer>
            						<key>name</key>
            						<string>inputMethod</string>
            						<key>required</key>
            						<string>0</string>
            						<key>type</key>
            						<string>0</string>
            						<key>uuid</key>
            						<string>0</string>
            					</dict>
            					<key>1</key>
            					<dict>
            						<key>default value</key>
            						<string></string>
            						<key>name</key>
            						<string>source</string>
            						<key>required</key>
            						<string>0</string>
            						<key>type</key>
            						<string>0</string>
            						<key>uuid</key>
            						<string>1</string>
            					</dict>
            					<key>2</key>
            					<dict>
            						<key>default value</key>
            						<false/>
            						<key>name</key>
            						<string>CheckedForUserDefaultShell</string>
            						<key>required</key>
            						<string>0</string>
            						<key>type</key>
            						<string>0</string>
            						<key>uuid</key>
            						<string>2</string>
            					</dict>
            					<key>3</key>
            					<dict>
            						<key>default value</key>
            						<string></string>
            						<key>name</key>
            						<string>COMMAND_STRING</string>
            						<key>required</key>
            						<string>0</string>
            						<key>type</key>
            						<string>0</string>
            						<key>uuid</key>
            						<string>3</string>
            					</dict>
            					<key>4</key>
            					<dict>
            						<key>default value</key>
            						<string>/bin/sh</string>
            						<key>name</key>
            						<string>shell</string>
            						<key>required</key>
            						<string>0</string>
            						<key>type</key>
            						<string>0</string>
            						<key>uuid</key>
            						<string>4</string>
            					</dict>
            				</dict>
            				<key>isViewVisible</key>
            				<true/>
            				<key>location</key>
            				<string>309.000000:253.000000</string>
            				<key>nibPath</key>
            				<string>/System/Library/Automator/Run Shell Script.action/Contents/Resources/English.lproj/main.nib</string>
            			</dict>
            			<key>isViewVisible</key>
            			<true/>
            		</dict>
            	</array>
            	<key>connectors</key>
            	<dict/>
            	<key>workflowMetaData</key>
            	<dict>
            		<key>workflowTypeIdentifier</key>
            		<string>com.apple.Automator.application</string>
            	</dict>
            </dict>
            </plist>
        `;

        fileUtil.chmodDir(tmpAppTemplatePath, mode)
        .then(() => fileUtil.copy(appTemplatePath, tmpAppTemplatePath))
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
            reject();
        }))
        .then(() => fileUtil.createTextFile(wflowPath, wflowContent))
        .then(() => fileUtil.createTextFile(infoPath, infoContent))
        .then(() => fileUtil.copy(tmpAppTemplatePath, filePath))
        .then(() => fileUtil.chmodDir(filePath, mode))
        .then(() => new Promise(resolve => {
            const appExecPath = path.join(filePath, '/Contents/MacOS/Application Stub');
            fs.chmodSync(appExecPath, mode);
            filePath = path.join(config.getHomeDir(), `/Applications/${fileName}.app/`);
            resolve();
        }))
        .then(() => fileUtil.copy(tmpAppTemplatePath, filePath))
        .then(() => fileUtil.chmodDir(filePath, mode))
        .then(() => new Promise(resolve => {
            const appExecPath = path.join(filePath, '/Contents/MacOS/Application Stub');
            fs.chmodSync(appExecPath, mode);
            resolve();
        }));
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
