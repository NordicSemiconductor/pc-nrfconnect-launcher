/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getShownStates, setShownStates } from './filterSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const { installed, downloadable } = useLauncherSelector(getShownStates);

    return (
        <Col className="pl-0 pr-4">
            <div className="border-bottom mx-3 mb-2 py-1">State</div>
            <Form.Check
                label="Installed"
                id="cb-installed"
                className="mx-3 px-4 py-1"
                custom
                checked={installed}
                onChange={({ target }) => {
                    dispatch(
                        setShownStates({
                            installed: target.checked,
                            downloadable,
                        }),
                    );
                }}
            />
            <Form.Check
                label="Downloadable"
                id="cb-downloadable"
                className="mx-3 px-4 py-1"
                custom
                checked={downloadable}
                onChange={({ target }) => {
                    dispatch(
                        setShownStates({
                            installed,
                            downloadable: target.checked,
                        }),
                    );
                }}
            />
        </Col>
    );
};
