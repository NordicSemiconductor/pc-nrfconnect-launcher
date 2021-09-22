/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

function createMenu(app) {
    const menuTemplate = [
        {
            label: '&File',
            submenu: [
                {
                    label: '&Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    selector: 'copy:',
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    selector: 'paste:',
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    selector: 'selectAll:',
                },
            ],
        },
        {
            label: '&View',
            submenu: [
                {
                    label: '&Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    },
                },
                {
                    label: 'Toggle &Full Screen',
                    accelerator:
                        process.platform === 'darwin'
                            ? 'Ctrl+Command+F'
                            : 'F11',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(
                                !focusedWindow.isFullScreen()
                            );
                        }
                    },
                },
                {
                    label: 'Toggle &Developer Tools',
                    accelerator:
                        process.platform === 'darwin'
                            ? 'Alt+Command+I'
                            : 'Ctrl+Shift+I',
                    visible: true,
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    },
                },
            ],
        },
    ];

    return menuTemplate;
}

module.exports = {
    createMenu,
};
