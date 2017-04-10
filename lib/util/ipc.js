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

import { ipcRenderer } from 'electron';

/**
 * Sends a message on the given IPC channel with optional arguments.
 * Expects to receive response on '{name}-success' and '{name}-error'
 * channels.
 *
 * @param {string} name the channel name to send on.
 * @param {Array} args optional argument array.
 * @returns {Promise} resolves if response received on '{name}-success'
 * and rejects if response received on '{name}-error'.
 */
function sendIpcAsync(name, args = []) {
    return new Promise((resolve, reject) => {
        const successChannel = `${name}-success`;
        const errorChannel = `${name}-error`;
        ipcRenderer.on(successChannel, (event, response) => {
            ipcRenderer.removeAllListeners(successChannel);
            ipcRenderer.removeAllListeners(errorChannel);
            resolve(response);
        });
        ipcRenderer.on(errorChannel, (event, errorMessage) => {
            ipcRenderer.removeAllListeners(successChannel);
            ipcRenderer.removeAllListeners(errorChannel);
            reject(new Error(errorMessage));
        });
        ipcRenderer.send(name, ...args);
    });
}

function getOfficialApps() {
    return sendIpcAsync('get-official-apps');
}

function getLocalApps() {
    return sendIpcAsync('get-local-apps');
}

function installOfficialApp(name) {
    return sendIpcAsync('install-official-app', [name]);
}

function removeOfficialApp(name) {
    return sendIpcAsync('remove-official-app', [name]);
}

export default {
    getOfficialApps,
    getLocalApps,
    installOfficialApp,
    removeOfficialApp,
};
