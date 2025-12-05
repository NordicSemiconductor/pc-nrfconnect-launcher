/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    colors,
    ExternalLink,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { inMain } from '../../../../ipc/launcherUpdate';
import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import NrfCard from '../../../util/NrfCard';
import {
    getUseChineseAppServer,
    setUseChineseAppServer,
} from '../settingsSlice';

const { white } = colors;

export default () => {
    const dispatch = useLauncherDispatch();

    const useChineseAppServer = useLauncherSelector(getUseChineseAppServer);

    return (
        <NrfCard title="Mainland China server">
            <p className="small text-muted">
                You can enable the server{' '}
                <ExternalLink href="https://files.nordicsemi.cn/" /> for
                installing and updating nRF Connect for Desktop and its apps.
                This server has a better connection in the People&apos;s
                Republic of China.
            </p>
            <Toggle
                label="Use Mainland China server"
                onToggle={() => {
                    dispatch(setUseChineseAppServer(!useChineseAppServer));
                    inMain.setUseChineseUpdateServer(!useChineseAppServer);
                }}
                isToggled={useChineseAppServer}
                variant="primary"
                handleColor={white}
            />
        </NrfCard>
    );
};
