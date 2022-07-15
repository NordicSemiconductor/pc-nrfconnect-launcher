/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const fileUtil = require('./fileUtil');
const config = require('./config');
const { ensureDirExists } = require('./mkdir');

let sourcesData = null;

const loadAllSources = () => {
    const filePath = config.getSourcesJsonPath();

    if (!fs.existsSync(filePath)) {
        return {};
    }
    try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
    } catch (err) {
        console.error('Could not load sources. Reason: ', err);
    }
    return {};
};

const saveAllSources = sources => {
    fs.writeFileSync(config.getSourcesJsonPath(), JSON.stringify(sources));
};

const initialSources = () => ({
    ...loadAllSources(),
    official: config.getAppsJsonUrl(),
});

const getAllSources = () => {
    if (sourcesData == null) {
        sourcesData = initialSources();
    }

    return sourcesData;
};

const getAllSourceNames = () => Object.keys(getAllSources());

const setAllSources = sources => {
    sourcesData = sources;
    saveAllSources(sources);
};

const initialiseAllSources = () =>
    Promise.all(getAllSourceNames().map(initialise));

const initialise = name =>
    ensureDirExists(config.getAppsRootDir(name))
        .then(() => ensureDirExists(config.getNodeModulesDir(name)))
        .then(() => ensureFileExists(config.getAppsJsonPath(name)))
        .then(() => ensureFileExists(config.getUpdatesJsonPath(name)));

const ensureFileExists = filename =>
    fileUtil.createJsonFileIfNotExists(filename, {});

const getSourceUrl = name => getAllSources()[name];

module.exports = {
    getAllSources,
    getAllSourceNames,
    setAllSources,
    initialiseAllSources,
    initialise,
    getSourceUrl,
};
