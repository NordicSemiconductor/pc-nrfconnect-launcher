/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { colors, Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import NrfCard from '../../../util/NrfCard';
import { toggleSendingTelemetry } from '../../telemetry/telemetryEffects';
import {
    getIsSendingTelemetry,
    showTelemetryDialog,
} from '../../telemetry/telemetrySlice';

const { white } = colors;

export default () => {
    const dispatch = useLauncherDispatch();

    const isSendingTelemetry = useLauncherSelector(getIsSendingTelemetry);

    return (
        <NrfCard title="Usage statistics">
            <Row>
                <Col>
                    <Toggle
                        id="checkForShare"
                        label="Collect anonymous usage data"
                        onToggle={() => dispatch(toggleSendingTelemetry())}
                        isToggled={isSendingTelemetry}
                        variant="primary"
                        handleColor={white}
                    />
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-primary"
                        onClick={() => dispatch(showTelemetryDialog())}
                    >
                        Show agreement
                    </Button>
                </Col>
            </Row>
        </NrfCard>
    );
};
