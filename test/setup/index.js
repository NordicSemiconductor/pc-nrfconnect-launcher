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

import path from 'path';
import { Application } from 'spectron';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
const projectPath = path.resolve(__dirname, '../../');

let electronPath;
if (process.platform === 'win32') {
    electronPath = path.resolve(__dirname, '../../node_modules/.bin/electron.cmd');
} else {
    electronPath = path.resolve(__dirname, '../../node_modules/.bin/electron');
}

function startElectronApp(extraArgs) {
    const args = [
        projectPath,
        '--skip-update-apps',
        '--skip-update-core',
        '--skip-splash-screen',
    ];
    const electronApp = new Application({
        path: electronPath,
        args: args.concat(extraArgs),
        startTimeout: 30000,
    });
    return electronApp.start()
        .then(() => expect(electronApp.isRunning()).toEqual(true))
        .then(() => electronApp);
}

function stopElectronApp(electronApp) {
    if (!electronApp || !electronApp.isRunning()) return Promise.resolve();

    return electronApp.stop()
        .then(() => expect(electronApp.isRunning()).toEqual(false));
}

function waitForWindowCount(electronApp, numWindows) {
    return new Promise((resolve, reject) => {
        let retryCount = 0;
        const getWindowCount = () => {
            electronApp.client.getWindowCount()
                .then(count => {
                    if (count === numWindows) {
                        resolve();
                    } else if (retryCount > 5) {
                        reject(new Error(`Timed out while waiting for ${numWindows} windows`));
                    } else {
                        retryCount += 1;
                        setTimeout(getWindowCount, 500);
                    }
                })
                .catch(error => reject(error));
        };
        getWindowCount();
    });
}

export default {
    startElectronApp,
    stopElectronApp,
    waitForWindowCount,
};
