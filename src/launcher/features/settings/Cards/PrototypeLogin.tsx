/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import formatDate from 'date-fns/format';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import Card from '../../layout/Card';
import Col from '../../layout/Col';
import Row from '../../layout/Row';
import { logInProtype } from '../settingsEffects';
import { getPrototypeAccountInformation } from '../settingsSlice';

export default () => {
    const dispatch = useLauncherDispatch();

    const account = useLauncherSelector(getPrototypeAccountInformation);

    return (
        <Card title="Login prototype">
            <Row>
                {account == null ? (
                    <>
                        <Col className="tw-text-sm tw-text-gray-600">
                            In the future you can log in here. TODO: Describe
                            this.
                        </Col>
                        <Col fixedSize>
                            <Button
                                variant="outline-primary"
                                onClick={() => dispatch(logInProtype())}
                            >
                                Log in
                            </Button>
                        </Col>
                    </>
                ) : (
                    <>
                        <Col className="tw-text-sm tw-text-gray-600">
                            <div>Name: {account.name}</div>
                            <div>
                                Expires:{' '}
                                {formatDate(
                                    account.expires,
                                    'yyyy-MM-dd HH:mm:ss',
                                )}
                            </div>
                        </Col>
                        <Col fixedSize>
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    /* TODO */
                                }}
                            >
                                Log out
                            </Button>
                        </Col>
                    </>
                )}
            </Row>
        </Card>
    );
};
