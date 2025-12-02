/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { colors, Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';
import formatDate from 'date-fns/format';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import NrfCard from '../../../util/NrfCard';
import { getUpdateCheckStatus } from '../../apps/appsSlice';
import { startUpdateProcess } from '../../process/updateProcess';
import {
    getShouldCheckForUpdatesAtStartup,
    setCheckForUpdatesAtStartup,
} from '../settingsSlice';

const { white } = colors;

export default () => {
    const dispatch = useLauncherDispatch();

    const shouldCheckForUpdatesAtStartup = useLauncherSelector(
        getShouldCheckForUpdatesAtStartup,
    );

    const { isCheckingForUpdates, lastUpdateCheckDate } =
        useLauncherSelector(getUpdateCheckStatus);

    return (
        <NrfCard>
            <Row>
                <Col>
                    <Card.Title>Updates</Card.Title>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-primary"
                        onClick={() => dispatch(startUpdateProcess(true))}
                        disabled={isCheckingForUpdates}
                    >
                        {isCheckingForUpdates
                            ? 'Checking...'
                            : 'Check for updates'}
                    </Button>
                </Col>
            </Row>
            <p className="small text-muted">
                {lastUpdateCheckDate != null && (
                    <>
                        Last update check performed:{' '}
                        {formatDate(lastUpdateCheckDate, 'yyyy-MM-dd HH:mm:ss')}
                    </>
                )}
            </p>
            <Toggle
                id="checkForUpdates"
                label="Check for updates at startup"
                onToggle={() =>
                    dispatch(
                        setCheckForUpdatesAtStartup(
                            !shouldCheckForUpdatesAtStartup,
                        ),
                    )
                }
                isToggled={shouldCheckForUpdatesAtStartup}
                variant="primary"
                handleColor={white}
            />
        </NrfCard>
    );
};
