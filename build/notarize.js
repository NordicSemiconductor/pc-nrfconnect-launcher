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
              appBundleId: pkgJson.build.appId,
              appPath: `${appOutDir}/${pkgJson.build.productName}.app`,
              teamId: 'P3R8YQEV4L',
              appleId: process.env.APPLEID,
              appleIdPassword: process.env.APPLEIDPASS,
          })
        : undefined;
