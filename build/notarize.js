/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

require('dotenv').config();
const { notarize } = require('@electron/notarize');
const pkgJson = require('../package.json');

exports.default = ({ electronPlatformName, appOutDir }) =>
    electronPlatformName === 'darwin'
        ? notarize({
              tool: 'notarytool',
              appPath: `${appOutDir}/${pkgJson.build.productName}.app`,
              teamId: process.env.APPLE_TEAM_ID,
              appleId: process.env.APPLE_ID,
              appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
          })
        : undefined;
