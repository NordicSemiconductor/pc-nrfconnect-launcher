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

export const checkTitleOfWindow = (app, titleString) =>
    expect(app.client.browserWindow.getTitle()).resolves.toContain(titleString);

export const checkTitleOfSecondWindow = (app, titleString) =>
    expect(
        app.client.windowByIndex(1).browserWindow.getTitle()
    ).resolves.toContain(titleString);

export const checkAppListContains = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');

    await expect(app.client.getText('.list-group-item .h8')).resolves.toEqual(
        appName
    );
};

export const checkHasInstallButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await app.client.waitForVisible(`[title="Install ${appName}"]`);
};

export const checkHasNoInstallButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await expect(
        app.client.isVisible(`[title="Install ${appName}"]`)
    ).resolves.toBe(false);
};

export const checkHasNoLaunchButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await expect(
        app.client.isVisible(`[title="Open ${appName}"]`)
    ).resolves.toBe(false);
};

export const checkShowsAppUpdate = async (app, appName, availableVersion) => {
    await app.client.waitForVisible(`[title="Update ${appName}"]`);
    await expect(app.client.getText('.list-group-item')).resolves.toContain(
        `${availableVersion} available`
    );
};

export const checkShowsNoAppUpdate = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await expect(
        app.client.isVisible(`[title="Update ${appName}"]`)
    ).resolves.toBe(false);

    await expect(app.client.getText('.list-group-item')).resolves.not.toContain(
        'available'
    );
};

export const checkHasRemoveButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await app.client.click('.list-group-item button[aria-haspopup="true"]');
    await app.client.waitForVisible(`[title="Remove ${appName}"]`);
};

export const checkHasNoRemoveButton = async (app, appName) => {
    await app.client.waitForVisible('.list-group-item');
    await app.client.click('.list-group-item button[aria-haspopup="true"]');
    await expect(
        app.client.isVisible(`[title="Remove ${appName}"]`)
    ).resolves.toBe(false);
};
