/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

let launcherWindow;

const registerLauncherWindowFromMain = newLauncherWindow => {
    launcherWindow = newLauncherWindow;
};

const sendToLauncherWindowFromMain = (channel, ...args) =>
    launcherWindow.webContents.send(channel, ...args);

module.exports = {
    registerLauncherWindowFromMain,
    sendToLauncherWindowFromMain,
};
