/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { exec } = require('child_process');

exports.default = configuration => {
    console.log('Start code signing');
    const keypairAlias = process.env.NORDIC_SM_KEYPAIR_ALIAS;

    console.log(`Configuration path ${configuration.path}`);
    console.log(`Env variables ${JSON.stringify(process.env)}`);
    if (configuration.path) {
        exec(
            `smctl sign --keypair-alias=${keypairAlias} --input "${String(
                configuration.path
            )}"`,
            error => {
                console.log(error);
            }
        );
    }
};
