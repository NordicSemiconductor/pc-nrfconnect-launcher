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

import { createLogger, format, transports } from 'winston';
import { SPLAT } from 'triple-beam';
import path from 'path';
import { openFile } from '../open';
import AppTransport from './appTransport';
import ConsoleTransport from './consoleTransport';
import createLogBuffer from './logBuffer';

const filePrefix = new Date().toISOString().replace(/:/gi, '_');
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

const logBuffer = createLogBuffer();

const logTransports = [
    new AppTransport({
        name: 'app',
        level: 'info',
        onLogEntry: logBuffer.addEntry,
    }),
];

if (isDevelopment && isConsoleAvailable) {
    logTransports.push(new ConsoleTransport({
        name: 'console',
        level: 'silly',
        debugStdout: false,
        stderrLevels: ['silly', 'debug', 'verbose', 'info', 'warn', 'error'],
    }));
}

const logger = createLogger({
    format: format.combine(
        format(info => ({
            ...info,
            message: info[SPLAT] ? `${info.message} ${info[SPLAT].join(' ')}` : info.message,
        }))(),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => (
            `${timestamp} ${level.toUpperCase()} ${message || ''}`
        )),
    ),
    transports: logTransports,
});

logger.addFileTransport = appLogDir => {
    logFilePath = path.join(appLogDir, `${filePrefix}-log.txt`);
    const fileTransport = new transports.File({
        name: 'file',
        filename: logFilePath,
        level: 'debug',
    });
    logger.add(fileTransport, {}, true);
};

logger.getAndClearEntries = () => logBuffer.clear();

logger.openLogFile = () => {
    openFile(logFilePath, err => {
        if (err) {
            logger.error(`Unable to open log file: ${err.message}`);
        }
    });
};

export default logger;
