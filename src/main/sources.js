/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs-extra');
const fileUtil = require('./fileUtil');
const config = require('./config');
const net = require('./net');
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

const downloadAppsJson = async (url, name) => {
    let appsJson;
    try {
        appsJson = await net.downloadToJson(url, true);
    } catch (error) {
        const wrappedError = new Error(
            `Unable to download apps list: ${error.message}. If you ` +
                'are using a proxy server, you may need to configure it as described on ' +
                'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher'
        );
        wrappedError.statusCode = error.statusCode;
        wrappedError.cause = { name, url };
        wrappedError.sourceNotFound = net.isResourceNotFound(error);
        throw wrappedError;
    }

    // eslint-disable-next-line no-underscore-dangle -- underscore is intentially used in JSON as a meta information
    const sourceName = appsJson._source;
    const isOfficial = url === config.getAppsJsonUrl();
    if (!sourceName && !isOfficial) {
        throw new Error('JSON does not contain expected `_source` tag');
    }

    await initialise(sourceName);
    await fileUtil.createJsonFile(config.getAppsJsonPath(sourceName), appsJson);

    return sourceName;
};

const downloadAllAppsJson = () => {
    const sources = getAllSources();
    const sequence = (source, ...rest) =>
        source
            ? downloadAppsJson(sources[source], source).then(() =>
                  sequence(...rest)
              )
            : Promise.resolve();
    return sequence(...Object.keys(sources));
};

const addSource = async url => {
    const name = await downloadAppsJson(url);

    sourcesData[name] = url;
    saveAllSources(sourcesData);
};

const assertNotOfficial = sourceName => {
    if (!sourceName || sourceName === 'official') {
        throw new Error('The official source shall not be removed.');
    }

    return true;
};

const removeSourceDirectory = sourceName =>
    assertNotOfficial(sourceName) &&
    fs.remove(config.getAppsRootDir(sourceName));

const removeSource = async sourceName => {
    await removeSourceDirectory(sourceName);

    delete sourcesData[sourceName];
    saveAllSources(sourcesData);
};

module.exports = {
    addSource,
    downloadAllAppsJson,
    downloadAppsJson,
    getAllSourceNames,
    getAllSources,
    getSourceUrl,
    initialise,
    initialiseAllSources,
    removeSource,
    removeSourceDirectory,
    setAllSources,
};
