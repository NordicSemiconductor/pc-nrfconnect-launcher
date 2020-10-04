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
import { logger } from 'pc-nrfconnect-shared';
import { getAppDataDir } from '../../api/core';

/**
 * Indicates that adding of log entries have been requested. This is dispatched
 * at regular intervals when some part of the application (core framework or app)
 * has used the winston logger instance to log something.
 *
 * @param {Array} entries Array of objects with id (number), time (Date), level
 * (number), message (string), and meta (object) properties.
 */
export const ADD_ENTRIES = 'LOG_ADD_ENTRIES';

/**
 * Indicates that clearing of all log entries in state has been requested.
 */
export const CLEAR_ENTRIES = 'LOG_CLEAR_ENTRIES';

/**
 * Indicates that toggling of auto scrolling in the LogViewer has been requested.
 */
export const TOGGLE_AUTOSCROLL = 'LOG_TOGGLE_AUTOSCROLL';

/**
 * Indicates that log container resize has been requested.
 */
export const RESIZE_LOG_CONTAINER = 'LOG_RESIZE_LOG_CONTAINER';

const LOG_UPDATE_INTERVAL = 400;
let logListenerTimeout;

function addEntries(entries) {
    return {
        type: ADD_ENTRIES,
        entries,
    };
}

function clearEntries() {
    return {
        type: CLEAR_ENTRIES,
    };
}

export function toggleAutoScroll() {
    return {
        type: TOGGLE_AUTOSCROLL,
    };
}

export function resizeLogContainer(containerHeight) {
    return {
        type: RESIZE_LOG_CONTAINER,
        containerHeight,
    };
}

/**
 * Listens to new log entries on every LOG_UPDATE_INTERVAL, and adds any
 * new entries that may have arrived in this the interval.
 *
 * @param {function} dispatch The redux dispatch function.
 * @returns {void}
 */
function listenToLogUpdates(dispatch) {
    const entries = logger.getAndClearEntries();
    if (entries.length > 0) {
        dispatch(addEntries(entries));
    }

    logListenerTimeout = setTimeout(() => {
        listenToLogUpdates(dispatch);
    }, LOG_UPDATE_INTERVAL);
}

function stopLogListener() {
    if (logListenerTimeout) {
        clearTimeout(logListenerTimeout);
    }
}

export function openLogFile() {
    logger.openLogFile();
}

export function clear() {
    return clearEntries();
}

/**
 * Starts listening to new log entries from the application's log buffer.
 * Incoming entries are added to the state, so that they can be displayed
 * in the UI.
 *
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function startReading() {
    return dispatch => {
        logger.info(`Application data folder: ${getAppDataDir()}`);

        ipcRenderer.once('app-details', (event, details) => {
            const {
                name,
                currentVersion,
                engineVersion,
                coreVersion,
                corePath,
                isOfficial,
                isSupportedEngine,
                path,
                homeDir,
                tmpDir,
            } = details;
            const official = isOfficial ? 'official' : 'local';
            const supported = isSupportedEngine
                ? 'is supported'
                : 'is not supported';
            logger.debug(`App ${name} v${currentVersion} ${official}`);
            logger.debug(`App path: ${path}`);
            logger.debug(
                `nRFConnect ${coreVersion} ${supported} by the app (${engineVersion})`
            );
            logger.debug(`nRFConnect path: ${corePath}`);
            logger.debug(`HomeDir: ${homeDir}`);
            logger.debug(`TmpDir: ${tmpDir}`);
        });
        ipcRenderer.send('get-app-details');

        return listenToLogUpdates(dispatch);
    };
}

export function stopReading() {
    stopLogListener();
}
