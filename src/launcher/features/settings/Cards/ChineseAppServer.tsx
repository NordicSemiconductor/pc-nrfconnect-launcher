/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {
    colors,
    ExternalLink,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import {
    getUseChineseAppServer,
    setUseChineseAppServer,
} from '../settingsSlice';

const { white } = colors;

export default () => {
    const dispatch = useLauncherDispatch();

    const useChineseAppServer = useLauncherSelector(getUseChineseAppServer);

    return (
        <Card body>
            <Row>
                <Col>
                    <Card.Title>Mainland China app server</Card.Title>
                </Col>
            </Row>
            <p className="small text-muted">
                For all publicly available apps, use the server{' '}
                <ExternalLink href="https://files.nordicsemi.cn/" />, which has
                a better connection in the People&apos;s Republic of China.
            </p>
            <Toggle
                label="Use Mainland China app server"
                onToggle={() =>
                    dispatch(setUseChineseAppServer(!useChineseAppServer))
                }
                isToggled={useChineseAppServer}
                variant="primary"
                handleColor={white}
            />
        </Card>
    );
};
