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

const { app, session } = require('electron');
const { exit } = require('process');
const path = require('path');
const fs = require('fs');

let devToolsInstaller;
let installExtension;
let REACT_DEVELOPER_TOOLS;
let REDUX_DEVTOOLS;

try {
    devToolsInstaller = require('electron-devtools-installer'); // eslint-disable-line global-require
} catch (err) {
    // Ignore missing devtools dependency here, check later for it when needed
}

if (devToolsInstaller) {
    installExtension = devToolsInstaller.default;
    REACT_DEVELOPER_TOOLS = devToolsInstaller.REACT_DEVELOPER_TOOLS;
    REDUX_DEVTOOLS = devToolsInstaller.REDUX_DEVTOOLS;
}

const installDevtools = async () => {
    try {
        await installExtension(REDUX_DEVTOOLS);
        await installExtension(REACT_DEVELOPER_TOOLS);
        console.log('Added devtool extensions');
        app.quit();
    } catch (err) {
        console.log('An error occurred while adding the devtools: ', err);
        exit(1);
    }
};

// Look for installed extensions and remove them
const removeDevtools = () => {
    try {
        [REDUX_DEVTOOLS.id, REACT_DEVELOPER_TOOLS.id].forEach(id => {
            const extensionPath = path.join(
                session.defaultSession.getStoragePath(),
                'extensions',
                id
            );

            if (fs.existsSync(extensionPath)) {
                fs.rmdirSync(extensionPath, { recursive: true });
            }
        });
        exit(0);
    } catch (err) {
        console.log('An error occurred while removing devtools: ', err);
        exit(1);
    }
};

// Look for installed extensions and load them
const loadInstalledDevtools = () => {
    try {
        const storagePath = session.defaultSession.getStoragePath();
        [REDUX_DEVTOOLS.id, REACT_DEVELOPER_TOOLS.id].forEach(id => {
            const extensionPath = path.join(storagePath, 'extensions', id);

            if (fs.existsSync(extensionPath)) {
                session.defaultSession.loadExtension(extensionPath, {
                    allowFileAccess: true,
                });
            }
        });
    } catch (err) {
        console.log(
            'An error occurred while loading installed devtools: ',
            err
        );
        exit(1);
    }
};

module.exports = () => {
    if (process.argv.includes('--install-devtools')) {
        installDevtools();
        return;
    }

    if (process.argv.includes('--remove-devtools')) {
        removeDevtools();
        return;
    }

    loadInstalledDevtools();
};
