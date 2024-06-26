/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { execSync } = require('child_process');

exports.default = configuration => {
    if (!configuration.path) {
        console.info('Skip signing because configuration.path is undefined');
    }

    if (!process.env.SM_API_KEY) {
        console.info('Skip signing because SM_API_KEY is not configured');
        return;
    }
    if (!process.env.SM_KEYPAIR_ALIAS) {
        console.info('Skip signing because SM_KEYPAIR_ALIAS is not configured');
        return;
    }

    console.log('Start code signing');
    const keypairAlias = process.env.SM_KEYPAIR_ALIAS;

    try {
        const output = execSync(
            `smctl sign --keypair-alias="${keypairAlias}" --input "${String(
                configuration.path
            )}"  --verbose`,
            {
                stdio: 'inherit',
            }
        );
        console.log(`Signing succeeded: ${output}`);
    } catch (e) {
        console.log(`Signing failed with error: ${e}`);
    }
};
