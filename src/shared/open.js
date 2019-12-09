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

import fs from 'fs';
import os from 'os';
import { shell } from 'electron';
import childProcess from 'child_process';

/**
 * Open a file in the default text application, depending on the user's OS.
 *
 * @param {string} filePath path to the file to open.
 * @param {function} callback signature: (error) => {}.
 * @returns {void}
 */
function openFile(filePath, callback) {
    fs.exists(filePath, exists => {
        if (!exists) {
            if (callback) {
                callback(new Error(`Could not find file at path: ${filePath}`));
            }
            return;
        }

        const escapedPath = filePath.replace(/ /g, '\\ ');

        // Could not find a method that works on all three platforms:
        // * shell.openItem works on Windows and Linux but not on OSX
        // * childProcess.execSync works on OSX but not on Windows
        if (os.type() === 'Darwin') {
            childProcess.execSync(`open ${escapedPath}`);
        } else {
            shell.openItem(escapedPath);
        }
        if (callback) {
            callback();
        }
    });
}

/**
 * Open a URL in the user's default web browser.
 *
 * @param {string} url The URL to open.
 * @returns {void}
 */
function openUrl(url) {
    shell.openExternal(url);
}

export {
    openFile,
    openUrl,
};
