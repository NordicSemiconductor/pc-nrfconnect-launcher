/* Copyright (c) 2105 - 2019, Nordic Semiconductor ASA
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

import si from 'systeminformation';
import path from 'path';
import fs from 'fs';
import { EOL } from 'os';
import pretty from 'prettysize';
import { getAppDataDir } from './appDirs';
import logger from './logging';
import { openFile } from './open';

/* eslint-disable object-curly-newline */

async function report() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const [
        { manufacturer, model },
        { vendor, version },
        { platform, distro, release, arch },
        { kernel, git, node, python, python3 },
        { manufacturer: cpuManufacturer, brand, speed, cores, physicalCores, processors },
        { total, free },
        fsSize,
    ] = await Promise.all([
        si.system(), si.bios(), si.osInfo(), si.versions(), si.cpu(), si.mem(), si.fsSize(),
    ]);

    return {
        timestamp,
        coreReport: [
            `# nRFConnect System Report - ${timestamp}`,
            '',
            `- System:     ${manufacturer} ${model}`,
            `- BIOS:       ${vendor} ${version}`,
            `- CPU:        ${processors} x ${cpuManufacturer} ${brand} ${speed} GHz`
            + ` ${cores} cores (${physicalCores} physical)`,
            `- Memory:     ${pretty(free)} free of ${pretty(total)} total`,
            `- Filesystem: ${fsSize[0].fs} (${fsSize[0].type})`
            + ` ${pretty(Number(fsSize[0].size) || 0)}`
            + ` ${fsSize[0].use.toFixed(1)}% used`,
            '',
            `- OS:         ${distro} (${release}) ${platform} ${arch}`,
            '',
            '- Versions',
            `    - kernel: ${kernel}`,
            `    - git: ${git}`,
            `    - node: ${node}`,
            `    - python: ${python}`,
            `    - python3: ${python3}`,
            '\n',
        ].join('\n'),
    };
}

// The parameter decoratedSystemReport can be removed when support for legacy apps is dropped
export default function systemReport(decoratedSystemReport = coreReport => coreReport) {
    return async () => {
        logger.info('Generating system report...');

        const { timestamp, coreReport } = await report();
        const decoratedReport = decoratedSystemReport(coreReport);
        const finalReport = decoratedReport.replace(/\n/g, EOL);

        const fileName = `nrfconnect-system-report-${timestamp}.txt`;
        const filePath = path.resolve(getAppDataDir(), fileName);

        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, finalReport, err => (err ? reject(err) : resolve()));
        })
            .then(() => {
                logger.info(`System report: ${filePath}`);
                return new Promise((resolve, reject) => {
                    openFile(filePath, err => (err ? reject(err) : resolve()));
                });
            })
            .catch(err => {
                logger.error(`Failed to generate system report: ${err.message}`);
            });
    };
}
