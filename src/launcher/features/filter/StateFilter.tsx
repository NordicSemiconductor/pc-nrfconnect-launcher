/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import { setShownStates as setShownStatesInSettings } from '../../../ipc/settings';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getShownStates, setShownStates } from './filterSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const { installed, downloadable } = useLauncherSelector(getShownStates);

    return (
        <Col className="pr-4 pl-0">
            <div className="border-bottom py-1 mx-3 mb-2">State</div>
            <Form.Check
                label="Installed"
                id="cb-installed"
                className="mx-3 py-1 px-4"
                custom
                checked={installed}
                onChange={({ target }) => {
                    dispatch(setShownStates({ installed: target.checked }));
                    setShownStatesInSettings({
                        installed: target.checked,
                    });
                }}
            />
            <Form.Check
                label="Downloadable"
                id="cb-downloadable"
                className="mx-3 py-1 px-4"
                custom
                checked={downloadable}
                onChange={({ target }) => {
                    dispatch(setShownStates({ downloadable: target.checked }));
                    setShownStatesInSettings({
                        downloadable: target.checked,
                    });
                }}
            />
        </Col>
    );
};
