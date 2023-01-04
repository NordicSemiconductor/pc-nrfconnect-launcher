/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import chmodr from 'chmodr';
import fs from 'fs-extra';
import path from 'path';
import targz from 'targz';

import describeError from './describeError';

const readFile = (filePath: string) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`Unable to read ${filePath}: ${describeError(error)}`);
    }
};

export const readJsonFile = <T>(filePath: string) => {
    try {
        return <T>JSON.parse(readFile(filePath));
    } catch (error) {
        throw new Error(`Unable to parse ${filePath}: ${describeError(error)}`);
    }
};

const isDirectory = (dirPath: string) => (file: string) => {
    const fileStats = fs.statSync(path.join(dirPath, file));

    return fileStats.isDirectory() && !file.startsWith('.');
};

export const listDirectories = (dirPath: string): string[] =>
    !fs.existsSync(dirPath)
        ? []
        : fs.readdirSync(dirPath).filter(isDirectory(dirPath));

const isFile = (dirPath: string, file: string) => {
    const fileStats = fs.statSync(path.join(dirPath, file));
    return fileStats.isFile();
};

export const listFiles = (dirPath: string, filterRegex: RegExp) =>
    !fs.existsSync(dirPath)
        ? []
        : fs
              .readdirSync(dirPath)
              .filter(file => isFile(dirPath, file))
              .filter(file => filterRegex.test(file));

export const deleteFile = async (filePath: string) => {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        throw new Error(
            `Unable to delete ${filePath}: ${describeError(error)}`
        );
    }
};

export const copy = async (src: string, dest: string) => {
    try {
        await fs.copy(src, dest);
    } catch (error) {
        throw new Error(`Unable to copy ${src}: ${describeError(error)}`);
    }
};

export const untar = (src: string, dest: string, stripComponents: number) => {
    const pattern = new RegExp(`(.*?/){${stripComponents}}`);
    return new Promise<void>((resolve, reject) => {
        targz.decompress(
            {
                src,
                dest,
                tar: {
                    map: header => ({
                        ...header,
                        name: header.name.replace(pattern, ''),
                    }),
                },
            },
            error => {
                if (error) {
                    reject(
                        new Error(
                            `Unable to extract ${src}: ${describeError(error)}`
                        )
                    );
                } else {
                    resolve();
                }
            }
        );
    });
};

export const chmodDir = (src: string, mode: string | number) =>
    new Promise<void>((resolve, reject) => {
        chmodr(src, mode, error => {
            if (error) {
                reject(
                    new Error(
                        `Unable to change mode to ${src}: ${describeError(
                            error
                        )}`
                    )
                );
            } else {
                resolve();
            }
        });
    });

export const createTextFile = async (filePath: string, text: string) => {
    try {
        await fs.writeFile(filePath, text);
    } catch (error) {
        throw new Error(
            `Unable to initialize ${filePath}: ${describeError(error)}`
        );
    }
};

const createTextFileIfNotExists = async (filePath: string, text: string) => {
    try {
        await fs.stat(filePath);
    } catch (error) {
        await createTextFile(filePath, text);
    }
};

export const createJsonFile = (filePath: string, jsonData: unknown) =>
    createTextFile(filePath, JSON.stringify(jsonData, undefined, 2));

export const createJsonFileIfNotExists = (
    filePath: string,
    jsonData: unknown
) =>
    createTextFileIfNotExists(filePath, JSON.stringify(jsonData, undefined, 2));
