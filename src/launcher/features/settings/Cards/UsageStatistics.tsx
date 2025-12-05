/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { colors, Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import Col from '../../layout/Col';
import NrfCard from '../../layout/NrfCard';
import Row from '../../layout/Row';
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
                <Col fixedSize>
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
