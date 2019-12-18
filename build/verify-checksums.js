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
