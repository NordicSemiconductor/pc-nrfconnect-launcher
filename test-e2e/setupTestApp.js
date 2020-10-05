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
import electron from 'electron';
import rimraf from 'rimraf';

const startApp = async extraArgs => {
    const projectPath = path.resolve(__dirname, '../');
    const electronArgs = [
        projectPath,
        '--skip-update-core',
        '--skip-splash-screen',
        ...extraArgs,
    ];
    if (process.env.LOG_ELECTRON_ARGS) {
        console.log(
            `Electron is run with these args: ${electronArgs.join(' ')}`
        );
    }

    const app = new Application({
        path: electron,
        args: electronArgs,
        startTimeout: 30000,
        webdriverOptions: {
            waitforTimeout: 10000,
        },
    });

    await app.start();

    expect(app.isRunning()).toEqual(true);

    return app;
};

const stopApp = async app => {
    if (!app || !app.isRunning()) return;

    await app.stop();

    expect(app.isRunning()).toEqual(false);
};

export default ({
    appsRootDir,
    additionalBeforeEach = () => {},
    additionalAfterEach = () => {},
    openLocalApp,
    openOfficialApp,
    removeAppsRootDirAfterwards = false,
    settingsJsonPath,
    skipUpdateApps = true,
} = {}) => {
    const app = {};
    let spectronApp;

    const absoluteAppsRootDir = path.resolve(__dirname, appsRootDir);
    beforeEach(async () => {
        additionalBeforeEach();

        const electronArgs = [
            `--apps-root-dir=${absoluteAppsRootDir}`,
            ...(settingsJsonPath
                ? [
                      `--settings-json-path=${path.join(
                          __dirname,
                          settingsJsonPath
                      )}`,
                  ]
                : []),
            ...(skipUpdateApps ? ['--skip-update-apps'] : []),
            ...(openLocalApp ? [`--open-local-app=${openLocalApp}`] : []),
            ...(openOfficialApp
                ? [`--open-official-app=${openOfficialApp}`]
                : []),
        ];

        spectronApp = await startApp(electronArgs);
        app.client = spectronApp.client;
    });

    afterEach(async () => {
        await stopApp(spectronApp);
        if (removeAppsRootDirAfterwards) {
            rimraf.sync(absoluteAppsRootDir);
        }
        additionalAfterEach();
    });

    return app;
};
