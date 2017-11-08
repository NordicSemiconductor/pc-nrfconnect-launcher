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

import winston from 'winston';
import path from 'path';
import AppTransport from './appTransport';
import { createLogBuffer } from './logBuffer';
import { getUserDataDir } from '../core';
import { mkdirIfNotExists } from '../../../main/mkdir';

const filePrefix = new Date().toISOString().replace(/:/gi, '_');
const userDataDir = getUserDataDir();
let logFilePath;

const isDevelopment = process.env.NODE_ENV === 'development';
const isConsoleAvailable = (() => {
    try {
        process.stdout.write('');
    } catch (error) {
        return false;
    }
    return true;
})();

const logFormatter = options => {
    const timestamp = options.timestamp();
    const level = options.level.toUpperCase();
    const message = options.message || '';
    return `${timestamp.toISOString()} ${level} ${message}`;
};

const logBuffer = createLogBuffer();

const appTransport = new AppTransport({
    name: 'app',
    level: 'info',
    onLogEntry: logBuffer.addEntry,
});


const transports = [
    appTransport,
];

if (isDevelopment && isConsoleAvailable) {
    transports.push(new winston.transports.Console({
        name: 'console',
        level: 'silly',
        timestamp: () => new Date(),
        formatter: logFormatter,
    }));
}

const logger = new winston.Logger({ transports });

logger.addFileTransport = appBaseName => (
    new Promise(resolve => {
        const logDir = path.join(userDataDir, appBaseName);
        mkdirIfNotExists(logDir).then(() => {
            logFilePath = path.join(logDir, `${filePrefix}-log.txt`);
            const fileTransport = new winston.transports.File({
                name: 'file',
                filename: logFilePath,
                level: 'debug',
                json: false,
                timestamp: () => new Date(),
                formatter: logFormatter,
            });
            logger.add(fileTransport, {}, true);
        })
        .then(resolve)
        .catch(error => {
            console.error(error);
            resolve();
        });
    })
);

export default {
    logger,
    userDataDir,
    getLogFilePath: () => logFilePath,
    logBuffer,
};
