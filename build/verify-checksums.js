/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const crypto = require('crypto');
const axios = require('axios');
const jsyaml = require('js-yaml');

const userOrOrg = 'NordicSemiconductor';
const repo = 'pc-nrfconnect-launcher';

const tag = process.argv.pop();
const ghToken = process.env.GITHUB_TOKEN;

if (!ghToken) {
    console.log('Please set GITHUB_TOKEN environment variable.');
    process.exit();
}

const promiseSha512 = stream => new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha512');
    hash.on('error', reject).setEncoding('base64');
    stream.on('error', reject)
        .on('end', () => {
            hash.end();
            resolve(hash.read());
        })
        .pipe(hash, { end: false });
});


async function main() {
    // get all releases
    const { data: releases } = await axios.get(`https://api.github.com/repos/${userOrOrg}/${repo}/releases`, {
        headers: {
            Accept: 'application/vnd.github.v3.raw',
            Authorization: `token ${ghToken}`,
        },
    });

    // find the one we want to check
    const release = (releases || []).find(r => r.tag_name === tag);
    if (!release) {
        throw new Error(`no release found with tag ${tag}`);
    }

    const { assets } = release;
    // look for the update files (latest*.yml)
    const yamlUrls = assets
        .filter(({ name }) => /latest.*?.yml/.test(name))
        .map(x => (
            `https://${ghToken}:@api.github.com/repos/${userOrOrg}/${repo}/releases/assets/${x.id}`
        ));

    // download yaml content
    const yamls = await Promise.all(yamlUrls.map(async url => {
        const { data } = await axios.get(url, {
            headers: { Accept: 'application/octet-stream' },
            responseType: 'application/text',
        });
        console.log(data);
        return jsyaml.safeLoad(data);
    }));

    // collect artefacts
    const arr = [];
    yamls.forEach(({ files }) => arr.push(...files));

    const files = arr.map(y => ({
        ...y,
        ...assets.find(({ name }) => (name === y.url)),
    }));

    // download artefacts
    console.log('downloading artefacts...\n');

    const checksums = await Promise.all(files.map(async file => {
        const { data } = await axios.get(file.url.replace('//api.', `//${ghToken}:@api.`), {
            headers: { Accept: 'application/octet-stream' },
            responseType: 'stream',
        });

        // finally calculate checksums
        return {
            ...file,
            calculated: await promiseSha512(data),
        };
    }));

    console.log(checksums.map(({ name, sha512, calculated }) => (
        `${name}: ${sha512 === calculated ? 'PASSED' : 'FAILED'}\n  Expected: ${sha512}\n  Received: ${calculated}`
    )).join('\n\n'));
}

main()
    .catch(console.log)
    .then(process.exit);
