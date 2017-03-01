import { spawn } from 'child_process';
import path from 'path';

function getQueryArgs(keyPath, queryString) {
    return ['query', keyPath, '/f', queryString, '/s'];
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
                reject(`Error when calling reg.exe: ${buffer}`);
            } else {
                resolve(buffer);
            }
        });

        proc.stdout.on('data', data => {
            buffer += data.toString();
        });

        proc.on('error', err => {
            reject(`Error when calling reg.exe: ${err.message}`);
        });
    });
}

function query(keyPath, queryString) {
    const args = getQueryArgs(keyPath, queryString);
    return regCmd(args);
}

export default {
    query,
};
