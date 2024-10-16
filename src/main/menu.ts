/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BaseWindow, Menu, MenuItem } from 'electron';

const isMac = process.platform === 'darwin';

export default () =>
    Menu.buildFromTemplate([
        {
            label: '&File',
            submenu: [
                {
                    label: '&Quit nRF Connect for Desktop',
                    accelerator: 'CmdOrCtrl+Q',
                    role: 'quit',
                },
                {
                    label: '&Close Window',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close',
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy',
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste',
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectAll',
                },
            ],
        },
        {
            label: '&View',
            submenu: [
                {
                    label: '&Restart Window',
                    accelerator: 'CmdOrCtrl+R',
                    click: (_item: MenuItem, focusedWindow?: BaseWindow) => {
                        if (focusedWindow) {
                            focusedWindow.emit('restart-window');
                        }
                    },
                },
                {
                    label: 'Toggle &Full Screen',
                    accelerator: isMac ? 'Ctrl+Command+F' : 'F11',
                    role: 'togglefullscreen',
                },
                {
                    label: 'Toggle &Developer Tools',
                    accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    visible: true,
                    role: 'toggleDevTools',
                },
            ],
        },
        {
            role: 'windowMenu',
        },
    ]);
