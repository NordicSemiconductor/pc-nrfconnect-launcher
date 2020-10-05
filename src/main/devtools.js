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

const { app, BrowserWindow } = require('electron');

let devToolsInstaller;
try {
    devToolsInstaller = require('electron-devtools-installer'); // eslint-disable-line global-require
} catch {
    // Ignore missing devtools dependency here, check later for it when needed
}

const installDevtools = async () => {
    try {
        const downloadAndInstall = devToolsInstaller.default;
        const devToolsExtensions = [
            devToolsInstaller.REACT_DEVELOPER_TOOLS,
            devToolsInstaller.REDUX_DEVTOOLS,
        ];
        const forceReinstall = true;

        await downloadAndInstall(devToolsExtensions, forceReinstall);
        console.log('Added devtool extensions');
        app.quit();
    } catch (err) {
        console.log('An error occurred while adding the devtools: ', err);
    }
};

const removeDevtools = () => {
    const devToolsExtensions = Object.keys(
        BrowserWindow.getDevToolsExtensions()
    );
    console.log('Removing devtool extensions:', devToolsExtensions);

    devToolsExtensions.forEach(BrowserWindow.removeDevToolsExtension);

    // Sometimes if we quit too fast we get a crash message here, so let us just wait a moment.
    setTimeout(app.quit, 1000);
};

module.exports = () => {
    if (devToolsInstaller == null) {
        return;
    }

    if (process.argv.includes('--install-devtools')) {
        installDevtools();
    }

    if (process.argv.includes('--remove-devtools')) {
        removeDevtools();
    }
};
