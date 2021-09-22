/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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
                path,
                homeDir,
                tmpDir,
            } = details;
            const official = isOfficial ? 'official' : 'local';
            logger.debug(`App ${name} v${currentVersion} ${official}`);
            logger.debug(`App path: ${path}`);
            logger.debug(
                `nRFConnect ${coreVersion}, required by the app is (${engineVersion})`
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
