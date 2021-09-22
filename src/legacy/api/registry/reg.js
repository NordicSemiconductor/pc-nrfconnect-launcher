/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawn } from 'child_process';
import path from 'path';

function getQueryArgs(keyPath, queryString) {
    return ['query', keyPath, '/f', queryString, '/s', '/t', 'REG_SZ'];
}

function getRegExePath() {
    // Use full path to reg.exe in case the user has a different
    // reg.exe in their PATH environment variable
    return path.join(path.join(process.env.windir, 'system32'), 'reg.exe');
}

function regCmd(args) {
    return new Promise((resolve, reject) => {
        const proc = spawn(getRegExePath(), args, {
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let buffer = '';

        proc.on('close', code => {
            if (code !== 0) {
                // The reg.exe command exits with code 1 if a query returns
                // zero results. However, this could also indicate that there
                // is an error, so logging it for traceability reasons.
                console.log(
                    `The reg.exe command exited with code ${code}. ` +
                        `Arguments: ${JSON.stringify(args)}. Output: ${buffer}.`
                );
            }
            resolve(buffer);
        });

        proc.stdout.on('data', data => {
            buffer += data.toString();
        });

        proc.on('error', err => {
            reject(new Error(`Error when calling reg.exe: ${err.message}`));
        });
    });
}

function query(keyPath, queryString) {
    const args = getQueryArgs(keyPath, queryString);
    return regCmd(args);
}

/* eslint-disable import/prefer-default-export */
export { query };
