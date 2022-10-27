/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { installLocalApp } from '../features/apps/appsEffects';
import { useLauncherDispatch } from './hooks';

const DropZoneForLocalApps: React.FC = ({ children }) => {
    const dispatch = useLauncherDispatch();

    const installAppPackage = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        dispatch(installLocalApp(event.dataTransfer.files[0].path));
    };

    const showAddCursor = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    return (
        <div
            data-testid="app-install-drop-zone"
            onDrop={installAppPackage}
            onDragOver={showAddCursor}
        >
            {children}
        </div>
    );
};

export default DropZoneForLocalApps;
