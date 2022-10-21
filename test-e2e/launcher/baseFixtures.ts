/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */

import { test as baseTest } from '@playwright/test';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const istanbulCLIOutput = path.join(
    process.cwd(),
    'coverage/pwrght/.nyc_output'
);

export function generateUUID(): string {
    return crypto.randomBytes(16).toString('hex');
}

export const test = baseTest.extend({
    context: async ({ context }, use) => {
        console.log('window', window);

        await context.addInitScript(() =>
            window.addEventListener('beforeunload', () => {
                console.log('Cov  handler', (window as Window).__coverage__);
                // @ts-expect-error Window obj not set
                (window as Window).collectIstanbulCoverage(
                    JSON.stringify((window as Window).__coverage__)
                );
            })
        );

        await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });

        await context.exposeFunction(
            'collectIstanbulCoverage',
            (coverageJSON: string) => {
                if (coverageJSON)
                    fs.writeFileSync(
                        path.join(
                            istanbulCLIOutput,
                            `playwright_coverage_${generateUUID()}.json`
                        ),
                        coverageJSON
                    );
            }
        );

        await use(context);

        // eslint-disable-next-line no-restricted-syntax
        for (const page of context.pages()) {
            // eslint-disable-next-line no-await-in-loop
            await page.evaluate(() =>
                // @ts-expect-error Window obj not set
                (window as Window).collectIstanbulCoverage(
                    JSON.stringify((window as Window).__coverage__)
                )
            );
        }
    },
});

export const { expect } = test;
