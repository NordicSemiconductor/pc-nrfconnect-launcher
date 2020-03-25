require('dotenv').config();
const { notarize } = require('electron-notarize');
const pkgJson = require('../package.json');

exports.default = async ({ electronPlatformName, appOutDir }) => (
  (electronPlatformName === 'darwin')
  ? await notarize({
    appBundleId: pkgJson.build.appId,
    appPath: `${appOutDir}/${pkgJson.build.productName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  })
  : undefined
);

