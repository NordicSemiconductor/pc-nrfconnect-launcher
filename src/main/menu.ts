/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app, BrowserWindow, Menu, MenuItem } from 'electron';

export default () =>
    Menu.buildFromTemplate([
        {
            label: '&File',
            submenu: [
                {
                    label: '&Quit nRF Connect for Desktop',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    },
                },
                {
                    label: '&Close Window',
                    accelerator: 'CmdOrCtrl+W',
                    click: (_, browserWindow) => {
                        browserWindow?.close();
                    },
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
                    label: '&Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: (_item: MenuItem, focusedWindow?: BrowserWindow) => {
                        if (focusedWindow) {
                            focusedWindow.emit('restart-window');
                        }
                    },
                },
                {
                    label: 'Toggle &Full Screen',
                    accelerator:
                        process.platform === 'darwin'
                            ? 'Ctrl+Command+F'
                            : 'F11',
                    click: (_item: MenuItem, focusedWindow?: BrowserWindow) => {
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
                    click: (_item: MenuItem, focusedWindow?: BrowserWindow) => {
                        if (focusedWindow) {
                            focusedWindow.webContents.toggleDevTools();
                        }
                    },
                },
            ],
        },
    ]);
